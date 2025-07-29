export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server'
import { prismaRead, prismaWrite, withRetry } from '@/lib/prisma-load-balanced'
import { z } from 'zod'
import { createErrorResponse, BusinessError, ErrorCodes, HttpStatus } from '@/lib/errors'

export async function GET() {
  try {
    // Get brands from database using read replica with product counts
    const brands = await withRetry(async () => {
      return await prismaRead.brand.findMany({
        include: {
          _count: {
            select: {
              products: true,
            },
          },
        },
        orderBy: { nameKo: 'asc' },
      })
    })

    // Transform data to include additional computed fields
    const brandsWithStats = brands.map(brand => ({
      id: brand.id,
      nameKo: brand.nameKo,
      nameCn: brand.nameCn,
      slug: brand.slug,
      description: brand.description,
      logoUrl: brand.logoUrl,
      isActive: brand.isActive,
      createdAt: brand.createdAt,
      updatedAt: brand.updatedAt,
      productCount: brand._count.products,
    }))

    return NextResponse.json({
      data: brandsWithStats,
    })
  } catch (error) {
    console.error('Brands API error:', error)
    return NextResponse.json({ error: 'Failed to fetch brands' }, { status: 500 })
  }
}

// Create brand schema
const createBrandSchema = z.object({
  nameKo: z.string().min(1, 'Korean name is required').max(100),
  nameCn: z.string().max(100).optional(),
  slug: z.string().min(1, 'Slug is required').max(100).regex(/^[a-z0-9-]+$/, 'Slug must be lowercase letters, numbers, and hyphens only'),
  description: z.string().max(500).optional(),
  logoUrl: z.string().url().optional().nullable(),
  isActive: z.boolean().default(true),
})

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

    // Verify token and check role
    const jwt = await import('jsonwebtoken')
    let userInfo
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key') as any
      userInfo = decoded
      
      // Only MASTER_ADMIN can create brands
      if (userInfo.role !== 'MASTER_ADMIN') {
        throw new BusinessError(
          ErrorCodes.AUTHORIZATION_ROLE_REQUIRED,
          HttpStatus.FORBIDDEN,
          { requiredRole: 'MASTER_ADMIN' }
        )
      }
    } catch (error) {
      throw new BusinessError(
        ErrorCodes.AUTHENTICATION_INVALID,
        HttpStatus.UNAUTHORIZED
      )
    }

    // Parse and validate request body
    const body = await request.json()
    const data = createBrandSchema.parse(body)

    // Check if slug already exists
    const existingBrand = await withRetry(async () => {
      return await prismaRead.brand.findUnique({
        where: { slug: data.slug },
      })
    })

    if (existingBrand) {
      throw new BusinessError(
        ErrorCodes.VALIDATION_FAILED,
        HttpStatus.CONFLICT,
        { message: 'Brand with this slug already exists' }
      )
    }

    // Create brand
    const brand = await withRetry(async () => {
      return await prismaWrite.brand.create({
        data: {
          ...data,
          logoUrl: data.logoUrl || null,
        },
        include: {
          _count: {
            select: {
              products: true,
            },
          },
        },
      })
    })

    // Create audit log - disabled temporarily due to foreign key constraints
    // TODO: Fix audit log when user management is properly set up
    console.log('Audit log would be created:', {
      userId: userInfo.username || 'unknown',
      action: 'BRAND_CREATE',
      entityType: 'Brand',
      entityId: brand.id,
      metadata: {
        nameKo: brand.nameKo,
        slug: brand.slug,
      },
      ip: request.headers.get('x-forwarded-for') || 'unknown',
      userAgent: request.headers.get('user-agent') || 'unknown',
    })

    return NextResponse.json({
      data: {
        ...brand,
        productCount: brand._count.products,
      },
    }, { status: 201 })
  } catch (error) {
    console.error('POST /api/brands error:', error)
    return createErrorResponse(error as Error, request.url)
  }
}