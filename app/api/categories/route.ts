export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server'
import { prismaRead, withRetry } from '@/lib/prisma-load-balanced'
import { createErrorResponse } from '@/lib/errors'
import { rateLimiters, getIdentifier } from '@/lib/rate-limit'

/**
 * @swagger
 * /api/categories:
 *   get:
 *     summary: Get category list
 *     description: Retrieve all active categories
 *     tags: [Categories]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Category list retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Category'
 *       401:
 *         description: Unauthorized
 */
export async function GET(request: NextRequest) {
  try {
    // Rate limiting
    const identifier = getIdentifier(request)
    const { success } = await rateLimiters.api.limit(identifier)
    
    if (!success) {
      return new Response('Too Many Requests', {
        status: 429,
        headers: {
          'X-RateLimit-Limit': '10',
          'X-RateLimit-Remaining': '0',
          'X-RateLimit-Reset': new Date().toISOString(),
        },
      })
    }

    // Get categories from database with product counts using read replica
    const categories = await withRetry(async () => {
      return await prismaRead.category.findMany({
        include: {
          products: {
            select: { id: true },
          },
          _count: {
            select: {
              products: true,
            },
          },
        },
        orderBy: { name: 'asc' },
      })
    })

    // Transform data to include additional computed fields
    const categoriesWithStats = categories.map(category => ({
      id: category.id,
      name: category.name,
      slug: category.slug,
      parentId: category.parentId,
      productsCount: category._count.products,
      createdAt: category.createdAt,
      updatedAt: category.updatedAt,
    }))

    return NextResponse.json({
      data: categoriesWithStats,
      meta: {
        totalCategories: categories.length,
      },
    })
  } catch (error) {
    console.error('Error fetching categories:', error)
    return createErrorResponse(error as Error, request.url)
  }
}