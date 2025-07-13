import { Ratelimit } from '@upstash/ratelimit'
import { Redis } from '@upstash/redis'

// Check if Redis configuration is available
const isRedisConfigured = 
  process.env.UPSTASH_REDIS_REST_URL && 
  process.env.UPSTASH_REDIS_REST_TOKEN &&
  process.env.UPSTASH_REDIS_REST_URL.startsWith('https://') &&
  process.env.UPSTASH_REDIS_REST_TOKEN !== 'your-upstash-redis-token'

// Create Redis instance only if properly configured
const redis = isRedisConfigured ? new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
}) : null

// Mock rate limiter for when Redis is not configured
const mockRateLimiter = {
  limit: async () => ({
    success: true,
    limit: 100,
    remaining: 99,
    reset: Date.now() + 60000,
  }),
}

// Rate limiters for different scenarios
export const rateLimiters = redis ? {
  // General API rate limiting - 10 requests per 10 seconds
  api: new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(10, '10 s'),
    analytics: true,
    prefix: '@upstash/ratelimit:api',
  }),

  // Auth rate limiting - 5 attempts per 15 minutes
  auth: new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(5, '15 m'),
    analytics: true,
    prefix: '@upstash/ratelimit:auth',
  }),

  // Product creation rate limiting - 20 per hour
  productCreate: new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(20, '1 h'),
    analytics: true,
    prefix: '@upstash/ratelimit:product-create',
  }),

  // Order creation rate limiting - 50 per hour
  orderCreate: new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(50, '1 h'),
    analytics: true,
    prefix: '@upstash/ratelimit:order-create',
  }),
} : {
  // Mock rate limiters when Redis is not configured
  api: mockRateLimiter,
  auth: mockRateLimiter,
  productCreate: mockRateLimiter,
  orderCreate: mockRateLimiter,
}

// Helper function to get identifier from request
export function getIdentifier(request: Request): string {
  // Try to get IP from various headers
  const forwardedFor = request.headers.get('x-forwarded-for')
  const realIp = request.headers.get('x-real-ip')
  const cfConnectingIp = request.headers.get('cf-connecting-ip')
  
  // Return the first available IP or a default
  return forwardedFor?.split(',')[0].trim() || 
         realIp || 
         cfConnectingIp || 
         'anonymous'
}

// Rate limit response helper
export function rateLimitResponse(
  remaining: number,
  reset: number,
  limit: number
): Response {
  return new Response('Too Many Requests', {
    status: 429,
    headers: {
      'X-RateLimit-Limit': limit.toString(),
      'X-RateLimit-Remaining': remaining.toString(),
      'X-RateLimit-Reset': new Date(reset).toISOString(),
      'Retry-After': Math.max(0, Math.floor((reset - Date.now()) / 1000)).toString(),
    },
  })
}