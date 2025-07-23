import { NextRequest, NextResponse } from 'next/server'
import { cognitoFindUserByEmail } from '@/lib/cognito'

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json()

    if (!email) {
      return NextResponse.json(
        { message: '이메일을 입력해주세요.' },
        { status: 400 }
      )
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { message: '올바른 이메일 형식을 입력해주세요.' },
        { status: 400 }
      )
    }

    // Find user by email in Cognito
    const user = await cognitoFindUserByEmail(email)

    if (!user) {
      return NextResponse.json(
        { message: '해당 이메일로 가입된 사용자를 찾을 수 없습니다.' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      message: '사용자명을 찾았습니다.',
      username: user.Username,
    })
  } catch (error: any) {
    console.error('Forgot ID error:', error)
    
    // Handle specific Cognito errors
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
      { message: '사용자명 찾기 중 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}