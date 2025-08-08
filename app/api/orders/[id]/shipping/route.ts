import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { prismaWrite, withRetry } from '@/lib/prisma-load-balanced'
import { createErrorResponse, BusinessError, ErrorCodes, HttpStatus } from '@/lib/errors'

// Shipping address update schema
const shippingUpdateSchema = z.object({
  name: z.string().min(1).max(100),
  phone: z.string().min(1).max(20),
  zipCode: z.string().max(10).optional(),
  address: z.string().min(1).max(200),
  addressDetail: z.string().max(200).optional(),
})

// PATCH: Update order shipping address
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

    // Verify token and get user info
    const jwt = await import('jsonwebtoken')
    let userInfo
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key') as any
      userInfo = decoded
    } catch (error) {
      throw new BusinessError(
        ErrorCodes.AUTHENTICATION_INVALID,
        HttpStatus.UNAUTHORIZED
      )
    }

    // Parse and validate request body
    const body = await request.json()
    const data = shippingUpdateSchema.parse(body)

    // Update shipping address in transaction
    const result = await withRetry(async () => {
      return await prismaWrite.$transaction(async (tx) => {
        // Get order
        const order = await tx.order.findUnique({
          where: { id: params.id },
          include: {
            user: true,
          }
        })

        if (!order) {
          throw new BusinessError(
            ErrorCodes.ORDER_NOT_FOUND,
            HttpStatus.NOT_FOUND
          )
        }

        // Check permissions - order owner or admin can update
        const userEmail = userInfo.username === 'momo' ? 'master@kfashion.com' : 
                          userInfo.username === 'kf001' ? 'kf001@kfashion.com' :
                          userInfo.username === 'kf002' ? 'brand@kfashion.com' :
                          `${userInfo.username}@kfashion.com`

        const isOrderOwner = order.user.email === userEmail
        const isAdmin = userInfo.role === 'MASTER_ADMIN'
        
        if (!isOrderOwner && !isAdmin) {
          throw new BusinessError(
            ErrorCodes.AUTHORIZATION_INSUFFICIENT_PERMISSIONS,
            HttpStatus.FORBIDDEN,
            { message: 'Can only update your own order shipping address' }
          )
        }

        // Only allow updating shipping address for PENDING orders
        if (order.status !== 'PENDING') {
          throw new BusinessError(
            ErrorCodes.ORDER_INVALID_STATUS,
            HttpStatus.UNPROCESSABLE_ENTITY,
            { message: 'Cannot update shipping address for orders that are not pending' }
          )
        }

        // Update shipping address
        const updatedOrder = await tx.order.update({
          where: { id: params.id },
          data: {
            shippingAddress: {
              name: data.name,
              phone: data.phone,
              zipCode: data.zipCode || '',
              address: data.address,
              addressDetail: data.addressDetail || '',
            }
          },
          include: {
            user: true,
            items: {
              include: {
                product: {
                  include: { brand: true }
                }
              }
            }
          }
        })

        // Create audit log
        await tx.auditLog.create({
          data: {
            userId: 'system',
            action: 'ORDER_SHIPPING_UPDATE',
            entityType: 'Order',
            entityId: order.id,
            metadata: {
              orderNumber: order.orderNumber,
              previousAddress: order.shippingAddress,
              newAddress: data,
              updatedBy: userInfo.username,
              userRole: userInfo.role
            },
            ip: request.headers.get('x-forwarded-for') || 'unknown',
            userAgent: request.headers.get('user-agent') || 'unknown',
          },
        })

        return updatedOrder
      }, {
        timeout: 30000,
      })
    })

    return NextResponse.json({
      data: result
    })
  } catch (error) {
    return createErrorResponse(error as Error, request.url)
  }
}