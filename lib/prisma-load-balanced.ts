import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prismaWrite: PrismaClient | undefined
  prismaRead: PrismaClient | undefined
}

// Configuration for connection pooling (reserved for future use)
// const poolConfig = {
//   connection_limit: parseInt(process.env.DATABASE_CONNECTION_LIMIT || '10'),
//   pool_timeout: parseInt(process.env.DATABASE_POOL_TIMEOUT || '10'),
// }

// Write instance - connects to primary Aurora instance
export const prismaWrite = globalForPrisma.prismaWrite ?? new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL_PRIMARY || process.env.DATABASE_URL,
    },
  },
  log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
})

// Read instance - connects to read replicas
export const prismaRead = globalForPrisma.prismaRead ?? new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL_REPLICA || process.env.DATABASE_URL,
    },
  },
  log: process.env.NODE_ENV === 'development' ? ['error'] : ['error'],
})

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prismaWrite = prismaWrite
  globalForPrisma.prismaRead = prismaRead
}

// Connection retry logic
export async function withRetry<T>(
  operation: () => Promise<T>,
  maxRetries: number = 3,
  delayMs: number = 1000
): Promise<T> {
  let lastError: Error | undefined
  
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await operation()
    } catch (error) {
      lastError = error as Error
      
      // Check if error is retryable
      if (isRetryableError(error)) {
        if (i < maxRetries - 1) {
          await new Promise(resolve => setTimeout(resolve, delayMs * Math.pow(2, i)))
          continue
        }
      }
      
      throw error
    }
  }
  
  throw lastError
}

function isRetryableError(error: unknown): boolean {
  if (!error || typeof error !== 'object') return false
  
  const err = error as { code?: string; message?: string }
  
  // Retry on connection errors
  if (err.code === 'P1001' || // Can't reach database server
      err.code === 'P1002' || // Database server timeout
      err.code === 'P1008' || // Operations timed out
      err.code === 'P1017') { // Server has closed the connection
    return true
  }
  
  // Retry on specific message patterns
  if (err.message && (
    err.message.includes('Connection refused') ||
    err.message.includes('ETIMEDOUT') ||
    err.message.includes('ECONNRESET')
  )) {
    return true
  }
  
  return false
}

// Helper to determine if operation should use read replica
export function useReadReplica(operation: string): boolean {
  const readOperations = ['findFirst', 'findUnique', 'findMany', 'count', 'aggregate', 'groupBy']
  return readOperations.includes(operation)
}

// Export helper function from original prisma.ts
export { handlePrismaError } from './prisma'