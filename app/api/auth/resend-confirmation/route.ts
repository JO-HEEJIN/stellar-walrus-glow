import { NextRequest, NextResponse } from 'next/server'
import { ResendConfirmationCodeCommand } from '@aws-sdk/client-cognito-identity-provider'
import { cognitoClient, generateSecretHash } from '@/lib/cognito'

export async function POST(request: NextRequest) {
  try {
    const { username } = await request.json()

    if (!username) {
      return NextResponse.json(
        { message: '사용자명을 입력해주세요.' },
        { status: 400 }
      )
    }

    const command = new ResendConfirmationCodeCommand({
      ClientId: process.env.COGNITO_CLIENT_ID!,
      Username: username,
      SecretHash: generateSecretHash(username),
    })

    await cognitoClient.send(command)

    return NextResponse.json({
      message: '인증 코드가 재전송되었습니다.',
    })
  } catch (error: any) {
    console.error('Resend confirmation error:', error)
    
    // Handle specific Cognito errors
    if (error.name === 'UserNotFoundException') {
      return NextResponse.json(
        { message: '사용자를 찾을 수 없습니다.' },
        { status: 404 }
      )
    }

    if (error.name === 'InvalidParameterException') {
      return NextResponse.json(
        { message: '이미 인증된 사용자입니다.' },
        { status: 400 }
      )
    }

    if (error.name === 'LimitExceededException') {
      return NextResponse.json(
        { message: '요청 한도를 초과했습니다. 잠시 후 다시 시도해주세요.' },
        { status: 429 }
      )
    }

    return NextResponse.json(
      { message: '인증 코드 재전송 중 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}