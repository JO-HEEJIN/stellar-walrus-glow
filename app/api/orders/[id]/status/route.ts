import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { prismaWrite, withRetry } from '@/lib/prisma-load-balanced'
import { rateLimiters, getIdentifier } from '@/lib/rate-limit'
import { createErrorResponse, BusinessError, ErrorCodes, HttpStatus } from '@/lib/errors'
import { Order } from '@/lib/domain/models'
import { OrderStatus } from '@prisma/client'

// Status update schema
const statusUpdateSchema = z.object({
  status: z.enum(['PENDING', 'PAID', 'PREPARING', 'SHIPPED', 'DELIVERED', 'CANCELLED']),
  reason: z.string().max(500).optional(),
  trackingNumber: z.string().max(100).optional(),
})

// PATCH: Update order status
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    // Parse and validate request body
    const body = await request.json()
    const data = statusUpdateSchema.parse(body)

    // Validate tracking number is provided when status is SHIPPED
    if (data.status === OrderStatus.SHIPPED && !data.trackingNumber) {
      throw new BusinessError(
        ErrorCodes.ORDER_INVALID_STATUS,
        HttpStatus.BAD_REQUEST,
        { message: 'Tracking number is required for SHIPPED status' }
      )
    }

    // Process status update in transaction
    const result = await withRetry(async () => {
      return await prismaWrite.$transaction(async (tx) => {
      // Get order with lock
      const order = await tx.order.findUnique({
        where: { id: params.id },
        include: {
          user: true,
          items: {
            include: {
              product: {
                include: { brand: true }
              }
            }
          }
        }
      })

      if (!order) {
        throw new BusinessError(
          ErrorCodes.ORDER_NOT_FOUND,
          HttpStatus.NOT_FOUND
        )
      }

      // Check permissions
      if (userInfo.role === 'BUYER') {
        // Buyers can only view their own orders, not update status
        throw new BusinessError(
          ErrorCodes.AUTHORIZATION_INSUFFICIENT_PERMISSIONS,
          HttpStatus.FORBIDDEN,
          { message: 'Buyers cannot update order status' }
        )
      } else if (userInfo.role === 'BRAND_ADMIN') {
        // Brand admins can only update orders for their brand's products
        const userEmail = userInfo.username === 'kf002' ? 'brand@kfashion.com' : 
                          `${userInfo.username}@kfashion.com`
        
        const user = await tx.user.findFirst({
          where: { email: userEmail }
        })

        if (user?.brandId) {
          const hasBrandProducts = order.items.some(item => 
            item.product.brandId === user.brandId
          )
          
          if (!hasBrandProducts) {
            throw new BusinessError(
              ErrorCodes.AUTHORIZATION_INSUFFICIENT_PERMISSIONS,
              HttpStatus.FORBIDDEN,
              { message: 'Cannot update orders for other brands' }
            )
          }
        }
      }
      // MASTER_ADMIN can update any order

      // Create domain model to check state transition
      const orderModel = new Order({
        id: order.id,
        userId: order.userId,
        status: order.status as any,
        items: order.items.map(item => ({
          id: item.id,
          productId: item.productId,
          quantity: item.quantity,
          price: Number(item.price),
        })),
        totalAmount: Number(order.totalAmount),
        shippingAddress: order.shippingAddress as any,
      })

      // Validate state transition
      if (!orderModel.canTransitionTo(data.status as any)) {
        throw new BusinessError(
          ErrorCodes.ORDER_INVALID_STATUS_TRANSITION,
          HttpStatus.UNPROCESSABLE_ENTITY,
          {
            currentStatus: order.status,
            requestedStatus: data.status,
            allowedTransitions: getValidTransitions(order.status as OrderStatus)
          }
        )
      }

      // Handle special cases for CANCELLED status
      if (data.status === OrderStatus.CANCELLED) {
        // Restore inventory for cancelled orders
        for (const item of order.items) {
          const product = await tx.product.update({
            where: { id: item.productId },
            data: {
              inventory: {
                increment: item.quantity
              }
            }
          })

          // Update product status if it was out of stock
          if (product.status === 'OUT_OF_STOCK' && product.inventory > 0) {
            await tx.product.update({
              where: { id: item.productId },
              data: { status: 'ACTIVE' }
            })
          }

          // Create audit log for inventory restoration
          await tx.auditLog.create({
            data: {
              userId: 'system', // Use system user for audit logs
              action: 'INVENTORY_RESTORE_FOR_CANCELLATION',
              entityType: 'Product',
              entityId: item.productId,
              metadata: {
                orderId: order.id,
                orderNumber: order.orderNumber,
                restoredQuantity: item.quantity,
                newInventory: product.inventory,
              },
              ip: request.headers.get('x-forwarded-for') || 'unknown',
              userAgent: request.headers.get('user-agent') || 'unknown',
            },
          })
        }
      }

      // Update order status
      const updatedOrder = await tx.order.update({
        where: { id: params.id },
        data: {
          status: data.status,
          // Store tracking number in paymentInfo for SHIPPED status
          paymentInfo: data.status === OrderStatus.SHIPPED && data.trackingNumber
            ? {
                ...(order.paymentInfo as any || {}),
                trackingNumber: data.trackingNumber,
                shippedAt: new Date().toISOString()
              }
            : order.paymentInfo
        },
        include: {
          user: true,
          items: {
            include: {
              product: {
                include: { brand: true }
              }
            }
          }
        }
      })

      // Create audit log for status change
      await tx.auditLog.create({
        data: {
          userId: 'system', // Use system user for audit logs
          action: 'ORDER_STATUS_UPDATE',
          entityType: 'Order',
          entityId: order.id,
          metadata: {
            orderNumber: order.orderNumber,
            previousStatus: order.status,
            newStatus: data.status,
            reason: data.reason,
            trackingNumber: data.trackingNumber,
            requiresRefund: orderModel.requiresRefund() && data.status === OrderStatus.CANCELLED,
            updatedBy: userInfo.username,
            userRole: userInfo.role
          },
          ip: request.headers.get('x-forwarded-for') || 'unknown',
          userAgent: request.headers.get('user-agent') || 'unknown',
        },
      })

      return {
        order: updatedOrder,
        previousStatus: order.status,
        notification: {
          sent: true, // In real implementation, this would be actual notification result
          type: 'email' as const,
          recipient: order.user.email,
        }
      }
      }, {
        timeout: 30000, // 30 seconds timeout for international latency
      })
    })

    // TODO: Send actual notifications (email/SMS)
    // For now, we're just returning a mock notification status
    if (result.order.status === OrderStatus.SHIPPED) {
      console.log(`Would send shipping notification to ${result.order.user.email} with tracking: ${data.trackingNumber}`)
    } else if (result.order.status === OrderStatus.CANCELLED) {
      console.log(`Would send cancellation notification to ${result.order.user.email}`)
    }

    return NextResponse.json({
      data: result
    })
  } catch (error) {
    return createErrorResponse(error as Error, request.url)
  }
}

// Helper function to get valid transitions
function getValidTransitions(currentStatus: OrderStatus): OrderStatus[] {
  const transitions: Record<OrderStatus, OrderStatus[]> = {
    [OrderStatus.PENDING]: [OrderStatus.PAID, OrderStatus.CANCELLED],
    [OrderStatus.PAID]: [OrderStatus.PREPARING, OrderStatus.CANCELLED],
    [OrderStatus.PREPARING]: [OrderStatus.SHIPPED, OrderStatus.CANCELLED],
    [OrderStatus.SHIPPED]: [OrderStatus.DELIVERED],
    [OrderStatus.DELIVERED]: [],
    [OrderStatus.CANCELLED]: []
  }
  return transitions[currentStatus] || []
}