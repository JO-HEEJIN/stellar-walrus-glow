import { NextRequest, NextResponse } from 'next/server'
import { cognitoLogin, getUserRole } from '@/lib/cognito'
import jwt from 'jsonwebtoken'

export async function POST(request: NextRequest) {
  try {
    const { username, password } = await request.json()

    if (!username || !password) {
      return NextResponse.json(
        { message: '사용자명과 비밀번호를 입력해주세요.' },
        { status: 400 }
      )
    }

    // Authenticate with Cognito
    const authResult = await cognitoLogin(username, password)

    if (!authResult?.AccessToken) {
      return NextResponse.json(
        { message: '로그인에 실패했습니다.' },
        { status: 401 }
      )
    }

    // Get user role based on username
    const role = getUserRole(username)

    // Create our own JWT token with user info
    const token = jwt.sign(
      {
        username,
        role,
        cognitoAccessToken: authResult.AccessToken,
        cognitoRefreshToken: authResult.RefreshToken,
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
    
    // Handle specific Cognito errors
    if (error.name === 'NotAuthorizedException') {
      return NextResponse.json(
        { message: '사용자명 또는 비밀번호가 올바르지 않습니다.' },
        { status: 401 }
      )
    }
    
    if (error.name === 'UserNotFoundException') {
      return NextResponse.json(
        { message: '존재하지 않는 사용자입니다.' },
        { status: 404 }
      )
    }

    return NextResponse.json(
      { message: '로그인 중 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}