import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const response: any = {
    timestamp: new Date().toISOString(),
    env: {
      NODE_ENV: process.env.NODE_ENV,
      SKIP_AUTH: process.env.NEXT_PUBLIC_SKIP_AUTH,
      HAS_DB_URL: !!process.env.DATABASE_URL,
    },
    database: {
      connected: false,
      error: null,
      userCount: null
    }
  }

  try {
    // Test database connection
    const userCount = await prisma.user.count()
    response.database.connected = true
    response.database.userCount = userCount
    
    // Try to fetch first user
    const firstUser = await prisma.user.findFirst({
      select: {
        id: true,
        email: true,
        role: true,
        createdAt: true
      }
    })
    
    if (firstUser) {
      response.database.sampleUser = {
        hasUser: true,
        role: firstUser.role,
        created: firstUser.createdAt
      }
    }
  } catch (error: any) {
    response.database.error = {
      message: error.message,
      code: error.code,
      meta: error.meta
    }
  }

  return NextResponse.json(response)
}