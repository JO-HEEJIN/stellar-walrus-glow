import nodemailer from 'nodemailer'
import { SESClient } from '@aws-sdk/client-ses'
import { Role } from '@/types'
import { OrderStatus } from '@prisma/client'
import { orderConfirmationTemplate } from './templates/order-confirmation'
import { orderStatusUpdateTemplate } from './templates/order-status-update'
import { passwordResetTemplate } from './templates/password-reset'
import { welcomeTemplate } from './templates/welcome'

// Types for email data
export interface OrderEmailData {
  order: {
    id: string
    orderNumber: string
    status: OrderStatus
    totalAmount: number
    items: Array<{
      productName: string
      quantity: number
      price: number
    }>
    shippingAddress: {
      name: string
      phone: string
      address: string
      addressDetail?: string
      zipCode: string
    }
    paymentMethod: string
    createdAt: Date
  }
  user: {
    email: string
    name: string
  }
  trackingNumber?: string
  reason?: string
}

export interface WelcomeEmailData {
  user: {
    email: string
    name: string
    role: Role
  }
}

export interface PasswordResetEmailData {
  user: {
    email: string
    name: string
  }
  resetToken: string
}

// Email service configuration
const isProduction = process.env.NODE_ENV === 'production'

// Create transporter based on environment
const createTransporter = () => {
  if (isProduction && process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY) {
    // Production: Use AWS SES
    const ses = new SESClient({
      region: process.env.AWS_REGION || 'ap-northeast-1',
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
      },
    })

    return nodemailer.createTransport({
      SES: { ses, aws: { SESClient } },
    })
  } else {
    // Development: Use Ethereal Email (free SMTP service for testing)
    // In real development, you might want to use Mailtrap or similar
    return nodemailer.createTransport({
      host: process.env.EMAIL_SERVER_HOST || 'smtp.ethereal.email',
      port: parseInt(process.env.EMAIL_SERVER_PORT || '587'),
      secure: false,
      auth: {
        user: process.env.EMAIL_SERVER_USER || 'ethereal.user',
        pass: process.env.EMAIL_SERVER_PASSWORD || 'ethereal.pass',
      },
    })
  }
}

// Email service class
export class EmailService {
  private transporter: nodemailer.Transporter
  private fromEmail: string
  private fromName: string

  constructor() {
    this.transporter = createTransporter()
    this.fromEmail = process.env.EMAIL_FROM || 'noreply@kfashion.com'
    this.fromName = process.env.EMAIL_FROM_NAME || 'K-Fashion Platform'
  }

  // Send order confirmation email
  async sendOrderConfirmation(data: OrderEmailData): Promise<boolean> {
    try {
      const { html, text } = orderConfirmationTemplate(data)
      
      const result = await this.transporter.sendMail({
        from: `${this.fromName} <${this.fromEmail}>`,
        to: data.user.email,
        subject: `주문 확인 - 주문번호: ${data.order.orderNumber}`,
        html,
        text,
      })

      console.log('Order confirmation email sent:', result.messageId)
      return true
    } catch (error) {
      console.error('Failed to send order confirmation email:', error)
      return false
    }
  }

  // Send order status update email
  async sendOrderStatusUpdate(data: OrderEmailData): Promise<boolean> {
    try {
      const { html, text } = orderStatusUpdateTemplate(data)
      
      const statusSubjects: Record<OrderStatus, string> = {
        [OrderStatus.PENDING]: '주문이 접수되었습니다',
        [OrderStatus.PAID]: '결제가 완료되었습니다',
        [OrderStatus.PREPARING]: '상품 준비중입니다',
        [OrderStatus.SHIPPED]: '상품이 발송되었습니다',
        [OrderStatus.DELIVERED]: '상품이 배송 완료되었습니다',
        [OrderStatus.CANCELLED]: '주문이 취소되었습니다',
      }

      const result = await this.transporter.sendMail({
        from: `${this.fromName} <${this.fromEmail}>`,
        to: data.user.email,
        subject: `[${data.order.orderNumber}] ${statusSubjects[data.order.status]}`,
        html,
        text,
      })

      console.log('Order status update email sent:', result.messageId)
      return true
    } catch (error) {
      console.error('Failed to send order status update email:', error)
      return false
    }
  }

  // Send welcome email
  async sendWelcomeEmail(data: WelcomeEmailData): Promise<boolean> {
    try {
      const { html, text } = welcomeTemplate(data)
      
      const result = await this.transporter.sendMail({
        from: `${this.fromName} <${this.fromEmail}>`,
        to: data.user.email,
        subject: 'K-Fashion 플랫폼에 오신 것을 환영합니다!',
        html,
        text,
      })

      console.log('Welcome email sent:', result.messageId)
      return true
    } catch (error) {
      console.error('Failed to send welcome email:', error)
      return false
    }
  }

  // Send password reset email
  async sendPasswordResetEmail(data: PasswordResetEmailData): Promise<boolean> {
    try {
      const { html, text } = passwordResetTemplate(data)
      
      const result = await this.transporter.sendMail({
        from: `${this.fromName} <${this.fromEmail}>`,
        to: data.user.email,
        subject: 'K-Fashion 비밀번호 재설정',
        html,
        text,
      })

      console.log('Password reset email sent:', result.messageId)
      return true
    } catch (error) {
      console.error('Failed to send password reset email:', error)
      return false
    }
  }

  // Send notification to admin
  async sendAdminNotification(subject: string, content: string): Promise<boolean> {
    try {
      const adminEmail = process.env.ADMIN_EMAIL || 'admin@kfashion.com'
      
      const result = await this.transporter.sendMail({
        from: `${this.fromName} <${this.fromEmail}>`,
        to: adminEmail,
        subject: `[관리자 알림] ${subject}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2>관리자 알림</h2>
            <div style="background-color: #f5f5f5; padding: 20px; border-radius: 5px;">
              ${content}
            </div>
            <p style="color: #666; font-size: 12px; margin-top: 20px;">
              이 이메일은 K-Fashion 플랫폼에서 자동으로 발송되었습니다.
            </p>
          </div>
        `,
        text: content,
      })

      console.log('Admin notification email sent:', result.messageId)
      return true
    } catch (error) {
      console.error('Failed to send admin notification email:', error)
      return false
    }
  }

  // Test email configuration
  async testEmailConfiguration(): Promise<{ success: boolean; message: string }> {
    try {
      if (!isProduction) {
        // For development, create test account if using Ethereal
        const testAccount = await nodemailer.createTestAccount();
        this.transporter = nodemailer.createTransport({

          host: 'smtp.ethereal.email',
          port: 587,
          secure: false,
          auth: {
            user: testAccount.user,
            pass: testAccount.pass,
          },
        })
      }

      // Send test email
      const result = await this.transporter.sendMail({
        from: `${this.fromName} <${this.fromEmail}>`,
        to: 'test@example.com',
        subject: 'K-Fashion Email Test',
        text: 'This is a test email from K-Fashion platform.',
        html: '<p>This is a test email from <strong>K-Fashion</strong> platform.</p>',
      })

      const previewUrl = nodemailer.getTestMessageUrl(result)
      
      return {
        success: true,
        message: isProduction 
          ? 'Email configuration is working correctly.' 
          : `Test email sent. Preview: ${previewUrl}`,
      }
    } catch (error) {
      return {
        success: false,
        message: `Email configuration error: ${error instanceof Error ? error.message : 'Unknown error'}`,
      }
    }
  }
}

// Export singleton instance
export const emailService = new EmailService()