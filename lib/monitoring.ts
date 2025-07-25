import { dbConfig } from './db-config'

// Performance metrics store
interface PerformanceMetrics {
  queryCount: number
  slowQueries: number
  errorCount: number
  avgResponseTime: number
  connectionPoolSize: number
  activeConnections: number
  cacheHits: number
  cacheMisses: number
}

// In-memory metrics (in production, use CloudWatch or similar)
const metrics: PerformanceMetrics = {
  queryCount: 0,
  slowQueries: 0,
  errorCount: 0,
  avgResponseTime: 0,
  connectionPoolSize: 0,
  activeConnections: 0,
  cacheHits: 0,
  cacheMisses: 0,
}

// Response time tracking
const responseTimes: number[] = []
const MAX_RESPONSE_TIME_SAMPLES = 1000

// Track query execution
export function trackQuery(queryType: string, duration: number, error?: Error) {
  if (!dbConfig.monitoring.enableMetrics) return
  
  metrics.queryCount++
  
  // Track response time
  responseTimes.push(duration)
  if (responseTimes.length > MAX_RESPONSE_TIME_SAMPLES) {
    responseTimes.shift()
  }
  metrics.avgResponseTime = responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length
  
  // Track slow queries
  if (duration > dbConfig.monitoring.slowQueryThreshold) {
    metrics.slowQueries++
    if (dbConfig.monitoring.logQueries) {
      console.warn(`Slow query detected: ${queryType} took ${duration}ms`)
    }
  }
  
  // Track errors
  if (error) {
    metrics.errorCount++
    console.error(`Query error in ${queryType}:`, error)
  }
  
  // Log query if enabled
  if (dbConfig.monitoring.logQueries) {
    console.log(`Query: ${queryType} - Duration: ${duration}ms`)
  }
}

// Track cache performance
export function trackCache(hit: boolean) {
  if (!dbConfig.monitoring.enableMetrics) return
  
  if (hit) {
    metrics.cacheHits++
  } else {
    metrics.cacheMisses++
  }
}

// Track connection pool
export function trackConnectionPool(poolSize: number, activeConnections: number) {
  if (!dbConfig.monitoring.enableMetrics) return
  
  metrics.connectionPoolSize = poolSize
  metrics.activeConnections = activeConnections
}

// Get current metrics
export function getMetrics(): PerformanceMetrics {
  return {
    ...metrics,
    cacheHitRate: metrics.cacheHits / (metrics.cacheHits + metrics.cacheMisses) || 0,
  } as PerformanceMetrics & { cacheHitRate: number }
}

// Reset metrics (useful for testing)
export function resetMetrics() {
  metrics.queryCount = 0
  metrics.slowQueries = 0
  metrics.errorCount = 0
  metrics.avgResponseTime = 0
  metrics.cacheHits = 0
  metrics.cacheMisses = 0
  responseTimes.length = 0
}

// Create CloudWatch metric data (for production use)
export function createCloudWatchMetrics() {
  const timestamp = new Date()
  
  return [
    {
      MetricName: 'DatabaseQueryCount',
      Value: metrics.queryCount,
      Unit: 'Count',
      Timestamp: timestamp,
    },
    {
      MetricName: 'DatabaseSlowQueries',
      Value: metrics.slowQueries,
      Unit: 'Count',
      Timestamp: timestamp,
    },
    {
      MetricName: 'DatabaseErrorCount',
      Value: metrics.errorCount,
      Unit: 'Count',
      Timestamp: timestamp,
    },
    {
      MetricName: 'DatabaseAvgResponseTime',
      Value: metrics.avgResponseTime,
      Unit: 'Milliseconds',
      Timestamp: timestamp,
    },
    {
      MetricName: 'CacheHitRate',
      Value: metrics.cacheHits / (metrics.cacheHits + metrics.cacheMisses) || 0,
      Unit: 'Percent',
      Timestamp: timestamp,
    },
    {
      MetricName: 'ConnectionPoolUtilization',
      Value: (metrics.activeConnections / metrics.connectionPoolSize) * 100 || 0,
      Unit: 'Percent',
      Timestamp: timestamp,
    },
  ]
}

// Health check function
export function checkDatabaseHealth(): {
  healthy: boolean
  issues: string[]
} {
  const issues: string[] = []
  
  // Check error rate
  const errorRate = metrics.errorCount / metrics.queryCount
  if (errorRate > 0.05) { // 5% error rate threshold
    issues.push(`High error rate: ${(errorRate * 100).toFixed(2)}%`)
  }
  
  // Check slow query rate
  const slowQueryRate = metrics.slowQueries / metrics.queryCount
  if (slowQueryRate > 0.1) { // 10% slow query threshold
    issues.push(`High slow query rate: ${(slowQueryRate * 100).toFixed(2)}%`)
  }
  
  // Check average response time
  if (metrics.avgResponseTime > 500) { // 500ms threshold
    issues.push(`High average response time: ${metrics.avgResponseTime.toFixed(0)}ms`)
  }
  
  // Check connection pool utilization
  const poolUtilization = metrics.activeConnections / metrics.connectionPoolSize
  if (poolUtilization > 0.8) { // 80% utilization threshold
    issues.push(`High connection pool utilization: ${(poolUtilization * 100).toFixed(0)}%`)
  }
  
  // Check cache hit rate
  const cacheHitRate = metrics.cacheHits / (metrics.cacheHits + metrics.cacheMisses)
  if (cacheHitRate < 0.7 && metrics.cacheHits + metrics.cacheMisses > 100) { // 70% hit rate threshold
    issues.push(`Low cache hit rate: ${(cacheHitRate * 100).toFixed(0)}%`)
  }
  
  return {
    healthy: issues.length === 0,
    issues,
  }
}