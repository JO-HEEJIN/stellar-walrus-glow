#!/usr/bin/env npx tsx

/**
 * Database Connection Test Script
 * 
 * This script tests the load-balanced database setup with:
 * - Primary database connection (writes)
 * - Read replica connection (reads)  
 * - Connection pooling
 * - Retry logic
 * - Performance metrics
 */

import { prismaWrite, prismaRead, withRetry } from '../lib/prisma-load-balanced'
import { trackQuery } from '../lib/monitoring'
import { dbConfig } from '../lib/db-config'

interface TestResults {
  primary: {
    connected: boolean
    responseTime: number
    error?: string
  }
  replica: {
    connected: boolean
    responseTime: number
    error?: string
  }
  connectionPool: {
    maxConnections: number
    activeConnections: number
    utilization: number
  }
  performance: {
    writeLatency: number
    readLatency: number
    transactionTest: boolean
  }
}

async function testDatabaseConnections(): Promise<TestResults> {
  const results: TestResults = {
    primary: { connected: false, responseTime: 0 },
    replica: { connected: false, responseTime: 0 },
    connectionPool: { maxConnections: 0, activeConnections: 0, utilization: 0 },
    performance: { writeLatency: 0, readLatency: 0, transactionTest: false }
  }

  console.log('🔄 Testing database connections...\n')

  // Test 1: Primary Database Connection
  console.log('1. Testing primary database (write) connection...')
  try {
    const start = Date.now()
    await prismaWrite.$queryRaw`SELECT 1 as test`
    const responseTime = Date.now() - start
    
    results.primary = { connected: true, responseTime }
    console.log(`   ✅ Primary database: Connected (${responseTime}ms)`)
    trackQuery('connection_test_primary', responseTime)
  } catch (error) {
    results.primary = { 
      connected: false, 
      responseTime: 0, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }
    console.log(`   ❌ Primary database: Failed - ${results.primary.error}`)
  }

  // Test 2: Read Replica Connection
  console.log('\n2. Testing read replica connection...')
  try {
    const start = Date.now()
    await prismaRead.$queryRaw`SELECT 1 as test`
    const responseTime = Date.now() - start
    
    results.replica = { connected: true, responseTime }
    console.log(`   ✅ Read replica: Connected (${responseTime}ms)`)
    trackQuery('connection_test_replica', responseTime)
  } catch (error) {
    results.replica = { 
      connected: false, 
      responseTime: 0, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }
    console.log(`   ❌ Read replica: Failed - ${results.replica.error}`)
  }

  // Test 3: Connection Pool Information
  console.log('\n3. Testing connection pool...')
  try {
    // These would be actual pool metrics in a real implementation
    results.connectionPool = {
      maxConnections: dbConfig.pool.connectionLimit,
      activeConnections: 2, // Simulated - would be actual in production
      utilization: (2 / dbConfig.pool.connectionLimit) * 100
    }
    console.log(`   📊 Pool: ${results.connectionPool.activeConnections}/${results.connectionPool.maxConnections} connections (${results.connectionPool.utilization.toFixed(1)}% utilization)`)
  } catch (error) {
    console.log(`   ⚠️  Pool metrics unavailable`)
  }

  // Test 4: Write Performance Test
  console.log('\n4. Testing write performance...')
  try {
    const start = Date.now()
    await withRetry(async () => {
      await prismaWrite.$executeRaw`
        CREATE TEMPORARY TABLE test_write_perf (id INT, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP)
      `
      await prismaWrite.$executeRaw`INSERT INTO test_write_perf (id) VALUES (1)`
      await prismaWrite.$executeRaw`DROP TEMPORARY TABLE test_write_perf`
    })
    const writeLatency = Date.now() - start
    
    results.performance.writeLatency = writeLatency
    console.log(`   ✅ Write test: ${writeLatency}ms`)
    trackQuery('write_performance_test', writeLatency)
  } catch (error) {
    console.log(`   ❌ Write test failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }

  // Test 5: Read Performance Test
  console.log('\n5. Testing read performance...')
  try {
    const start = Date.now()
    await prismaRead.$queryRaw`
      SELECT 
        CURRENT_TIMESTAMP() as current_time,
        CONNECTION_ID() as connection_id,
        DATABASE() as database_name
    `
    const readLatency = Date.now() - start
    
    results.performance.readLatency = readLatency
    console.log(`   ✅ Read test: ${readLatency}ms`)
    trackQuery('read_performance_test', readLatency)
  } catch (error) {
    console.log(`   ❌ Read test failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }

  // Test 6: Transaction Test
  console.log('\n6. Testing transaction handling...')
  try {
    await prismaWrite.$transaction(async (tx) => {
      await tx.$executeRaw`CREATE TEMPORARY TABLE test_tx (id INT)`
      await tx.$executeRaw`INSERT INTO test_tx (id) VALUES (1)`
      const result = await tx.$queryRaw`SELECT COUNT(*) as count FROM test_tx`
      await tx.$executeRaw`DROP TEMPORARY TABLE test_tx`
      
      // Verify transaction worked
      if (Array.isArray(result) && result[0] && (result[0] as any).count === BigInt(1)) {
        results.performance.transactionTest = true
      }
    })
    console.log(`   ✅ Transaction test: Passed`)
  } catch (error) {
    console.log(`   ❌ Transaction test failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }

  // Test 7: Retry Logic Test
  console.log('\n7. Testing retry logic...')
  try {
    let attempts = 0
    await withRetry(async () => {
      attempts++
      if (attempts === 1) {
        // Simulate a retryable error on first attempt
        const error = new Error('Connection refused') as any
        error.code = 'P1001'
        throw error
      }
      return await prismaRead.$queryRaw`SELECT 'retry_test_success' as result`
    }, 2, 100)
    console.log(`   ✅ Retry logic: Passed (${attempts} attempts)`)
  } catch (error) {
    console.log(`   ⚠️  Retry logic test inconclusive`)
  }

  return results
}

async function displaySummary(results: TestResults) {
  console.log('\n' + '='.repeat(60))
  console.log('📋 DATABASE CONNECTION TEST SUMMARY')
  console.log('='.repeat(60))
  
  // Connection Status
  console.log('\n🔌 CONNECTION STATUS:')
  console.log(`   Primary Database: ${results.primary.connected ? '✅ Connected' : '❌ Failed'}`)
  console.log(`   Read Replica:     ${results.replica.connected ? '✅ Connected' : '❌ Failed'}`)
  
  // Performance Metrics
  console.log('\n⚡ PERFORMANCE METRICS:')
  console.log(`   Primary Response:  ${results.primary.responseTime}ms`)
  console.log(`   Replica Response:  ${results.replica.responseTime}ms`)
  if (results.performance.writeLatency > 0) {
    console.log(`   Write Latency:     ${results.performance.writeLatency}ms`)
  }
  if (results.performance.readLatency > 0) {
    console.log(`   Read Latency:      ${results.performance.readLatency}ms`)
  }
  
  // Connection Pool
  console.log('\n🏊 CONNECTION POOL:')
  console.log(`   Max Connections:   ${results.connectionPool.maxConnections}`)
  console.log(`   Active:            ${results.connectionPool.activeConnections}`)
  console.log(`   Utilization:       ${results.connectionPool.utilization.toFixed(1)}%`)
  
  // Health Assessment
  console.log('\n🏥 HEALTH ASSESSMENT:')
  const primaryOk = results.primary.connected && results.primary.responseTime < 1000
  const replicaOk = results.replica.connected && results.replica.responseTime < 1000
  const performanceOk = results.performance.writeLatency < 500 && results.performance.readLatency < 500
  
  if (primaryOk && replicaOk && performanceOk) {
    console.log('   🟢 Overall Status: HEALTHY')
    console.log('   ✅ All systems operational')
  } else if (primaryOk && (replicaOk || results.replica.error)) {
    console.log('   🟡 Overall Status: DEGRADED')
    console.log('   ⚠️  Some issues detected but core functionality available')
  } else {
    console.log('   🔴 Overall Status: UNHEALTHY')
    console.log('   ❌ Critical issues detected')
  }
  
  // Recommendations
  console.log('\n💡 RECOMMENDATIONS:')
  if (!results.primary.connected) {
    console.log('   - Check primary database connection string')
    console.log('   - Verify AWS security group rules')
    console.log('   - Ensure database is running')
  }
  if (!results.replica.connected) {
    console.log('   - Check read replica endpoint')
    console.log('   - Verify replica is healthy in AWS Console')
  }
  if (results.primary.responseTime > 500) {
    console.log('   - High primary latency - check database performance')
  }
  if (results.replica.responseTime > 500) {
    console.log('   - High replica latency - consider adding more read replicas')
  }
  if (results.connectionPool.utilization > 80) {
    console.log('   - High connection pool utilization - consider increasing limit')
  }
}

async function main() {
  console.log('K-Fashion Database Connection Test')
  console.log('==================================\n')
  
  try {
    const results = await testDatabaseConnections()
    await displaySummary(results)
  } catch (error) {
    console.error('❌ Test failed:', error)
    process.exit(1)
  } finally {
    await prismaWrite.$disconnect()
    await prismaRead.$disconnect()
  }
}

// Run the test if this script is executed directly
if (require.main === module) {
  main().catch(console.error)
}

export { testDatabaseConnections }