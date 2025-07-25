export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server'
// import { prisma } from '@/lib/prisma'
// import { rateLimiters, getIdentifier } from '@/lib/rate-limit'
// import { createErrorResponse, BusinessError, ErrorCodes, HttpStatus } from '@/lib/errors'
// import { z } from 'zod'


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

    // Parse query parameters
    const { searchParams } = new URL(request.url)
    const period = searchParams.get('period') || 'daily'
    const isBrandAdmin = userInfo.role === 'BRAND_ADMIN'

    // Generate mock revenue data based on period
    const generateRevenueData = (period: string, count: number) => {
      return Array.from({ length: count }, (_, i) => {
        const date = new Date()
        let periodStr = ''
        
        switch (period) {
          case 'monthly':
            date.setMonth(date.getMonth() - (count - 1 - i))
            periodStr = date.toISOString().slice(0, 7) // YYYY-MM
            break
          case 'weekly':
            date.setDate(date.getDate() - (count - 1 - i) * 7)
            periodStr = `${date.getFullYear()}-W${Math.ceil(date.getDate() / 7)}`
            break
          default: // daily
            date.setDate(date.getDate() - (count - 1 - i))
            periodStr = date.toISOString().slice(0, 10) // YYYY-MM-DD
        }
        
        const baseMultiplier = isBrandAdmin ? 1 : 3
        return {
          period: periodStr,
          weekStart: period === 'weekly' ? date.toISOString().slice(0, 10) : null,
          orderCount: Math.floor(Math.random() * 20 + 5) * baseMultiplier,
          totalRevenue: Math.floor(Math.random() * 1000000 + 500000) * baseMultiplier,
          avgOrderValue: Math.floor(Math.random() * 100000 + 80000),
          uniqueCustomers: Math.floor(Math.random() * 50 + 20) * baseMultiplier
        }
      })
    }

    const getDataCount = (period: string) => {
      switch (period) {
        case 'monthly': return 12
        case 'weekly': return 12
        default: return 30
      }
    }

    const revenueData = generateRevenueData(period, getDataCount(period))

    const categoryBreakdown = isBrandAdmin ? [
      { categoryName: '상의', orderCount: 45, totalQuantity: 67, totalRevenue: 5980000 },
      { categoryName: '하의', orderCount: 32, totalQuantity: 38, totalRevenue: 3800000 },
      { categoryName: '아우터', orderCount: 28, totalQuantity: 31, totalRevenue: 4030000 },
      { categoryName: '드레스', orderCount: 15, totalQuantity: 18, totalRevenue: 2880000 }
    ] : [
      { categoryName: '상의', orderCount: 156, totalQuantity: 234, totalRevenue: 15600000 },
      { categoryName: '하의', orderCount: 98, totalQuantity: 145, totalRevenue: 12450000 },
      { categoryName: '아우터', orderCount: 87, totalQuantity: 112, totalRevenue: 14560000 },
      { categoryName: '드레스', orderCount: 67, totalQuantity: 89, totalRevenue: 13340000 },
      { categoryName: '액세서리', orderCount: 45, totalQuantity: 78, totalRevenue: 6240000 }
    ]

    const brandComparison = isBrandAdmin ? [] : [
      { brandName: 'test-brand', orderCount: 124, totalQuantity: 234, totalRevenue: 18560000 },
      { brandName: 'K-Fashion', orderCount: 98, totalQuantity: 189, totalRevenue: 15230000 },
      { brandName: 'Urban Style', orderCount: 87, totalQuantity: 156, totalRevenue: 12890000 },
      { brandName: 'Modern Wear', orderCount: 76, totalQuantity: 123, totalRevenue: 11200000 },
      { brandName: 'Style Plus', orderCount: 65, totalQuantity: 98, totalRevenue: 9870000 }
    ]

    const endDate = new Date()
    const startDate = new Date()
    startDate.setMonth(startDate.getMonth() - 3)

    const responseData = {
      period,
      dateRange: {
        start: startDate.toISOString(),
        end: endDate.toISOString()
      },
      revenueData,
      categoryBreakdown,
      brandComparison
    }
    
    return NextResponse.json(responseData)
  } catch (error) {
    console.error('Revenue analytics error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch revenue analytics' },
      { status: 500 }
    )
  }
}