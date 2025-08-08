import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET /api/products/bestsellers - 베스트셀러 상품 조회
export async function GET(request: NextRequest) {
  try {
    // Check authentication
    const token = request.cookies.get('auth-token')?.value
    if (!token) {
      return NextResponse.json(
        { error: { message: '인증이 필요합니다', code: 'UNAUTHORIZED' } },
        { status: 401 }
      )
    }

    // Verify token
    const jwt = await import('jsonwebtoken')
    let userInfo
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key') as any
      userInfo = decoded
    } catch (error) {
      return NextResponse.json(
        { error: { message: '유효하지 않은 인증입니다', code: 'INVALID_TOKEN' } },
        { status: 401 }
      )
    }

    const searchParams = request.nextUrl.searchParams
    const limit = parseInt(searchParams.get('limit') || '10')
    const period = searchParams.get('period') || '30days' // 7days, 30days, 90days, all

    // 기간 설정
    let startDate: Date | undefined
    const now = new Date()
    
    switch (period) {
      case '7days':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
        break
      case '30days':
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
        break
      case '90days':
        startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000)
        break
      case 'all':
      default:
        startDate = undefined
    }

    // Set up product filter based on user role
    const productWhere: any = {}
    const orderItemWhere: any = {
      order: {
        status: {
          notIn: ['CANCELLED', 'REFUNDED']
        },
        ...(startDate && {
          createdAt: {
            gte: startDate
          }
        })
      }
    }
    
    if (userInfo.role === 'BRAND_ADMIN') {
      // Get user's brandId
      const userEmail = userInfo.username === 'kf002' ? 'brand@kfashion.com' :
                        `${userInfo.username}@kfashion.com`
      
      const user = await prisma.user.findFirst({
        where: { email: userEmail }
      })
      
      if (user?.brandId) {
        productWhere.brandId = user.brandId
        orderItemWhere.product = {
          brandId: user.brandId
        }
      }
    }

    // 베스트셀러 상품 조회 (주문된 수량 기준)
    const bestsellers = await prisma.orderItem.groupBy({
      by: ['productId'],
      where: orderItemWhere,
      _sum: {
        quantity: true
      },
      _count: {
        orderId: true
      },
      orderBy: {
        _sum: {
          quantity: 'desc'
        }
      },
      take: limit
    })

    // 상품 ID 추출
    const productIds = bestsellers.map(item => item.productId)

    // 상품 상세 정보 조회
    const products = await prisma.product.findMany({
      where: {
        id: {
          in: productIds
        }
      },
      include: {
        brand: {
          select: {
            id: true,
            nameKo: true,
            nameCn: true,
            logoUrl: true
          }
        },
        category: {
          select: {
            id: true,
            name: true
          }
        }
      }
    })

    // 베스트셀러 데이터와 상품 정보 합치기
    const bestsellersWithDetails = bestsellers.map((item, index) => {
      const product = products.find(p => p.id === item.productId)
      if (!product) return null

      return {
        rank: index + 1,
        product: {
          id: product.id,
          nameKo: product.nameKo,
          nameCn: product.nameCn,
          descriptionKo: product.descriptionKo,
          descriptionCn: product.descriptionCn,
          category: product.category?.name || product.categoryId || 'uncategorized',
          basePrice: product.basePrice,
          thumbnailImage: product.thumbnailImage,
          brand: product.brand,
          images: product.images
        },
        salesData: {
          totalQuantity: item._sum.quantity || 0,
          orderCount: item._count.orderId || 0,
          revenue: (item._sum.quantity || 0) * parseFloat(product.basePrice.toString())
        }
      }
    }).filter(Boolean)

    // If no bestsellers found, return mock data for testing
    if (bestsellersWithDetails.length === 0) {
      // Fetch some active products to use as mock bestsellers
      const mockProducts = await prisma.product.findMany({
        where: {
          status: 'ACTIVE',
          ...productWhere
        },
        include: {
          brand: {
            select: {
              id: true,
              nameKo: true,
              nameCn: true,
              logoUrl: true
            }
          }
        },
        take: 5,
        orderBy: {
          createdAt: 'desc'
        }
      })

      const mockBestsellers = mockProducts.map((product, index) => ({
        rank: index + 1,
        product: {
          id: product.id,
          nameKo: product.nameKo,
          nameCn: product.nameCn,
          descriptionKo: product.descriptionKo,
          descriptionCn: product.descriptionCn,
          category: product.categoryId || 'uncategorized',
          basePrice: product.basePrice,
          thumbnailImage: product.thumbnailImage,
          brand: product.brand,
          images: product.images
        },
        salesData: {
          totalQuantity: Math.floor(Math.random() * 50) + 10,
          orderCount: Math.floor(Math.random() * 20) + 5,
          revenue: (Math.floor(Math.random() * 50) + 10) * parseFloat(product.basePrice.toString())
        }
      }))

      return NextResponse.json({
        period,
        startDate,
        endDate: now,
        totalProducts: mockBestsellers.length,
        bestsellers: mockBestsellers,
        isMockData: true
      })
    }

    return NextResponse.json({
      period,
      startDate,
      endDate: now,
      totalProducts: bestsellersWithDetails.length,
      bestsellers: bestsellersWithDetails
    })

  } catch (error) {
    console.error('Bestsellers fetch error:', error)
    
    return NextResponse.json(
      { error: { message: '베스트셀러 조회 중 오류가 발생했습니다', code: 'INTERNAL_ERROR' } },
      { status: 500 }
    )
  }
}