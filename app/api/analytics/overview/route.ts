import { NextRequest, NextResponse } from 'next/server'
// import { prisma } from '@/lib/prisma'
// import { rateLimiters, getIdentifier } from '@/lib/rate-limit'
// import { createErrorResponse, BusinessError, ErrorCodes, HttpStatus } from '@/lib/errors'

export async function GET(request: NextRequest) {
  try {
    // Authentication check
    const token = request.cookies.get('auth-token')?.value
    if (!token) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Verify token and get user info
    const jwt = await import('jsonwebtoken')
    let userInfo
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key') as any
      userInfo = decoded
    } catch (error) {
      return NextResponse.json(
        { error: 'Invalid token' },
        { status: 401 }
      )
    }

    // Only MASTER_ADMIN and BRAND_ADMIN can view analytics
    if (userInfo.role === 'BUYER') {
      return NextResponse.json(
        { error: 'Insufficient permissions' },
        { status: 403 }
      )
    }

    // Mock data for analytics (replace with DB when connected)
    const isBrandAdmin = userInfo.role === 'BRAND_ADMIN'

    // Mock analytics data
    const mockData = {
      todayRevenue: isBrandAdmin ? 850000 : 2500000,
      todayOrders: isBrandAdmin ? 12 : 45,
      yesterdayRevenue: isBrandAdmin ? 750000 : 2200000,
      yesterdayOrders: isBrandAdmin ? 10 : 38,
      totalUsers: isBrandAdmin ? 0 : 1250,
      newUsersToday: isBrandAdmin ? 0 : 5,
      totalProducts: isBrandAdmin ? 28 : 156,
      lowStockProducts: isBrandAdmin ? 3 : 12
    }

    const revenueChange = ((mockData.todayRevenue - mockData.yesterdayRevenue) / mockData.yesterdayRevenue * 100).toFixed(1)
    const orderChange = ((mockData.todayOrders - mockData.yesterdayOrders) / mockData.yesterdayOrders * 100).toFixed(1)

    const ordersByStatus = isBrandAdmin ? [
      { status: 'PENDING', count: 5 },
      { status: 'PROCESSING', count: 3 },
      { status: 'SHIPPED', count: 8 },
      { status: 'DELIVERED', count: 25 },
      { status: 'CANCELLED', count: 2 }
    ] : [
      { status: 'PENDING', count: 18 },
      { status: 'PROCESSING', count: 12 },
      { status: 'SHIPPED', count: 35 },
      { status: 'DELIVERED', count: 98 },
      { status: 'CANCELLED', count: 7 }
    ]

    // Generate last 7 days revenue data
    const dailyRevenue = Array.from({ length: 7 }, (_, i) => {
      const date = new Date()
      date.setDate(date.getDate() - (6 - i))
      return {
        date: date.toISOString().split('T')[0],
        orders: Math.floor(Math.random() * (isBrandAdmin ? 15 : 50)) + 5,
        revenue: Math.floor(Math.random() * (isBrandAdmin ? 800000 : 2000000)) + (isBrandAdmin ? 200000 : 500000)
      }
    })

    const topProducts = isBrandAdmin ? [
      {
        productId: 'prod-1',
        productName: '클래식 셔츠',
        productSku: 'CS-001',
        brandName: userInfo.username.includes('brand') ? 'test-brand' : 'K-Fashion',
        quantity: 25,
        revenue: 2225000,
        orderCount: 15
      },
      {
        productId: 'prod-2',
        productName: '데님 자켓',
        productSku: 'DJ-001',
        brandName: userInfo.username.includes('brand') ? 'test-brand' : 'K-Fashion',
        quantity: 18,
        revenue: 2322000,
        orderCount: 12
      }
    ] : [
      {
        productId: 'prod-1',
        productName: '클래식 셔츠',
        productSku: 'CS-001',
        brandName: 'test-brand',
        quantity: 45,
        revenue: 4005000,
        orderCount: 28
      },
      {
        productId: 'prod-2',
        productName: '데님 자켓',
        productSku: 'DJ-001',
        brandName: 'test-brand',
        quantity: 32,
        revenue: 4128000,
        orderCount: 20
      },
      {
        productId: 'prod-4',
        productName: '한복 원피스',
        productSku: 'HP-001',
        brandName: 'K-Fashion',
        quantity: 28,
        revenue: 4452000,
        orderCount: 18
      }
    ]

    return NextResponse.json({
      overview: {
        todayRevenue: mockData.todayRevenue,
        todayOrders: mockData.todayOrders,
        yesterdayRevenue: mockData.yesterdayRevenue,
        yesterdayOrders: mockData.yesterdayOrders,
        revenueChange,
        orderChange,
        totalUsers: mockData.totalUsers,
        newUsersToday: mockData.newUsersToday,
        totalProducts: mockData.totalProducts,
        lowStockProducts: mockData.lowStockProducts
      },
      ordersByStatus,
      dailyRevenue,
      topProducts
    })
  } catch (error) {
    console.error('Analytics error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch analytics data' },
      { status: 500 }
    )
  }
}