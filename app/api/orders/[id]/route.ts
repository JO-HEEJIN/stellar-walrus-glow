import { NextRequest, NextResponse } from 'next/server'
import { prismaRead, withRetry } from '@/lib/prisma-load-balanced'
import { rateLimiters, getIdentifier } from '@/lib/rate-limit'
import { createErrorResponse, BusinessError, ErrorCodes, HttpStatus } from '@/lib/errors'

// GET: Get order details
export async function GET(
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

    // Get order with all relations using read replica
    const order = await withRetry(async () => {
      return await prismaRead.order.findUnique({
        where: { id: params.id },
        include: {
          user: {
            select: {
              id: true,
              email: true,
              name: true,
              role: true,
            }
          },
          items: {
            include: {
              product: {
                include: {
                  brand: {
                    select: {
                      id: true,
                      nameKo: true,
                      nameCn: true,
                    }
                  },
                  category: {
                    select: {
                      id: true,
                      name: true,
                    }
                  }
                }
              }
            }
          }
        }
      })
    })

    if (!order) {
      throw new BusinessError(
        ErrorCodes.ORDER_NOT_FOUND,
        HttpStatus.NOT_FOUND
      )
    }

    // Role-based access control
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
      if (!user || order.userId !== user.id) {
        throw new BusinessError(
          ErrorCodes.AUTH_INSUFFICIENT_PERMISSION,
          HttpStatus.FORBIDDEN
        )
      }
    } else if (userInfo.role === 'BRAND_ADMIN') {
      // Brand admins can only see orders for their brand's products
      const userEmail = userInfo.username === 'kf002' ? 'brand@kfashion.com' :
                        `${userInfo.username}@kfashion.com`
      
      const user = await withRetry(async () => {
        return await prismaRead.user.findFirst({
          where: { email: userEmail }
        })
      })
      
      if (!user?.brandId) {
        throw new BusinessError(
          ErrorCodes.AUTH_INSUFFICIENT_PERMISSION,
          HttpStatus.FORBIDDEN
        )
      }

      // Check if any order items belong to the admin's brand
      const hasAccess = order.items.some(item => item.product.brandId === user.brandId)
      if (!hasAccess) {
        throw new BusinessError(
          ErrorCodes.AUTH_INSUFFICIENT_PERMISSION,
          HttpStatus.FORBIDDEN
        )
      }
    }
    // MASTER_ADMIN can see all orders

    // Get status history from audit logs using read replica
    const statusHistory = await withRetry(async () => {
      return await prismaRead.auditLog.findMany({
        where: {
          entityType: 'Order',
          entityId: order.id,
          action: {
            in: ['ORDER_CREATE', 'ORDER_STATUS_UPDATE']
          }
        },
        orderBy: {
          createdAt: 'asc'
        },
        select: {
          id: true,
          action: true,
          createdAt: true,
          userId: true,
          user: {
            select: {
              email: true,
              name: true,
            }
          },
          metadata: true,
        }
      })
    })

    // Format status history
    const formattedHistory = statusHistory.map(log => {
      if (log.action === 'ORDER_CREATE') {
        return {
          status: 'PENDING',
          changedAt: log.createdAt,
          changedBy: log.user?.email || 'System',
          action: 'Created',
        }
      } else {
        const metadata = log.metadata as any
        return {
          status: metadata.newStatus,
          previousStatus: metadata.previousStatus,
          changedAt: log.createdAt,
          changedBy: log.user?.email || 'System',
          action: 'Status Updated',
          reason: metadata.reason,
          trackingNumber: metadata.trackingNumber,
        }
      }
    })

    // Extract tracking info if available
    const paymentInfo = order.paymentInfo as any
    const trackingInfo = paymentInfo?.trackingNumber ? {
      trackingNumber: paymentInfo.trackingNumber,
      shippedAt: paymentInfo.shippedAt,
    } : null

    return NextResponse.json({
      data: {
        ...order,
        trackingInfo,
        statusHistory: formattedHistory,
      }
    })
  } catch (error) {
    return createErrorResponse(error as Error, request.url)
  }
}