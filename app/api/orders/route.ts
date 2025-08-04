import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { prismaRead, prismaWrite, withRetry } from '@/lib/prisma-load-balanced'
import { rateLimiters, getIdentifier } from '@/lib/rate-limit'
import { createErrorResponse, BusinessError, ErrorCodes, HttpStatus } from '@/lib/errors'
import { Product, MIN_ORDER_AMOUNT } from '@/lib/domain/models'
import { ProductStatus, Role } from '@/types'
import { OrderStatus } from '@prisma/client'
import { notificationManager } from '../notifications/websocket/route'
// import { emailService, OrderEmailData } from '@/lib/email'

// Order search schema
const orderSearchSchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(20),
  status: z.enum(['PENDING', 'PAID', 'PREPARING', 'SHIPPED', 'DELIVERED', 'CANCELLED']).optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  search: z.string().optional(),
  brandId: z.string().optional(),
})

/**
 * @swagger
 * /api/orders:
 *   get:
 *     summary: Get order list
 *     description: Retrieve orders based on user role (filtered by brand/user)
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 20
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [PENDING, PAID, PREPARING, SHIPPED, DELIVERED, CANCELLED]
 *     responses:
 *       200:
 *         description: Order list retrieved successfully
 *       401:
 *         description: Unauthorized
 */
export async function GET(request: NextRequest) {
  try {
    // Rate limiting
    const identifier = getIdentifier(request)
    const { success } = await rateLimiters.api.limit(identifier)
    
    if (!success) {
      throw new BusinessError(
        ErrorCodes.SYSTEM_RATE_LIMIT_EXCEEDED,
        HttpStatus.TOO_MANY_REQUESTS
      )
    }

    // Authentication removed for now
    // TODO: Add proper authentication when auth system is set up

    // Parse query parameters
    const { searchParams } = new URL(request.url)
    const query = orderSearchSchema.parse(Object.fromEntries(searchParams))

    // Check authentication
    const token = request.cookies.get('auth-token')?.value
    if (!token) {
      throw new BusinessError(
        ErrorCodes.AUTHENTICATION_REQUIRED,
        HttpStatus.UNAUTHORIZED
      )
    }

    // Verify token and get user info
    const jwt = await import('jsonwebtoken')
    let userInfo
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key') as any
      userInfo = decoded
    } catch (error) {
      throw new BusinessError(
        ErrorCodes.AUTHENTICATION_INVALID,
        HttpStatus.UNAUTHORIZED
      )
    }

    // Build where clause
    const where: any = {}
    
    // Role-based filtering
    if (userInfo.role === 'BUYER') {
      // Buyers can only see their own orders
      const userEmail = userInfo.username === 'momo' ? 'master@kfashion.com' : 
                        userInfo.username === 'kf001' ? 'kf001@kfashion.com' :
                        userInfo.username === 'kf002' ? 'brand@kfashion.com' :
                        `${userInfo.username}@kfashion.com`
      
      const user = await withRetry(async () => {
        return await prismaRead.user.findFirst({
          where: { email: userEmail }
        })
      })
      if (user) {
        where.userId = user.id
      } else {
        // If user not found in DB, return empty results
        where.userId = 'non-existent-id'
      }
    } else if (userInfo.role === 'BRAND_ADMIN') {
      // Brand admins can see orders for their brand's products
      const userEmail = userInfo.username === 'kf002' ? 'brand@kfashion.com' :
                        `${userInfo.username}@kfashion.com`
      
      const user = await withRetry(async () => {
        return await prismaRead.user.findFirst({
          where: { email: userEmail }
        })
      })
      if (user?.brandId) {
        where.items = {
          some: {
            product: {
              brandId: user.brandId
            }
          }
        }
      } else {
        // If brand admin has no brandId, show no orders
        where.items = {
          some: {
            product: {
              brandId: 'non-existent-brand'
            }
          }
        }
      }
    }
    // MASTER_ADMIN can see all orders

    // Add filters
    if (query.status) where.status = query.status
    if (query.brandId) {
      where.items = {
        some: {
          product: {
            brandId: query.brandId
          }
        }
      }
    }
    if (query.startDate || query.endDate) {
      where.createdAt = {}
      if (query.startDate) where.createdAt.gte = new Date(query.startDate)
      if (query.endDate) {
        const endDate = new Date(query.endDate)
        endDate.setHours(23, 59, 59, 999) // End of day
        where.createdAt.lte = endDate
      }
    }
    
    // Search functionality
    if (query.search) {
      where.OR = [
        { orderNumber: { contains: query.search } },
        { user: { name: { contains: query.search } } },
        { user: { email: { contains: query.search } } },
        { shippingAddress: { path: ['name'], string_contains: query.search } },
      ]
    }

    // Count total items using read replica
    const totalItems = await withRetry(async () => {
      return await prismaRead.order.count({ where })
    })

    // Fetch orders using read replica
    const orders = await withRetry(async () => {
      return await prismaRead.order.findMany({
        where,
        include: {
          user: {
            select: { id: true, email: true, name: true },
          },
          items: {
            include: {
              product: {
                include: {
                  brand: {
                    select: { id: true, nameKo: true, nameCn: true },
                  },
                },
              },
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip: (query.page - 1) * query.limit,
        take: query.limit,
      })
    })

    return NextResponse.json({
      data: orders,
      meta: {
        page: query.page,
        limit: query.limit,
        totalItems,
        totalPages: Math.ceil(totalItems / query.limit),
      },
    })
  } catch (error) {
    return createErrorResponse(error as Error, request.url)
  }
}

// Create order schema
const createOrderSchema = z.object({
  items: z.array(z.object({
    productId: z.string().min(1),
    quantity: z.number().int().positive(),
  })).min(1),
  shippingAddress: z.object({
    name: z.string().min(1).max(100),
    phone: z.string().regex(/^[0-9-+()]+$/),
    address: z.string().min(1).max(500),
    addressDetail: z.string().max(200).optional(),
    zipCode: z.string().regex(/^[0-9-]+$/),
  }),
  paymentMethod: z.enum(['BANK_TRANSFER', 'CARD']),
  memo: z.string().max(1000).optional(),
})

// POST: Create new order
export async function POST(request: NextRequest) {
  try {
    // Rate limiting
    const identifier = getIdentifier(request)
    const { success } = await rateLimiters.orderCreate.limit(identifier)
    
    if (!success) {
      throw new BusinessError(
        ErrorCodes.SYSTEM_RATE_LIMIT_EXCEEDED,
        HttpStatus.TOO_MANY_REQUESTS
      )
    }

    // Get current user from cookie
    const token = request.cookies.get('auth-token')?.value
    if (!token) {
      throw new BusinessError(
        ErrorCodes.AUTHENTICATION_REQUIRED,
        HttpStatus.UNAUTHORIZED
      )
    }

    // Verify token and get user info
    const jwt = await import('jsonwebtoken')
    let currentUser
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key') as any
      currentUser = decoded.username
    } catch (error) {
      throw new BusinessError(
        ErrorCodes.AUTHENTICATION_INVALID,
        HttpStatus.UNAUTHORIZED
      )
    }

    // Parse and validate request body
    const body = await request.json()
    const data = createOrderSchema.parse(body)

    // Process order in transaction using write instance with increased timeout
    const result = await withRetry(async () => {
      return await prismaWrite.$transaction(async (tx) => {
      // 1. Fetch and lock products
      const productIds = data.items.map(item => item.productId)
      
      const products = await tx.product.findMany({
        where: {
          id: { in: productIds },
          status: 'ACTIVE', // Use string instead of enum
        },
        include: { brand: true },
      })

      // Check all products exist and are active
      if (products.length !== productIds.length) {
        const foundIds = products.map(p => p.id)
        const missingIds = productIds.filter(id => !foundIds.includes(id))
        throw new BusinessError(
          ErrorCodes.PRODUCT_NOT_FOUND,
          HttpStatus.NOT_FOUND,
          { missingProducts: missingIds }
        )
      }

      // 2. Calculate order and check inventory
      const orderItems = []
      let totalAmount = 0

      for (const item of data.items) {
        const product = products.find(p => p.id === item.productId)!
        
        // Create domain model
        const productModel = new Product({
          id: product.id,
          brandId: product.brandId,
          sku: product.sku,
          inventory: product.inventory,
          status: product.status as ProductStatus,
          basePrice: Number(product.basePrice),
        })

        // Check inventory
        if (!productModel.isOrderable(item.quantity)) {
          throw new BusinessError(
            ErrorCodes.PRODUCT_INSUFFICIENT_INVENTORY,
            HttpStatus.CONFLICT,
            {
              productId: product.id,
              sku: product.sku,
              available: product.inventory,
              requested: item.quantity,
            }
          )
        }

        // Calculate price with discounts
        const price = productModel.calculatePrice(item.quantity, Role.BUYER)
        
        orderItems.push({
          productId: item.productId,
          quantity: item.quantity,
          price: price,
        })

        totalAmount += price * item.quantity
      }

      // 3. Check minimum order amount
      if (totalAmount < MIN_ORDER_AMOUNT) {
        throw new BusinessError(
          ErrorCodes.ORDER_MIN_AMOUNT_NOT_MET,
          HttpStatus.UNPROCESSABLE_ENTITY,
          {
            currentAmount: totalAmount,
            minimumAmount: MIN_ORDER_AMOUNT,
          }
        )
      }

      // 4. Find or create user in database
      // Map username to email
      const userEmail = currentUser === 'momo' ? 'master@kfashion.com' : 
                        currentUser === 'kf001' ? 'kf001@kfashion.com' :
                        currentUser === 'kf002' ? 'brand@kfashion.com' :
                        `${currentUser}@kfashion.com`
      
      let user = await tx.user.findUnique({
        where: { email: userEmail }
      })

      if (!user) {
        // Create user if not exists (for testing)
        user = await tx.user.create({
          data: {
            name: currentUser,
            email: userEmail,
            role: currentUser === 'momo' || currentUser === 'kf001' ? 'MASTER_ADMIN' : 
                  currentUser === 'kf002' ? 'BRAND_ADMIN' : 'BUYER',
            status: 'ACTIVE'
          }
        })
      }

      // 5. Create order with custom order number
      const orderNumber = generateOrderNumber()
      const order = await tx.order.create({
        data: {
          orderNumber,
          userId: user.id,
          status: OrderStatus.PENDING,
          totalAmount,
          shippingAddress: data.shippingAddress,
          paymentMethod: data.paymentMethod,
          memo: data.memo,
          items: {
            create: orderItems,
          },
        },
        include: {
          items: {
            include: {
              product: {
                include: { brand: true },
              },
            },
          },
          user: true,
        },
      })

      // 6. Update inventory
      for (const item of data.items) {
        const product = products.find(p => p.id === item.productId)!
        const newInventory = product.inventory - item.quantity
        
        const updated = await tx.product.update({
          where: { id: item.productId },
          data: {
            inventory: newInventory,
            status: newInventory === 0 ? ProductStatus.OUT_OF_STOCK : product.status,
          },
        })

        // Create audit log
        await tx.auditLog.create({
          data: {
            userId: 'system', // Use system user for audit logs
            action: 'INVENTORY_DECREASE_FOR_ORDER',
            entityType: 'Product',
            entityId: item.productId,
            metadata: {
              orderId: order.id,
              orderNumber: order.orderNumber,
              previousInventory: product.inventory,
              newInventory: updated.inventory,
              quantity: item.quantity,
            },
            ip: request.headers.get('x-forwarded-for') || 'unknown',
            userAgent: request.headers.get('user-agent') || 'unknown',
          },
        })
      }

      // Create audit log
      await tx.auditLog.create({
        data: {
          userId: 'system', // Use system user for audit logs
          action: 'ORDER_CREATE',
          entityType: 'Order',
          entityId: order.id,
          metadata: {
            orderNumber: order.orderNumber,
            totalAmount: order.totalAmount,
            itemCount: order.items.length,
            paymentMethod: order.paymentMethod,
          },
          ip: request.headers.get('x-forwarded-for') || 'unknown',
          userAgent: request.headers.get('user-agent') || 'unknown',
        },
      })

        return order
      }, {
        timeout: 30000, // 30 seconds timeout for international latency
      })
    })

    // Send real-time notification for new order
    try {
      notificationManager.sendNewOrderNotification(
        result.orderNumber,
        result.user.email
      )
      console.log(`📧 Real-time notification sent for new order: ${result.orderNumber}`)
    } catch (notificationError) {
      console.error('Failed to send new order notification:', notificationError)
      // Don't fail the entire request if notification fails
    }

    // TODO: Send email notifications (disabled for now)
    console.log(`📧 Order created: ${result.orderNumber} for ${result.user.email}`)

    // Generate payment info
    const paymentInfo = generatePaymentInfo(result)

    return NextResponse.json({
      data: {
        order: result,
        paymentInfo,
      },
    }, { status: 201 })
  } catch (error) {
    console.error('❌ Order creation error:', error)
    return createErrorResponse(error as Error, request.url)
  }
}

// Helper function to generate readable order number
function generateOrderNumber(): string {
  const now = new Date()
  const year = now.getFullYear().toString().slice(-2) // Last 2 digits of year
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const day = String(now.getDate()).padStart(2, '0')
  const random = Math.random().toString(36).substring(2, 8).toUpperCase() // 6 random chars
  
  return `KF${year}${month}${day}${random}` // e.g., KF2507283A7B9C
}

// Helper function to generate payment info
function generatePaymentInfo(order: any) {
  if (order.paymentMethod === 'BANK_TRANSFER') {
    return {
      method: 'BANK_TRANSFER',
      amount: order.totalAmount,
      dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 days
      accountInfo: {
        bank: '국민은행',
        accountNumber: '123-456-789012',
        accountHolder: 'K-Fashion',
      },
    }
  }

  // Card payment
  return {
    method: 'CARD',
    amount: order.totalAmount,
    // Additional PG integration info would go here
  }
}