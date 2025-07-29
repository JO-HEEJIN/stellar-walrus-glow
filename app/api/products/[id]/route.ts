import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
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
    const product = await prisma.product.findUnique({
      where: { id: params.id },
      include: {
        brand: true,
        category: true,
      },
    })

    if (!product) {
      throw new BusinessError(
        ErrorCodes.PRODUCT_NOT_FOUND,
        HttpStatus.NOT_FOUND
      )
    }

    return NextResponse.json({ data: product })
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

    // Create audit log - disabled temporarily due to foreign key constraints
    // TODO: Fix audit log when user management is properly set up
    console.log('Audit log would be created:', {
      userId: userInfo.username || 'unknown',
      action: 'PRODUCT_UPDATE',
      entityType: 'Product',
      entityId: product.id,
      metadata: {
        updatedBy: userInfo.username,
        changes: data,
      },
      ip: request.headers.get('x-forwarded-for') || 'unknown',
      userAgent: request.headers.get('user-agent') || 'unknown',
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

    // Create audit log - disabled temporarily due to foreign key constraints
    // TODO: Fix audit log when user management is properly set up
    console.log('Audit log would be created:', {
      userId: userInfo.username || 'unknown',
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
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    return createErrorResponse(error as Error, request.url)
  }
}