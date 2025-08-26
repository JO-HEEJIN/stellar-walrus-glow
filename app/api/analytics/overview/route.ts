import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  // Redirect to v2 analytics API which uses RDS Data API
  const baseUrl = new URL(request.url).origin
  const analyticsV2Url = `${baseUrl}/api/analytics-v2`
  
  // Forward query parameters
  const { searchParams } = new URL(request.url)
  if (searchParams.toString()) {
    return NextResponse.redirect(`${analyticsV2Url}?${searchParams.toString()}`)
  }
  
  return NextResponse.redirect(analyticsV2Url)
}