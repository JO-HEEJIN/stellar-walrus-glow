import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import { createErrorResponse } from '@/lib/errors'

/**
 * @swagger
 * /api/brands:
 *   get:
 *     summary: Get brand list
 *     description: Retrieve all active brands (filtered by user's brand for BRAND_ADMIN)
 *     tags: [Brands]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Brand list retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Brand'
 *       401:
 *         description: Unauthorized
 */
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
        logoUrl: true,
        isActive: true,
        _count: {
          select: {
            products: true,
          },
        },
      },
      orderBy: { nameKo: 'asc' },
    })

    return NextResponse.json({ data: brands })
  } catch (error) {
    return createErrorResponse(error as Error, request.url)
  }
}