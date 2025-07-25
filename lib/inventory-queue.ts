import { Redis } from '@upstash/redis'
import { prismaWrite, withRetry } from './prisma-load-balanced'
import { cache } from './cache'

// Queue configuration
const QUEUE_KEY = 'inventory:queue'
const PROCESSING_KEY = 'inventory:processing'
const LOCK_TTL = 30 // 30 seconds lock TTL

// Initialize Redis client for queue
const redis = process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN
  ? new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL,
      token: process.env.UPSTASH_REDIS_REST_TOKEN,
    })
  : null

// Inventory update operation types
export type InventoryOperation = 'set' | 'increment' | 'decrement'

// Inventory update job
export interface InventoryJob {
  id: string
  productId: string
  operation: InventoryOperation
  value: number
  orderId?: string
  timestamp: number
}

// Add inventory update to queue
export async function queueInventoryUpdate(job: Omit<InventoryJob, 'id' | 'timestamp'>): Promise<string> {
  const jobId = `inv_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  const fullJob: InventoryJob = {
    ...job,
    id: jobId,
    timestamp: Date.now(),
  }
  
  if (!redis) {
    // If Redis is not available, process immediately
    await processInventoryJob(fullJob)
    return jobId
  }
  
  // Add to queue
  await redis.rpush(QUEUE_KEY, JSON.stringify(fullJob))
  
  // Try to process queue immediately
  processQueue().catch(console.error)
  
  return jobId
}

// Process inventory queue
async function processQueue(): Promise<void> {
  if (!redis) return
  
  // Try to acquire lock
  const lockKey = `${PROCESSING_KEY}:lock`
  const lockId = Math.random().toString(36).substr(2, 9)
  
  try {
    // Set lock with TTL
    const acquired = await redis.set(lockKey, lockId, {
      nx: true,
      ex: LOCK_TTL,
    })
    
    if (!acquired) {
      // Another process is handling the queue
      return
    }
    
    // Process jobs while queue is not empty
    while (true) {
      // Get next job
      const jobData = await redis.lpop(QUEUE_KEY)
      if (!jobData) break
      
      const job = JSON.parse(jobData as string) as InventoryJob
      
      try {
        await processInventoryJob(job)
      } catch (error) {
        console.error('Failed to process inventory job:', error)
        // Re-queue failed job (with limit to prevent infinite loops)
        if (!job.retryCount || job.retryCount < 3) {
          await redis.rpush(QUEUE_KEY, JSON.stringify({
            ...job,
            retryCount: (job.retryCount || 0) + 1,
          }))
        }
      }
    }
  } finally {
    // Release lock if we own it
    const currentLock = await redis.get(lockKey)
    if (currentLock === lockId) {
      await redis.del(lockKey)
    }
  }
}

// Process individual inventory job
async function processInventoryJob(job: InventoryJob): Promise<void> {
  await withRetry(async () => {
    await prismaWrite.$transaction(async (tx) => {
      // Get current product with lock
      const product = await tx.product.findUnique({
        where: { id: job.productId },
        select: { 
          id: true, 
          inventory: true, 
          status: true,
          lowStockThreshold: true 
        },
      })
      
      if (!product) {
        throw new Error(`Product ${job.productId} not found`)
      }
      
      let newInventory: number
      
      switch (job.operation) {
        case 'set':
          newInventory = job.value
          break
        case 'increment':
          newInventory = product.inventory + job.value
          break
        case 'decrement':
          newInventory = Math.max(0, product.inventory - job.value)
          break
      }
      
      // Determine new status based on inventory
      let newStatus = product.status
      if (newInventory === 0) {
        newStatus = 'OUT_OF_STOCK'
      } else if (product.status === 'OUT_OF_STOCK' && newInventory > 0) {
        newStatus = 'ACTIVE'
      }
      
      // Update product
      await tx.product.update({
        where: { id: job.productId },
        data: {
          inventory: newInventory,
          status: newStatus,
          updatedAt: new Date(),
        },
      })
      
      // Create audit log
      await tx.auditLog.create({
        data: {
          userId: 'system',
          entityType: 'PRODUCT_INVENTORY',
          entityId: job.productId,
          action: `INVENTORY_${job.operation.toUpperCase()}`,
          oldValues: { inventory: product.inventory },
          newValues: { inventory: newInventory },
          metadata: {
            operation: job.operation,
            value: job.value,
            orderId: job.orderId,
            jobId: job.id,
          },
        },
      })
      
      // Check for low stock alert
      if (product.lowStockThreshold && newInventory <= product.lowStockThreshold) {
        // In production, send notification here
        console.log(`Low stock alert for product ${job.productId}: ${newInventory} remaining`)
      }
    })
    
    // Invalidate cache after successful update
    await cache.invalidateInventory(job.productId)
  })
}

// Background job processor (call this from a cron job or worker)
export async function startInventoryProcessor(): Promise<void> {
  if (!redis) {
    console.log('Redis not configured, inventory queue disabled')
    return
  }
  
  console.log('Starting inventory queue processor')
  
  // Process queue every 5 seconds
  setInterval(async () => {
    try {
      await processQueue()
    } catch (error) {
      console.error('Inventory processor error:', error)
    }
  }, 5000)
}

// Get queue status
export async function getQueueStatus(): Promise<{
  queueLength: number
  isProcessing: boolean
}> {
  if (!redis) {
    return { queueLength: 0, isProcessing: false }
  }
  
  const [queueLength, lockExists] = await Promise.all([
    redis.llen(QUEUE_KEY),
    redis.exists(`${PROCESSING_KEY}:lock`),
  ])
  
  return {
    queueLength: queueLength as number,
    isProcessing: lockExists === 1,
  }
}

// Extend InventoryJob to include retry count
interface InventoryJob {
  id: string
  productId: string
  operation: InventoryOperation
  value: number
  orderId?: string
  timestamp: number
  retryCount?: number
}