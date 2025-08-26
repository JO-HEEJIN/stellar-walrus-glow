export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server'
import { getDatabase } from '@/lib/db/adapter'
import { rateLimiters, getIdentifier } from '@/lib/rate-limit'
import { createErrorResponse, BusinessError, ErrorCodes, HttpStatus } from '@/lib/errors'
import { logger } from '@/lib/logger'

/**
 * GET /api/performance
 * Get performance metrics for RDS Data API migration
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

    const db = getDatabase()

    // Test connection and measure response time
    const connectionStart = Date.now()
    const testResult = await db.testConnection()
    const connectionTime = Date.now() - connectionStart

    // Get cache statistics
    const cacheStats = db.client.getCacheStats()

    // Test query performance
    const queryStart = Date.now()
    const sampleQuery = await db.getProducts({ limit: 10 })
    const queryTime = Date.now() - queryStart

    // Analytics query performance
    const analyticsStart = Date.now()
    const analyticsData = await db.getAnalyticsOverview()
    const analyticsTime = Date.now() - analyticsStart

    logger.info('Performance metrics collected', {
      connectionTime,
      queryTime,
      analyticsTime,
      cacheSize: cacheStats.size
    })

    return NextResponse.json({
      data: {
        connection: {
          status: testResult.success ? 'healthy' : 'unhealthy',
          responseTime: connectionTime,
          message: testResult.message
        },
        queries: {
          sampleQueryTime: queryTime,
          analyticsQueryTime: analyticsTime,
          sampleResultCount: sampleQuery.length
        },
        cache: {
          enabled: true,
          size: cacheStats.size,
          timeout: cacheStats.timeout,
          hitRatio: cacheStats.size > 0 ? 'Available' : 'No cached queries'
        },
        optimization: {
          batchQueriesEnabled: true,
          connectionRetries: 3,
          requestTimeout: 30000,
          cacheTimeout: cacheStats.timeout
        },
        performance: {
          averageQueryTime: `${queryTime}ms`,
          cacheEfficiency: cacheStats.size > 0 ? 'Active' : 'Building cache',
          dataSource: 'RDS Data API (HTTP-based)',
          migration: 'Completed - Prisma to RDS Data API'
        }
      },
      meta: {
        timestamp: new Date().toISOString(),
        apiVersion: 'v1',
        testDuration: Date.now() - connectionStart
      }
    })

  } catch (error) {
    logger.error('Performance monitoring error:', error instanceof Error ? error : new Error(String(error)))
    
    return createErrorResponse(
      new BusinessError(ErrorCodes.DATABASE_ERROR, HttpStatus.INTERNAL_SERVER_ERROR),
      request.url
    )
  }
}