import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import { createErrorResponse, BusinessError, ErrorCodes, HttpStatus } from '@/lib/errors'
import { Role } from '@/types'

// GET: Get single product
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

// DELETE: Delete product
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