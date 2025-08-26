import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function GET() {
  // Redirect to main performance API which uses RDS Data API
  const baseUrl = process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000'
  const performanceUrl = `${baseUrl}/api/performance`
  
  return NextResponse.redirect(performanceUrl)
}