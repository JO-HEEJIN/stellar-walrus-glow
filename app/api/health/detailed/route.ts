import { NextResponse } from 'next/server'
import { prismaRead, prismaWrite } from '@/lib/prisma-load-balanced'
import { Redis } from '@upstash/redis'
import { getMetrics, checkDatabaseHealth } from '@/lib/monitoring'
import { getQueueStatus } from '@/lib/inventory-queue'

export async function GET() {
  const startTime = Date.now()
  
  // Initialize health status
  const health = {
    status: 'healthy' as 'healthy' | 'degraded' | 'unhealthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    services: {
      api: { status: 'healthy', responseTime: 0 },
      database: { 
        primary: { status: 'unknown', responseTime: 0 },
        replica: { status: 'unknown', responseTime: 0 }
      },
      cache: { status: 'unknown', responseTime: 0 },
      queue: { status: 'unknown', queueLength: 0 }
    },
    metrics: {} as any,
    issues: [] as string[]
  }
  
  // Check primary database
  try {
    const dbStart = Date.now()
    await prismaWrite.$queryRaw`SELECT 1`
    health.services.database.primary = {
      status: 'healthy',
      responseTime: Date.now() - dbStart
    }
  } catch (error) {
    health.services.database.primary.status = 'unhealthy'
    health.issues.push('Primary database connection failed')
    health.status = 'unhealthy'
  }
  
  // Check read replica
  try {
    const dbStart = Date.now()
    await prismaRead.$queryRaw`SELECT 1`
    health.services.database.replica = {
      status: 'healthy',
      responseTime: Date.now() - dbStart
    }
  } catch (error) {
    health.services.database.replica.status = 'unhealthy'
    health.issues.push('Read replica connection failed')
    if (health.status === 'healthy') health.status = 'degraded'
  }
  
  // Check Redis cache
  if (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
    try {
      const redis = new Redis({
        url: process.env.UPSTASH_REDIS_REST_URL,
        token: process.env.UPSTASH_REDIS_REST_TOKEN,
      })
      
      const cacheStart = Date.now()
      await redis.ping()
      health.services.cache = {
        status: 'healthy',
        responseTime: Date.now() - cacheStart
      }
    } catch (error) {
      health.services.cache.status = 'unhealthy'
      health.issues.push('Redis cache connection failed')
      if (health.status === 'healthy') health.status = 'degraded'
    }
  } else {
    health.services.cache.status = 'disabled'
  }
  
  // Check inventory queue
  try {
    const queueStatus = await getQueueStatus()
    health.services.queue = {
      status: 'healthy',
      queueLength: queueStatus.queueLength,
      isProcessing: queueStatus.isProcessing
    } as any
    
    if (queueStatus.queueLength > 100) {
      health.issues.push(`High queue backlog: ${queueStatus.queueLength} items`)
      if (health.status === 'healthy') health.status = 'degraded'
    }
  } catch (error) {
    health.services.queue.status = 'unknown'
  }
  
  // Get performance metrics
  health.metrics = getMetrics()
  
  // Check database health based on metrics
  const dbHealth = checkDatabaseHealth()
  if (!dbHealth.healthy) {
    health.issues.push(...dbHealth.issues)
    if (health.status === 'healthy') health.status = 'degraded'
  }
  
  // Calculate API response time
  health.services.api.responseTime = Date.now() - startTime
  
  // Return appropriate status code
  const statusCode = health.status === 'healthy' ? 200 : 
                     health.status === 'degraded' ? 206 : 503
  
  return NextResponse.json(health, { status: statusCode })
}