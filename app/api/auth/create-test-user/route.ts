import { NextRequest, NextResponse } from 'next/server'
import { cognitoAdminCreateUser } from '@/lib/cognito'

export async function POST(request: NextRequest) {
  try {
    const { username, email, password } = await request.json()

    if (!username || !email || !password) {
      return NextResponse.json(
        { message: '모든 필드를 입력해주세요.' },
        { status: 400 }
      )
    }

    // Create user in Cognito
    const result = await cognitoAdminCreateUser(username, email, password)

    return NextResponse.json({
      message: '테스트 사용자가 생성되었습니다.',
      userSub: result.User?.Username,
    })
  } catch (error: any) {
    console.error('Create test user error:', error)
    
    if (error.name === 'UsernameExistsException') {
      return NextResponse.json(
        { message: '이미 존재하는 사용자명입니다.' },
        { status: 409 }
      )
    }

    return NextResponse.json(
      { message: '테스트 사용자 생성 중 오류가 발생했습니다: ' + error.message },
      { status: 500 }
    )
  }
}