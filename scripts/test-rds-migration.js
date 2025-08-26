/**
 * Test script for RDS Data API migration
 * Tests all migrated APIs to ensure they work with RDS Data API
 */

const fetch = require('node-fetch')

const BASE_URL = process.env.VERCEL_URL 
  ? `https://${process.env.VERCEL_URL}` 
  : 'http://localhost:3000'

async function testAPI(endpoint, description) {
  try {
    console.log(`\n🧪 Testing ${description}...`)
    console.log(`   GET ${BASE_URL}${endpoint}`)
    
    const response = await fetch(`${BASE_URL}${endpoint}`)
    const data = await response.text()
    
    console.log(`   Status: ${response.status} ${response.statusText}`)
    
    if (response.ok) {
      try {
        const json = JSON.parse(data)
        console.log(`   ✅ Success! Data source: ${json.meta?.dataSource || 'N/A'}`)
        if (json.data) {
          if (Array.isArray(json.data)) {
            console.log(`   📊 Returned ${json.data.length} items`)
          } else {
            console.log(`   📊 Returned data object`)
          }
        }
      } catch (e) {
        console.log(`   ✅ Success! (Non-JSON response)`)
      }
    } else {
      console.log(`   ❌ Failed: ${data.substring(0, 100)}...`)
    }
    
    return response.ok
  } catch (error) {
    console.log(`   ❌ Error: ${error.message}`)
    return false
  }
}

async function runTests() {
  console.log('🚀 Testing RDS Data API Migration')
  console.log('===================================')
  
  const tests = [
    ['/api/test-rds-data', 'RDS Data API Connection'],
    ['/api/products-v2?limit=5', 'Products API v2'],
    ['/api/analytics-v2?period=30d', 'Analytics API v2'], 
    ['/api/users-v2?limit=5', 'Users API v2'],
  ]
  
  const results = []
  
  for (const [endpoint, description] of tests) {
    const success = await testAPI(endpoint, description)
    results.push({ endpoint, description, success })
  }
  
  console.log('\n📋 Test Summary')
  console.log('================')
  
  let passed = 0
  for (const result of results) {
    const status = result.success ? '✅ PASS' : '❌ FAIL'
    console.log(`${status} ${result.description}`)
    if (result.success) passed++
  }
  
  console.log(`\n🏁 Tests completed: ${passed}/${results.length} passed`)
  
  if (passed === results.length) {
    console.log('🎉 All tests passed! RDS Data API migration successful.')
    process.exit(0)
  } else {
    console.log('⚠️  Some tests failed. Check the output above.')
    process.exit(1)
  }
}

runTests().catch(console.error)