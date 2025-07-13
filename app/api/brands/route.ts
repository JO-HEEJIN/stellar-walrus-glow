import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import { createErrorResponse } from '@/lib/errors'

// GET: List all active brands
export async function GET(request: NextRequest) {
  try {
    // Check authentication
    const session = await auth()
    if (!session) {
      return new Response('Unauthorized', { status: 401 })
    }

    // Fetch brands based on user role
    const where = session.user.role === 'BRAND_ADMIN' && session.user.brandId
      ? { id: session.user.brandId, isActive: true }
      : { isActive: true }

    const brands = await prisma.brand.findMany({
      where,
      select: {
        id: true,
        nameKo: true,
        nameCn: true,
        slug: true,
        description: true,
      },
      orderBy: { nameKo: 'asc' },
    })

    return NextResponse.json({ data: brands })
  } catch (error) {
    return createErrorResponse(error as Error, request.url)
  }
}