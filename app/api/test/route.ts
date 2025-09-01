import { NextResponse } from 'next/server'

export async function GET() {
  const response: any = {
    ok: true,
    timestamp: new Date().toISOString(),
    env: {
      NODE_ENV: process.env.NODE_ENV || 'not set',
      SKIP_AUTH: process.env.NEXT_PUBLIC_SKIP_AUTH || 'not set',
      HAS_DB: !!process.env.DATABASE_URL,
      HAS_JWT: !!process.env.JWT_SECRET,
    },
    message: 'API is working'
  }

  // Simple database test
  if (process.env.DATABASE_URL) {
    try {
      const { PrismaClient } = await import('@prisma/client')
      const prisma = new PrismaClient()
      
      // Just try to connect
      await prisma.$connect()
      await prisma.$disconnect()
      
      response.database = {
        status: 'connected',
        message: 'Database connection successful'
      }
    } catch (error: any) {
      response.database = {
        status: 'error',
        message: error.message || 'Unknown error',
        code: error.code
      }
    }
  } else {
    response.database = {
      status: 'not configured',
      message: 'DATABASE_URL not set'
    }
  }

  return NextResponse.json(response)
}