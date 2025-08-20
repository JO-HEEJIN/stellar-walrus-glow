export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { prismaRead, prismaWrite, withRetry } from '@/lib/prisma-load-balanced'
import { rateLimiters, getIdentifier } from '@/lib/rate-limit'
import { createErrorResponse, BusinessError, ErrorCodes, HttpStatus } from '@/lib/errors'
import { ProductStatus } from '@/types'
import { logger } from '@/lib/logger'

// Search/filter schema
const searchSchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(20),
  search: z.string().optional(),
  brandId: z.string().optional(),
  categoryId: z.string().optional(),
  category: z.string().optional(), // For brand page filtering
  status: z.enum(['ACTIVE', 'INACTIVE', 'OUT_OF_STOCK']).optional(),
  sortBy: z.enum(['createdAt', 'basePrice', 'nameKo', 'inventory', 'sku']).default('createdAt'),
  sort: z.enum(['recommended', 'newest', 'sales', 'price-low', 'price-high', 'discount']).optional(),
  order: z.enum(['asc', 'desc']).default('desc'),
  priceMin: z.coerce.number().min(0).optional(),
  priceMax: z.coerce.number().min(0).optional(),
  colors: z.string().optional(), // Comma-separated color IDs
  sizes: z.string().optional(), // Comma-separated size IDs
  moq: z.string().optional(), // MOQ range filter
})

/**
 * @swagger
 * /api/products:
 *   get:
 *     summary: Get product list
 *     description: Retrieve a paginated list of products with optional filters
 *     tags: [Products]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 20
 *         description: Items per page
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search by name or SKU
 *       - in: query
 *         name: brandId
 *         schema:
 *           type: string
 *         description: Filter by brand ID
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [ACTIVE, INACTIVE, OUT_OF_STOCK]
 *         description: Filter by product status
 *     responses:
 *       200:
 *         description: Product list retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Product'
 *                 meta:
 *                   type: object
 *                   properties:
 *                     page:
 *                       type: integer
 *                     limit:
 *                       type: integer
 *                     totalItems:
 *                       type: integer
 *                     totalPages:
 *                       type: integer
 *       429:
 *         description: Too many requests
 */
export async function GET(request: NextRequest) {
  try {
    // Skip rate limiting in development mode
    if (process.env.NODE_ENV !== 'development') {
      // Rate limiting
      const identifier = getIdentifier(request)
      const { success } = await rateLimiters.api.limit(identifier)
      
      if (!success) {
        return new Response('Too Many Requests', {
          status: 429,
          headers: {
            'X-RateLimit-Limit': '10',
            'X-RateLimit-Remaining': '0',
            'X-RateLimit-Reset': new Date().toISOString(),
          },
        })
      }
    } else {
      console.log('🔧 /api/products: Development mode - skipping rate limiting')
    }

    // Parse query parameters
    const { searchParams } = new URL(request.url)
    const query = searchSchema.parse(Object.fromEntries(searchParams))

    // Build where clause
    const where: any = {}
    
    if (query.search) {
      where.OR = [
        { nameKo: { contains: query.search } },
        { nameCn: { contains: query.search } },
        { sku: { contains: query.search } },
      ]
    }
    
    if (query.brandId) where.brandId = query.brandId
    if (query.categoryId) where.categoryId = query.categoryId
    if (query.status) where.status = query.status

    // Brand page category filtering
    if (query.category) {
      switch (query.category) {
        case 'new':
          where.isNew = true
          break
        case 'best':
          where.isBestSeller = true
          break
        case 'men':
          where.category = { name: { contains: '남성' } }
          break
        case 'women':
          where.category = { name: { contains: '여성' } }
          break
        case 'accessories':
          where.category = { name: { contains: '액세서리' } }
          break
        case 'sale':
          where.discountRate = { gt: 0 }
          break
      }
    }

    // Price range filtering
    if (query.priceMin || query.priceMax) {
      where.basePrice = {}
      if (query.priceMin) where.basePrice.gte = query.priceMin
      if (query.priceMax) where.basePrice.lte = query.priceMax
    }

    // Color filtering
    if (query.colors) {
      const colorIds = query.colors.split(',').filter(Boolean)
      if (colorIds.length > 0) {
        where.colors = {
          some: {
            name: { in: colorIds }
          }
        }
      }
    }

    // Size filtering
    if (query.sizes) {
      const sizeIds = query.sizes.split(',').filter(Boolean)
      if (sizeIds.length > 0) {
        where.sizes = {
          some: {
            name: { in: sizeIds }
          }
        }
      }
    }

    // MOQ filtering
    if (query.moq) {
      switch (query.moq) {
        case 'under-5':
          where.minOrderQty = { lte: 5 }
          break
        case 'under-10':
          where.minOrderQty = { lte: 10 }
          break
        case 'under-20':
          where.minOrderQty = { lte: 20 }
          break
        case 'over-20':
          where.minOrderQty = { gt: 20 }
          break
      }
    }

    // Count total items using read replica
    const totalItems = await withRetry(async () => {
      return await prismaRead.product.count({ where })
    })

    // Build orderBy clause
    let orderBy: any = {}
    
    if (query.sort) {
      switch (query.sort) {
        case 'recommended':
          orderBy = [
            { isBestSeller: 'desc' },
            { soldCount: 'desc' },
            { rating: 'desc' }
          ]
          break
        case 'newest':
          orderBy = { createdAt: 'desc' }
          break
        case 'sales':
          orderBy = { soldCount: 'desc' }
          break
        case 'price-low':
          orderBy = { basePrice: 'asc' }
          break
        case 'price-high':
          orderBy = { basePrice: 'desc' }
          break
        case 'discount':
          orderBy = { discountRate: 'desc' }
          break
        default:
          orderBy = { createdAt: 'desc' }
      }
    } else {
      orderBy = { [query.sortBy]: query.order }
    }

    // Fetch products using read replica
    const products = await withRetry(async () => {
      return await prismaRead.product.findMany({
        where,
        include: {
          brand: {
            select: { id: true, nameKo: true, nameCn: true },
          },
          category: {
            select: { id: true, name: true },
          },
          colors: {
            select: { id: true, name: true, code: true }
          },
          sizes: {
            select: { id: true, name: true }
          }
        },
        orderBy,
        skip: (query.page - 1) * query.limit,
        take: query.limit,
      })
    })

    // Format products for brand page
    const formattedProducts = products.map(product => ({
      id: product.id,
      sku: product.sku,
      name: product.nameKo,
      nameKo: product.nameKo,
      brandName: product.brand?.nameKo || '',
      category: product.category?.name || '',
      price: Number(product.basePrice),
      discountPrice: product.discountPrice ? Number(product.discountPrice) : undefined,
      discountRate: product.discountRate,
      imageUrl: product.thumbnailImage || (Array.isArray(product.images) && product.images.length > 0 ? product.images[0] : null) || 'https://picsum.photos/280/340?random=' + product.id,
      minOrderQty: product.minOrderQty,
      isNew: product.isNew,
      isBestSeller: product.isBestSeller,
      colors: product.colors?.map(c => c.name) || [],
      sizes: product.sizes?.map(s => s.name) || [],
      stock: product.inventory,
      inventory: product.inventory
    }))

    return NextResponse.json({
      data: {
        products: formattedProducts,
        totalCount: totalItems
      },
      meta: {
        page: query.page,
        limit: query.limit,
        totalItems,
        totalPages: Math.ceil(totalItems / query.limit),
      },
    })
  } catch (error) {
    logger.error('Product fetch error:', error)
    return createErrorResponse(error as Error, request.url)
  }
}

// Create product schema
const createProductSchema = z.object({
  brandId: z.string().min(1),
  sku: z.string().min(1).max(50),
  nameKo: z.string().min(1).max(200),
  nameCn: z.string().max(200).optional().or(z.literal('')),
  descriptionKo: z.string().max(5000).optional().or(z.literal('')),
  descriptionCn: z.string().max(5000).optional().or(z.literal('')),
  categoryId: z.string().optional().or(z.literal('')).transform(val => val === '' ? undefined : val),
  basePrice: z.number().positive(),
  inventory: z.number().int().min(0),
  thumbnailImage: z.string().url().min(1), // Required
  images: z.array(z.string().url()).max(10).default([]),
  options: z.record(z.array(z.string())).optional(),
})

/**
 * @swagger
 * /api/products:
 *   post:
 *     summary: Create a new product
 *     description: Create a new product (requires BRAND_ADMIN or MASTER_ADMIN role)
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - brandId
 *               - sku
 *               - nameKo
 *               - basePrice
 *               - inventory
 *             properties:
 *               brandId:
 *                 type: string
 *                 description: Brand ID
 *               sku:
 *                 type: string
 *                 description: Stock Keeping Unit - unique identifier
 *                 maxLength: 50
 *               nameKo:
 *                 type: string
 *                 description: Product name in Korean
 *                 maxLength: 200
 *               nameCn:
 *                 type: string
 *                 description: Product name in Chinese
 *                 maxLength: 200
 *               descriptionKo:
 *                 type: string
 *                 description: Product description in Korean
 *                 maxLength: 5000
 *               basePrice:
 *                 type: number
 *                 description: Base price in KRW
 *                 minimum: 0
 *               inventory:
 *                 type: integer
 *                 description: Initial inventory quantity
 *                 minimum: 0
 *               categoryId:
 *                 type: string
 *                 description: Category ID (optional)
 *               images:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: uri
 *                 maxItems: 10
 *                 description: Product image URLs
 *     responses:
 *       201:
 *         description: Product created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   $ref: '#/components/schemas/Product'
 *       400:
 *         description: Invalid request data
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Insufficient permissions
 *       409:
 *         description: SKU already exists
 */
export async function POST(request: NextRequest) {
  try {
    // Rate limiting
    const identifier = getIdentifier(request)
    const { success } = await rateLimiters.productCreate.limit(identifier)
    
    if (!success) {
      throw new BusinessError(
        ErrorCodes.SYSTEM_RATE_LIMIT_EXCEEDED,
        HttpStatus.TOO_MANY_REQUESTS
      )
    }

    // Check authentication
    const token = request.cookies.get('auth-token')?.value
    if (!token) {
      throw new BusinessError(
        ErrorCodes.AUTHENTICATION_REQUIRED,
        HttpStatus.UNAUTHORIZED
      )
    }

    // Verify token and check role
    const jwt = await import('jsonwebtoken')
    let userInfo
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key') as any
      userInfo = decoded
      
      // Only BRAND_ADMIN and MASTER_ADMIN can create products
      if (userInfo.role !== 'BRAND_ADMIN' && userInfo.role !== 'MASTER_ADMIN') {
        throw new BusinessError(
          ErrorCodes.AUTHORIZATION_ROLE_REQUIRED,
          HttpStatus.FORBIDDEN,
          { requiredRole: 'BRAND_ADMIN or MASTER_ADMIN' }
        )
      }
    } catch (error) {
      logger.authFailure('JWT verification', 'Invalid or expired token', { error: error instanceof Error ? error.message : String(error) })
      throw new BusinessError(
        ErrorCodes.AUTHENTICATION_INVALID,
        HttpStatus.UNAUTHORIZED
      )
    }

    // Parse and validate request body
    let body
    try {
      body = await request.json()
      logger.debug('Product creation request received', { hasBody: !!body })
    } catch (error) {
      logger.error('Failed to parse request body', error instanceof Error ? error : new Error(String(error)))
      throw new BusinessError(
        ErrorCodes.VALIDATION_FAILED,
        HttpStatus.BAD_REQUEST,
        { message: 'Invalid JSON in request body' }
      )
    }
    
    let data
    try {
      data = createProductSchema.parse(body)
      logger.debug('Product data validated', { productName: data.nameKo, brandId: data.brandId })
    } catch (error) {
      logger.error('Product validation failed', error instanceof Error ? error : new Error(String(error)))
      throw new BusinessError(
        ErrorCodes.VALIDATION_FAILED,
        HttpStatus.BAD_REQUEST,
        { 
          message: 'Validation failed',
          details: error instanceof z.ZodError ? error.errors : error
        }
      )
    }

    // Brand ownership check removed for now
    // TODO: Add proper brand ownership validation when auth system is set up

    // Check if brand exists using read replica
    const brand = await withRetry(async () => {
      return await prismaRead.brand.findUnique({
        where: { id: data.brandId },
      })
    })

    if (!brand) {
      throw new BusinessError(
        ErrorCodes.PRODUCT_NOT_FOUND,
        HttpStatus.NOT_FOUND,
        { resource: 'brand' }
      )
    }

    // Check SKU uniqueness using read replica
    const existingProduct = await withRetry(async () => {
      return await prismaRead.product.findUnique({
        where: { sku: data.sku },
      })
    })

    if (existingProduct) {
      throw new BusinessError(
        ErrorCodes.PRODUCT_SKU_EXISTS,
        HttpStatus.CONFLICT
      )
    }

    // Create product with automatic status based on inventory using write instance
    const product = await withRetry(async () => {
      return await prismaWrite.product.create({
        data: {
          ...data,
          categoryId: data.categoryId || null, // Convert empty string to null
          status: data.inventory > 0 ? ProductStatus.ACTIVE : ProductStatus.OUT_OF_STOCK,
        },
        include: {
          brand: true,
          category: true,
        },
      })
    })

    // Create audit log using write instance
    await withRetry(async () => {
      return await prismaWrite.auditLog.create({
        data: {
          userId: 'system', // Use system user for audit logs
          action: 'PRODUCT_CREATE',
          entityType: 'Product',
          entityId: product.id,
          metadata: {
            createdBy: userInfo.username || 'unknown',
            sku: product.sku,
            nameKo: product.nameKo,
            brandId: product.brandId,
          },
          ip: request.headers.get('x-forwarded-for') || 'unknown',
          userAgent: request.headers.get('user-agent') || 'unknown',
        },
      })
    })

    return NextResponse.json({ data: product }, { status: 201 })
  } catch (error) {
    logger.apiError('POST', '/api/products', error instanceof Error ? error : new Error(String(error)))
    return createErrorResponse(error as Error, request.url)
  }
}