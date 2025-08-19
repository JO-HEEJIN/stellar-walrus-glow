import { NextRequest, NextResponse } from 'next/server'
import { prismaRead } from '@/lib/prisma-load-balanced'
import { createErrorResponse, BusinessError, ErrorCodes, HttpStatus } from '@/lib/errors'

/**
 * @swagger
 * /api/products/analytics:
 *   get:
 *     summary: Get product analytics and insights
 *     description: Retrieve comprehensive analytics data for products including performance, inventory insights, and trends
 *     tags: [Analytics]
 *     parameters:
 *       - in: query
 *         name: period
 *         schema:
 *           type: string
 *           enum: [7d, 30d, 90d, 1y]
 *         description: Time period for analytics
 *       - in: query
 *         name: brand
 *         schema:
 *           type: string
 *         description: Filter by brand ID
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *         description: Filter by category ID
 *       - in: query
 *         name: from
 *         schema:
 *           type: string
 *           format: date-time
 *         description: Start date for custom range
 *       - in: query
 *         name: to
 *         schema:
 *           type: string
 *           format: date-time
 *         description: End date for custom range
 *     responses:
 *       200:
 *         description: Analytics data retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     overview:
 *                       type: object
 *                     trends:
 *                       type: array
 *                     topProducts:
 *                       type: array
 *                     categoryBreakdown:
 *                       type: array
 *                     inventoryInsights:
 *                       type: object
 *                     priceAnalysis:
 *                       type: object
 *       401:
 *         description: Unauthorized
 */
export async function GET(request: NextRequest) {
  try {
    console.log('🔄 Starting analytics data fetch...')

    // Parse query parameters
    const { searchParams } = new URL(request.url)
    const period = searchParams.get('period') || '30d'
    const brandFilter = searchParams.get('brand')
    const categoryFilter = searchParams.get('category')
    const fromDate = searchParams.get('from')
    const toDate = searchParams.get('to')

    // For development mode, check if auth is skipped
    if (process.env.NODE_ENV === 'development' || process.env.NEXT_PUBLIC_SKIP_AUTH === 'true') {
      console.log('🔧 Development mode: skipping auth check for analytics')
    } else {
      // TODO: Add proper authentication check
      // const session = await getServerSession(authOptions)
      // if (!session || !['BRAND_ADMIN', 'MASTER_ADMIN'].includes(session.user.role)) {
      //   return createErrorResponse(ErrorCodes.UNAUTHORIZED, HttpStatus.UNAUTHORIZED)
      // }
    }

    console.log(`📊 Analytics parameters: period=${period}, brand=${brandFilter}, category=${categoryFilter}`)

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
    if (fromDate) startDate.setTime(new Date(fromDate).getTime())
    if (toDate) endDate.setTime(new Date(toDate).getTime())

    let analyticsData: any = {}

    if (process.env.NODE_ENV === 'development') {
      // Mock analytics data for development
      console.log('📦 Using mock analytics data')
      
      analyticsData = {
        overview: {
          totalProducts: 156,
          totalViews: 12430,
          totalOrders: 89,
          totalRevenue: 4567000,
          averagePrice: 51300,
          lowStockCount: 8,
          inactiveCount: 12
        },
        trends: generateMockTrends(startDate, endDate),
        topProducts: [
          {
            id: '1',
            name: '프리미엄 코튼 셔츠',
            sku: 'SHIRT-001',
            views: 2430,
            orders: 45,
            revenue: 2250000,
            trend: 'up',
            changePercent: 15.3
          },
          {
            id: '2',
            name: '캐주얼 데님 팬츠',
            sku: 'DENIM-002',
            views: 1890,
            orders: 32,
            revenue: 1920000,
            trend: 'up',
            changePercent: 8.7
          },
          {
            id: '3',
            name: '스포츠 운동화',
            sku: 'SHOES-003',
            views: 1650,
            orders: 28,
            revenue: 1680000,
            trend: 'down',
            changePercent: -5.2
          },
          {
            id: '4',
            name: '여성 블라우스',
            sku: 'BLOUSE-004',
            views: 1420,
            orders: 25,
            revenue: 1500000,
            trend: 'stable',
            changePercent: 2.1
          },
          {
            id: '5',
            name: '남성 정장',
            sku: 'SUIT-005',
            views: 1380,
            orders: 23,
            revenue: 2760000,
            trend: 'up',
            changePercent: 12.8
          }
        ],
        categoryBreakdown: [
          { category: '상의', productCount: 45, revenue: 2100000, percentage: 46.0 },
          { category: '하의', productCount: 38, revenue: 1800000, percentage: 39.4 },
          { category: '신발', productCount: 23, revenue: 667000, percentage: 14.6 }
        ],
        inventoryInsights: {
          lowStock: [
            { id: '1', name: '인기 티셔츠', sku: 'TSHIRT-001', current: 3, recommended: 25 },
            { id: '2', name: '베스트 진', sku: 'JEANS-002', current: 5, recommended: 30 },
            { id: '3', name: '스니커즈', sku: 'SNEAKER-003', current: 2, recommended: 20 }
          ],
          overStock: [
            { id: '4', name: '계절 자켓', sku: 'JACKET-004', current: 85, avgSales: 12 },
            { id: '5', name: '정장 셔츠', sku: 'FORMAL-005', current: 67, avgSales: 8 },
            { id: '6', name: '드레스', sku: 'DRESS-006', current: 45, avgSales: 6 }
          ],
          fastMoving: [
            { id: '7', name: '데일리 후드', sku: 'HOOD-007', velocity: 4.2 },
            { id: '8', name: '캐주얼 스니커즈', sku: 'SNEAKER-008', velocity: 3.8 },
            { id: '9', name: '베이직 티', sku: 'TSHIRT-009', velocity: 3.5 }
          ]
        },
        priceAnalysis: {
          priceRanges: [
            { range: '0-30,000원', count: 34, percentage: 21.8 },
            { range: '30,000-60,000원', count: 67, percentage: 42.9 },
            { range: '60,000-100,000원', count: 38, percentage: 24.4 },
            { range: '100,000원+', count: 17, percentage: 10.9 }
          ],
          profitability: {
            high: 45,
            medium: 78,
            low: 33
          }
        }
      }
    } else {
      // Build where clause for filtering
      const whereClause: any = {
        createdAt: {
          gte: startDate,
          lte: endDate
        }
      }
      
      if (brandFilter) {
        whereClause.brandId = brandFilter
      }
      
      if (categoryFilter) {
        whereClause.categoryId = categoryFilter
      }

      // Fetch actual data from database
      const [
        products,
        totalViews,
        totalOrders,
        lowStockProducts
      ] = await Promise.all([
        prismaRead.product.findMany({
          where: whereClause,
          include: {
            brand: { select: { nameKo: true } },
            category: { select: { name: true } },
          }
        }),
        // These would be actual analytics queries in a real implementation
        Promise.resolve(12430), // Mock total views
        Promise.resolve(89), // Mock total orders
        prismaRead.product.findMany({
          where: {
            ...whereClause,
            inventory: { lt: 10 }
          },
          take: 10
        })
      ])

      // Process the data
      const totalProducts = products.length
      const totalRevenue = products.reduce((sum, p) => sum + Number(p.basePrice), 0)
      const averagePrice = totalProducts > 0 ? products.reduce((sum, p) => sum + Number(p.basePrice), 0) / totalProducts : 0
      const inactiveCount = products.filter(p => p.status === 'INACTIVE').length

      // Build analytics object
      analyticsData = {
        overview: {
          totalProducts,
          totalViews,
          totalOrders,
          totalRevenue,
          averagePrice: Math.round(averagePrice),
          lowStockCount: lowStockProducts.length,
          inactiveCount
        },
        trends: generateMockTrends(startDate, endDate), // In real implementation, calculate from actual data
        topProducts: products
          .sort((a, b) => b.viewCount - a.viewCount)
          .slice(0, 5)
          .map((product, index) => ({
            id: product.id,
            name: product.nameKo,
            sku: product.sku,
            views: Math.floor(Math.random() * 3000) + 1000, // Mock data
            orders: Math.floor(Math.random() * 50), // Mock orders count
            revenue: Number(product.basePrice) * Math.floor(Math.random() * 50),
            trend: Math.random() > 0.5 ? 'up' : 'down',
            changePercent: Math.round((Math.random() - 0.5) * 40 * 100) / 100
          })),
        // Add other analytics sections...
        categoryBreakdown: [],
        inventoryInsights: {
          lowStock: lowStockProducts.map(p => ({
            id: p.id,
            name: p.nameKo,
            sku: p.sku,
            current: p.inventory,
            recommended: Math.max(20, p.inventory * 3)
          })),
          overStock: [],
          fastMoving: []
        },
        priceAnalysis: {
          priceRanges: calculatePriceRanges(products),
          profitability: {
            high: Math.floor(totalProducts * 0.3),
            medium: Math.floor(totalProducts * 0.5),
            low: Math.floor(totalProducts * 0.2)
          }
        }
      }
    }

    console.log(`📊 Analytics data prepared: ${analyticsData.overview.totalProducts} products analyzed`)

    return NextResponse.json({
      success: true,
      data: analyticsData
    })

  } catch (error: any) {
    console.error('❌ Analytics error:', error)
    return createErrorResponse(
      new BusinessError(ErrorCodes.INTERNAL_ERROR, HttpStatus.INTERNAL_SERVER_ERROR, error.message || 'Analytics fetch failed'),
      request.url
    )
  }
}

// Helper functions
function generateMockTrends(startDate: Date, endDate: Date) {
  const trends = []
  const daysDiff = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24))
  const intervals = Math.min(10, Math.max(5, Math.floor(daysDiff / 7)))
  
  for (let i = 0; i < intervals; i++) {
    const date = new Date(startDate.getTime() + (i * (daysDiff / intervals) * 24 * 60 * 60 * 1000))
    trends.push({
      period: date.toISOString().split('T')[0],
      views: Math.floor(Math.random() * 500) + 1000,
      orders: Math.floor(Math.random() * 20) + 10,
      revenue: Math.floor(Math.random() * 500000) + 500000,
      change: Math.round((Math.random() - 0.5) * 30 * 100) / 100
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
    const count = products.filter(p => p.basePrice >= range.min && p.basePrice < range.max).length
    return {
      range: range.range,
      count,
      percentage: total > 0 ? Math.round((count / total) * 100 * 10) / 10 : 0
    }
  })
}