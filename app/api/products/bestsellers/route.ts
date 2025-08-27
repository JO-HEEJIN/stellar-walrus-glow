import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

// GET /api/products/bestsellers - 베스트셀러 상품 조회 (Mock data)
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const limit = parseInt(searchParams.get('limit') || '10')
    const period = searchParams.get('period') || '30days'

    // Mock bestsellers data
    const mockBestsellers = [
      {
        rank: 1,
        product: {
          id: 'prod_001',
          nameKo: '베스트 한복 드레스',
          nameCn: '最佳韩服连衣裙',
          descriptionKo: '전통과 현대가 만나는 우아한 한복 스타일 드레스',
          category: '상의',
          basePrice: 89000,
          thumbnailImage: 'https://via.placeholder.com/300x300',
          brand: { nameKo: 'K-Fashion Seoul', logoUrl: null },
          images: ['https://via.placeholder.com/300x300']
        },
        salesData: {
          totalQuantity: 156,
          orderCount: 89,
          revenue: 13884000
        }
      },
      {
        rank: 2,
        product: {
          id: 'prod_002',
          nameKo: '모던 한국 블라우스',
          nameCn: '现代韩式衬衫',
          descriptionKo: '현대적 감각의 한국 전통 블라우스',
          category: '상의',
          basePrice: 65000,
          thumbnailImage: 'https://via.placeholder.com/300x300',
          brand: { nameKo: 'Modern Korean', logoUrl: null },
          images: ['https://via.placeholder.com/300x300']
        },
        salesData: {
          totalQuantity: 142,
          orderCount: 78,
          revenue: 9230000
        }
      }
    ].slice(0, limit)

    return NextResponse.json({
      period,
      startDate: period === '7days' ? new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) : 
                period === '30days' ? new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) : 
                period === '90days' ? new Date(Date.now() - 90 * 24 * 60 * 60 * 1000) : undefined,
      endDate: new Date(),
      totalProducts: mockBestsellers.length,
      bestsellers: mockBestsellers,
      isMockData: true
    })

  } catch (error) {
    console.error('Bestsellers fetch error:', error)
    
    return NextResponse.json(
      { error: { message: '베스트셀러 조회 중 오류가 발생했습니다', code: 'INTERNAL_ERROR' } },
      { status: 500 }
    )
  }
}