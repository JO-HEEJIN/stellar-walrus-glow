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
  role: z.enum(['BUYER', 'BRAND_ADMIN', 'MASTER_ADMIN']).optional(),
})

const createUserSchema = z.object({
  name: z.string().min(1).max(100),
  email: z.string().email(),
  role: z.enum(['MASTER_ADMIN', 'BRAND_ADMIN', 'BUYER']).default('BUYER'),
  cognitoId: z.string().optional(),
})

/**
 * GET /api/users-v2
 * Fetch users with filtering and pagination using RDS Data API
 */
export async function GET(request: NextRequest) {
  try {
    const identifier = getIdentifier(request)
    
    // Rate limiting
    try {
      await rateLimiters.api.limit(identifier)
    } catch (error) {
      return createErrorResponse(
        new BusinessError('Too many requests', ErrorCodes.SYSTEM_RATE_LIMIT_EXCEEDED),
        HttpStatus.TOO_MANY_REQUESTS
      )
    }

    // Parse query parameters
    const { searchParams } = new URL(request.url)
    const queryParams = Object.fromEntries(searchParams.entries())
    
    const { page, limit, search, role } = searchSchema.parse(queryParams)
    const offset = (page - 1) * limit

    // Get database adapter
    const db = getDatabase()

    // Build SQL query for users with filtering
    let sql = 'SELECT * FROM User'
    const params: any[] = []
    const whereConditions: string[] = []
    
    if (search) {
      whereConditions.push('(name LIKE ? OR email LIKE ?)')
      params.push(`%${search}%`, `%${search}%`)
    }
    
    if (role) {
      whereConditions.push('role = ?')
      params.push(role)
    }
    
    if (whereConditions.length > 0) {
      sql += ' WHERE ' + whereConditions.join(' AND ')
    }
    
    sql += ' ORDER BY createdAt DESC'
    
    if (limit) {
      sql += ' LIMIT ?'
      params.push(limit)
    }
    
    if (offset) {
      sql += ' OFFSET ?'
      params.push(offset)
    }

    // Get users and total count using database adapter
    const [users, totalCount] = await Promise.all([
      db.client.query(sql, params).then(result => result.rows),
      db.getUserCount({ search, role })
    ])

    const totalPages = Math.ceil(totalCount / limit)
    const hasMore = page < totalPages

    logger.info('Users fetched successfully', {
      count: users.length,
      totalCount,
      page,
      limit,
      role: role || 'all'
    })

    return NextResponse.json({
      data: users,
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
    logger.error('User fetch error:', error)
    
    if (error instanceof z.ZodError) {
      return createErrorResponse(
        new BusinessError('Invalid query parameters', ErrorCodes.VALIDATION_ERROR, error.errors),
        HttpStatus.BAD_REQUEST
      )
    }

    return createErrorResponse(
      new BusinessError('Failed to fetch users', ErrorCodes.DATABASE_ERROR),
      HttpStatus.INTERNAL_SERVER_ERROR
    )
  }
}

/**
 * POST /api/users-v2
 * Create a new user using RDS Data API
 */
export async function POST(request: NextRequest) {
  try {
    const identifier = getIdentifier(request)
    
    // Rate limiting - stricter for user creation
    try {
      await rateLimiters.api.limit(identifier)
    } catch (error) {
      return createErrorResponse(
        new BusinessError('Too many user creation requests', ErrorCodes.SYSTEM_RATE_LIMIT_EXCEEDED),
        HttpStatus.TOO_MANY_REQUESTS
      )
    }

    // Parse and validate request body
    const body = await request.json()
    const userData = createUserSchema.parse(body)

    // Get database adapter
    const db = getDatabase()

    // Check if email already exists
    const existingUser = await db.getUserByEmail(userData.email)
    if (existingUser) {
      return createErrorResponse(
        new BusinessError('User with this email already exists', ErrorCodes.DUPLICATE_ENTRY),
        HttpStatus.CONFLICT
      )
    }

    // Create user
    const user = await db.createUser(userData)

    logger.info('User created successfully', {
      userId: user.id,
      name: user.name,
      email: user.email,
      role: user.role
    })

    return NextResponse.json({
      data: user,
      meta: {
        timestamp: new Date().toISOString(),
        apiVersion: 'v2',
        dataSource: 'RDS Data API'
      }
    }, { status: 201 })

  } catch (error) {
    logger.error('User creation error:', error)
    
    if (error instanceof z.ZodError) {
      return createErrorResponse(
        new BusinessError('Invalid user data', ErrorCodes.VALIDATION_ERROR, error.errors),
        HttpStatus.BAD_REQUEST
      )
    }

    // Handle duplicate email or other database errors
    if (error instanceof Error && error.message.includes('Duplicate entry')) {
      return createErrorResponse(
        new BusinessError('User with this email already exists', ErrorCodes.DUPLICATE_ENTRY),
        HttpStatus.CONFLICT
      )
    }

    return createErrorResponse(
      new BusinessError('Failed to create user', ErrorCodes.DATABASE_ERROR),
      HttpStatus.INTERNAL_SERVER_ERROR
    )
  }
}