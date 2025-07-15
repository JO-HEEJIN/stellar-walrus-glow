import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
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

    // Authentication removed for now
    // TODO: Add proper authentication when auth system is set up

    // Get order with all relations
    const order = await prisma.order.findUnique({
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

    if (!order) {
      throw new BusinessError(
        ErrorCodes.ORDER_NOT_FOUND,
        HttpStatus.NOT_FOUND
      )
    }

    // Access permission checks removed for now
    // TODO: Add proper access permission checks when auth system is set up

    // Get status history from audit logs
    const statusHistory = await prisma.auditLog.findMany({
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