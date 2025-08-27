import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { getDatabase } from '@/lib/db/adapter'
import { rateLimiters, getIdentifier } from '@/lib/rate-limit'
import { createErrorResponse, BusinessError, ErrorCodes, HttpStatus } from '@/lib/errors'
import { logger } from '@/lib/logger'

export const dynamic = 'force-dynamic'

// Search/filter schema
const searchSchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(10),
  status: z.enum(['PENDING', 'CONFIRMED', 'SHIPPED', 'DELIVERED', 'CANCELLED']).optional(),
  userId: z.string().optional(),
  search: z.string().optional(),
})

/**
 * GET /api/orders-v2
 * Fetch orders with filtering and pagination using RDS Data API
 */
export async function GET(request: NextRequest) {
  try {
    const identifier = getIdentifier(request)
    
    // Rate limiting
    try {
      await rateLimiters.api.limit(identifier)
    } catch (error) {
      return createErrorResponse(
        new BusinessError(ErrorCodes.SYSTEM_RATE_LIMIT_EXCEEDED, HttpStatus.TOO_MANY_REQUESTS),
        request.url
      )
    }

    // Parse query parameters
    const { searchParams } = new URL(request.url)
    const queryParams = Object.fromEntries(searchParams.entries())
    
    const { page, limit, status, userId, search } = searchSchema.parse(queryParams)
    const offset = (page - 1) * limit

    // Get database adapter
    const db = getDatabase()

    // For now, return mock data since we don't have orders yet
    const mockOrders = [
      {
        id: 'order_001',
        orderNumber: 'ORD-001',
        userId: 'user_001',
        status: 'PENDING',
        totalAmount: 59800,
        shippingAddress: { city: '서울', district: '강남구' },
        createdAt: new Date().toISOString(),
        user: { email: 'buyer@kfashion.com', name: '구매자' },
        items: [
          { productId: 'prod_001', quantity: 2, price: 29900, product: { nameKo: '테스트 상품' } }
        ]
      }
    ]

    // Get orders and total count (mock for now)
    const orders = mockOrders
    const totalCount = mockOrders.length
    const totalPages = Math.ceil(totalCount / limit)
    const hasMore = page < totalPages

    logger.info('Orders fetched successfully', {
      count: orders.length,
      totalCount,
      page,
      limit,
      status: status || 'all'
    })

    return NextResponse.json({
      data: orders,
      pagination: {
        page,
        limit,
        totalCount,
        totalPages,
        hasMore,
        hasPrev: page > 1,
      },
      meta: {
        timestamp: new Date().toISOString(),
        apiVersion: 'v2',
        dataSource: 'RDS Data API (Mock)'
      }
    })

  } catch (error) {
    logger.error('Order fetch error:', error instanceof Error ? error : new Error(String(error)))
    
    return createErrorResponse(error as Error, request.url)
  }
}

const createOrderSchema = z.object({
  userId: z.string(),
  items: z.array(z.object({
    productId: z.string(),
    quantity: z.number().min(1),
    price: z.number().min(0)
  })),
  shippingAddress: z.object({
    name: z.string(),
    phone: z.string(),
    address: z.string(),
    city: z.string(),
    zipCode: z.string()
  }),
  memo: z.string().optional()
})

/**
 * POST /api/orders-v2
 * Create new order using RDS Data API
 */
export async function POST(request: NextRequest) {
  try {
    const identifier = getIdentifier(request)
    
    // Rate limiting
    try {
      await rateLimiters.orderCreation.limit(identifier)
    } catch (error) {
      return createErrorResponse(
        new BusinessError(ErrorCodes.SYSTEM_RATE_LIMIT_EXCEEDED, HttpStatus.TOO_MANY_REQUESTS),
        request.url
      )
    }

    // Parse and validate request body
    const body = await request.json()
    const data = createOrderSchema.parse(body)

    // Calculate total amount
    const totalAmount = data.items.reduce((sum, item) => sum + (item.price * item.quantity), 0)

    // Get database adapter
    const db = getDatabase()

    // Create order using adapter
    const order = await db.createOrder({
      userId: data.userId,
      totalAmount,
      status: 'PENDING',
      shippingAddress: data.shippingAddress,
      items: data.items,
      memo: data.memo
    })

    logger.info('Order created successfully', {
      orderId: order.id,
      userId: data.userId,
      totalAmount,
      itemCount: data.items.length
    })

    return NextResponse.json({
      data: order,
      message: '주문이 성공적으로 생성되었습니다'
    }, { status: 201 })

  } catch (error) {
    logger.error('Order creation error:', error instanceof Error ? error : new Error(String(error)))
    
    return createErrorResponse(error as Error, request.url)
  }
}