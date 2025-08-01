import { OrderEmailData } from '../email'
import { OrderStatus } from '@prisma/client'
import { formatPrice, formatDateTime } from '../utils'

function getStatusLabel(status: OrderStatus): string {
  const labels: Record<OrderStatus, string> = {
    [OrderStatus.PENDING]: '결제 대기',
    [OrderStatus.PAID]: '결제 완료',
    [OrderStatus.PREPARING]: '상품 준비중',
    [OrderStatus.SHIPPED]: '배송중',
    [OrderStatus.DELIVERED]: '배송 완료',
    [OrderStatus.CANCELLED]: '취소됨',
  }
  return labels[status] || status
}

function getStatusMessage(status: OrderStatus): string {
  const messages: Record<string, string> = {
    [OrderStatus.PAID]: '<p style="color: #28a745; font-weight: bold;">✅ 결제가 확인되었습니다. 곧 상품 준비를 시작하겠습니다.</p>',
    [OrderStatus.PREPARING]: '<p style="color: #007bff; font-weight: bold;">📦 상품을 준비하고 있습니다. 조금만 더 기다려 주세요.</p>',
    [OrderStatus.SHIPPED]: '<p style="color: #6f42c1; font-weight: bold;">🚚 상품이 발송되었습니다. 배송 추적을 통해 현황을 확인하세요.</p>',
    [OrderStatus.DELIVERED]: '<p style="color: #28a745; font-weight: bold;">🎉 배송이 완료되었습니다. 상품을 확인해 주세요.</p>',
    [OrderStatus.CANCELLED]: '<p style="color: #dc3545; font-weight: bold;">❌ 주문이 취소되었습니다. 결제 금액은 영업일 기준 3-5일 내에 환불됩니다.</p>',
  }
  return messages[status] || ''
}

export const orderStatusUpdateTemplate = (data: OrderEmailData) => {
  const { order, user, trackingNumber, reason } = data

  const html = `
<!DOCTYPE html>
<html lang="ko">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>주문 상태 업데이트 - K-Fashion</title>
    <style>
        body { font-family: 'Malgun Gothic', Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
        .container { max-width: 600px; margin: 0 auto; background-color: #f8f9fa; }
        .header { background-color: #28a745; color: white; padding: 20px; text-align: center; }
        .content { background-color: white; padding: 30px; margin: 20px; border-radius: 8px; }
        .status-info { background-color: #d4edda; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #28a745; }
        .order-summary { background-color: #f8f9fa; padding: 15px; border-radius: 8px; }
        .footer { text-align: center; padding: 20px; color: #666; font-size: 14px; }
        .status-badge { padding: 8px 15px; border-radius: 20px; background-color: #28a745; color: white; font-weight: bold; }
        .tracking-info { background-color: #e3f2fd; padding: 15px; border-radius: 8px; margin: 15px 0; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>K-Fashion</h1>
            <h2>주문 상태가 업데이트되었습니다!</h2>
        </div>
        
        <div class="content">
            <p>안녕하세요, <strong>${user.name}</strong>님!</p>
            
            <div class="status-info">
                <h3>📦 주문 상태 변경</h3>
                <p><strong>주문번호:</strong> ${order.orderNumber}</p>
                <p><strong>현재 상태:</strong> <span class="status-badge">${getStatusLabel(order.status)}</span></p>
                ${reason ? `<p><strong>변경 사유:</strong> ${reason}</p>` : ''}
                <p><strong>업데이트 일시:</strong> ${formatDateTime(new Date())}</p>
            </div>

            ${trackingNumber ? `
                <div class="tracking-info">
                    <h3>🚚 배송 추적 정보</h3>
                    <p><strong>송장번호:</strong> ${trackingNumber}</p>
                    <p>배송업체 홈페이지에서 실시간 배송 현황을 확인하실 수 있습니다.</p>
                </div>
            ` : ''}

            <div class="order-summary">
                <h3>📋 주문 요약</h3>
                <p><strong>상품:</strong> ${order.items[0]?.productName}${order.items.length > 1 ? ` 외 ${order.items.length - 1}개` : ''}</p>
                <p><strong>주문금액:</strong> ${formatPrice(order.totalAmount)}</p>
            </div>

            ${getStatusMessage(order.status)}

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

주문 상태가 업데이트되었습니다.

[주문 상태 변경]
- 주문번호: ${order.orderNumber}
- 현재 상태: ${getStatusLabel(order.status)}
${reason ? `- 변경 사유: ${reason}` : ''}
- 업데이트 일시: ${formatDateTime(new Date())}

${trackingNumber ? `[배송 추적 정보]
- 송장번호: ${trackingNumber}
배송업체 홈페이지에서 실시간 배송 현황을 확인하실 수 있습니다.
` : ''}

[주문 요약]
- 상품: ${order.items[0]?.productName}${order.items.length > 1 ? ` 외 ${order.items.length - 1}개` : ''}
- 주문금액: ${formatPrice(order.totalAmount)}

주문과 관련하여 궁금한 사항이 있으시면 언제든지 고객센터로 연락해 주세요.

감사합니다!
K-Fashion 드림
`

  return { html, text }
}
