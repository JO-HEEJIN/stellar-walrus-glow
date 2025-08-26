export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { getDatabase } from '@/lib/db/adapter'
import { rateLimiters, getIdentifier } from '@/lib/rate-limit'
import { createErrorResponse, BusinessError, ErrorCodes, HttpStatus } from '@/lib/errors'
import { logger } from '@/lib/logger'

const analyticsSchema = z.object({
  period: z.enum(['7d', '30d', '90d', '1y']).default('30d'),
  brand: z.string().optional(),
  category: z.string().optional(),
  from: z.string().optional(),
  to: z.string().optional(),
})

/**
 * GET /api/analytics-v2
 * Get comprehensive analytics overview using RDS Data API
 */
export async function GET(request: NextRequest) {
  try {
    const identifier = getIdentifier(request)
    
    // Rate limiting
    try {
      await rateLimiters.api.limit(identifier)
    } catch (error) {
      return createErrorResponse(
        new BusinessError(ErrorCodes.SYSTEM_RATE_LIMIT_EXCEEDED, HttpStatus.TOO_MANY_REQUESTS),
        request.url
      )
    }

    // Parse query parameters
    const { searchParams } = new URL(request.url)
    const queryParams = Object.fromEntries(searchParams.entries())
    
    const { period, brand, category, from, to } = analyticsSchema.parse(queryParams)

    // Calculate date range based on period
    const endDate = new Date()
    const startDate = new Date()
    
    switch (period) {
      case '7d':
        startDate.setDate(endDate.getDate() - 7)
        break
      case '30d':
        startDate.setDate(endDate.getDate() - 30)
        break
      case '90d':
        startDate.setDate(endDate.getDate() - 90)
        break
      case '1y':
        startDate.setFullYear(endDate.getFullYear() - 1)
        break
    }

    // Use custom date range if provided
    if (from) startDate.setTime(new Date(from).getTime())
    if (to) endDate.setTime(new Date(to).getTime())

    // Get database adapter
    const db = getDatabase()

    // Get analytics overview
    const overview = await db.getAnalyticsOverview()

    // Get recent orders for trend analysis
    const recentOrders = await db.getRecentOrders(50)

    // Get filtered products for insights
    const products = await db.getProducts({
      brandId: brand,
      categoryId: category,
      limit: 100
    })

    // Calculate additional insights
    const lowStockProducts = products.filter((p: any) => (p.stock || 0) < 10)
    const averagePrice = products.length > 0 
      ? products.reduce((sum: number, p: any) => sum + (p.price || 0), 0) / products.length 
      : 0

    // Calculate price distribution
    const priceRanges = calculatePriceRanges(products)

    logger.info('Analytics data compiled successfully', {
      totalProducts: overview.totalProducts,
      totalOrders: overview.totalOrders,
      period,
      brand: brand || 'all',
      category: category || 'all'
    })

    return NextResponse.json({
      data: {
        overview: {
          ...overview,
          averagePrice: Math.round(averagePrice),
          lowStockCount: lowStockProducts.length,
          period: period,
          dateRange: {
            from: startDate.toISOString(),
            to: endDate.toISOString()
          }
        },
        trends: generateTrendsFromOrders(recentOrders, startDate, endDate),
        topProducts: products
          .sort((a: any, b: any) => (b.stock || 0) - (a.stock || 0))
          .slice(0, 10)
          .map((product: any) => ({
            id: product.id,
            name: product.name,
            sku: product.sku,
            price: product.price,
            stock: product.stock || 0,
            status: product.status || 'ACTIVE'
          })),
        inventoryInsights: {
          lowStock: lowStockProducts.slice(0, 10).map((p: any) => ({
            id: p.id,
            name: p.name,
            sku: p.sku,
            current: p.stock || 0,
            recommended: Math.max(20, (p.stock || 0) * 3)
          })),
          totalProducts: products.length,
          activeProducts: products.filter((p: any) => p.status === 'ACTIVE').length,
          inactiveProducts: products.filter((p: any) => p.status === 'INACTIVE').length,
        },
        priceAnalysis: {
          priceRanges,
          averagePrice: Math.round(averagePrice),
          highestPrice: products.reduce((max: number, p: any) => Math.max(max, p.price || 0), 0),
          lowestPrice: products.reduce((min: number, p: any) => Math.min(min, p.price || 0), Infinity)
        }
      },
      meta: {
        timestamp: new Date().toISOString(),
        apiVersion: 'v2',
        dataSource: 'RDS Data API',
        filters: { period, brand, category }
      }
    })

  } catch (error) {
    logger.error('Analytics fetch error:', error instanceof Error ? error : new Error(String(error)))
    
    if (error instanceof z.ZodError) {
      return createErrorResponse(
        new BusinessError(ErrorCodes.VALIDATION_ERROR, HttpStatus.BAD_REQUEST, error.errors),
        request.url
      )
    }

    return createErrorResponse(
      new BusinessError(ErrorCodes.SYSTEM_DATABASE_ERROR, HttpStatus.INTERNAL_SERVER_ERROR),
      request.url
    )
  }
}

// Helper functions
function generateTrendsFromOrders(orders: any[], startDate: Date, endDate: Date) {
  const daysDiff = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24))
  const intervals = Math.min(10, Math.max(5, Math.floor(daysDiff / 7)))
  const trends = []

  for (let i = 0; i < intervals; i++) {
    const periodStart = new Date(startDate.getTime() + (i * (daysDiff / intervals) * 24 * 60 * 60 * 1000))
    const periodEnd = new Date(startDate.getTime() + ((i + 1) * (daysDiff / intervals) * 24 * 60 * 60 * 1000))
    
    const periodOrders = orders.filter((order: any) => {
      const orderDate = new Date(order.createdAt)
      return orderDate >= periodStart && orderDate < periodEnd
    })

    trends.push({
      period: periodStart.toISOString().split('T')[0],
      orders: periodOrders.length,
      revenue: periodOrders.reduce((sum: number, order: any) => sum + (order.total || 0), 0),
      averageOrderValue: periodOrders.length > 0 
        ? periodOrders.reduce((sum: number, order: any) => sum + (order.total || 0), 0) / periodOrders.length 
        : 0
    })
  }

  return trends
}

function calculatePriceRanges(products: any[]) {
  const ranges = [
    { range: '0-30,000원', min: 0, max: 30000 },
    { range: '30,000-60,000원', min: 30000, max: 60000 },
    { range: '60,000-100,000원', min: 60000, max: 100000 },
    { range: '100,000원+', min: 100000, max: Infinity }
  ]
  
  const total = products.length
  
  return ranges.map(range => {
    const count = products.filter((p: any) => 
      (p.price || 0) >= range.min && (p.price || 0) < range.max
    ).length
    return {
      range: range.range,
      count,
      percentage: total > 0 ? Math.round((count / total) * 100 * 10) / 10 : 0
    }
  })
}