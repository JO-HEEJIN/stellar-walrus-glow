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

    // Try to get categories from database with product counts using read replica
    let categories: any[] = []
    let isUsingMockData = false

    try {
      categories = await withRetry(async () => {
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

      console.log(`✅ Loaded ${categories.length} categories from database`)
    } catch (dbError: any) {
      console.log('⚠️ Database error, using mock categories:', dbError.message || 'Unknown error')
      isUsingMockData = true
      
      // Mock 카테고리 데이터
      categories = [
        {
          id: 'cat-1',
          name: '의류',
          slug: 'clothing',
          parentId: null,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          _count: { products: 5 }
        },
        {
          id: 'cat-2',
          name: '상의',
          slug: 'tops',
          parentId: 'cat-1',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          _count: { products: 3 }
        },
        {
          id: 'cat-3',
          name: '하의',
          slug: 'bottoms',
          parentId: 'cat-1',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          _count: { products: 2 }
        },
        {
          id: 'cat-4',
          name: '신발',
          slug: 'shoes',
          parentId: null,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          _count: { products: 1 }
        },
        {
          id: 'cat-5',
          name: '가방',
          slug: 'bags',
          parentId: null,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          _count: { products: 1 }
        }
      ]
    }

    // Transform data to include additional computed fields
    const categoriesWithStats = categories.map(category => ({
      id: category.id,
      name: category.name,
      slug: category.slug,
      parentId: category.parentId,
      productsCount: category._count?.products || 0,
      createdAt: category.createdAt,
      updatedAt: category.updatedAt,
    }))

    const response: any = {
      data: categoriesWithStats,
      meta: {
        totalCategories: categories.length,
      },
    }

    if (isUsingMockData) {
      response.warning = 'Using mock data - database connection not available'
    }

    return NextResponse.json(response)
  } catch (error) {
    console.error('Error fetching categories:', error)
    return createErrorResponse(error as Error, request.url)
  }
}