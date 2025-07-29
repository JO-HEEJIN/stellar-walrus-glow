import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function POST() {
  try {
    // Simple logout - just clear the cookie

    // Create response
    const response = NextResponse.json({
      message: '로그아웃되었습니다.',
    })

    // Clear the auth cookie
    response.cookies.set('auth-token', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 0,
    })

    return response
  } catch (error) {
    console.error('Logout error:', error)
    
    // Still clear the cookie even if there's an error
    const response = NextResponse.json({
      message: '로그아웃되었습니다.',
    })

    response.cookies.set('auth-token', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 0,
    })

    return response
  }
}