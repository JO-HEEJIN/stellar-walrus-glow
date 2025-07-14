import { NextRequest } from 'next/server'
import { auth } from '@/auth'

// Mock data for development
const getMockStats = (_brandId: string) => {
  return {
    totalProducts: 12,
    activeProducts: 10,
    totalOrders: 45,
    totalRevenue: 15750000,
    totalUsers: 3,
    recentOrders: [
      {
        id: '1',
        orderNumber: 'ORD-2024-001',
        totalAmount: 850000,
        status: 'COMPLETED',
        createdAt: new Date().toISOString(),
        buyer: {
          name: '김철수',
          email: 'buyer1@example.com',
        },
      },
      {
        id: '2',
        orderNumber: 'ORD-2024-002',
        totalAmount: 1200000,
        status: 'PROCESSING',
        createdAt: new Date(Date.now() - 86400000).toISOString(),
        buyer: {
          name: '이영희',
          email: 'buyer2@example.com',
        },
      },
    ],
    topProducts: [
      {
        id: '1',
        nameKo: '프리미엄 티셔츠',
        orderCount: 15,
        revenue: 3750000,
      },
      {
        id: '2',
        nameKo: '데님 팬츠',
        orderCount: 12,
        revenue: 4800000,
      },
      {
        id: '3',
        nameKo: '캐주얼 재킷',
        orderCount: 8,
        revenue: 4000000,
      },
    ],
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth()
    if (!session?.user) {
      return Response.json(
        { error: { message: 'Unauthorized' } },
        { status: 401 }
      )
    }

    const brandId = params.id

    // Check permissions - only brand owners and master admins can view stats
    const isOwnBrand = session.user.brandId === brandId
    const isMasterAdmin = session.user.role === 'MASTER_ADMIN'

    if (!isOwnBrand && !isMasterAdmin) {
      return Response.json(
        { error: { message: 'Forbidden' } },
        { status: 403 }
      )
    }

    // For now, return mock data
    // In production, this would aggregate data from orders, products, etc.
    const stats = getMockStats(brandId)

    return Response.json(stats)
  } catch (error) {
    console.error('Brand stats error:', error)
    return Response.json(
      { error: { message: 'Failed to fetch brand statistics' } },
      { status: 500 }
    )
  }
}