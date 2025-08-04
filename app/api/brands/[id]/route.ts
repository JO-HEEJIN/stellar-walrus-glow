export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server'
import { prismaRead, prismaWrite, withRetry } from '@/lib/prisma-load-balanced'
import { z } from 'zod'
import { createErrorResponse, BusinessError, ErrorCodes, HttpStatus } from '@/lib/errors'

// Update brand schema
const updateBrandSchema = z.object({
  nameKo: z.string().min(1, 'Korean name is required').max(100).optional(),
  nameCn: z.string().max(100).optional().nullable(),
  slug: z.string().min(1, 'Slug is required').max(100).regex(/^[a-z0-9-]+$/, 'Slug must be lowercase letters, numbers, and hyphens only').optional(),
  description: z.string().max(500).optional().nullable(),
  logoUrl: z.string().url().optional().nullable(),
  isActive: z.boolean().optional(),
})

// GET single brand with product count and recent products
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const brandId = params.id

    // Get brand with product count and recent products from read replica
    const brand = await withRetry(async () => {
      return await prismaRead.brand.findUnique({
        where: { id: brandId },
        include: {
          _count: {
            select: {
              products: true,
            },
          },
          products: {
            take: 5,
            orderBy: { createdAt: 'desc' },
            select: {
              id: true,
              nameKo: true,
              thumbnailImage: true,
              basePrice: true,
              createdAt: true,
            },
          },
        },
      })
    })

    if (!brand) {
      throw new BusinessError(
        ErrorCodes.BRAND_NOT_FOUND,
        HttpStatus.NOT_FOUND,
        { resource: 'Brand' }
      )
    }

    // Transform data to include additional computed fields
    const brandWithStats = {
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
      recentProducts: brand.products,
    }

    return NextResponse.json({
      data: brandWithStats,
    })
  } catch (error: any) {
    console.error('GET /api/brands/[id] error:', error)
    
    // Check if it's a database connection error
    if (error.code === 'P1001' || error.message?.includes('Can\'t reach database')) {
      // Return mock data if database is not available
      const mockBrand = {
        id: params.id,
        nameKo: '샘플 브랜드',
        nameCn: '样品品牌',
        slug: 'sample-brand',
        description: '데이터베이스 연결이 되지 않아 샘플 데이터를 표시합니다.',
        logoUrl: null,
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        productCount: 0,
        recentProducts: [],
      }
      
      return NextResponse.json({
        data: mockBrand,
        warning: 'Using mock data - database connection not available',
      })
    }
    
    return createErrorResponse(error as Error, request.url)
  }
}

// PUT update brand
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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
      
      // Only MASTER_ADMIN can update brands
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

    const brandId = params.id

    // Check if brand exists
    const existingBrand = await withRetry(async () => {
      return await prismaRead.brand.findUnique({
        where: { id: brandId },
      })
    })

    if (!existingBrand) {
      throw new BusinessError(
        ErrorCodes.BRAND_NOT_FOUND,
        HttpStatus.NOT_FOUND,
        { resource: 'Brand' }
      )
    }

    // Parse and validate request body
    const body = await request.json()
    const data = updateBrandSchema.parse(body)

    // If slug is being updated, check for uniqueness
    if (data.slug && data.slug !== existingBrand.slug) {
      const slugExists = await withRetry(async () => {
        return await prismaRead.brand.findUnique({
          where: { slug: data.slug },
        })
      })

      if (slugExists) {
        throw new BusinessError(
          ErrorCodes.VALIDATION_FAILED,
          HttpStatus.CONFLICT,
          { message: 'Brand with this slug already exists' }
        )
      }
    }

    // Update brand
    let updatedBrand
    try {
      updatedBrand = await withRetry(async () => {
        return await prismaWrite.brand.update({
          where: { id: brandId },
          data: {
            ...data,
            logoUrl: data.logoUrl === undefined ? undefined : data.logoUrl,
          },
        })
      })

      // Create audit log
      await withRetry(async () => {
        return await prismaWrite.auditLog.create({
          data: {
            userId: 'system', // Use system user for audit logs
            action: 'BRAND_UPDATE',
            entityType: 'Brand',
            entityId: brandId,
            metadata: {
              updatedBy: userInfo.username,
              changes: data,
              previousValues: {
                nameKo: existingBrand.nameKo,
                slug: existingBrand.slug,
              },
            },
            ip: request.headers.get('x-forwarded-for') || 'unknown',
            userAgent: request.headers.get('user-agent') || 'unknown',
          },
        })
      })
    } catch (dbError: any) {
      console.error('Database error during update:', dbError)
      
      // Check if it's a database connection error
      if (dbError.code === 'P1001' || dbError.message?.includes('Can\'t reach database')) {
        // Return mock response for demo purposes
        const mockUpdatedBrand = {
          ...existingBrand,
          ...data,
          updatedAt: new Date().toISOString(),
        }
        
        return NextResponse.json({
          data: mockUpdatedBrand,
          warning: 'Brand updated in mock mode - database connection not available',
        })
      }
      
      throw dbError
    }

    return NextResponse.json({
      data: updatedBrand,
    })
  } catch (error: any) {
    console.error('PUT /api/brands/[id] error:', error)
    return createErrorResponse(error as Error, request.url)
  }
}

// DELETE brand (soft delete)
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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
      
      // Only MASTER_ADMIN can delete brands
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

    const brandId = params.id

    // Check if brand exists and get product count
    const existingBrand = await withRetry(async () => {
      return await prismaRead.brand.findUnique({
        where: { id: brandId },
        include: {
          _count: {
            select: {
              products: true,
            },
          },
        },
      })
    })

    if (!existingBrand) {
      throw new BusinessError(
        ErrorCodes.BRAND_NOT_FOUND,
        HttpStatus.NOT_FOUND,
        { resource: 'Brand' }
      )
    }

    // Prevent deletion if brand has products
    if (existingBrand._count.products > 0) {
      throw new BusinessError(
        ErrorCodes.VALIDATION_FAILED,
        HttpStatus.CONFLICT,
        { 
          message: `Cannot delete brand with ${existingBrand._count.products} products. Please reassign or delete products first.` 
        }
      )
    }

    // Soft delete brand (set isActive to false)
    let deletedBrand
    try {
      deletedBrand = await withRetry(async () => {
        return await prismaWrite.brand.update({
          where: { id: brandId },
          data: { isActive: false },
        })
      })

      // Create audit log
      await withRetry(async () => {
        return await prismaWrite.auditLog.create({
          data: {
            userId: 'system', // Use system user for audit logs
            action: 'BRAND_DELETE',
            entityType: 'Brand',
            entityId: brandId,
            metadata: {
              deletedBy: userInfo.username,
              nameKo: existingBrand.nameKo,
              slug: existingBrand.slug,
              softDelete: true,
            },
            ip: request.headers.get('x-forwarded-for') || 'unknown',
            userAgent: request.headers.get('user-agent') || 'unknown',
          },
        })
      })
    } catch (dbError: any) {
      console.error('Database error during delete:', dbError)
      
      // Check if it's a database connection error
      if (dbError.code === 'P1001' || dbError.message?.includes('Can\'t reach database')) {
        // Return success response for demo purposes
        return NextResponse.json({
          message: 'Brand deleted successfully (mock mode)',
          data: {
            ...existingBrand,
            isActive: false,
          },
          warning: 'Brand deleted in mock mode - database connection not available',
        })
      }
      
      throw dbError
    }

    return NextResponse.json({
      message: 'Brand deleted successfully',
      data: deletedBrand,
    })
  } catch (error: any) {
    console.error('DELETE /api/brands/[id] error:', error)
    return createErrorResponse(error as Error, request.url)
  }
}