import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import { rateLimiters, getIdentifier } from '@/lib/rate-limit'
import { createErrorResponse, BusinessError, ErrorCodes, HttpStatus } from '@/lib/errors'
import { ProductStatus, Role } from '@/types'

// Search/filter schema
const searchSchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(20),
  search: z.string().optional(),
  brandId: z.string().optional(),
  categoryId: z.string().optional(),
  status: z.enum(['ACTIVE', 'INACTIVE', 'OUT_OF_STOCK']).optional(),
  sortBy: z.enum(['createdAt', 'basePrice', 'nameKo']).default('createdAt'),
  order: z.enum(['asc', 'desc']).default('desc'),
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
    // Rate limiting
    const identifier = getIdentifier(request)
    const { success, limit, reset, remaining } = await rateLimiters.api.limit(identifier)
    
    if (!success) {
      return new Response('Too Many Requests', {
        status: 429,
        headers: {
          'X-RateLimit-Limit': limit.toString(),
          'X-RateLimit-Remaining': remaining.toString(),
          'X-RateLimit-Reset': new Date(reset).toISOString(),
        },
      })
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

    // Count total items
    const totalItems = await prisma.product.count({ where })

    // Fetch products
    const products = await prisma.product.findMany({
      where,
      include: {
        brand: {
          select: { id: true, nameKo: true, nameCn: true },
        },
        category: {
          select: { id: true, name: true },
        },
      },
      orderBy: { [query.sortBy]: query.order },
      skip: (query.page - 1) * query.limit,
      take: query.limit,
    })

    return NextResponse.json({
      data: products,
      meta: {
        page: query.page,
        limit: query.limit,
        totalItems,
        totalPages: Math.ceil(totalItems / query.limit),
      },
    })
  } catch (error) {
    return createErrorResponse(error as Error, request.url)
  }
}

// Create product schema
const createProductSchema = z.object({
  brandId: z.string().min(1),
  sku: z.string().min(1).max(50),
  nameKo: z.string().min(1).max(200),
  nameCn: z.string().max(200).optional(),
  descriptionKo: z.string().max(5000).optional(),
  descriptionCn: z.string().max(5000).optional(),
  categoryId: z.string().nullable().optional(),
  basePrice: z.number().positive(),
  inventory: z.number().int().min(0),
  images: z.array(z.string().url()).max(10).optional(),
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
    const { success, limit, reset, remaining } = await rateLimiters.productCreate.limit(identifier)
    
    if (!success) {
      throw new BusinessError(
        ErrorCodes.SYSTEM_RATE_LIMIT_EXCEEDED,
        HttpStatus.TOO_MANY_REQUESTS
      )
    }

    // Check authentication
    const session = await auth()
    if (!session) {
      throw new BusinessError(
        ErrorCodes.AUTH_INVALID_CREDENTIALS,
        HttpStatus.UNAUTHORIZED
      )
    }

    // Check role permissions
    if (!['BRAND_ADMIN', 'MASTER_ADMIN'].includes(session.user.role)) {
      throw new BusinessError(
        ErrorCodes.AUTH_INSUFFICIENT_PERMISSION,
        HttpStatus.FORBIDDEN
      )
    }

    // Parse and validate request body
    const body = await request.json()
    const data = createProductSchema.parse(body)

    // For BRAND_ADMIN, ensure they can only create products for their brand
    if (session.user.role === Role.BRAND_ADMIN && session.user.brandId !== data.brandId) {
      throw new BusinessError(
        ErrorCodes.PRODUCT_BRAND_MISMATCH,
        HttpStatus.FORBIDDEN
      )
    }

    // Check if brand exists
    const brand = await prisma.brand.findUnique({
      where: { id: data.brandId },
    })

    if (!brand) {
      throw new BusinessError(
        ErrorCodes.PRODUCT_NOT_FOUND,
        HttpStatus.NOT_FOUND,
        { resource: 'brand' }
      )
    }

    // Check SKU uniqueness
    const existingProduct = await prisma.product.findUnique({
      where: { sku: data.sku },
    })

    if (existingProduct) {
      throw new BusinessError(
        ErrorCodes.PRODUCT_SKU_EXISTS,
        HttpStatus.CONFLICT
      )
    }

    // Create product with automatic status based on inventory
    const product = await prisma.product.create({
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

    // Create audit log
    await prisma.auditLog.create({
      data: {
        userId: session.user.id,
        action: 'PRODUCT_CREATE',
        entityType: 'Product',
        entityId: product.id,
        metadata: {
          sku: product.sku,
          nameKo: product.nameKo,
          brandId: product.brandId,
        },
        ip: request.headers.get('x-forwarded-for') || 'unknown',
        userAgent: request.headers.get('user-agent') || 'unknown',
      },
    })

    return NextResponse.json({ data: product }, { status: 201 })
  } catch (error) {
    console.error('POST /api/products error:', error)
    return createErrorResponse(error as Error, request.url)
  }
}