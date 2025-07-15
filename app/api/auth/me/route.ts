import { NextRequest, NextResponse } from 'next/server'
import jwt from 'jsonwebtoken'

export async function GET(request: NextRequest) {
  try {
    // Get token from cookie
    const token = request.cookies.get('auth-token')?.value

    if (!token) {
      return NextResponse.json(
        { message: '인증 토큰이 없습니다.' },
        { status: 401 }
      )
    }

    // Verify and decode the token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key') as any

    return NextResponse.json({
      user: {
        username: decoded.username,
        role: decoded.role,
      },
    })
  } catch (error) {
    console.error('Auth verification error:', error)
    
    return NextResponse.json(
      { message: '유효하지 않은 토큰입니다.' },
      { status: 401 }
    )
  }
}