export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server'
import { prismaRead, withRetry } from '@/lib/prisma-load-balanced'

export async function GET(request: NextRequest) {
  try {
    // Get brands from database using read replica with product counts
    const brands = await withRetry(async () => {
      return await prismaRead.brand.findMany({
        include: {
          _count: {
            select: {
              products: true,
            },
          },
        },
        orderBy: { nameKo: 'asc' },
      })
    })

    // Transform data to include additional computed fields
    const brandsWithStats = brands.map(brand => ({
      id: brand.id,
      nameKo: brand.nameKo,
      nameCn: brand.nameCn,
      slug: brand.slug,
      description: brand.description,
      logoUrl: brand.logoUrl,
      website: brand.website,
      contactEmail: brand.contactEmail,
      contactPhone: brand.contactPhone,
      address: brand.address,
      isActive: brand.isActive,
      createdAt: brand.createdAt,
      updatedAt: brand.updatedAt,
      productCount: brand._count.products,
    }))

    return NextResponse.json({
      data: brandsWithStats,
    })
  } catch (error) {
    console.error('Brands API error:', error)
    return NextResponse.json({ error: 'Failed to fetch brands' }, { status: 500 })
  }
}