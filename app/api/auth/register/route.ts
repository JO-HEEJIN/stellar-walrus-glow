import { NextRequest, NextResponse } from 'next/server'
import { cognitoRegister, cognitoAdminCreateUser } from '@/lib/cognito'

export async function POST(request: NextRequest) {
  try {
    const { username, email, password, role } = await request.json()

    if (!username || !email || !password) {
      return NextResponse.json(
        { message: '모든 필드를 입력해주세요.' },
        { status: 400 }
      )
    }

    // Validate role
    if (role && !['BUYER', 'BRAND_ADMIN'].includes(role)) {
      return NextResponse.json(
        { message: '유효하지 않은 역할입니다.' },
        { status: 400 }
      )
    }

    // Validate password strength
    if (password.length < 8) {
      return NextResponse.json(
        { message: '비밀번호는 8자 이상이어야 합니다.' },
        { status: 400 }
      )
    }

    // Try normal registration first, fallback to admin create user
    let result
    const userRole = role || 'BUYER' // Default to BUYER if no role specified
    
    try {
      result = await cognitoRegister(username, email, password, userRole)
      return NextResponse.json({
        message: '회원가입이 완료되었습니다. 이메일 인증을 진행해주세요.',
        userSub: result.UserSub,
        needsConfirmation: true,
      })
    } catch (signupError: any) {
      // If signup fails (e.g., admin-only signup), try admin create user
      console.log('Normal signup failed, trying admin create user:', signupError.name)
      
      if (signupError.name === 'NotAuthorizedException') {
        try {
          result = await cognitoAdminCreateUser(username, email, password, userRole)
          console.log('Admin create user successful:', result.User?.Username)
          return NextResponse.json({
            message: '회원가입이 완료되었습니다. (관리자 생성)',
            userSub: result.User?.Username,
          })
        } catch (adminError: any) {
          console.error('Admin create user also failed:', adminError)
          throw adminError
        }
      }
      
      // If it's a different error, re-throw it
      throw signupError
    }
  } catch (error: any) {
    console.error('Register error:', error)
    
    // Handle specific Cognito errors
    if (error.name === 'UsernameExistsException') {
      return NextResponse.json(
        { message: '이미 존재하는 사용자명입니다.' },
        { status: 409 }
      )
    }
    
    if (error.name === 'InvalidPasswordException') {
      return NextResponse.json(
        { message: '비밀번호가 정책에 맞지 않습니다. 8자 이상, 대소문자, 숫자, 특수문자를 포함해주세요.' },
        { status: 400 }
      )
    }

    if (error.name === 'NotAuthorizedException') {
      return NextResponse.json(
        { message: '인증에 실패했습니다. 관리자에게 문의하세요.' },
        { status: 401 }
      )
    }

    if (error.name === 'InvalidParameterException') {
      return NextResponse.json(
        { message: '입력 정보가 올바르지 않습니다.' },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { message: '회원가입 중 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}