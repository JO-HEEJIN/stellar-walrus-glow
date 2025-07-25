import { Redis } from '@upstash/redis'

// Initialize Redis client
const redis = process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN
  ? new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL,
      token: process.env.UPSTASH_REDIS_REST_TOKEN,
    })
  : null

// Cache configuration
const cacheConfig = {
  // Default TTL in seconds
  defaultTTL: 300, // 5 minutes
  
  // Specific TTLs for different data types
  ttl: {
    product: 300,      // 5 minutes
    productList: 60,   // 1 minute for lists (more dynamic)
    brand: 1800,       // 30 minutes
    category: 3600,    // 1 hour
    user: 3600,        // 1 hour
    analytics: 300,    // 5 minutes
  },
  
  // Cache key prefixes
  prefix: {
    product: 'product:',
    productList: 'products:',
    brand: 'brand:',
    category: 'category:',
    user: 'user:',
    analytics: 'analytics:',
    inventory: 'inventory:',
  }
}

// Cache-aside pattern implementation
export async function cacheAside<T>(
  key: string,
  fetcher: () => Promise<T>,
  ttl?: number
): Promise<T> {
  if (!redis) {
    // If Redis is not configured, always fetch fresh data
    return fetcher()
  }
  
  try {
    // Try to get from cache
    const cached = await redis.get(key)
    if (cached) {
      return cached as T
    }
  } catch (error) {
    console.error('Cache read error:', error)
    // Continue to fetch fresh data on cache error
  }
  
  // Fetch fresh data
  const data = await fetcher()
  
  // Store in cache (fire and forget)
  try {
    await redis.setex(key, ttl || cacheConfig.defaultTTL, JSON.stringify(data))
  } catch (error) {
    console.error('Cache write error:', error)
    // Don't fail the request if cache write fails
  }
  
  return data
}

// Cache invalidation helpers
export async function invalidateCache(pattern: string): Promise<void> {
  if (!redis) return
  
  try {
    // For Upstash Redis, we need to delete specific keys
    // Pattern-based deletion is not directly supported
    console.log(`Cache invalidation requested for pattern: ${pattern}`)
  } catch (error) {
    console.error('Cache invalidation error:', error)
  }
}

// Specific cache helpers
export const cache = {
  // Product cache
  async getProduct(productId: string, fetcher: () => Promise<any>) {
    const key = `${cacheConfig.prefix.product}${productId}`
    return cacheAside(key, fetcher, cacheConfig.ttl.product)
  },
  
  async invalidateProduct(productId: string) {
    if (!redis) return
    const key = `${cacheConfig.prefix.product}${productId}`
    await redis.del(key)
  },
  
  // Product list cache
  async getProductList(params: Record<string, any>, fetcher: () => Promise<any>) {
    const key = `${cacheConfig.prefix.productList}${JSON.stringify(params)}`
    return cacheAside(key, fetcher, cacheConfig.ttl.productList)
  },
  
  async invalidateProductList() {
    // Since we can't use pattern matching, we'll need to track keys
    // In production, consider using Redis Sets to track cache keys
    console.log('Product list cache invalidation requested')
  },
  
  // Brand cache
  async getBrand(brandId: string, fetcher: () => Promise<any>) {
    const key = `${cacheConfig.prefix.brand}${brandId}`
    return cacheAside(key, fetcher, cacheConfig.ttl.brand)
  },
  
  async invalidateBrand(brandId: string) {
    if (!redis) return
    const key = `${cacheConfig.prefix.brand}${brandId}`
    await redis.del(key)
  },
  
  // Analytics cache
  async getAnalytics(type: string, params: Record<string, any>, fetcher: () => Promise<any>) {
    const key = `${cacheConfig.prefix.analytics}${type}:${JSON.stringify(params)}`
    return cacheAside(key, fetcher, cacheConfig.ttl.analytics)
  },
  
  // Inventory cache (shorter TTL for accuracy)
  async getInventory(productId: string, fetcher: () => Promise<any>) {
    const key = `${cacheConfig.prefix.inventory}${productId}`
    return cacheAside(key, fetcher, 30) // 30 seconds TTL
  },
  
  async invalidateInventory(productId: string) {
    if (!redis) return
    const key = `${cacheConfig.prefix.inventory}${productId}`
    await redis.del(key)
    // Also invalidate the product cache
    await cache.invalidateProduct(productId)
  }
}

// Cache warming for popular items
export async function warmCache(type: 'products' | 'brands', items: any[]) {
  if (!redis) return
  
  const promises = items.map(async (item) => {
    try {
      let key: string
      let ttl: number
      
      switch (type) {
        case 'products':
          key = `${cacheConfig.prefix.product}${item.id}`
          ttl = cacheConfig.ttl.product
          break
        case 'brands':
          key = `${cacheConfig.prefix.brand}${item.id}`
          ttl = cacheConfig.ttl.brand
          break
      }
      
      await redis.setex(key, ttl, JSON.stringify(item))
    } catch (error) {
      console.error(`Cache warming error for ${type}:`, error)
    }
  })
  
  await Promise.all(promises)
}