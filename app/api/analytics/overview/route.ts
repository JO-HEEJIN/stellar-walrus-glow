import { NextRequest, NextResponse } from 'next/server'
import { prismaRead, withRetry } from '@/lib/prisma-load-balanced'
import { createErrorResponse, BusinessError, ErrorCodes, HttpStatus } from '@/lib/errors'

export const dynamic = 'force-dynamic'

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

    // Verify token
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

    // Get date ranges
    const now = new Date()
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    const yesterday = new Date(today)
    yesterday.setDate(yesterday.getDate() - 1)
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)
    const lastWeek = new Date(today)
    lastWeek.setDate(lastWeek.getDate() - 7)
    const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1)
    const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1)

    // Build where clause based on user role
    let productWhere: any = {}
    let orderWhere: any = {}
    let userWhere: any = {}
    
    if (userInfo.role === 'BRAND_ADMIN') {
      // For brand admins, filter by their brand
      const userEmail = userInfo.username === 'kf002' ? 'brand@kfashion.com' :
                        `${userInfo.username}@kfashion.com`
      
      const user = await withRetry(async () => {
        return await prismaRead.user.findFirst({
          where: { email: userEmail }
        })
      })
      
      if (user?.brandId) {
        productWhere.brandId = user.brandId
        orderWhere.items = {
          some: {
            product: {
              brandId: user.brandId
            }
          }
        }
      }
    } else if (userInfo.role === 'BUYER') {
      // For buyers, show their own orders
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
        orderWhere.userId = user.id
      }
    }

    // Get today's statistics
    const [
      todayRevenue,
      todayOrders,
      yesterdayRevenue,
      yesterdayOrders,
      totalUsers,
      newUsersToday,
      totalProducts,
      lowStockProducts,
      ordersByStatus
    ] = await Promise.all([
      // Today's revenue
      withRetry(async () => {
        const result = await prismaRead.order.aggregate({
          where: { 
            ...orderWhere,
            status: { in: ['PAID', 'PREPARING', 'SHIPPED', 'DELIVERED'] },
            createdAt: { gte: today, lt: tomorrow }
          },
          _sum: { totalAmount: true }
        })
        return result._sum.totalAmount || 0
      }),
      
      // Today's orders
      withRetry(async () => {
        return await prismaRead.order.count({
          where: { 
            ...orderWhere,
            createdAt: { gte: today, lt: tomorrow }
          }
        })
      }),
      
      // Yesterday's revenue
      withRetry(async () => {
        const result = await prismaRead.order.aggregate({
          where: { 
            ...orderWhere,
            status: { in: ['PAID', 'PREPARING', 'SHIPPED', 'DELIVERED'] },
            createdAt: { gte: yesterday, lt: today }
          },
          _sum: { totalAmount: true }
        })
        return result._sum.totalAmount || 0
      }),
      
      // Yesterday's orders
      withRetry(async () => {
        return await prismaRead.order.count({
          where: { 
            ...orderWhere,
            createdAt: { gte: yesterday, lt: today }
          }
        })
      }),
      
      // Total users (only for MASTER_ADMIN)
      userInfo.role === 'MASTER_ADMIN' ? withRetry(async () => {
        return await prismaRead.user.count({ where: { status: 'ACTIVE' } })
      }) : 0,
      
      // New users today (only for MASTER_ADMIN)
      userInfo.role === 'MASTER_ADMIN' ? withRetry(async () => {
        return await prismaRead.user.count({
          where: { 
            status: 'ACTIVE',
            createdAt: { gte: today, lt: tomorrow }
          }
        })
      }) : 0,
      
      // Total products
      withRetry(async () => {
        return await prismaRead.product.count({ where: productWhere })
      }),
      
      // Low stock products (inventory < 10)
      withRetry(async () => {
        return await prismaRead.product.count({
          where: { 
            ...productWhere,
            inventory: { lt: 10 },
            status: 'ACTIVE'
          }
        })
      }),
      
      // Orders by status
      withRetry(async () => {
        const statuses = ['PENDING', 'PAID', 'PREPARING', 'SHIPPED', 'DELIVERED', 'CANCELLED']
        const counts = await Promise.all(
          statuses.map(status => 
            prismaRead.order.count({
              where: { ...orderWhere, status }
            })
          )
        )
        return statuses.map((status, index) => ({
          status,
          count: counts[index]
        }))
      })
    ])

    // Calculate changes
    const revenueChange = Number(yesterdayRevenue) > 0 
      ? ((Number(todayRevenue) - Number(yesterdayRevenue)) / Number(yesterdayRevenue) * 100).toFixed(1)
      : '0'
    
    const orderChange = yesterdayOrders > 0
      ? ((todayOrders - yesterdayOrders) / yesterdayOrders * 100).toFixed(1)
      : '0'

    // Get daily revenue for last 7 days
    const dailyRevenue = await withRetry(async () => {
      const revenues = []
      for (let i = 6; i >= 0; i--) {
        const date = new Date(today)
        date.setDate(date.getDate() - i)
        const nextDate = new Date(date)
        nextDate.setDate(nextDate.getDate() + 1)
        
        const [revenue, orders] = await Promise.all([
          prismaRead.order.aggregate({
            where: {
              ...orderWhere,
              status: { in: ['PAID', 'PREPARING', 'SHIPPED', 'DELIVERED'] },
              createdAt: { gte: date, lt: nextDate }
            },
            _sum: { totalAmount: true }
          }),
          prismaRead.order.count({
            where: {
              ...orderWhere,
              createdAt: { gte: date, lt: nextDate }
            }
          })
        ])
        
        revenues.push({
          date: date.toISOString().split('T')[0],
          revenue: Number(revenue._sum.totalAmount || 0),
          orders
        })
      }
      return revenues
    })

    // Get top products
    const topProducts = await withRetry(async () => {
      const products = await prismaRead.orderItem.groupBy({
        by: ['productId'],
        where: orderWhere.items ? orderWhere.items : {},
        _sum: {
          quantity: true,
          price: true
        },
        _count: true,
        orderBy: {
          _sum: {
            price: 'desc'
          }
        },
        take: 5
      })
      
      // Get product details
      const productDetails = await prismaRead.product.findMany({
        where: {
          id: { in: products.map(p => p.productId) }
        },
        include: {
          brand: {
            select: { nameKo: true }
          }
        }
      })
      
      return products.map(p => {
        const product = productDetails.find(pd => pd.id === p.productId)
        return {
          productId: p.productId,
          productName: product?.nameKo || 'Unknown',
          productSku: product?.sku || 'Unknown',
          brandName: product?.brand.nameKo || 'Unknown',
          quantity: p._sum.quantity || 0,
          revenue: Number(p._sum.price || 0) * (p._sum.quantity || 0),
          orderCount: p._count
        }
      })
    })

    return NextResponse.json({
      overview: {
        todayRevenue: Number(todayRevenue),
        todayOrders,
        yesterdayRevenue: Number(yesterdayRevenue),
        yesterdayOrders,
        revenueChange,
        orderChange,
        totalUsers,
        newUsersToday,
        totalProducts,
        lowStockProducts
      },
      ordersByStatus,
      dailyRevenue,
      topProducts
    })
  } catch (error) {
    return createErrorResponse(error as Error, request.url)
  }
}