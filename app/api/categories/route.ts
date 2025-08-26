import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  // Return categories data from mock API since categories aren't frequently updated
  return NextResponse.json({
    success: true,
    data: [
      { id: 'CAT_001', name: '상의', nameEn: 'Top', icon: '👕' },
      { id: 'CAT_002', name: '하의', nameEn: 'Bottom', icon: '👖' },
      { id: 'CAT_003', name: '아우터', nameEn: 'Outer', icon: '🧥' },
      { id: 'CAT_004', name: '원피스', nameEn: 'Dress', icon: '👗' },
      { id: 'CAT_005', name: '액세서리', nameEn: 'Accessories', icon: '👜' }
    ]
  })
}

export async function POST(request: NextRequest) {
  // Redirect to admin panel for category management
  const baseUrl = new URL(request.url).origin
  return NextResponse.redirect(`${baseUrl}/admin/categories`)
}