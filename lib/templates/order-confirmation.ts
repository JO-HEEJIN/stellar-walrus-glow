import { OrderEmailData } from '../email'
import { formatPrice, formatDateTime } from '../utils'

export const orderConfirmationTemplate = (data: OrderEmailData) => {
  const { order, user } = data

  const html = `
<!DOCTYPE html>
<html lang="ko">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>주문 확인 - K-Fashion</title>
    <style>
        body { font-family: 'Malgun Gothic', Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
        .container { max-width: 600px; margin: 0 auto; background-color: #f8f9fa; }
        .header { background-color: #007bff; color: white; padding: 20px; text-align: center; }
        .content { background-color: white; padding: 30px; margin: 20px; border-radius: 8px; }
        .order-info { background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0; }
        .items-table { width: 100%; border-collapse: collapse; margin: 20px 0; }
        .items-table th, .items-table td { padding: 12px; text-align: left; border-bottom: 1px solid #ddd; }
        .items-table th { background-color: #f8f9fa; font-weight: bold; }
        .total { background-color: #e3f2fd; padding: 15px; border-radius: 8px; text-align: right; font-size: 18px; font-weight: bold; }
        .footer { text-align: center; padding: 20px; color: #666; font-size: 14px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>K-Fashion</h1>
            <h2>주문이 정상적으로 접수되었습니다!</h2>
        </div>
        
        <div class="content">
            <p>안녕하세요, <strong>${user.name}</strong>님!</p>
            <p>K-Fashion에서 주문해 주셔서 감사합니다. 주문 내역을 확인해 주세요.</p>
            
            <div class="order-info">
                <h3>📋 주문 정보</h3>
                <p><strong>주문번호:</strong> ${order.orderNumber}</p>
                <p><strong>주문일시:</strong> ${formatDateTime(order.createdAt)}</p>
                <p><strong>결제방법:</strong> ${order.paymentMethod === 'BANK_TRANSFER' ? '계좌이체' : '카드결제'}</p>
            </div>

            <h3>🛍️ 주문 상품</h3>
            <table class="items-table">
                <thead>
                    <tr>
                        <th>상품명</th>
                        <th>수량</th>
                        <th>가격</th>
                        <th>소계</th>
                    </tr>
                </thead>
                <tbody>
                    ${order.items.map(item => `
                        <tr>
                            <td>${item.productName}</td>
                            <td>${item.quantity}개</td>
                            <td>${formatPrice(item.price)}</td>
                            <td>${formatPrice(item.price * item.quantity)}</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>

            <div class="total">
                총 주문금액: ${formatPrice(order.totalAmount)}
            </div>

            <div class="order-info">
                <h3>🚚 배송 정보</h3>
                <p><strong>받는분:</strong> ${order.shippingAddress.name}</p>
                <p><strong>연락처:</strong> ${order.shippingAddress.phone}</p>
                <p><strong>주소:</strong> ${order.shippingAddress.address} ${order.shippingAddress.addressDetail || ''}</p>
                <p><strong>우편번호:</strong> ${order.shippingAddress.zipCode}</p>
            </div>

            ${order.paymentMethod === 'BANK_TRANSFER' ? `
                <div class="order-info" style="background-color: #fff3cd; border-left: 4px solid #ffc107;">
                    <h3>💳 입금 안내</h3>
                    <p><strong>입금계좌:</strong> 국민은행 123-456-789012 (K-Fashion)</p>
                    <p><strong>입금금액:</strong> ${formatPrice(order.totalAmount)}</p>
                    <p><strong>입금기한:</strong> ${new Date(new Date(order.createdAt).getTime() + 3 * 24 * 60 * 60 * 1000).toLocaleDateString('ko-KR')}</p>
                    <p style="color: #856404; font-size: 14px;">※ 입금 확인 후 상품 준비가 시작됩니다.</p>
                </div>
            ` : ''}

            <p style="margin-top: 30px;">주문과 관련하여 궁금한 사항이 있으시면 언제든지 고객센터로 연락해 주세요.</p>
            <p>감사합니다! 😊</p>
        </div>

        <div class="footer">
            <p>NIA INTERNATIONAL 고객센터: 1544-7734 | master@k-fashions.com</p>
            <p>© 2025 NIA INTERNATIONAL. All rights reserved.</p>
        </div>
    </div>
</body>
</html>
`

  const text = `
안녕하세요, ${user.name}님!

K-Fashion에서 주문해 주셔서 감사합니다. 주문 내역을 확인해 주세요.

[주문 정보]
- 주문번호: ${order.orderNumber}
- 주문일시: ${formatDateTime(order.createdAt)}
- 결제방법: ${order.paymentMethod === 'BANK_TRANSFER' ? '계좌이체' : '카드결제'}

[주문 상품]
${order.items.map(item => `- ${item.productName} | ${item.quantity}개 | ${formatPrice(item.price * item.quantity)}`).join('\n')}

총 주문금액: ${formatPrice(order.totalAmount)}

[배송 정보]
- 받는분: ${order.shippingAddress.name}
- 연락처: ${order.shippingAddress.phone}
- 주소: ${order.shippingAddress.address} ${order.shippingAddress.addressDetail || ''}
- 우편번호: ${order.shippingAddress.zipCode}

${order.paymentMethod === 'BANK_TRANSFER' ? `
[입금 안내]
- 입금계좌: 국민은행 123-456-789012 (K-Fashion)
- 입금금액: ${formatPrice(order.totalAmount)}
- 입금기한: ${new Date(new Date(order.createdAt).getTime() + 3 * 24 * 60 * 60 * 1000).toLocaleDateString('ko-KR')}
※ 입금 확인 후 상품 준비가 시작됩니다.
` : ''}

주문과 관련하여 궁금한 사항이 있으시면 언제든지 고객센터로 연락해 주세요.

감사합니다!
K-Fashion 드림
`

  return { html, text }
}
