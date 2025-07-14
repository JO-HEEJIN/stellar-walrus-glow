import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import { createErrorResponse, BusinessError, ErrorCodes, HttpStatus } from '@/lib/errors'
import { Role } from '@/types'

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
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Check authentication
    const session = await auth()
    if (!session) {
      throw new BusinessError(
        ErrorCodes.AUTH_INVALID_CREDENTIALS,
        HttpStatus.UNAUTHORIZED
      )
    }

    // Check role permissions
    if (!['BRAND_ADMIN', 'MASTER_ADMIN'].includes(session.user.role)) {
      throw new BusinessError(
        ErrorCodes.AUTH_INSUFFICIENT_PERMISSION,
        HttpStatus.FORBIDDEN
      )
    }

    // Get the product first to check ownership
    const product = await prisma.product.findUnique({
      where: { id: params.id },
      select: { brandId: true },
    })

    if (!product) {
      throw new BusinessError(
        ErrorCodes.PRODUCT_NOT_FOUND,
        HttpStatus.NOT_FOUND
      )
    }

    // For BRAND_ADMIN, ensure they can only delete their own brand's products
    if (session.user.role === Role.BRAND_ADMIN && session.user.brandId !== product.brandId) {
      throw new BusinessError(
        ErrorCodes.PRODUCT_BRAND_MISMATCH,
        HttpStatus.FORBIDDEN
      )
    }

    // Check if product is used in any orders
    const orderCount = await prisma.orderItem.count({
      where: { productId: params.id },
    })

    if (orderCount > 0) {
      throw new BusinessError(
        ErrorCodes.PRODUCT_IN_USE,
        HttpStatus.CONFLICT,
        { orderCount }
      )
    }

    // Delete the product
    await prisma.product.delete({
      where: { id: params.id },
    })

    // Create audit log
    await prisma.auditLog.create({
      data: {
        userId: session.user.id,
        action: 'PRODUCT_DELETE',
        entityType: 'Product',
        entityId: params.id,
        metadata: { brandId: product.brandId },
        ip: request.headers.get('x-forwarded-for') || 'unknown',
        userAgent: request.headers.get('user-agent') || 'unknown',
      },
    })

    return new Response(null, { status: 204 })
  } catch (error) {
    return createErrorResponse(error as Error, request.url)
  }
}