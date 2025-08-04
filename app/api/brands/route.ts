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
  } catch (error: any) {
    console.error('Brands API error:', error)
    
    // Check if it's a database connection error
    if (error.code === 'P1001' || error.message?.includes('Can\'t reach database')) {
      // Return mock data if database is not available
      const mockBrands = [
        {
          id: '1',
          nameKo: '나이키',
          nameCn: '耐克',
          slug: 'nike',
          description: '글로벌 스포츠 브랜드',
          logoUrl: 'https://example.com/nike-logo.png',
          isActive: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          productCount: 15,
        },
        {
          id: '2',
          nameKo: '아디다스',
          nameCn: '阿迪达斯',
          slug: 'adidas',
          description: '독일 스포츠 브랜드',
          logoUrl: 'https://example.com/adidas-logo.png',
          isActive: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          productCount: 12,
        },
      ]
      
      return NextResponse.json({
        data: mockBrands,
        warning: 'Using mock data - database connection not available',
      })
    }
    
    return NextResponse.json({ error: 'Failed to fetch brands' }, { status: 500 })
  }
}

// Create brand schema
const createBrandSchema = z.object({
  nameKo: z.string().min(1, 'Korean name is required').max(100),
  nameCn: z.string().max(100).optional().nullable(),
  slug: z.string().min(1, 'Slug is required').max(100).regex(/^[a-z0-9-]+$/, 'Slug must be lowercase letters, numbers, and hyphens only'),
  description: z.string().max(500).optional().nullable(),
  logoUrl: z.string().url().optional().nullable().or(z.literal('')),
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
    
    // Clean up empty strings to null
    const cleanedBody = {
      ...body,
      nameCn: body.nameCn || null,
      description: body.description || null,
      logoUrl: body.logoUrl || null,
    }
    
    const data = createBrandSchema.parse(cleanedBody)

    // Check if slug already exists
    try {
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
    } catch (checkError: any) {
      // If database is not available, skip the check
      if (checkError.code === 'P1001' || checkError.message?.includes('Can\'t reach database')) {
        console.warn('Skipping slug uniqueness check - database not available')
      } else if (checkError instanceof BusinessError) {
        throw checkError
      } else {
        throw checkError
      }
    }

    // Create brand
    let brand: any
    try {
      brand = await withRetry(async () => {
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

      // Create audit log
      await withRetry(async () => {
        return await prismaWrite.auditLog.create({
          data: {
            userId: 'system', // Use system user for audit logs
            action: 'BRAND_CREATE',
            entityType: 'Brand',
            entityId: brand.id,
            metadata: {
              createdBy: userInfo.username,
              nameKo: brand.nameKo,
              slug: brand.slug,
            },
            ip: request.headers.get('x-forwarded-for') || 'unknown',
            userAgent: request.headers.get('user-agent') || 'unknown',
          },
        })
      })
    } catch (dbError: any) {
      console.error('Database error:', dbError)
      
      // Check if it's a database connection error
      if (dbError.code === 'P1001' || dbError.message?.includes('Can\'t reach database')) {
        // Return mock response for demo purposes
        const mockBrand = {
          id: `mock-${Date.now()}`,
          ...data,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          _count: {
            products: 0,
          },
        }
        
        return NextResponse.json({
          data: {
            ...mockBrand,
            productCount: 0,
          },
          warning: 'Brand created in mock mode - database connection not available',
        }, { status: 201 })
      }
      
      throw dbError
    }

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