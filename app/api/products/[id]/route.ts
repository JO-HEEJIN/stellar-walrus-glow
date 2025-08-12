export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { prismaRead, prismaWrite, withRetry } from '@/lib/prisma-load-balanced'
import { createErrorResponse, BusinessError, ErrorCodes, HttpStatus } from '@/lib/errors'
import { deleteFromS3, extractS3KeyFromUrl } from '@/lib/s3'

/**
 * @swagger
 * /api/products/{id}:
 *   get:
 *     summary: Get product details
 *     description: Retrieve details of a specific product
 *     tags: [Products]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Product ID
 *     responses:
 *       200:
 *         description: Product details retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   $ref: '#/components/schemas/Product'
 *       404:
 *         description: Product not found
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    console.log(`🔍 Getting product: ${params.id}`)
    
    let product: any = null

    try {
      product = await withRetry(async () => {
        return await prismaRead.product.findUnique({
      where: { id: params.id },
      include: {
        brand: true,
        category: true,
        colors: {
          orderBy: { order: 'asc' }
        },
        sizes: {
          orderBy: { order: 'asc' }
        },
        bulkPricing: {
          orderBy: { minQuantity: 'asc' }
        },
        reviews: {
          take: 5,
          orderBy: { createdAt: 'desc' },
          include: {
            user: {
              select: {
                name: true,
                image: true
              }
            }
          }
        },
        _count: {
          select: {
            reviews: true,
            questions: true
          }
        }
      }
        })
      })

      if (!product) {
        throw new BusinessError(
          ErrorCodes.PRODUCT_NOT_FOUND,
          HttpStatus.NOT_FOUND
        )
      }

      console.log(`✅ Found product: ${product.nameKo}`)

    } catch (dbError: any) {
      console.log('⚠️ Database error, using mock data for product:', params.id)
      
      // Mock product data for development
      product = {
        id: params.id,
        sku: 'MOCK-001',
        nameKo: '테스트 상품',
        nameCn: '测试产品',
        descriptionKo: '이것은 테스트 상품입니다.',
        descriptionCn: '这是测试产品。',
        basePrice: 50000,
        inventory: 100,
        status: 'ACTIVE',
        thumbnailImage: '/placeholder.svg',
        images: ['/placeholder.svg'],
        brandId: 'mock-brand-1',
        categoryId: 'mock-category-1',
        brand: {
          id: 'mock-brand-1',
          nameKo: '테스트 브랜드',
          nameCn: '测试品牌',
        },
        category: {
          id: 'mock-category-1',
          name: '상의',
        },
        colors: [],
        sizes: [],
        bulkPricing: [],
        reviews: [],
        _count: {
          reviews: 0,
          questions: 0,
        },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        viewCount: 0,
      }
    }

    // Try to increment view count (skip if database not available)
    try {
      await withRetry(async () => {
        return await prismaWrite.product.update({
          where: { id: params.id },
          data: { viewCount: { increment: 1 } }
        })
      })
    } catch (error) {
      console.log('⚠️ Could not update view count:', error)
    }

    // Check if user has wishlisted this product
    let isWishlisted = false;
    
    // Get session token from cookie for session-based auth
    const authToken = request.cookies.get('auth-token')?.value;
    if (authToken) {
      try {
        const jwt = await import('jsonwebtoken');
        const decoded = jwt.verify(authToken, process.env.JWT_SECRET || 'your-secret-key') as any;
        
        const user = await prisma.user.findFirst({
          where: { email: `${decoded.username}@kfashion.com` }
        });
        
        if (user) {
          const wishlist = await prisma.wishlist.findUnique({
            where: {
              userId_productId: {
                userId: user.id,
                productId: params.id
              }
            }
          });
          isWishlisted = !!wishlist;
        }
      } catch (error) {
        // JWT verification failed, user not authenticated
      }
    }

    // Get related products
    const relatedProducts = await prisma.product.findMany({
      where: {
        AND: [
          { brandId: product.brandId },
          { id: { not: product.id } },
          { status: 'ACTIVE' }
        ]
      },
      take: 5,
      select: {
        id: true,
        nameKo: true,
        basePrice: true,
        discountPrice: true,
        thumbnailImage: true,
        brand: {
          select: {
            nameKo: true
          }
        }
      }
    })

    // Format response
    const formattedProduct = {
      id: product.id,
      sku: product.sku,
      brandId: product.brandId,
      brandName: product.brand.nameKo,
      name: product.nameKo,
      description: product.descriptionKo,
      price: Number(product.basePrice),
      discountPrice: product.discountPrice ? Number(product.discountPrice) : Number(product.basePrice),
      discountRate: product.discountRate,
      rating: Number(product.rating),
      reviewCount: product._count.reviews,
      soldCount: product.soldCount,
      colors: product.colors.map(color => ({
        id: color.id,
        name: color.name,
        code: color.code,
        available: color.available
      })),
      sizes: product.sizes.map(size => ({
        id: size.id,
        name: size.name,
        available: size.available
      })),
      images: product.images ? 
        (Array.isArray(product.images) ? 
          product.images
            .filter((url): url is string => typeof url === 'string')
            .map((url: string, index: number) => ({
              id: String(index + 1),
              url,
              alt: `${product.nameKo} ${index + 1}`,
              order: index + 1
            })) : []
        ) : [{
          id: '1',
          url: product.thumbnailImage || '/placeholder.svg',
          alt: product.nameKo,
          order: 1
        }],
      bulkPricing: product.bulkPricing.map(bp => ({
        minQuantity: bp.minQuantity,
        maxQuantity: bp.maxQuantity,
        pricePerUnit: Number(bp.pricePerUnit),
        discountRate: bp.discountRate
      })),
      minOrderQuantity: product.minOrderQty,
      features: product.features ? (Array.isArray(product.features) ? product.features : []) : [],
      material: product.material,
      careInstructions: product.careInstructions,
      category: product.category ? product.category.name.split('/') : [],
      tags: product.tags ? (Array.isArray(product.tags) ? product.tags : []) : [],
      isNew: product.isNew,
      isBestSeller: product.isBestSeller,
      stock: product.inventory,
      isWishlisted
    }

    const formattedRelatedProducts = relatedProducts.map(p => ({
      id: p.id,
      brandName: p.brand.nameKo,
      name: p.nameKo,
      price: Number(p.basePrice),
      discountPrice: p.discountPrice ? Number(p.discountPrice) : undefined,
      imageUrl: p.thumbnailImage || '/placeholder.svg'
    }))

    return NextResponse.json({ 
      data: {
        product: formattedProduct,
        relatedProducts: formattedRelatedProducts
      }
    })
  } catch (error) {
    return createErrorResponse(error as Error, request.url)
  }
}

/**
 * @swagger
 * /api/products/{id}:
 *   delete:
 *     summary: Delete a product
 *     description: Delete a product (requires BRAND_ADMIN or MASTER_ADMIN role)
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Product ID to delete
 *     responses:
 *       204:
 *         description: Product deleted successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Insufficient permissions or not your brand's product
 *       404:
 *         description: Product not found
 *       409:
 *         description: Product is in use and cannot be deleted
 */
// Update product schema
const updateProductSchema = z.object({
  brandId: z.string().min(1).optional(),
  sku: z.string().min(1).max(50).optional(),
  nameKo: z.string().min(1).max(200).optional(),
  nameCn: z.string().max(200).nullable().optional(),
  descriptionKo: z.string().max(5000).nullable().optional(),
  descriptionCn: z.string().max(5000).nullable().optional(),
  categoryId: z.string().nullable().optional(),
  basePrice: z.number().positive().optional(),
  inventory: z.number().int().min(0).optional(),
  status: z.enum(['ACTIVE', 'INACTIVE', 'OUT_OF_STOCK']).optional(),
  thumbnailImage: z.string().url().nullable().optional(),
  images: z.array(z.string().url()).max(10).nullable().optional(),
  options: z.record(z.array(z.string())).nullable().optional(),
})

// PATCH: Update product
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Check authentication
    const token = request.cookies.get('auth-token')?.value
    if (!token) {
      throw new BusinessError(
        ErrorCodes.AUTHENTICATION_REQUIRED,
        HttpStatus.UNAUTHORIZED
      )
    }

    // Verify token and check role
    const jwt = await import('jsonwebtoken')
    let userInfo
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key') as any
      userInfo = decoded
      
      // Only BRAND_ADMIN and MASTER_ADMIN can update
      if (userInfo.role !== 'BRAND_ADMIN' && userInfo.role !== 'MASTER_ADMIN') {
        throw new BusinessError(
          ErrorCodes.AUTHORIZATION_ROLE_REQUIRED,
          HttpStatus.FORBIDDEN,
          { requiredRole: 'BRAND_ADMIN or MASTER_ADMIN' }
        )
      }
    } catch (error) {
      throw new BusinessError(
        ErrorCodes.AUTHENTICATION_INVALID,
        HttpStatus.UNAUTHORIZED
      )
    }

    // Parse and validate request body
    const body = await request.json()
    const data = updateProductSchema.parse(body)

    // Check if product exists
    const existingProduct = await prisma.product.findUnique({
      where: { id: params.id },
    })

    if (!existingProduct) {
      throw new BusinessError(
        ErrorCodes.PRODUCT_NOT_FOUND,
        HttpStatus.NOT_FOUND
      )
    }

    // For BRAND_ADMIN, verify they own the product
    if (userInfo.role === 'BRAND_ADMIN') {
      // Get user's brand
      const user = await prisma.user.findFirst({
        where: { email: `${userInfo.username}@kfashion.com` },
      })
      
      if (!user?.brandId || user.brandId !== existingProduct.brandId) {
        throw new BusinessError(
          ErrorCodes.AUTH_INSUFFICIENT_PERMISSION,
          HttpStatus.FORBIDDEN
        )
      }
    }

    // Check if SKU is being changed and is unique
    if (data.sku && data.sku !== existingProduct.sku) {
      const skuExists = await prisma.product.findFirst({
        where: {
          sku: data.sku,
          id: { not: params.id },
        },
      })

      if (skuExists) {
        throw new BusinessError(
          ErrorCodes.PRODUCT_SKU_EXISTS,
          HttpStatus.CONFLICT
        )
      }
    }

    // Update product
    const updateData: any = {
      ...data,
      updatedAt: new Date(),
    }
    
    // Remove brandId for BRAND_ADMIN users
    if (userInfo.role === 'BRAND_ADMIN') {
      delete updateData.brandId
    }
    
    const product = await prisma.product.update({
      where: { id: params.id },
      data: updateData,
      include: {
        brand: {
          select: { id: true, nameKo: true, nameCn: true },
        },
        category: {
          select: { id: true, name: true },
        },
      },
    })

    // Create audit log
    await prisma.auditLog.create({
      data: {
        userId: 'system', // Use system user for audit logs
        action: 'PRODUCT_UPDATE',
        entityType: 'Product',
        entityId: product.id,
        metadata: {
          updatedBy: userInfo.username,
          changes: data,
        },
        ip: request.headers.get('x-forwarded-for') || 'unknown',
        userAgent: request.headers.get('user-agent') || 'unknown',
      },
    })

    return NextResponse.json({ data: product })
  } catch (error) {
    return createErrorResponse(error as Error, request.url)
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Check authentication
    const token = request.cookies.get('auth-token')?.value
    if (!token) {
      throw new BusinessError(
        ErrorCodes.AUTHENTICATION_REQUIRED,
        HttpStatus.UNAUTHORIZED
      )
    }

    // Verify token and check role
    const jwt = await import('jsonwebtoken')
    let userInfo
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key') as any
      userInfo = decoded
      
      // Only BRAND_ADMIN and MASTER_ADMIN can delete
      if (userInfo.role !== 'BRAND_ADMIN' && userInfo.role !== 'MASTER_ADMIN') {
        throw new BusinessError(
          ErrorCodes.AUTHORIZATION_ROLE_REQUIRED,
          HttpStatus.FORBIDDEN,
          { requiredRole: 'BRAND_ADMIN or MASTER_ADMIN' }
        )
      }
    } catch (error) {
      throw new BusinessError(
        ErrorCodes.AUTHENTICATION_INVALID,
        HttpStatus.UNAUTHORIZED
      )
    }

    // Check if product exists
    const product = await prisma.product.findUnique({
      where: { id: params.id },
      include: {
        orderItems: {
          take: 1,
        },
      },
    })

    if (!product) {
      throw new BusinessError(
        ErrorCodes.PRODUCT_NOT_FOUND,
        HttpStatus.NOT_FOUND
      )
    }

    // For BRAND_ADMIN, verify they own the product
    if (userInfo.role === 'BRAND_ADMIN') {
      // Get user's brand
      const user = await prisma.user.findFirst({
        where: { email: `${userInfo.username}@kfashion.com` },
      })
      
      if (!user?.brandId || user.brandId !== product.brandId) {
        throw new BusinessError(
          ErrorCodes.AUTH_INSUFFICIENT_PERMISSION,
          HttpStatus.FORBIDDEN,
          { message: '다른 브랜드의 상품은 삭제할 수 없습니다.' }
        )
      }
    }

    // Check if product is in any orders
    if (product.orderItems.length > 0) {
      throw new BusinessError(
        ErrorCodes.PRODUCT_IN_USE,
        HttpStatus.CONFLICT,
        { message: '이 상품은 주문에서 사용 중이므로 삭제할 수 없습니다.' }
      )
    }

    // Delete images from S3 if they exist
    try {
      if (product.thumbnailImage) {
        const key = extractS3KeyFromUrl(product.thumbnailImage)
        if (key) await deleteFromS3(key)
      }
      
      if (product.images && Array.isArray(product.images)) {
        for (const imageUrl of product.images as string[]) {
          const key = extractS3KeyFromUrl(imageUrl)
          if (key) await deleteFromS3(key)
        }
      }
    } catch (s3Error) {
      console.error('Failed to delete images from S3:', s3Error)
      // Continue with product deletion even if S3 deletion fails
    }

    // Delete the product
    await prisma.product.delete({
      where: { id: params.id },
    })

    // Create audit log
    await prisma.auditLog.create({
      data: {
        userId: 'system', // Use system user for audit logs
        action: 'PRODUCT_DELETE',
        entityType: 'Product',
        entityId: params.id,
        metadata: {
          deletedBy: userInfo.username,
          sku: product.sku,
          nameKo: product.nameKo,
        },
        ip: request.headers.get('x-forwarded-for') || 'unknown',
        userAgent: request.headers.get('user-agent') || 'unknown',
      },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    return createErrorResponse(error as Error, request.url)
  }
}