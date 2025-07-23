import { NextRequest, NextResponse } from 'next/server'
import { ConfirmSignUpCommand } from '@aws-sdk/client-cognito-identity-provider'
import { cognitoClient, generateSecretHash } from '@/lib/cognito'

export async function POST(request: NextRequest) {
  try {
    const { username, confirmationCode } = await request.json()

    if (!username || !confirmationCode) {
      return NextResponse.json(
        { message: '사용자명과 인증 코드를 모두 입력해주세요.' },
        { status: 400 }
      )
    }

    const command = new ConfirmSignUpCommand({
      ClientId: process.env.COGNITO_CLIENT_ID!,
      Username: username,
      ConfirmationCode: confirmationCode,
      SecretHash: generateSecretHash(username),
    })

    await cognitoClient.send(command)

    return NextResponse.json({
      message: '이메일 인증이 완료되었습니다.',
    })
  } catch (error: any) {
    console.error('Confirm signup error:', error)
    
    // Handle specific Cognito errors
    if (error.name === 'CodeMismatchException') {
      return NextResponse.json(
        { message: '인증 코드가 올바르지 않습니다.' },
        { status: 400 }
      )
    }
    
    if (error.name === 'ExpiredCodeException') {
      return NextResponse.json(
        { message: '인증 코드가 만료되었습니다. 새 코드를 요청해주세요.' },
        { status: 400 }
      )
    }

    if (error.name === 'UserNotFoundException') {
      return NextResponse.json(
        { message: '사용자를 찾을 수 없습니다.' },
        { status: 404 }
      )
    }

    if (error.name === 'NotAuthorizedException') {
      return NextResponse.json(
        { message: '이미 인증된 사용자이거나 인증할 수 없습니다.' },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { message: '인증 중 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}