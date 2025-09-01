import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { createErrorResponse, BusinessError, ErrorCodes, HttpStatus } from '@/lib/errors'

// GET: Get single user
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Skip auth check when NEXT_PUBLIC_SKIP_AUTH is enabled
    if (process.env.NEXT_PUBLIC_SKIP_AUTH === 'true') {
      console.log('🔧 Auth bypass enabled: skipping auth check in users/[id] API')
    } else {
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
        
        // Only MASTER_ADMIN can view users
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
    }

    const user = await prisma.user.findUnique({
      where: { id: params.id },
      include: {
        brand: {
          select: { id: true, nameKo: true, nameCn: true },
        },
      },
    })

    if (!user) {
      throw new BusinessError(
        ErrorCodes.USER_NOT_FOUND,
        HttpStatus.NOT_FOUND
      )
    }

    return NextResponse.json({ data: user })
  } catch (error) {
    return createErrorResponse(error as Error, request.url)
  }
}

// Update user schema
const updateUserSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  email: z.string().email().optional(),
  role: z.enum(['MASTER_ADMIN', 'BRAND_ADMIN', 'BUYER']).optional(),
  status: z.enum(['ACTIVE', 'SUSPENDED', 'DELETED']).optional(),
  isActive: z.boolean().optional(), // For active/inactive toggle
  brandId: z.string().nullable().optional(),
})

// PATCH: Update user
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Skip auth check when NEXT_PUBLIC_SKIP_AUTH is enabled
    if (process.env.NEXT_PUBLIC_SKIP_AUTH === 'true') {
      console.log('🔧 Auth bypass enabled: skipping auth check in users/[id] PATCH API')
    } else {
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
        
        // Only MASTER_ADMIN can update users
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
    }

    // Parse and validate request body
    const body = await request.json()
    const data = updateUserSchema.parse(body)

    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { id: params.id },
    })

    if (!existingUser) {
      throw new BusinessError(
        ErrorCodes.USER_NOT_FOUND,
        HttpStatus.NOT_FOUND
      )
    }

    // Check if email is being changed and is unique
    if (data.email && data.email !== existingUser.email) {
      const emailExists = await prisma.user.findFirst({
        where: {
          email: data.email,
          id: { not: params.id },
        },
      })

      if (emailExists) {
        throw new BusinessError(
          ErrorCodes.USER_EMAIL_EXISTS,
          HttpStatus.CONFLICT
        )
      }
    }

    // If changing to BRAND_ADMIN, validate brandId
    if (data.role === 'BRAND_ADMIN' && data.brandId) {
      const brand = await prisma.brand.findUnique({
        where: { id: data.brandId },
      })

      if (!brand) {
        throw new BusinessError(
          ErrorCodes.BRAND_NOT_FOUND,
          HttpStatus.NOT_FOUND
        )
      }
    }

    // If changing from BRAND_ADMIN to other role, clear brandId
    if (data.role && data.role !== 'BRAND_ADMIN') {
      data.brandId = null
    }

    // Update user
    const user = await prisma.user.update({
      where: { id: params.id },
      data: {
        ...data,
        updatedAt: new Date(),
      },
      include: {
        brand: {
          select: { id: true, nameKo: true, nameCn: true },
        },
      },
    })

    // Create audit log - disabled temporarily due to foreign key constraints
    // TODO: Fix audit log when user management is properly set up
    // Create audit log
    await prisma.auditLog.create({
      data: {
        userId: 'system', // Use system user for audit logs
        action: 'USER_UPDATE',
        entityType: 'User',
        entityId: user.id,
        metadata: {
          updatedBy: userInfo.username,
          changes: data,
          previousValues: {
            name: existingUser.name,
            email: existingUser.email,
            role: existingUser.role,
            status: existingUser.status,
          },
        },
        ip: request.headers.get('x-forwarded-for') || 'unknown',
        userAgent: request.headers.get('user-agent') || 'unknown',
      },
    })

    return NextResponse.json({ data: user })
  } catch (error) {
    return createErrorResponse(error as Error, request.url)
  }
}