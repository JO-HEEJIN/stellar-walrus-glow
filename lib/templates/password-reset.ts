import { PasswordResetEmailData } from '../email'

export const passwordResetTemplate = (data: PasswordResetEmailData) => {
  const { user, resetToken } = data
  const resetUrl = `${process.env.NEXT_PUBLIC_BASE_URL || 'https://kfashion.com'}/reset-password?token=${resetToken}`

  const html = `
<!DOCTYPE html>
<html lang="ko">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>비밀번호 재설정 - K-Fashion</title>
    <style>
        body { font-family: 'Malgun Gothic', Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
        .container { max-width: 600px; margin: 0 auto; background-color: #f8f9fa; }
        .header { background-color: #dc3545; color: white; padding: 20px; text-align: center; }
        .content { background-color: white; padding: 30px; margin: 20px; border-radius: 8px; }
        .button { display: inline-block; background-color: #dc3545; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold; }
        .footer { text-align: center; padding: 20px; color: #666; font-size: 14px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>K-Fashion</h1>
            <h2>비밀번호 재설정 요청</h2>
        </div>
        
        <div class="content">
            <p>안녕하세요, <strong>${user.name}</strong>님.</p>
            <p>비밀번호 재설정을 요청하셨습니다. 아래 버튼을 클릭하여 비밀번호를 재설정해 주세요.</p>
            <p>이 링크는 1시간 동안 유효합니다.</p>
            <p style="text-align: center; margin: 30px 0;">
                <a href="${resetUrl}" class="button">비밀번호 재설정하기</a>
            </p>
            <p>만약 비밀번호 재설정을 요청하지 않으셨다면 이 이메일을 무시해 주세요.</p>
        </div>

        <div class="footer">
            <p>K-Fashion 고객센터: 1588-0000 | support@k-fashion.com</p>
            <p>© 2025 K-Fashion. All rights reserved.</p>
        </div>
    </div>
</body>
</html>
`

  const text = `
안녕하세요, ${user.name}님.

비밀번호 재설정을 요청하셨습니다. 아래 링크를 클릭하여 비밀번호를 재설정해 주세요.

재설정 링크: ${resetUrl}

이 링크는 1시간 동안 유효합니다.

만약 비밀번호 재설정을 요청하지 않으셨다면 이 이메일을 무시해 주세요.

감사합니다!
K-Fashion 드림
`

  return { html, text }
}
