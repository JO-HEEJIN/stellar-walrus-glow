import { NextRequest, NextResponse } from 'next/server'
import { cognitoLogout } from '@/lib/cognito'
import jwt from 'jsonwebtoken'

export async function POST(request: NextRequest) {
  try {
    // Get token from cookie
    const token = request.cookies.get('auth-token')?.value

    if (token) {
      try {
        // Decode the token to get Cognito access token
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key') as any
        
        if (decoded.cognitoAccessToken) {
          // Sign out from Cognito
          await cognitoLogout(decoded.cognitoAccessToken)
        }
      } catch (error) {
        console.error('Error during Cognito logout:', error)
        // Continue with local logout even if Cognito logout fails
      }
    }

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