import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  // Redirect to v2 products API
  const baseUrl = new URL(request.url).origin
  const productsV2Url = `${baseUrl}/api/products-v2/${params.id}`
  
  return NextResponse.redirect(productsV2Url)
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  // Redirect to v2 products API
  const baseUrl = new URL(request.url).origin
  const productsV2Url = `${baseUrl}/api/products-v2/${params.id}`
  
  return NextResponse.redirect(productsV2Url, {
    status: 307, // Preserve PATCH method
  })
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  // Redirect to v2 products API
  const baseUrl = new URL(request.url).origin
  const productsV2Url = `${baseUrl}/api/products-v2/${params.id}`
  
  return NextResponse.redirect(productsV2Url, {
    status: 307, // Preserve DELETE method
  })
}