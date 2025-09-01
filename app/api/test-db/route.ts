import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

export async function GET() {
  const results: any = {
    timestamp: new Date().toISOString(),
    tests: []
  }

  // Test 1: Environment variable
  results.tests.push({
    test: 'Environment Variable',
    hasDbUrl: !!process.env.DATABASE_URL,
    urlLength: process.env.DATABASE_URL?.length || 0
  })

  // Test 2: Direct Prisma connection
  try {
    const prisma = new PrismaClient({
      log: ['error', 'warn']
    })
    
    const result = await prisma.$queryRaw`SELECT 1 as test`
    results.tests.push({
      test: 'Direct Query',
      success: true,
      result
    })
    
    await prisma.$disconnect()
  } catch (error: any) {
    results.tests.push({
      test: 'Direct Query',
      success: false,
      error: error.message,
      code: error.code
    })
  }

  // Test 3: Try with different connection string format
  try {
    // Try to parse and rebuild the connection string
    const dbUrl = process.env.DATABASE_URL
    if (dbUrl) {
      const urlPattern = /mysql:\/\/([^:]+):([^@]+)@([^:]+):(\d+)\/([^?]+)/
      const match = dbUrl.match(urlPattern)
      
      if (match) {
        results.connectionParts = {
          user: match[1],
          passLength: match[2].length,
          host: match[3],
          port: match[4],
          database: match[5]
        }
      }
    }
  } catch (error: any) {
    results.tests.push({
      test: 'URL Parsing',
      error: error.message
    })
  }

  return NextResponse.json(results)
}