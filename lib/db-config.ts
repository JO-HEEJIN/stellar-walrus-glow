/**
 * Database configuration for AWS Aurora with load balancing
 * 
 * Environment variables needed:
 * - DATABASE_URL: Main database connection string
 * - DATABASE_URL_PRIMARY: Primary write instance (optional, falls back to DATABASE_URL)
 * - DATABASE_URL_REPLICA: Read replica instance (optional, falls back to DATABASE_URL)
 * - DATABASE_CONNECTION_LIMIT: Max connections per pool (default: 10)
 * - DATABASE_POOL_TIMEOUT: Connection pool timeout in seconds (default: 10)
 * - DATABASE_QUERY_TIMEOUT: Query timeout in milliseconds (default: 10000)
 */

export const dbConfig = {
  // Connection pool settings
  pool: {
    // Maximum number of connections in the pool
    connectionLimit: parseInt(process.env.DATABASE_CONNECTION_LIMIT || '10'),
    
    // Pool timeout in seconds
    poolTimeout: parseInt(process.env.DATABASE_POOL_TIMEOUT || '10'),
    
    // Idle timeout in seconds
    idleTimeout: parseInt(process.env.DATABASE_IDLE_TIMEOUT || '60'),
    
    // Query timeout in milliseconds
    queryTimeout: parseInt(process.env.DATABASE_QUERY_TIMEOUT || '10000'),
  },
  
  // Retry configuration
  retry: {
    maxRetries: parseInt(process.env.DATABASE_MAX_RETRIES || '3'),
    initialDelayMs: parseInt(process.env.DATABASE_RETRY_DELAY || '1000'),
    maxDelayMs: parseInt(process.env.DATABASE_MAX_RETRY_DELAY || '10000'),
  },
  
  // Aurora-specific settings
  aurora: {
    // Enable Aurora Data API (serverless)
    useDataApi: process.env.AURORA_DATA_API === 'true',
    
    // Read preference for replica selection
    readPreference: process.env.AURORA_READ_PREFERENCE || 'random', // random, nearest, primary
    
    // Failover timeout in milliseconds
    failoverTimeout: parseInt(process.env.AURORA_FAILOVER_TIMEOUT || '30000'),
  },
  
  // Load balancing settings
  loadBalancing: {
    // Enable read/write splitting
    enabled: process.env.DATABASE_READ_WRITE_SPLIT !== 'false',
    
    // Percentage of read queries to send to replicas (0-100)
    readReplicaRatio: parseInt(process.env.READ_REPLICA_RATIO || '80'),
    
    // Sticky sessions for read-after-write consistency
    stickySessionDuration: parseInt(process.env.STICKY_SESSION_DURATION || '5000'),
  },
  
  // Monitoring and metrics
  monitoring: {
    // Enable query logging
    logQueries: process.env.DATABASE_LOG_QUERIES === 'true',
    
    // Slow query threshold in milliseconds
    slowQueryThreshold: parseInt(process.env.SLOW_QUERY_THRESHOLD || '1000'),
    
    // Enable connection pool metrics
    enableMetrics: process.env.DATABASE_ENABLE_METRICS !== 'false',
  },
}

// Helper to build connection string with pool parameters
export function buildConnectionString(baseUrl: string): string {
  const url = new URL(baseUrl)
  
  // Add connection pool parameters
  url.searchParams.set('connection_limit', dbConfig.pool.connectionLimit.toString())
  url.searchParams.set('pool_timeout', dbConfig.pool.poolTimeout.toString())
  
  // Add SSL for production
  if (process.env.NODE_ENV === 'production') {
    url.searchParams.set('sslmode', 'require')
  }
  
  return url.toString()
}

// Helper to select read replica based on load balancing strategy
export function selectReadReplica(replicas: string[]): string {
  if (replicas.length === 0) {
    return process.env.DATABASE_URL || ''
  }
  
  switch (dbConfig.aurora.readPreference) {
    case 'random':
      return replicas[Math.floor(Math.random() * replicas.length)]
    case 'nearest':
      // In real implementation, this would consider latency
      return replicas[0]
    case 'primary':
      return process.env.DATABASE_URL_PRIMARY || process.env.DATABASE_URL || ''
    default:
      return replicas[0]
  }
}