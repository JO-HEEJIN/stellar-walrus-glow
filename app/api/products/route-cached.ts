import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { prismaRead, prismaWrite } from '@/lib/prisma-load-balanced'
import { cache } from '@/lib/cache'
import { rateLimiters, getIdentifier } from '@/lib/rate-limit'
import { createErrorResponse, BusinessError, ErrorCodes, HttpStatus } from '@/lib/errors'
import { decodeJWT } from '@/lib/auth'

// Search schema with validation
const searchSchema = z.object({
  search: z.string().optional(),
  brandId: z.string().optional(),
  categoryId: z.string().optional(),
  status: z.enum(['ACTIVE', 'INACTIVE', 'OUT_OF_STOCK']).optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
  sortBy: z.enum(['createdAt', 'nameKo', 'price', 'inventory']).default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
})

// Create product schema
const createProductSchema = z.object({
  brandId: z.string().min(1),
  sku: z.string().min(1).max(50),
  nameKo: z.string().min(1).max(200),
  nameCn: z.string().max(200).nullable().optional(),
  descriptionKo: z.string().max(5000).nullable().optional(),
  descriptionCn: z.string().max(5000).nullable().optional(),
  categoryId: z.string().nullable().optional(),
  basePrice: z.number().positive(),
  discountRate: z.number().min(0).max(100).default(0),
  inventory: z.number().int().min(0).default(0),
  lowStockThreshold: z.number().int().min(0).nullable().optional(),
  status: z.enum(['ACTIVE', 'INACTIVE', 'OUT_OF_STOCK']).default('ACTIVE'),
  thumbnailImage: z.string().url().nullable().optional(),
  images: z.array(z.string().url()).max(10).nullable().optional(),
  options: z.record(z.array(z.string())).nullable().optional(),
})

// GET: List products with search, filter, and pagination
export async function GET(request: NextRequest) {
  try {
    // Check authentication
    const token = request.cookies.get('auth-token')?.value
    if (!token) {
      throw new BusinessError(
        ErrorCodes.AUTHENTICATION_REQUIRED,
        HttpStatus.UNAUTHORIZED
      )
    }

    let userInfo
    try {
      userInfo = decodeJWT(token)
      if (!userInfo || !userInfo.username) {
        throw new Error('Invalid token')
      }
    } catch (error) {
      throw new BusinessError(
        ErrorCodes.AUTHENTICATION_INVALID,
        HttpStatus.UNAUTHORIZED
      )
    }

    // Apply rate limiting
    const identifier = getIdentifier(request)
    const rateLimiter = rateLimiters.api.products
    const { success } = await rateLimiter.limit(identifier)
    
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

    // Parse query parameters
    const { searchParams } = new URL(request.url)
    const query = searchSchema.parse(Object.fromEntries(searchParams))

    // Cache key for this specific query
    const cacheKey = JSON.stringify({
      ...query,
      userRole: userInfo.role,
      userId: userInfo.username,
    })

    // Try to get from cache
    const result = await cache.getProductList(cacheKey, async () => {
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

      // For BRAND_ADMIN, only show their products
      if (userInfo.role === 'BRAND_ADMIN') {
        const user = await prismaRead.user.findFirst({
          where: { email: `${userInfo.username}@kfashion.com` },
          include: { brand: true },
        })
        if (user?.brand) {
          where.brandId = user.brand.id
        }
      }

      // Count total items (using read replica)
      const totalItems = await prismaRead.product.count({ where })

      // Fetch products (using read replica)
      const products = await prismaRead.product.findMany({
        where,
        include: {
          brand: {
            select: { id: true, nameKo: true, nameCn: true },
          },
          category: {
            select: { id: true, name: true },
          },
        },
        orderBy: { [query.sortBy]: query.sortOrder },
        skip: (query.page - 1) * query.limit,
        take: query.limit,
      })

      // Transform products
      const transformedProducts = products.map(product => ({
        id: product.id,
        brandId: product.brandId,
        brand: product.brand,
        sku: product.sku,
        nameKo: product.nameKo,
        nameCn: product.nameCn,
        descriptionKo: product.descriptionKo,
        descriptionCn: product.descriptionCn,
        category: product.category,
        basePrice: product.basePrice,
        discountRate: product.discountRate,
        finalPrice: product.basePrice * (1 - product.discountRate / 100),
        inventory: product.inventory,
        lowStockThreshold: product.lowStockThreshold,
        status: product.status,
        thumbnailImage: product.thumbnailImage,
        images: product.images || [],
        options: product.options || {},
        isLowStock: product.lowStockThreshold ? 
          product.inventory <= product.lowStockThreshold : false,
        createdAt: product.createdAt.toISOString(),
        updatedAt: product.updatedAt.toISOString(),
      }))

      return {
        data: transformedProducts,
        meta: {
          page: query.page,
          limit: query.limit,
          totalItems,
          totalPages: Math.ceil(totalItems / query.limit),
          hasNextPage: query.page < Math.ceil(totalItems / query.limit),
          hasPreviousPage: query.page > 1,
        },
      }
    })

    return NextResponse.json(result)
  } catch (error: any) {
    console.error('Product list error:', error)
    
    if (error instanceof BusinessError) {
      return createErrorResponse(error.code, error.statusCode)
    }
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid parameters', details: error.errors },
        { status: 400 }
      )
    }
    
    return createErrorResponse(
      ErrorCodes.INTERNAL_SERVER_ERROR,
      HttpStatus.INTERNAL_SERVER_ERROR
    )
  }
}

// POST: Create new product
export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const token = request.cookies.get('auth-token')?.value
    if (!token) {
      throw new BusinessError(
        ErrorCodes.AUTHENTICATION_REQUIRED,
        HttpStatus.UNAUTHORIZED
      )
    }

    let userInfo
    try {
      userInfo = decodeJWT(token)
      if (!userInfo || !userInfo.username) {
        throw new Error('Invalid token')
      }
    } catch (error) {
      throw new BusinessError(
        ErrorCodes.AUTHENTICATION_INVALID,
        HttpStatus.UNAUTHORIZED
      )
    }

    // Check role permissions
    if (userInfo.role !== 'BRAND_ADMIN' && userInfo.role !== 'MASTER_ADMIN') {
      throw new BusinessError(
        ErrorCodes.AUTHORIZATION_ROLE_REQUIRED,
        HttpStatus.FORBIDDEN
      )
    }

    // Apply rate limiting
    const identifier = getIdentifier(request)
    const rateLimiter = rateLimiters.createContent
    const { success } = await rateLimiter.limit(identifier)
    
    if (!success) {
      return new Response('Too Many Requests', { status: 429 })
    }

    // Parse request body
    const body = await request.json()
    const data = createProductSchema.parse(body)

    // For BRAND_ADMIN, override brandId with their own
    let finalBrandId = data.brandId
    if (userInfo.role === 'BRAND_ADMIN') {
      const user = await prismaRead.user.findFirst({
        where: { email: `${userInfo.username}@kfashion.com` },
        include: { brand: true },
      })
      
      if (!user?.brand) {
        throw new BusinessError(
          ErrorCodes.BRAND_NOT_FOUND,
          HttpStatus.NOT_FOUND
        )
      }
      
      finalBrandId = user.brand.id
    }

    // Check if SKU already exists
    const existingSku = await prismaRead.product.findFirst({
      where: { sku: data.sku },
    })
    
    if (existingSku) {
      throw new BusinessError(
        ErrorCodes.PRODUCT_SKU_EXISTS,
        HttpStatus.CONFLICT
      )
    }

    // Create product (using write instance)
    const product = await prismaWrite.product.create({
      data: {
        ...data,
        brandId: finalBrandId,
        images: data.images || [],
        options: data.options || {},
      },
      include: {
        brand: {
          select: { id: true, nameKo: true, nameCn: true },
        },
        category: {
          select: { id: true, name: true },
        },
      },
    })

    // Audit log
    await prismaWrite.auditLog.create({
      data: {
        userId: userInfo.username,
        entityType: 'PRODUCT',
        entityId: product.id,
        action: 'CREATE',
        metadata: {
          productName: product.nameKo,
          sku: product.sku,
          brandId: product.brandId,
        },
      },
    })

    // Invalidate product list cache
    await cache.invalidateProductList()

    // Transform response
    const response = {
      id: product.id,
      brandId: product.brandId,
      brand: product.brand,
      sku: product.sku,
      nameKo: product.nameKo,
      nameCn: product.nameCn,
      descriptionKo: product.descriptionKo,
      descriptionCn: product.descriptionCn,
      category: product.category,
      basePrice: product.basePrice,
      discountRate: product.discountRate,
      finalPrice: product.basePrice * (1 - product.discountRate / 100),
      inventory: product.inventory,
      lowStockThreshold: product.lowStockThreshold,
      status: product.status,
      thumbnailImage: product.thumbnailImage,
      images: product.images,
      options: product.options,
      createdAt: product.createdAt.toISOString(),
      updatedAt: product.updatedAt.toISOString(),
    }

    return NextResponse.json(
      {
        data: response,
        meta: {
          message: '상품이 성공적으로 생성되었습니다.',
        },
      },
      { status: 201 }
    )
  } catch (error: any) {
    console.error('Product creation error:', error)
    
    if (error instanceof BusinessError) {
      return createErrorResponse(error.code, error.statusCode)
    }
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid product data', details: error.errors },
        { status: 400 }
      )
    }
    
    return createErrorResponse(
      ErrorCodes.INTERNAL_SERVER_ERROR,
      HttpStatus.INTERNAL_SERVER_ERROR
    )
  }
}