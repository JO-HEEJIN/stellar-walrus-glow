import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function PATCH(request: NextRequest) {
  // Redirect to v2 users API which uses RDS Data API
  const baseUrl = new URL(request.url).origin
  const usersV2Url = `${baseUrl}/api/users-v2/profile`
  
  return NextResponse.redirect(usersV2Url, {
    status: 307, // Preserve PATCH method
  })
}

export async function GET(request: NextRequest) {
  // Redirect to v2 users API which uses RDS Data API  
  const baseUrl = new URL(request.url).origin
  const usersV2Url = `${baseUrl}/api/users-v2/profile`
  
  return NextResponse.redirect(usersV2Url)
}