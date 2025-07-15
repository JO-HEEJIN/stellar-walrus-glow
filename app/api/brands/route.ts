import { NextRequest, NextResponse } from 'next/server'
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
    // Authentication removed for now
    // TODO: Add proper authentication when auth system is set up

    // Fetch all active brands for now
    const where = { isActive: true }

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