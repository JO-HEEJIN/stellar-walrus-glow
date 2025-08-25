import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    // Simple connectivity test
    await prisma.$queryRaw`SELECT 1 as test`
    
    // Check if tables exist
    const tables = await prisma.$queryRaw`
      SELECT TABLE_NAME 
      FROM INFORMATION_SCHEMA.TABLES 
      WHERE TABLE_SCHEMA = DATABASE()
      LIMIT 10
    `
    
    return NextResponse.json({
      status: 'success',
      message: 'Database connection working',
      timestamp: new Date().toISOString(),
      tablesCount: Array.isArray(tables) ? tables.length : 0,
      sampleTables: tables
    })
  } catch (error) {
    return NextResponse.json({
      status: 'error',
      message: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }, { status: 500 })
  }
}