import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import { rateLimiters, getIdentifier } from '@/lib/rate-limit'
import { createErrorResponse, BusinessError, ErrorCodes, HttpStatus } from '@/lib/errors'
import { Product, MIN_ORDER_AMOUNT } from '@/lib/domain/models'
import { OrderStatus, ProductStatus, Role } from '@/types'

// Order search schema
const orderSearchSchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(20),
  status: z.enum(['PENDING', 'PAID', 'PREPARING', 'SHIPPED', 'DELIVERED', 'CANCELLED']).optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
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

    // Check authentication
    const session = await auth()
    if (!session) {
      throw new BusinessError(
        ErrorCodes.AUTH_INVALID_CREDENTIALS,
        HttpStatus.UNAUTHORIZED
      )
    }

    // Parse query parameters
    const { searchParams } = new URL(request.url)
    const query = orderSearchSchema.parse(Object.fromEntries(searchParams))

    // Build where clause based on role
    const where: any = {}
    
    // Filter by user role
    if (session.user.role === Role.BUYER) {
      where.userId = session.user.id
    } else if (session.user.role === Role.BRAND_ADMIN && session.user.brandId) {
      // Brand admin sees orders containing their products
      where.items = {
        some: {
          product: {
            brandId: session.user.brandId
          }
        }
      }
    }
    // MASTER_ADMIN sees all orders

    // Add filters
    if (query.status) where.status = query.status
    if (query.startDate || query.endDate) {
      where.createdAt = {}
      if (query.startDate) where.createdAt.gte = new Date(query.startDate)
      if (query.endDate) where.createdAt.lte = new Date(query.endDate)
    }

    // Count total items
    const totalItems = await prisma.order.count({ where })

    // Fetch orders
    const orders = await prisma.order.findMany({
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

    // Check authentication
    const session = await auth()
    if (!session) {
      throw new BusinessError(
        ErrorCodes.AUTH_INVALID_CREDENTIALS,
        HttpStatus.UNAUTHORIZED
      )
    }

    // Parse and validate request body
    const body = await request.json()
    const data = createOrderSchema.parse(body)

    // Process order in transaction
    const result = await prisma.$transaction(async (tx) => {
      // 1. Fetch and lock products
      const productIds = data.items.map(item => item.productId)
      const products = await tx.product.findMany({
        where: {
          id: { in: productIds },
          status: ProductStatus.ACTIVE,
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
        const price = productModel.calculatePrice(item.quantity, session.user.role as Role)
        
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

      // 4. Create order
      const order = await tx.order.create({
        data: {
          userId: session.user.id,
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

      // 5. Update inventory
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

        // Audit log for inventory change
        await tx.auditLog.create({
          data: {
            userId: session.user.id,
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
          },
        })
      }

      // 6. Audit log for order creation
      await tx.auditLog.create({
        data: {
          userId: session.user.id,
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
    })

    // Generate payment info
    const paymentInfo = generatePaymentInfo(result)

    return NextResponse.json({
      data: {
        order: result,
        paymentInfo,
      },
    }, { status: 201 })
  } catch (error) {
    return createErrorResponse(error as Error, request.url)
  }
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