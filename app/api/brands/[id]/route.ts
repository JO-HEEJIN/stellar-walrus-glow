import { NextRequest } from 'next/server'
import { z } from 'zod'
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
    // Authentication removed for now
    // TODO: Add proper authentication when auth system is set up

    const brandId = params.id

    // Permission checks removed for now
    // TODO: Add proper permission checks when auth system is set up
    const brand = await prisma.brand.findUnique({
      where: { id: brandId },
    })

    if (!brand) {
      return Response.json(
        { error: { message: 'Brand not found' } },
        { status: 404 }
      )
    }

    // Brand ownership and role checks removed for now
    // TODO: Add proper brand ownership validation when auth system is set up

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