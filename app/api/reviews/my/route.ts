import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '20')
    const sort = searchParams.get('sort') || 'createdAt:desc'

    // Mock review data
    const mockReviews = [
      {
        id: '1',
        productId: 'prod-1',
        productName: '스트레치 벨트',
        productImage: '/placeholder.svg',
        rating: 5,
        title: '정말 만족스러운 상품입니다',
        content: '품질이 우수하고 배송도 빨라서 만족합니다. 추천해요!',
        status: 'PUBLISHED',
        createdAt: new Date(Date.now() - 86400000 * 3).toISOString(), // 3 days ago
        updatedAt: new Date(Date.now() - 86400000 * 3).toISOString(),
      },
      {
        id: '2',
        productId: 'prod-2',
        productName: '코튼 티셔츠',
        productImage: '/placeholder.svg',
        rating: 4,
        title: '괜찮은 품질',
        content: '가격 대비 만족스럽습니다. 색상이 예쁘네요.',
        status: 'PUBLISHED',
        createdAt: new Date(Date.now() - 86400000 * 7).toISOString(), // 7 days ago
        updatedAt: new Date(Date.now() - 86400000 * 7).toISOString(),
      },
      {
        id: '3',
        productId: 'prod-3',
        productName: '스키니 청바지',
        productImage: '/placeholder.svg',
        rating: 3,
        title: '보통이에요',
        content: '사이즈가 조금 작은 것 같아요. 다음엔 한 사이즈 큰 걸로...',
        status: 'PENDING',
        createdAt: new Date(Date.now() - 86400000 * 1).toISOString(), // 1 day ago
        updatedAt: new Date(Date.now() - 86400000 * 1).toISOString(),
      }
    ]

    // Sort reviews
    const sortedReviews = [...mockReviews].sort((a, b) => {
      if (sort === 'createdAt:desc') {
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      }
      return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
    })

    return NextResponse.json({
      success: true,
      data: {
        reviews: sortedReviews.slice(0, limit),
        total: mockReviews.length,
        summary: {
          total: mockReviews.length,
          published: mockReviews.filter(r => r.status === 'PUBLISHED').length,
          pending: mockReviews.filter(r => r.status === 'PENDING').length,
          rejected: mockReviews.filter(r => r.status === 'REJECTED').length,
          avgRating: mockReviews.reduce((sum, r) => sum + r.rating, 0) / mockReviews.length
        }
      }
    })
  } catch (error) {
    console.error('My reviews fetch error:', error)
    return NextResponse.json(
      { success: false, error: '리뷰 정보를 불러오는데 실패했습니다' },
      { status: 500 }
    )
  }
}