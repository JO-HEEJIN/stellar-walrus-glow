import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { prismaWrite, withRetry } from '@/lib/prisma-load-balanced'
import { rateLimiters, getIdentifier } from '@/lib/rate-limit'
import { createErrorResponse, BusinessError, ErrorCodes, HttpStatus } from '@/lib/errors'
import { Product } from '@/lib/domain/models'
import { ProductStatus } from '@/types'

// Inventory update schema
const inventoryUpdateSchema = z.object({
  quantity: z.number().int(),
  operation: z.enum(['set', 'increment', 'decrement']),
  reason: z.string().max(500).optional(),
})

// PATCH: Update product inventory
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Rate limiting
    const identifier = getIdentifier(request)
    const { success } = await rateLimiters.api.limit(identifier)
    
    if (!success) {
      throw new BusinessError(
        ErrorCodes.SYSTEM_RATE_LIMIT_EXCEEDED,
        HttpStatus.TOO_MANY_REQUESTS
      )
    }

    // Authentication removed for now
    // TODO: Add proper authentication when auth system is set up

    // Parse and validate request body
    const body = await request.json()
    const data = inventoryUpdateSchema.parse(body)

    // Start transaction for inventory update using write instance
    const result = await withRetry(async () => {
      return await prismaWrite.$transaction(async (tx) => {
      // Get product with lock
      const product = await tx.product.findUnique({
        where: { id: params.id },
        include: { brand: true },
      })

      if (!product) {
        throw new BusinessError(
          ErrorCodes.PRODUCT_NOT_FOUND,
          HttpStatus.NOT_FOUND
        )
      }

      // Brand permission check removed for now
      // TODO: Add proper brand permission check when auth system is set up

      // Calculate new inventory
      let newInventory: number
      const previousInventory = product.inventory

      switch (data.operation) {
        case 'set':
          newInventory = data.quantity
          break
        case 'increment':
          newInventory = previousInventory + data.quantity
          break
        case 'decrement':
          if (previousInventory < data.quantity) {
            throw new BusinessError(
              ErrorCodes.PRODUCT_INSUFFICIENT_INVENTORY,
              HttpStatus.CONFLICT,
              { 
                currentInventory: previousInventory,
                requestedDecrease: data.quantity
              }
            )
          }
          newInventory = previousInventory - data.quantity
          break
      }

      // Ensure inventory is not negative
      if (newInventory < 0) {
        throw new BusinessError(
          ErrorCodes.PRODUCT_INVALID_STATUS,
          HttpStatus.BAD_REQUEST,
          { message: 'Inventory cannot be negative' }
        )
      }

      // Create domain model to check status
      const productModel = new Product({
        id: product.id,
        brandId: product.brandId,
        sku: product.sku,
        inventory: newInventory,
        status: product.status as ProductStatus,
        basePrice: Number(product.basePrice),
      })

      // Determine new status
      const newStatus = productModel.shouldUpdateStatus()

      // Update product
      const updatedProduct = await tx.product.update({
        where: { id: params.id },
        data: {
          inventory: newInventory,
          status: newStatus,
        },
        include: {
          brand: true,
          category: true,
        },
      })

      // Create audit log
      await tx.auditLog.create({
        data: {
          userId: 'system', // Use system user for audit logs
          action: 'INVENTORY_UPDATE',
          entityType: 'Product',
          entityId: product.id,
          metadata: {
            sku: product.sku,
            previousInventory,
            newInventory,
            operation: data.operation,
            quantity: data.quantity,
            reason: data.reason,
            statusChanged: product.status !== newStatus,
            previousStatus: product.status,
            newStatus,
          },
          ip: request.headers.get('x-forwarded-for') || 'unknown',
          userAgent: request.headers.get('user-agent') || 'unknown',
        },
      })

        return {
          product: updatedProduct,
          previousInventory,
          newInventory,
        }
      })
    })

    return NextResponse.json({
      data: result,
    })
  } catch (error) {
    return createErrorResponse(error as Error, request.url)
  }
}