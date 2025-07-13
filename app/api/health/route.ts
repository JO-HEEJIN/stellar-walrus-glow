import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { Redis } from '@upstash/redis'

export async function GET() {
  const health = {
    status: 'ok',
    timestamp: new Date().toISOString(),
    services: {
      app: true,
      database: false,
      redis: false,
    },
    version: process.env.npm_package_version || '1.0.0',
    environment: process.env.NODE_ENV || 'development',
  }

  // Check database connection
  try {
    await prisma.$queryRaw`SELECT 1`
    health.services.database = true
  } catch (error) {
    console.warn('Database health check failed:', error)
  }

  // Check Redis connection
  try {
    if (
      process.env.UPSTASH_REDIS_REST_URL && 
      process.env.UPSTASH_REDIS_REST_TOKEN &&
      process.env.UPSTASH_REDIS_REST_URL.startsWith('https://') &&
      process.env.UPSTASH_REDIS_REST_TOKEN !== 'your-upstash-redis-token'
    ) {
      const redis = new Redis({
        url: process.env.UPSTASH_REDIS_REST_URL,
        token: process.env.UPSTASH_REDIS_REST_TOKEN,
      })
      await redis.ping()
      health.services.redis = true
    }
  } catch (error) {
    console.warn('Redis health check failed:', error)
  }

  // Determine overall health status
  const allServicesHealthy = Object.values(health.services).every(status => status === true)
  const httpStatus = allServicesHealthy ? 200 : 503

  return NextResponse.json(health, { status: httpStatus })
}