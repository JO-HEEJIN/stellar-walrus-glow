import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// GET /api/products/bestsellers - 베스트셀러 상품 조회
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json(
        { error: { message: '인증이 필요합니다', code: 'UNAUTHORIZED' } },
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

    // 베스트셀러 상품 조회 (주문된 수량 기준)
    const bestsellers = await prisma.orderItem.groupBy({
      by: ['productId'],
      where: {
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
      },
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
        productImages: {
          select: {
            url: true,
            imageType: true
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
          category: product.category,
          basePrice: product.basePrice,
          thumbnailImage: product.thumbnailImage,
          brand: product.brand,
          images: product.productImages
        },
        salesData: {
          totalQuantity: item._sum.quantity || 0,
          orderCount: item._count.orderId || 0,
          revenue: (item._sum.quantity || 0) * parseFloat(product.basePrice.toString())
        }
      }
    }).filter(Boolean)

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