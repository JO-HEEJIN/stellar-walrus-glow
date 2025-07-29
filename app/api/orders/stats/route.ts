export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server'
import { prismaRead, withRetry } from '@/lib/prisma-load-balanced'
import { createErrorResponse, BusinessError, ErrorCodes, HttpStatus } from '@/lib/errors'

export async function GET(request: NextRequest) {
  try {
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

    // Get order statistics
    const stats = await withRetry(async () => {
      // Build where clause based on user role
      let whereClause: any = {}
      
      // BUYER can only see their own orders
      if (userInfo.role === 'BUYER') {
        whereClause.userId = userInfo.username
      }
      // BRAND_ADMIN can see orders from their brand's products
      else if (userInfo.role === 'BRAND_ADMIN' && userInfo.brandId) {
        whereClause.items = {
          some: {
            product: {
              brandId: userInfo.brandId
            }
          }
        }
      }
      // MASTER_ADMIN can see all orders (no additional filter)

      // Get total counts by status
      const [
        total,
        pending,
        paid,
        preparing,
        shipped,
        delivered,
        cancelled
      ] = await Promise.all([
        prismaRead.order.count({ where: whereClause }),
        prismaRead.order.count({ where: { ...whereClause, status: 'PENDING' } }),
        prismaRead.order.count({ where: { ...whereClause, status: 'PAID' } }),
        prismaRead.order.count({ where: { ...whereClause, status: 'PREPARING' } }),
        prismaRead.order.count({ where: { ...whereClause, status: 'SHIPPED' } }),
        prismaRead.order.count({ where: { ...whereClause, status: 'DELIVERED' } }),
        prismaRead.order.count({ where: { ...whereClause, status: 'CANCELLED' } }),
      ])

      return {
        total,
        pending,
        paid,
        preparing,
        shipped,
        delivered,
        cancelled
      }
    })

    return NextResponse.json(stats)
  } catch (error) {
    console.error('GET /api/orders/stats error:', error)
    return createErrorResponse(error as Error, request.url)
  }
}