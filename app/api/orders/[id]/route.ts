import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  // Redirect to v2 orders API
  const baseUrl = new URL(request.url).origin
  const ordersV2Url = `${baseUrl}/api/orders-v2/${params.id}`
  
  return NextResponse.redirect(ordersV2Url)
}