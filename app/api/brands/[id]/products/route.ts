import { NextRequest } from 'next/server'
import { prismaRead, withRetry } from '@/lib/prisma-load-balanced'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const brandId = params.id
    
    // Get products from database for the specific brand
    const products = await withRetry(async () => {
      return await prismaRead.product.findMany({
        where: {
          brandId: brandId,
          status: 'ACTIVE'
        },
        include: {
          brand: {
            select: {
              nameKo: true,
              nameCn: true
            }
          }
        },
        orderBy: { createdAt: 'desc' }
      })
    })

    // Transform to match frontend expectations
    const transformedProducts = products.map(product => ({
      id: product.id,
      name: product.nameKo,
      nameCn: product.nameCn,
      description: product.descriptionKo,
      descriptionCn: product.descriptionCn,
      price: Number(product.basePrice),
      image: product.thumbnailImage,
      images: Array.isArray(product.images) ? product.images : [product.thumbnailImage].filter(Boolean),
      category: product.categoryId || '기타',
      stock: product.inventory,
      status: product.status,
      brandId: product.brandId,
      sku: product.sku,
      createdAt: product.createdAt,
      updatedAt: product.updatedAt
    }))

    return Response.json(transformedProducts)
  } catch (error) {
    console.error('Brand products fetch error:', error)
    return Response.json(
      { error: { message: 'Failed to fetch brand products' } },
      { status: 500 }
    )
  }
}