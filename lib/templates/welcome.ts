import { WelcomeEmailData } from '../email'

export const welcomeTemplate = (data: WelcomeEmailData) => {
  const { user } = data

  const html = `
<!DOCTYPE html>
<html lang="ko">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>K-Fashion에 오신 것을 환영합니다!</title>
    <style>
        body { font-family: 'Malgun Gothic', Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
        .container { max-width: 600px; margin: 0 auto; background-color: #f8f9fa; }
        .header { background-color: #007bff; color: white; padding: 20px; text-align: center; }
        .content { background-color: white; padding: 30px; margin: 20px; border-radius: 8px; }
        .button { display: inline-block; background-color: #007bff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold; }
        .footer { text-align: center; padding: 20px; color: #666; font-size: 14px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>K-Fashion</h1>
            <h2>K-Fashion에 오신 것을 환영합니다!</h2>
        </div>
        
        <div class="content">
            <p>안녕하세요, <strong>${user.name}</strong>님!</p>
            <p>K-Fashion의 회원이 되신 것을 진심으로 환영합니다. 저희 플랫폼에서 최신 K-Fashion 트렌드를 만나보세요.</p>
            <p>지금 바로 쇼핑을 시작하고 특별한 혜택을 누려보세요!</p>
            <p style="text-align: center; margin: 30px 0;">
                <a href="${process.env.NEXT_PUBLIC_BASE_URL || 'https://kfashion.com'}" class="button">쇼핑하러 가기</a>
            </p>
            <p>궁금한 점이 있으시면 언제든지 고객센터로 문의해 주세요.</p>
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
안녕하세요, ${user.name}님!

K-Fashion의 회원이 되신 것을 진심으로 환영합니다. 저희 플랫폼에서 최신 K-Fashion 트렌드를 만나보세요.

지금 바로 쇼핑을 시작하고 특별한 혜택을 누려보세요!
쇼핑하러 가기: ${process.env.NEXT_PUBLIC_BASE_URL || 'https://kfashion.com'}

궁금한 점이 있으시면 언제든지 고객센터로 문의해 주세요.

감사합니다!
K-Fashion 드림
`

  return { html, text }
}
