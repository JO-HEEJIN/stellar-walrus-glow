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
        new BusinessError(ErrorCodes.SYSTEM_RATE_LIMIT_EXCEEDED, HttpStatus.TOO_MANY_REQUESTS),
        request.url
      )
    }

    // Parse query parameters
    const { searchParams } = new URL(request.url)
    const queryParams = Object.fromEntries(searchParams.entries())
    
    const { page, limit, search, role } = searchSchema.parse(queryParams)
    const offset = (page - 1) * limit

    // Get database adapter
    const db = getDatabase()

    // Use database adapter's client query method through a public interface
    const users = await db.getUsers({ search, role, limit, offset })
    const totalCount = await db.getUserCount({ search, role })

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
    logger.error('User fetch error:', error instanceof Error ? error : new Error(String(error)))
    
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
        new BusinessError(ErrorCodes.SYSTEM_RATE_LIMIT_EXCEEDED, HttpStatus.TOO_MANY_REQUESTS),
        request.url
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
        new BusinessError(ErrorCodes.USER_EMAIL_EXISTS, HttpStatus.CONFLICT),
        request.url
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
    logger.error('User creation error:', error instanceof Error ? error : new Error(String(error)))
    
    if (error instanceof z.ZodError) {
      return createErrorResponse(
        new BusinessError(ErrorCodes.VALIDATION_ERROR, HttpStatus.BAD_REQUEST, error.errors),
        request.url
      )
    }

    // Handle duplicate email or other database errors
    if (error instanceof Error && error.message.includes('Duplicate entry')) {
      return createErrorResponse(
        new BusinessError(ErrorCodes.USER_EMAIL_EXISTS, HttpStatus.CONFLICT),
        request.url
      )
    }

    return createErrorResponse(
      new BusinessError(ErrorCodes.SYSTEM_DATABASE_ERROR, HttpStatus.INTERNAL_SERVER_ERROR),
      request.url
    )
  }
}