import { NextRequest, NextResponse } from 'next/server'
import { cognitoConfirmForgotPassword } from '@/lib/cognito'

export async function POST(request: NextRequest) {
  try {
    const { username, confirmationCode, newPassword } = await request.json()

    if (!username || !confirmationCode || !newPassword) {
      return NextResponse.json(
        { message: '모든 필드를 입력해주세요.' },
        { status: 400 }
      )
    }

    // Validate password strength
    if (newPassword.length < 8) {
      return NextResponse.json(
        { message: '비밀번호는 8자 이상이어야 합니다.' },
        { status: 400 }
      )
    }

    // Confirm forgot password with Cognito
    await cognitoConfirmForgotPassword(username, confirmationCode, newPassword)

    return NextResponse.json({
      message: '비밀번호가 성공적으로 재설정되었습니다.',
    })
  } catch (error: any) {
    console.error('Confirm forgot password error:', error)
    
    // Handle specific Cognito errors
    if (error.name === 'UserNotFoundException') {
      return NextResponse.json(
        { message: '존재하지 않는 사용자입니다.' },
        { status: 404 }
      )
    }
    
    if (error.name === 'CodeMismatchException') {
      return NextResponse.json(
        { message: '인증 코드가 올바르지 않습니다.' },
        { status: 400 }
      )
    }

    if (error.name === 'ExpiredCodeException') {
      return NextResponse.json(
        { message: '인증 코드가 만료되었습니다. 다시 요청해주세요.' },
        { status: 400 }
      )
    }

    if (error.name === 'InvalidPasswordException') {
      return NextResponse.json(
        { message: '비밀번호가 정책에 맞지 않습니다. 8자 이상, 대소문자, 숫자, 특수문자를 포함해주세요.' },
        { status: 400 }
      )
    }

    if (error.name === 'LimitExceededException') {
      return NextResponse.json(
        { message: '너무 많은 시도가 있었습니다. 나중에 다시 시도해주세요.' },
        { status: 429 }
      )
    }

    return NextResponse.json(
      { message: '비밀번호 재설정 중 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}