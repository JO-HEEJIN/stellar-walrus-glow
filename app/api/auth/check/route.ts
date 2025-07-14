import { NextResponse } from 'next/server'
import { auth } from '@/auth'

export async function GET() {
  try {
    const session = await auth()
    
    return NextResponse.json({
      authenticated: !!session,
      user: session?.user || null,
      message: session ? 'Authenticated' : 'Not authenticated'
    })
  } catch (error) {
    return NextResponse.json({
      authenticated: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      message: 'Error checking authentication'
    })
  }
}