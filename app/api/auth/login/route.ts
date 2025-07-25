import { NextRequest, NextResponse } from 'next/server'
import jwt from 'jsonwebtoken'

// Mock users for demo - in production this would be Cognito
const mockUsers = [
  { username: 'master@kfashion.com', password: 'password123', email: 'master@kfashion.com', role: 'MASTER_ADMIN' },
  { username: 'brand@kfashion.com', password: 'password123', email: 'brand@kfashion.com', role: 'BRAND_ADMIN' },
  { username: 'buyer@kfashion.com', password: 'password123', email: 'buyer@kfashion.com', role: 'BUYER' },
  { username: 'demo', password: 'demo', email: 'demo@kfashion.com', role: 'MASTER_ADMIN' },
  { username: 'admin', password: 'admin', email: 'admin@kfashion.com', role: 'MASTER_ADMIN' },
]

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    const { username, password } = await request.json()

    if (!username || !password) {
      return NextResponse.json(
        { message: '사용자명과 비밀번호를 입력해주세요.' },
        { status: 400 }
      )
    }

    // Check against mock users (for demo purposes)
    const user = mockUsers.find(u => 
      (u.username === username || u.email === username) && u.password === password
    )

    if (!user) {
      return NextResponse.json(
        { message: '사용자명 또는 비밀번호가 올바르지 않습니다.' },
        { status: 401 }
      )
    }

    const { email, role } = user

    // Create our own JWT token with user info
    const token = jwt.sign(
      {
        username,
        email,
        role,
      },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '1h' }
    )

    // Create response with token in cookie
    const response = NextResponse.json({
      message: '로그인 성공',
      token,
      user: {
        username,
        email,
        role,
      },
    })

    // Set HTTP-only cookie
    response.cookies.set('auth-token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 3600, // 1 hour
    })

    return response
  } catch (error: any) {
    console.error('Login error:', error)

    return NextResponse.json(
      { message: '로그인 중 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}