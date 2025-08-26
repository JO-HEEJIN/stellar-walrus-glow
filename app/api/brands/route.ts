import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  // Return brands data from mock API since brands aren't frequently updated
  return NextResponse.json({
    success: true,
    data: [
      { id: 'BRAND_001', name: 'K-Fashion Seoul', description: '서울 패션 브랜드', status: 'ACTIVE' },
      { id: 'BRAND_002', name: 'Modern Korean', description: '현대적 한국 스타일', status: 'ACTIVE' },
      { id: 'BRAND_003', name: 'Hanbok Modern', description: '현대적 한복', status: 'ACTIVE' },
      { id: 'BRAND_004', name: 'Urban Korean', description: '도시적 한국 패션', status: 'ACTIVE' },
      { id: 'BRAND_005', name: 'Traditional Plus', description: '전통적 스타일', status: 'ACTIVE' }
    ]
  })
}

export async function POST(request: NextRequest) {
  // Redirect to admin panel for brand management
  const baseUrl = new URL(request.url).origin
  return NextResponse.redirect(`${baseUrl}/admin/brands`)
}