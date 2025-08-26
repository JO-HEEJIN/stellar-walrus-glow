export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { getDatabase } from '@/lib/db/adapter'
import { rateLimiters, getIdentifier } from '@/lib/rate-limit'
import { createErrorResponse, BusinessError, ErrorCodes, HttpStatus } from '@/lib/errors'
import { logger } from '@/lib/logger'

// Search/filter schema
const searchSchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(20),
  search: z.string().optional(),
  brandId: z.string().optional(),
  categoryId: z.string().optional(),
  status: z.enum(['ACTIVE', 'INACTIVE', 'OUT_OF_STOCK']).optional(),
  sortBy: z.enum(['createdAt', 'price', 'name']).default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
})

const createProductSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  price: z.number().min(0),
  sku: z.string().min(1),
  brandId: z.string().min(1),
  categoryId: z.string().min(1),
  imageUrl: z.string().url().optional(),
  stock: z.number().min(0).default(0),
})

/**
 * GET /api/products-v2
 * Fetch products with filtering and pagination using RDS Data API
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
    
    const {
      page,
      limit,
      search,
      brandId,
      categoryId,
      status,
      sortBy,
      sortOrder
    } = searchSchema.parse(queryParams)

    const offset = (page - 1) * limit

    // Get database adapter
    const db = getDatabase()

    // Get products and total count
    const [products, totalCount] = await Promise.all([
      db.getProducts({
        limit,
        offset,
        search,
        brandId,
        categoryId,
        status,
        sortBy,
        sortOrder
      }),
      db.getProductCount({ search, brandId, categoryId, status })
    ])

    const totalPages = Math.ceil(totalCount / limit)
    const hasMore = page < totalPages

    logger.info('Products fetched successfully', {
      count: products.length,
      totalCount,
      page,
      limit,
      search: search || 'none'
    })

    return NextResponse.json({
      data: products,
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
        dataSource: 'RDS Data API'
      }
    })

  } catch (error) {
    logger.error('Product fetch error:', error instanceof Error ? error : new Error(String(error)))
    
    if (error instanceof z.ZodError) {
      return createErrorResponse(
        new BusinessError(ErrorCodes.VALIDATION_ERROR, HttpStatus.BAD_REQUEST, error.errors),
        request.url
      )
    }

    return createErrorResponse(
      new BusinessError(ErrorCodes.SYSTEM_DATABASE_ERROR, HttpStatus.INTERNAL_SERVER_ERROR),
      request.url
    )
  }
}

/**
 * POST /api/products-v2
 * Create a new product using RDS Data API
 */
export async function POST(request: NextRequest) {
  try {
    const identifier = getIdentifier(request)
    
    // Rate limiting - stricter for product creation
    try {
      await rateLimiters.productCreate.limit(identifier)
    } catch (error) {
      return createErrorResponse(
        new BusinessError(ErrorCodes.SYSTEM_RATE_LIMIT_EXCEEDED, HttpStatus.TOO_MANY_REQUESTS),
        request.url
      )
    }

    // Parse and validate request body
    const body = await request.json()
    const productData = createProductSchema.parse(body)

    // Get database adapter
    const db = getDatabase()

    // Create product
    const product = await db.createProduct(productData)

    logger.info('Product created successfully', {
      productId: product.id,
      name: product.name,
      sku: product.sku
    })

    return NextResponse.json({
      data: product,
      meta: {
        timestamp: new Date().toISOString(),
        apiVersion: 'v2',
        dataSource: 'RDS Data API'
      }
    }, { status: 201 })

  } catch (error) {
    logger.error('Product creation error:', error instanceof Error ? error : new Error(String(error)))
    
    if (error instanceof z.ZodError) {
      return createErrorResponse(
        new BusinessError(ErrorCodes.VALIDATION_ERROR, HttpStatus.BAD_REQUEST, error.errors),
        request.url
      )
    }

    // Handle duplicate SKU or other database errors
    if (error instanceof Error && error.message.includes('Duplicate entry')) {
      return createErrorResponse(
        new BusinessError(ErrorCodes.PRODUCT_SKU_EXISTS, HttpStatus.CONFLICT),
        request.url
      )
    }

    return createErrorResponse(
      new BusinessError(ErrorCodes.SYSTEM_DATABASE_ERROR, HttpStatus.INTERNAL_SERVER_ERROR),
      request.url
    )
  }
}