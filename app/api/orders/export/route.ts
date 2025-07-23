import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { rateLimiters, getIdentifier } from '@/lib/rate-limit'
import { createErrorResponse, BusinessError, ErrorCodes, HttpStatus } from '@/lib/errors'
import { formatDateTime } from '@/lib/utils'

// Export configuration schema
const exportConfigSchema = z.object({
  format: z.enum(['csv', 'excel']),
  dateRange: z.object({
    startDate: z.string(),
    endDate: z.string(),
  }),
  status: z.array(z.string()).optional(),
  includeFields: z.array(z.string()),
  brandId: z.string().optional(),
})

// Field mapping for export
const fieldMapping = {
  orderNumber: '주문번호',
  createdAt: '주문일시',
  customerInfo: '고객정보',
  productInfo: '상품정보',
  pricing: '가격정보',
  status: '주문상태',
  shippingInfo: '배송정보',
  paymentInfo: '결제정보',
}

const statusLabels = {
  PENDING: '결제 대기',
  PAID: '결제 완료',
  PREPARING: '상품 준비중',
  SHIPPED: '배송중',
  DELIVERED: '배송 완료',
  CANCELLED: '취소됨',
}

export async function POST(request: NextRequest) {
  try {
    // Rate limiting
    const identifier = getIdentifier(request)
    const { success } = await rateLimiters.api.limit(identifier)
    
    if (!success) {
      throw new BusinessError(
        ErrorCodes.SYSTEM_RATE_LIMIT_EXCEEDED,
        HttpStatus.TOO_MANY_REQUESTS
      )
    }

    // Authentication check
    const token = request.cookies.get('auth-token')?.value
    if (!token) {
      throw new BusinessError(
        ErrorCodes.AUTH_INVALID_CREDENTIALS,
        HttpStatus.UNAUTHORIZED
      )
    }

    // Verify token and get user info
    const jwt = await import('jsonwebtoken')
    let userInfo
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key') as any
      userInfo = decoded
    } catch (error) {
      throw new BusinessError(
        ErrorCodes.AUTH_INVALID_TOKEN,
        HttpStatus.UNAUTHORIZED
      )
    }

    // Parse and validate request body
    const body = await request.json()
    const config = exportConfigSchema.parse(body)

    // Build where clause for filtering
    const where: any = {}
    
    // Role-based filtering
    if (userInfo.role === 'BUYER') {
      const userEmail = userInfo.username === 'momo' ? 'master@kfashion.com' : 
                        userInfo.username === 'kf001' ? 'kf001@kfashion.com' :
                        userInfo.username === 'kf002' ? 'brand@kfashion.com' :
                        `${userInfo.username}@kfashion.com`
      
      const user = await prisma.user.findFirst({
        where: { email: userEmail }
      })
      if (user) {
        where.userId = user.id
      } else {
        where.userId = 'non-existent-id'
      }
    } else if (userInfo.role === 'BRAND_ADMIN') {
      const userEmail = userInfo.username === 'kf002' ? 'brand@kfashion.com' :
                        `${userInfo.username}@kfashion.com`
      
      const user = await prisma.user.findFirst({
        where: { email: userEmail }
      })
      if (user?.brandId) {
        where.items = {
          some: {
            product: {
              brandId: user.brandId
            }
          }
        }
      } else {
        // If brand admin has no brandId, show no orders
        where.items = {
          some: {
            product: {
              brandId: 'non-existent-brand'
            }
          }
        }
      }
    }

    // Date range filter
    if (config.dateRange.startDate || config.dateRange.endDate) {
      where.createdAt = {}
      if (config.dateRange.startDate) {
        where.createdAt.gte = new Date(config.dateRange.startDate)
      }
      if (config.dateRange.endDate) {
        const endDate = new Date(config.dateRange.endDate)
        endDate.setHours(23, 59, 59, 999)
        where.createdAt.lte = endDate
      }
    }

    // Status filter
    if (config.status && config.status.length > 0) {
      where.status = { in: config.status }
    }

    // Brand filter (for MASTER_ADMIN)
    if (config.brandId) {
      where.items = {
        some: {
          product: {
            brandId: config.brandId
          }
        }
      }
    }

    // Fetch orders with all required data
    const orders = await prisma.order.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            email: true,
            name: true,
            role: true,
          }
        },
        items: {
          include: {
            product: {
              include: {
                brand: {
                  select: {
                    id: true,
                    nameKo: true,
                    nameCn: true,
                  }
                },
                category: {
                  select: {
                    id: true,
                    name: true,
                  }
                }
              }
            }
          }
        }
      },
      orderBy: { createdAt: 'desc' },
    })

    // Transform data for export
    const exportData = orders.map(order => {
      const row: any = {}

      if (config.includeFields.includes('orderNumber')) {
        row[fieldMapping.orderNumber] = order.orderNumber
      }

      if (config.includeFields.includes('createdAt')) {
        row[fieldMapping.createdAt] = formatDateTime(order.createdAt)
      }

      if (config.includeFields.includes('customerInfo')) {
        row['고객명'] = order.user?.name || ''
        row['고객이메일'] = order.user?.email || ''
      }

      if (config.includeFields.includes('productInfo')) {
        const productNames = order.items.map(item => item.product.nameKo).join(', ')
        const brandNames = order.items.map(item => item.product.brand?.nameKo || '').join(', ')
        row['상품명'] = productNames
        row['브랜드'] = brandNames
        row['상품수량'] = order.items.reduce((sum, item) => sum + item.quantity, 0)
      }

      if (config.includeFields.includes('pricing')) {
        row['총주문금액'] = Number(order.totalAmount)
      }

      if (config.includeFields.includes('status')) {
        row[fieldMapping.status] = statusLabels[order.status as keyof typeof statusLabels] || order.status
      }

      if (config.includeFields.includes('shippingInfo')) {
        const shippingAddress = order.shippingAddress as any
        row['배송지명'] = shippingAddress?.name || ''
        row['배송지전화'] = shippingAddress?.phone || ''
        row['배송지주소'] = shippingAddress?.address || ''
        row['배송지상세'] = shippingAddress?.addressDetail || ''
        row['우편번호'] = shippingAddress?.zipCode || ''
      }

      if (config.includeFields.includes('paymentInfo')) {
        row['결제방법'] = order.paymentMethod === 'BANK_TRANSFER' ? '계좌이체' : '카드결제'
      }

      return row
    })

    // Generate file content based on format
    if (config.format === 'csv') {
      const csvContent = generateCSV(exportData)
      
      return new NextResponse(csvContent, {
        headers: {
          'Content-Type': 'text/csv; charset=utf-8',
          'Content-Disposition': `attachment; filename="orders_export_${new Date().toISOString().split('T')[0]}.csv"`,
        },
      })
    } else {
      // Excel format
      const excelBuffer = await generateExcel(exportData)
      
      return new NextResponse(excelBuffer, {
        headers: {
          'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
          'Content-Disposition': `attachment; filename="orders_export_${new Date().toISOString().split('T')[0]}.xlsx"`,
        },
      })
    }
  } catch (error) {
    return createErrorResponse(error as Error, request.url)
  }
}

function generateCSV(data: any[]): string {
  if (data.length === 0) return ''

  const headers = Object.keys(data[0])
  const csvRows = [
    headers.join(','),
    ...data.map(row => 
      headers.map(header => {
        const value = row[header]
        // Escape quotes and wrap in quotes if contains comma, quote, or newline
        if (typeof value === 'string' && (value.includes(',') || value.includes('"') || value.includes('\n'))) {
          return `"${value.replace(/"/g, '""')}"`
        }
        return value
      }).join(',')
    )
  ]

  return '\uFEFF' + csvRows.join('\n') // Add BOM for proper UTF-8 encoding
}

async function generateExcel(data: any[]): Promise<Buffer> {
  // Import xlsx library
  const XLSX = await import('xlsx')
  
  // Create workbook and worksheet
  const workbook = XLSX.utils.book_new()
  const worksheet = XLSX.utils.json_to_sheet(data)
  
  // Auto-size columns
  const range = XLSX.utils.decode_range(worksheet['!ref'] || 'A1')
  const columnWidths = []
  
  for (let C = range.s.c; C <= range.e.c; C++) {
    let maxWidth = 10
    for (let R = range.s.r; R <= range.e.r; R++) {
      const cellAddress = XLSX.utils.encode_cell({ r: R, c: C })
      const cell = worksheet[cellAddress]
      if (cell && cell.v) {
        const cellLength = cell.v.toString().length
        if (cellLength > maxWidth) {
          maxWidth = Math.min(cellLength, 50) // Max width of 50
        }
      }
    }
    columnWidths.push({ wch: maxWidth })
  }
  
  worksheet['!cols'] = columnWidths
  
  // Add worksheet to workbook
  XLSX.utils.book_append_sheet(workbook, worksheet, '주문내역')
  
  // Generate buffer
  const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' })
  
  return buffer
}