import { notFound } from 'next/navigation'
import { requireAuth } from '@/lib/auth'
import BrandProfile from '@/components/brands/brand-profile'
import BrandProducts from '@/components/brands/brand-products'
import BrandStats from '@/components/brands/brand-stats'
import { prisma } from '@/lib/prisma'

interface BrandPageProps {
  params: { slug: string }
}

async function getBrand(slug: string) {
  const brand = await prisma.brand.findUnique({
    where: { slug },
    include: {
      _count: {
        select: {
          products: true,
          users: true,
        },
      },
    },
  })

  return brand
}

export default async function BrandPage({ params }: BrandPageProps) {
  const user = await requireAuth()
  const brand = await getBrand(params.slug)

  if (!brand) {
    notFound()
  }

  const isOwnBrand = user.brandId === brand.id
  const canEdit = isOwnBrand || user.role === 'MASTER_ADMIN'

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Brand Header */}
      <BrandProfile brand={brand} canEdit={canEdit} />

      {/* Brand Stats - Only for brand owners and master admins */}
      {(isOwnBrand || user.role === 'MASTER_ADMIN') && (
        <div className="mt-8">
          <BrandStats brandId={brand.id} />
        </div>
      )}

      {/* Brand Products */}
      <div className="mt-8">
        <h2 className="text-xl font-semibold text-gray-900 mb-6">브랜드 상품</h2>
        <BrandProducts brandId={brand.id} userRole={user.role} />
      </div>
    </div>
  )
}