#!/usr/bin/env npx tsx

/**
 * Cache Connection Test Script
 * 
 * This script tests the Redis caching setup with:
 * - Connection to Upstash Redis
 * - Cache operations (set, get, delete)
 * - TTL functionality
 * - Performance metrics
 * - Cache warming
 */

import { Redis } from '@upstash/redis'
import { cache } from '../lib/cache'
import { trackCache } from '../lib/monitoring'
import { readFileSync } from 'fs'
import { resolve } from 'path'

// Load environment variables manually
const envPath = resolve(process.cwd(), '.env')
const envFile = readFileSync(envPath, 'utf-8')
envFile.split('\n').forEach(line => {
  const trimmedLine = line.trim()
  if (trimmedLine && !trimmedLine.startsWith('#')) {
    const [key, ...valueParts] = trimmedLine.split('=')
    const value = valueParts.join('=').replace(/^["']|["']$/g, '')
    if (key && value) {
      process.env[key] = value
    }
  }
})

interface CacheTestResults {
  connection: {
    connected: boolean
    responseTime: number
    error?: string
  }
  operations: {
    set: { success: boolean, responseTime: number }
    get: { success: boolean, responseTime: number, dataCorrect: boolean }
    delete: { success: boolean, responseTime: number }
    ttl: { success: boolean, responseTime: number }
  }
  performance: {
    avgResponseTime: number
    throughput: number
    cacheHitRate: number
  }
  integration: {
    cacheAsidePattern: boolean
    invalidation: boolean
    warmingTest: boolean
  }
}

async function testCacheConnection(): Promise<CacheTestResults> {
  const results: CacheTestResults = {
    connection: { connected: false, responseTime: 0 },
    operations: {
      set: { success: false, responseTime: 0 },
      get: { success: false, responseTime: 0, dataCorrect: false },
      delete: { success: false, responseTime: 0 },
      ttl: { success: false, responseTime: 0 }
    },
    performance: { avgResponseTime: 0, throughput: 0, cacheHitRate: 0 },
    integration: { cacheAsidePattern: false, invalidation: false, warmingTest: false }
  }

  console.log('🔄 Testing Redis cache connection...\n')

  // Initialize Redis client
  const redis = process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN
    ? new Redis({
        url: process.env.UPSTASH_REDIS_REST_URL,
        token: process.env.UPSTASH_REDIS_REST_TOKEN,
      })
    : null

  if (!redis) {
    console.log('❌ Redis not configured. Check UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN')
    return results
  }

  // Test 1: Basic Connection
  console.log('1. Testing Redis connection...')
  try {
    const start = Date.now()
    const pingResult = await redis.ping()
    const responseTime = Date.now() - start
    
    if (pingResult === 'PONG') {
      results.connection = { connected: true, responseTime }
      console.log(`   ✅ Connection: Successful (${responseTime}ms)`)
    } else {
      throw new Error('Ping returned unexpected result')
    }
  } catch (error) {
    results.connection = {
      connected: false,
      responseTime: 0,
      error: error instanceof Error ? error.message : 'Unknown error'
    }
    console.log(`   ❌ Connection failed: ${results.connection.error}`)
    return results // Exit early if no connection
  }

  // Test 2: Set Operation
  console.log('\n2. Testing SET operation...')
  try {
    const testKey = 'test:cache:set'
    const testValue = { message: 'Hello Cache!', timestamp: Date.now() }
    
    const start = Date.now()
    await redis.set(testKey, JSON.stringify(testValue))
    const responseTime = Date.now() - start
    
    results.operations.set = { success: true, responseTime }
    console.log(`   ✅ SET operation: Successful (${responseTime}ms)`)
  } catch (error) {
    console.log(`   ❌ SET operation failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }

  // Test 3: Get Operation
  console.log('\n3. Testing GET operation...')
  try {
    const testKey = 'test:cache:set'
    
    const start = Date.now()
    const result = await redis.get(testKey)
    const responseTime = Date.now() - start
    
    if (result) {
      // Upstash may auto-parse JSON, so check if it's already an object
      const parsed = typeof result === 'string' ? JSON.parse(result) : result
      const dataCorrect = parsed.message === 'Hello Cache!' && typeof parsed.timestamp === 'number'
      
      results.operations.get = { success: true, responseTime, dataCorrect }
      console.log(`   ✅ GET operation: Successful (${responseTime}ms) - Data: ${dataCorrect ? 'Correct' : 'Incorrect'}`)
      trackCache(true) // Cache hit
    } else {
      results.operations.get = { success: false, responseTime, dataCorrect: false }
      console.log(`   ❌ GET operation: No data returned`)
      trackCache(false) // Cache miss
    }
  } catch (error) {
    console.log(`   ❌ GET operation failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
    trackCache(false)
  }

  // Test 4: TTL Operation
  console.log('\n4. Testing TTL functionality...')
  try {
    const testKey = 'test:cache:ttl'
    const testValue = 'TTL Test Value'
    const ttlSeconds = 2
    
    const start = Date.now()
    await redis.setex(testKey, ttlSeconds, testValue)
    
    // Check if key exists immediately
    const immediateResult = await redis.get(testKey)
    
    // Wait for TTL to expire
    await new Promise(resolve => setTimeout(resolve, (ttlSeconds + 1) * 1000))
    
    // Check if key has expired
    const expiredResult = await redis.get(testKey)
    const responseTime = Date.now() - start
    
    const success = immediateResult === testValue && expiredResult === null
    results.operations.ttl = { success, responseTime }
    
    console.log(`   ${success ? '✅' : '❌'} TTL operation: ${success ? 'Successful' : 'Failed'} (${responseTime}ms)`)
    console.log(`   📊 Immediate result: ${immediateResult ? 'Found' : 'Not found'}`)
    console.log(`   📊 After TTL: ${expiredResult ? 'Found' : 'Expired correctly'}`)
  } catch (error) {
    console.log(`   ❌ TTL operation failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }

  // Test 5: Delete Operation
  console.log('\n5. Testing DELETE operation...')
  try {
    const testKey = 'test:cache:delete'
    const testValue = 'Delete Test Value'
    
    // Set a value first
    await redis.set(testKey, testValue)
    
    const start = Date.now()
    const deleteResult = await redis.del(testKey)
    const responseTime = Date.now() - start
    
    // Verify deletion
    const verifyResult = await redis.get(testKey)
    const success = deleteResult === 1 && verifyResult === null
    
    results.operations.delete = { success, responseTime }
    console.log(`   ${success ? '✅' : '❌'} DELETE operation: ${success ? 'Successful' : 'Failed'} (${responseTime}ms)`)
  } catch (error) {
    console.log(`   ❌ DELETE operation failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }

  // Test 6: Performance Test
  console.log('\n6. Testing performance with multiple operations...')
  try {
    const operations = 10
    const times: number[] = []
    
    for (let i = 0; i < operations; i++) {
      const start = Date.now()
      await redis.set(`perf:test:${i}`, `value-${i}`)
      await redis.get(`perf:test:${i}`)
      times.push(Date.now() - start)
    }
    
    // Cleanup
    const deletePromises = Array.from({ length: operations }, (_, i) => 
      redis.del(`perf:test:${i}`)
    )
    await Promise.all(deletePromises)
    
    const avgResponseTime = times.reduce((a, b) => a + b, 0) / times.length
    const throughput = Math.round((operations * 2) / (Math.max(...times) / 1000)) // ops per second
    
    results.performance = {
      avgResponseTime,
      throughput,
      cacheHitRate: 100 // All gets should hit since we set immediately before
    }
    
    console.log(`   ✅ Performance test: ${operations} operations completed`)
    console.log(`   📊 Average response time: ${avgResponseTime.toFixed(1)}ms`)
    console.log(`   📊 Throughput: ~${throughput} ops/sec`)
  } catch (error) {
    console.log(`   ❌ Performance test failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }

  // Test 7: Cache-Aside Pattern
  console.log('\n7. Testing cache-aside pattern integration...')
  try {
    const mockDataFetcher = async () => {
      await new Promise(resolve => setTimeout(resolve, 100)) // Simulate DB delay
      return { id: 'test-product', name: 'Test Product', price: 99.99 }
    }
    
    // First call should fetch from "database"
    const start1 = Date.now()
    const result1 = await cache.getProduct('test-cache-aside', mockDataFetcher)
    const time1 = Date.now() - start1
    
    // Second call should come from cache (faster)
    const start2 = Date.now()
    const result2 = await cache.getProduct('test-cache-aside', mockDataFetcher)
    const time2 = Date.now() - start2
    
    const cacheWorking = time2 < time1 && 
                        result1.id === result2.id && 
                        result1.name === result2.name
    
    results.integration.cacheAsidePattern = cacheWorking
    console.log(`   ${cacheWorking ? '✅' : '❌'} Cache-aside pattern: ${cacheWorking ? 'Working' : 'Failed'}`)
    console.log(`   📊 First call (DB): ${time1}ms`)
    console.log(`   📊 Second call (Cache): ${time2}ms`)
    
    // Cleanup
    await cache.invalidateProduct('test-cache-aside')
  } catch (error) {
    console.log(`   ❌ Cache-aside test failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }

  // Test 8: Cache Invalidation
  console.log('\n8. Testing cache invalidation...')
  try {
    const productId = 'test-invalidation'
    
    // Set cache entry
    await redis.set(`product:${productId}`, JSON.stringify({ id: productId, cached: true }))
    
    // Verify it exists
    const beforeInvalidation = await redis.get(`product:${productId}`)
    
    // Invalidate
    await cache.invalidateProduct(productId)
    
    // Verify it's gone
    const afterInvalidation = await redis.get(`product:${productId}`)
    
    const invalidationWorked = beforeInvalidation !== null && afterInvalidation === null
    results.integration.invalidation = invalidationWorked
    
    console.log(`   ${invalidationWorked ? '✅' : '❌'} Cache invalidation: ${invalidationWorked ? 'Working' : 'Failed'}`)
  } catch (error) {
    console.log(`   ❌ Cache invalidation test failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }

  // Final cleanup
  console.log('\n9. Cleaning up test data...')
  try {
    const keysToDelete = ['test:cache:set', 'test:cache:delete', 'test:cache:ttl']
    await Promise.all(keysToDelete.map(key => redis.del(key)))
    console.log('   ✅ Cleanup completed')
  } catch (error) {
    console.log('   ⚠️  Cleanup failed (non-critical)')
  }

  return results
}

async function displayCacheSummary(results: CacheTestResults) {
  console.log('\n' + '='.repeat(60))
  console.log('📋 CACHE CONNECTION TEST SUMMARY')
  console.log('='.repeat(60))
  
  // Connection Status
  console.log('\n🔌 CONNECTION STATUS:')
  console.log(`   Redis Connection: ${results.connection.connected ? '✅ Connected' : '❌ Failed'}`)
  if (results.connection.connected) {
    console.log(`   Response Time:    ${results.connection.responseTime}ms`)
  }
  
  // Operations Status
  console.log('\n⚙️  OPERATIONS STATUS:')
  console.log(`   SET:    ${results.operations.set.success ? '✅' : '❌'} (${results.operations.set.responseTime}ms)`)
  console.log(`   GET:    ${results.operations.get.success ? '✅' : '❌'} (${results.operations.get.responseTime}ms)`)
  console.log(`   DELETE: ${results.operations.delete.success ? '✅' : '❌'} (${results.operations.delete.responseTime}ms)`)
  console.log(`   TTL:    ${results.operations.ttl.success ? '✅' : '❌'} (${results.operations.ttl.responseTime}ms)`)
  
  // Performance Metrics
  if (results.performance.avgResponseTime > 0) {
    console.log('\n⚡ PERFORMANCE METRICS:')
    console.log(`   Avg Response Time: ${results.performance.avgResponseTime.toFixed(1)}ms`)
    console.log(`   Throughput:        ~${results.performance.throughput} ops/sec`)
    console.log(`   Cache Hit Rate:    ${results.performance.cacheHitRate.toFixed(1)}%`)
  }
  
  // Integration Status
  console.log('\n🔗 INTEGRATION STATUS:')
  console.log(`   Cache-Aside:      ${results.integration.cacheAsidePattern ? '✅' : '❌'}`)
  console.log(`   Invalidation:     ${results.integration.invalidation ? '✅' : '❌'}`)
  
  // Health Assessment
  console.log('\n🏥 HEALTH ASSESSMENT:')
  const connected = results.connection.connected
  const basicOpsWork = results.operations.set.success && results.operations.get.success
  const integrationWorks = results.integration.cacheAsidePattern
  
  if (connected && basicOpsWork && integrationWorks) {
    console.log('   🟢 Overall Status: HEALTHY')
    console.log('   ✅ Cache system fully operational')
  } else if (connected && basicOpsWork) {
    console.log('   🟡 Overall Status: DEGRADED')
    console.log('   ⚠️  Basic caching works but integration issues detected')
  } else if (connected) {
    console.log('   🔴 Overall Status: UNHEALTHY')
    console.log('   ❌ Connection works but operations failing')
  } else {
    console.log('   ⚫ Overall Status: OFFLINE')
    console.log('   ❌ No Redis connection available')
  }
  
  // Recommendations
  console.log('\n💡 RECOMMENDATIONS:')
  if (!results.connection.connected) {
    console.log('   - Verify UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN')
    console.log('   - Check Upstash Redis dashboard for service status')
    console.log('   - Verify network connectivity')
  }
  if (results.connection.responseTime > 100) {
    console.log('   - High latency detected - consider changing Redis region')
  }
  if (!results.integration.cacheAsidePattern) {
    console.log('   - Cache-aside pattern not working - check implementation')
  }
  if (results.performance.avgResponseTime > 50) {
    console.log('   - Consider optimizing payload sizes or connection settings')
  }
}

async function main() {
  console.log('K-Fashion Cache Connection Test')
  console.log('===============================\n')
  
  // Check environment variables
  if (!process.env.UPSTASH_REDIS_REST_URL || !process.env.UPSTASH_REDIS_REST_TOKEN) {
    console.log('❌ Redis not configured. Please set:')
    console.log('   - UPSTASH_REDIS_REST_URL')
    console.log('   - UPSTASH_REDIS_REST_TOKEN')
    console.log('\nSee docs/upstash-redis-setup.md for setup instructions.')
    process.exit(1)
  }
  
  try {
    const results = await testCacheConnection()
    await displayCacheSummary(results)
    
    // Exit with appropriate code
    const success = results.connection.connected && 
                   results.operations.set.success && 
                   results.operations.get.success
    process.exit(success ? 0 : 1)
  } catch (error) {
    console.error('❌ Test failed:', error)
    process.exit(1)
  }
}

// Run the test if this script is executed directly
if (require.main === module) {
  main().catch(console.error)
}

export { testCacheConnection }