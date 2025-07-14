import { NextRequest } from 'next/server'
import { z } from 'zod'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'

const updateBrandSchema = z.object({
  nameKo: z.string().min(1, 'Korean name is required'),
  nameCn: z.string().optional().nullable(),
  description: z.string().optional().nullable(),
})

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth()
    if (!session?.user) {
      return Response.json(
        { error: { message: 'Unauthorized' } },
        { status: 401 }
      )
    }

    const brandId = params.id

    // Check permissions - only brand admins/owners and master admins can update
    const brand = await prisma.brand.findUnique({
      where: { id: brandId },
    })

    if (!brand) {
      return Response.json(
        { error: { message: 'Brand not found' } },
        { status: 404 }
      )
    }

    const isOwnBrand = session.user.brandId === brandId
    const isMasterAdmin = session.user.role === 'MASTER_ADMIN'

    if (!isOwnBrand && !isMasterAdmin) {
      return Response.json(
        { error: { message: 'Forbidden' } },
        { status: 403 }
      )
    }

    const body = await request.json()
    const validatedData = updateBrandSchema.parse(body)

    const updatedBrand = await prisma.brand.update({
      where: { id: brandId },
      data: {
        nameKo: validatedData.nameKo,
        nameCn: validatedData.nameCn || null,
        description: validatedData.description || null,
      },
    })

    return Response.json(updatedBrand)
  } catch (error) {
    console.error('Brand update error:', error)
    
    if (error instanceof z.ZodError) {
      return Response.json(
        { error: { message: 'Invalid input', details: error.errors } },
        { status: 400 }
      )
    }

    return Response.json(
      { error: { message: 'Failed to update brand' } },
      { status: 500 }
    )
  }
}