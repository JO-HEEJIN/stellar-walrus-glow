import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  // Redirect to v2 products API which uses RDS Data API
  const baseUrl = new URL(request.url).origin
  const productsV2Url = `${baseUrl}/api/products-v2`
  
  // Forward query parameters
  const { searchParams } = new URL(request.url)
  if (searchParams.toString()) {
    return NextResponse.redirect(`${productsV2Url}?${searchParams.toString()}`)
  }
  
  return NextResponse.redirect(productsV2Url)
}

export async function POST(request: NextRequest) {
  // Redirect to v2 products API which uses RDS Data API
  const baseUrl = new URL(request.url).origin
  const productsV2Url = `${baseUrl}/api/products-v2`
  
  // Forward the request body to v2 endpoint
  const body = await request.text()
  
  return NextResponse.redirect(productsV2Url, {
    status: 307, // Preserve POST method
    headers: {
      'Content-Type': 'application/json',
    }
  })
}