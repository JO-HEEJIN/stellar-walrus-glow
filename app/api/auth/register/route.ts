import { NextRequest, NextResponse } from 'next/server'
import { cognitoRegister } from '@/lib/cognito'

export async function POST(request: NextRequest) {
  try {
    const { username, email, password } = await request.json()

    if (!username || !email || !password) {
      return NextResponse.json(
        { message: '모든 필드를 입력해주세요.' },
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

    // Register with Cognito
    const result = await cognitoRegister(username, email, password)

    return NextResponse.json({
      message: '회원가입이 완료되었습니다.',
      userSub: result.UserSub,
    })
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

    return NextResponse.json(
      { message: '회원가입 중 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}