import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { createErrorResponse, BusinessError, ErrorCodes, HttpStatus } from '@/lib/errors'

export async function GET(request: NextRequest) {
  try {
    console.log('🔍 /api/users GET - Environment check:', {
      NODE_ENV: process.env.NODE_ENV,
      SKIP_AUTH: process.env.NEXT_PUBLIC_SKIP_AUTH,
      HAS_DB: !!process.env.DATABASE_URL
    })

    // Skip auth check when NEXT_PUBLIC_SKIP_AUTH is enabled
    if (process.env.NEXT_PUBLIC_SKIP_AUTH === 'true') {
      console.log('🔧 Auth bypass enabled: skipping auth check in users API')
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

    // Get query parameters
    const searchParams = request.nextUrl.searchParams
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const role = searchParams.get('role')
    const status = searchParams.get('status')

    // Build where clause
    const where: any = {}
    if (role && role !== 'all') where.role = role
    if (status && status !== 'all') where.status = status

    try {
      console.log('📊 Attempting to fetch users from database...')
      
      // Count total users
      const totalUsers = await prisma.user.count({ where })
      console.log('✅ Total users count:', totalUsers)

      // Fetch users
      const users = await prisma.user.findMany({
        where,
        include: {
          brand: {
            select: { id: true, nameKo: true, nameCn: true },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      })
      console.log('✅ Fetched users:', users.length)

      return NextResponse.json({
        data: users,
      meta: {
        page,
        limit,
        totalItems: totalUsers,
        totalPages: Math.ceil(totalUsers / limit),
      },
    })
    } catch (dbError) {
      console.error('❌ Database error in /api/users:', dbError)
      throw dbError
    }
  } catch (error) {
    console.error('❌ Final error in /api/users:', error)
    return createErrorResponse(error as Error, request.url)
  }
}

// Create user schema for invite functionality
const createUserSchema = z.object({
  name: z.string().min(1).max(100),
  email: z.string().email(),
  password: z.string().min(8).optional(), // Optional for invite flow
  role: z.enum(['MASTER_ADMIN', 'BRAND_ADMIN', 'BUYER']).default('BUYER'),
  brandId: z.string().nullable().optional(),
})

// POST: Create/invite new user
export async function POST(request: NextRequest) {
  try {
    // Skip auth check when NEXT_PUBLIC_SKIP_AUTH is enabled
    if (process.env.NEXT_PUBLIC_SKIP_AUTH === 'true') {
      console.log('🔧 Auth bypass enabled: skipping auth check in users API POST')
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
        
        // Only MASTER_ADMIN can create users
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
    const data = createUserSchema.parse(body)

    // Check if email already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: data.email },
    })

    if (existingUser) {
      throw new BusinessError(
        ErrorCodes.USER_EMAIL_EXISTS,
        HttpStatus.CONFLICT
      )
    }

    // If role is BRAND_ADMIN, validate brandId
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

    // Hash password if provided
    let hashedPassword = null
    if (data.password) {
      const bcrypt = await import('bcryptjs')
      hashedPassword = await bcrypt.hash(data.password, 10)
    }

    // Create user
    const user = await prisma.user.create({
      data: {
        name: data.name,
        email: data.email,
        // password field doesn't exist in User model
        role: data.role,
        brandId: data.role === 'BRAND_ADMIN' ? data.brandId : null,
        status: 'ACTIVE',
        // isActive field doesn't exist in User model
      },
      include: {
        brand: {
          select: { id: true, nameKo: true, nameCn: true },
        },
      },
    })

    // Create audit log
    await prisma.auditLog.create({
      data: {
        userId: 'system', // Use system user for audit logs
        action: 'USER_CREATE',
        entityType: 'User',
        entityId: user.id,
        metadata: {
          createdBy: userInfo.username,
          userEmail: user.email,
          userRole: user.role,
        },
        ip: request.headers.get('x-forwarded-for') || 'unknown',
        userAgent: request.headers.get('user-agent') || 'unknown',
      },
    })

    return NextResponse.json({ data: user }, { status: 201 })
  } catch (error) {
    return createErrorResponse(error as Error, request.url)
  }
}