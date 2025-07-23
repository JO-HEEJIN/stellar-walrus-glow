import { NextRequest, NextResponse } from 'next/server'
import { cognitoForgotPassword } from '@/lib/cognito'

export async function POST(request: NextRequest) {
  try {
    const { username } = await request.json()

    if (!username) {
      return NextResponse.json(
        { message: '사용자명을 입력해주세요.' },
        { status: 400 }
      )
    }

    // Send forgot password request to Cognito
    await cognitoForgotPassword(username)

    return NextResponse.json({
      message: '비밀번호 재설정 코드가 이메일로 전송되었습니다.',
    })
  } catch (error: any) {
    console.error('Forgot password error:', error)
    
    // Handle specific Cognito errors
    if (error.name === 'UserNotFoundException') {
      return NextResponse.json(
        { message: '존재하지 않는 사용자입니다.' },
        { status: 404 }
      )
    }
    
    if (error.name === 'InvalidParameterException') {
      return NextResponse.json(
        { message: '잘못된 요청입니다.' },
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
      { message: '비밀번호 재설정 요청 중 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}