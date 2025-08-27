export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    // Mock order statistics data
    const stats = {
      total: 156,
      pending: 23,
      paid: 0,
      preparing: 15,
      shipped: 48,
      delivered: 67,
      cancelled: 3
    }

    return NextResponse.json(stats)
  } catch (error) {
    console.error('GET /api/orders/stats error:', error)
    
    return new NextResponse(
      JSON.stringify({ 
        error: { 
          message: '주문 통계 조회 중 오류가 발생했습니다', 
          code: 'INTERNAL_ERROR' 
        } 
      }),
      { 
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    )
  }
}