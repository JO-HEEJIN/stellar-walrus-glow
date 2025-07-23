import nodemailer from 'nodemailer'
import { formatPrice, formatDateTime } from './utils'

// Email configuration
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'localhost',
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: process.env.SMTP_SECURE === 'true', // true for 465, false for other ports
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
})

// Email templates
interface OrderEmailData {
  orderNumber: string
  customerName: string
  customerEmail: string
  totalAmount: number
  createdAt: Date
  shippingAddress: any
  paymentMethod: string
  items: Array<{
    productName: string
    quantity: number
    price: number
    brandName?: string
  }>
  status?: string
  trackingNumber?: string
  reason?: string
}

// Order confirmation email template
const orderConfirmationTemplate = (data: OrderEmailData) => `
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
        .status-badge { padding: 5px 10px; border-radius: 15px; background-color: #28a745; color: white; font-size: 12px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>K-Fashion</h1>
            <h2>주문이 정상적으로 접수되었습니다!</h2>
        </div>
        
        <div class="content">
            <p>안녕하세요, <strong>${data.customerName}</strong>님!</p>
            <p>K-Fashion에서 주문해 주셔서 감사합니다. 주문 내역을 확인해 주세요.</p>
            
            <div class="order-info">
                <h3>📋 주문 정보</h3>
                <p><strong>주문번호:</strong> ${data.orderNumber}</p>
                <p><strong>주문일시:</strong> ${formatDateTime(data.createdAt)}</p>
                <p><strong>결제방법:</strong> ${data.paymentMethod === 'BANK_TRANSFER' ? '계좌이체' : '카드결제'}</p>
                ${data.status ? `<p><strong>주문상태:</strong> <span class="status-badge">${getStatusLabel(data.status)}</span></p>` : ''}
            </div>

            <h3>🛍️ 주문 상품</h3>
            <table class="items-table">
                <thead>
                    <tr>
                        <th>상품명</th>
                        <th>브랜드</th>
                        <th>수량</th>
                        <th>가격</th>
                        <th>소계</th>
                    </tr>
                </thead>
                <tbody>
                    ${data.items.map(item => `
                        <tr>
                            <td>${item.productName}</td>
                            <td>${item.brandName || '-'}</td>
                            <td>${item.quantity}개</td>
                            <td>${formatPrice(item.price)}</td>
                            <td>${formatPrice(item.price * item.quantity)}</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>

            <div class="total">
                총 주문금액: ${formatPrice(data.totalAmount)}
            </div>

            <div class="order-info">
                <h3>🚚 배송 정보</h3>
                <p><strong>받는분:</strong> ${data.shippingAddress?.name || '-'}</p>
                <p><strong>연락처:</strong> ${data.shippingAddress?.phone || '-'}</p>
                <p><strong>주소:</strong> ${data.shippingAddress?.address || '-'} ${data.shippingAddress?.addressDetail || ''}</p>
                <p><strong>우편번호:</strong> ${data.shippingAddress?.zipCode || '-'}</p>
                ${data.trackingNumber ? `<p><strong>송장번호:</strong> ${data.trackingNumber}</p>` : ''}
            </div>

            ${data.paymentMethod === 'BANK_TRANSFER' ? `
                <div class="order-info" style="background-color: #fff3cd; border-left: 4px solid #ffc107;">
                    <h3>💳 입금 안내</h3>
                    <p><strong>입금계좌:</strong> 국민은행 123-456-789012 (K-Fashion)</p>
                    <p><strong>입금금액:</strong> ${formatPrice(data.totalAmount)}</p>
                    <p><strong>입금기한:</strong> ${new Date(data.createdAt.getTime() + 3 * 24 * 60 * 60 * 1000).toLocaleDateString('ko-KR')}</p>
                    <p style="color: #856404; font-size: 14px;">※ 입금 확인 후 상품 준비가 시작됩니다.</p>
                </div>
            ` : ''}

            <p style="margin-top: 30px;">주문과 관련하여 궁금한 사항이 있으시면 언제든지 고객센터로 연락해 주세요.</p>
            <p>감사합니다! 😊</p>
        </div>

        <div class="footer">
            <p>K-Fashion 고객센터: 1588-0000 | support@k-fashion.com</p>
            <p>© 2025 K-Fashion. All rights reserved.</p>
        </div>
    </div>
</body>
</html>
`

// Order status update template
const orderStatusUpdateTemplate = (data: OrderEmailData) => `
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
            <p>안녕하세요, <strong>${data.customerName}</strong>님!</p>
            
            <div class="status-info">
                <h3>📦 주문 상태 변경</h3>
                <p><strong>주문번호:</strong> ${data.orderNumber}</p>
                <p><strong>현재 상태:</strong> <span class="status-badge">${getStatusLabel(data.status || '')}</span></p>
                ${data.reason ? `<p><strong>변경 사유:</strong> ${data.reason}</p>` : ''}
                <p><strong>업데이트 일시:</strong> ${formatDateTime(new Date())}</p>
            </div>

            ${data.trackingNumber ? `
                <div class="tracking-info">
                    <h3>🚚 배송 추적 정보</h3>
                    <p><strong>송장번호:</strong> ${data.trackingNumber}</p>
                    <p>배송업체 홈페이지에서 실시간 배송 현황을 확인하실 수 있습니다.</p>
                </div>
            ` : ''}

            <div class="order-summary">
                <h3>📋 주문 요약</h3>
                <p><strong>상품:</strong> ${data.items[0]?.productName}${data.items.length > 1 ? ` 외 ${data.items.length - 1}개` : ''}</p>
                <p><strong>주문금액:</strong> ${formatPrice(data.totalAmount)}</p>
            </div>

            ${getStatusMessage(data.status || '')}

            <p style="margin-top: 30px;">주문과 관련하여 궁금한 사항이 있으시면 언제든지 고객센터로 연락해 주세요.</p>
            <p>감사합니다! 😊</p>
        </div>

        <div class="footer">
            <p>K-Fashion 고객센터: 1588-0000 | support@k-fashion.com</p>
            <p>© 2025 K-Fashion. All rights reserved.</p>
        </div>
    </div>
</body>
</html>
`

// Admin notification template
const adminNotificationTemplate = (type: 'new_order' | 'low_stock', data: any) => {
  if (type === 'new_order') {
    return `
<!DOCTYPE html>
<html lang="ko">
<head>
    <meta charset="UTF-8">
    <title>신규 주문 알림 - K-Fashion Admin</title>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background-color: #007bff; color: white; padding: 15px; text-align: center; border-radius: 8px; }
        .content { background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0; }
        .urgent { background-color: #dc3545; color: white; padding: 10px; border-radius: 4px; text-align: center; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h2>🔔 신규 주문 접수 알림</h2>
        </div>
        <div class="content">
            <p><strong>주문번호:</strong> ${data.orderNumber}</p>
            <p><strong>고객:</strong> ${data.customerName} (${data.customerEmail})</p>
            <p><strong>주문금액:</strong> ${formatPrice(data.totalAmount)}</p>
            <p><strong>주문시간:</strong> ${formatDateTime(data.createdAt)}</p>
            <p><strong>결제방법:</strong> ${data.paymentMethod === 'BANK_TRANSFER' ? '계좌이체' : '카드결제'}</p>
            
            <div style="margin-top: 20px;">
                <a href="${process.env.NEXT_PUBLIC_BASE_URL}/orders/${data.orderId}" 
                   style="background-color: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 4px;">
                   주문 상세 보기
                </a>
            </div>
        </div>
    </div>
</body>
</html>
    `
  } else {
    return `
<!DOCTYPE html>
<html lang="ko">
<head>
    <meta charset="UTF-8">
    <title>재고 부족 알림 - K-Fashion Admin</title>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background-color: #ffc107; color: #212529; padding: 15px; text-align: center; border-radius: 8px; }
        .content { background-color: #fff3cd; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #ffc107; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h2>⚠️ 재고 부족 알림</h2>
        </div>
        <div class="content">
            <p><strong>상품:</strong> ${data.productName}</p>
            <p><strong>SKU:</strong> ${data.sku}</p>
            <p><strong>현재 재고:</strong> ${data.inventory}개</p>
            <p><strong>브랜드:</strong> ${data.brandName}</p>
            
            <p style="color: #856404; font-weight: bold;">재고가 10개 미만으로 부족합니다. 재고 보충이 필요합니다.</p>
            
            <div style="margin-top: 20px;">
                <a href="${process.env.NEXT_PUBLIC_BASE_URL}/products/${data.productId}" 
                   style="background-color: #ffc107; color: #212529; padding: 10px 20px; text-decoration: none; border-radius: 4px;">
                   상품 관리하기
                </a>
            </div>
        </div>
    </div>
</body>
</html>
    `
  }
}

// Helper functions
function getStatusLabel(status: string): string {
  const labels: Record<string, string> = {
    PENDING: '결제 대기',
    PAID: '결제 완료',
    PREPARING: '상품 준비중',
    SHIPPED: '배송중',
    DELIVERED: '배송 완료',
    CANCELLED: '취소됨',
  }
  return labels[status] || status
}

function getStatusMessage(status: string): string {
  const messages: Record<string, string> = {
    PAID: '<p style="color: #28a745; font-weight: bold;">✅ 결제가 확인되었습니다. 곧 상품 준비를 시작하겠습니다.</p>',
    PREPARING: '<p style="color: #007bff; font-weight: bold;">📦 상품을 준비하고 있습니다. 조금만 더 기다려 주세요.</p>',
    SHIPPED: '<p style="color: #6f42c1; font-weight: bold;">🚚 상품이 발송되었습니다. 배송 추적을 통해 현황을 확인하세요.</p>',
    DELIVERED: '<p style="color: #28a745; font-weight: bold;">🎉 배송이 완료되었습니다. 상품을 확인해 주세요.</p>',
    CANCELLED: '<p style="color: #dc3545; font-weight: bold;">❌ 주문이 취소되었습니다. 결제 금액은 영업일 기준 3-5일 내에 환불됩니다.</p>',
  }
  return messages[status] || ''
}

// Email service functions
export class EmailService {
  // Send order confirmation email
  static async sendOrderConfirmation(orderData: OrderEmailData): Promise<boolean> {
    try {
      await transporter.sendMail({
        from: `"K-Fashion" <${process.env.SMTP_FROM || 'noreply@k-fashion.com'}>`,
        to: orderData.customerEmail,
        subject: `[K-Fashion] 주문 확인 - ${orderData.orderNumber}`,
        html: orderConfirmationTemplate(orderData),
      })
      return true
    } catch (error) {
      console.error('Failed to send order confirmation email:', error)
      return false
    }
  }

  // Send order status update email
  static async sendOrderStatusUpdate(orderData: OrderEmailData): Promise<boolean> {
    try {
      await transporter.sendMail({
        from: `"K-Fashion" <${process.env.SMTP_FROM || 'noreply@k-fashion.com'}>`,
        to: orderData.customerEmail,
        subject: `[K-Fashion] 주문 상태 업데이트 - ${orderData.orderNumber}`,
        html: orderStatusUpdateTemplate(orderData),
      })
      return true
    } catch (error) {
      console.error('Failed to send order status update email:', error)
      return false
    }
  }

  // Send admin notification
  static async sendAdminNotification(
    type: 'new_order' | 'low_stock', 
    data: any,
    adminEmails: string[] = []
  ): Promise<boolean> {
    try {
      const defaultAdmins = process.env.ADMIN_EMAILS?.split(',') || ['admin@k-fashion.com']
      const recipients = adminEmails.length > 0 ? adminEmails : defaultAdmins

      const subject = type === 'new_order' 
        ? `[K-Fashion] 신규 주문 접수 - ${data.orderNumber}`
        : `[K-Fashion] 재고 부족 알림 - ${data.productName}`

      await transporter.sendMail({
        from: `"K-Fashion System" <${process.env.SMTP_FROM || 'system@k-fashion.com'}>`,
        to: recipients.join(','),
        subject,
        html: adminNotificationTemplate(type, data),
      })
      return true
    } catch (error) {
      console.error('Failed to send admin notification:', error)
      return false
    }
  }

  // Test email configuration
  static async testEmailConfig(): Promise<boolean> {
    try {
      await transporter.verify()
      console.log('Email configuration is valid')
      return true
    } catch (error) {
      console.error('Email configuration error:', error)
      return false
    }
  }
}