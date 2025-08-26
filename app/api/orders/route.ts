import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  // Redirect to v2 orders API which uses RDS Data API
  const baseUrl = new URL(request.url).origin
  const ordersV2Url = `${baseUrl}/api/orders-v2`
  
  // Forward query parameters
  const { searchParams } = new URL(request.url)
  if (searchParams.toString()) {
    return NextResponse.redirect(`${ordersV2Url}?${searchParams.toString()}`)
  }
  
  return NextResponse.redirect(ordersV2Url)
}

export async function POST(request: NextRequest) {
  // Redirect to v2 orders API which uses RDS Data API
  const baseUrl = new URL(request.url).origin
  const ordersV2Url = `${baseUrl}/api/orders-v2`
  
  return NextResponse.redirect(ordersV2Url, {
    status: 307, // Preserve POST method
  })
}