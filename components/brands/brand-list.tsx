'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Building2, Package } from 'lucide-react'

interface Brand {
  id: string
  nameKo: string
  nameCn?: string
  slug: string
  description?: string
  logoUrl?: string
  isActive: boolean
  _count?: {
    products: number
  }
}

interface BrandListProps {
  userBrandId?: string
}

export default function BrandList({ userBrandId }: BrandListProps) {
  const [brands, setBrands] = useState<Brand[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchBrands()
  }, [])

  const fetchBrands = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/brands', {
        credentials: 'include',
      })
      
      if (!response.ok) {
        throw new Error('Failed to fetch brands')
      }

      const result = await response.json()
      setBrands(result.data || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="animate-pulse">
            <div className="bg-gray-200 rounded-lg h-64"></div>
          </div>
        ))}
      </div>
    )
  }

  if (error) {
    return (
      <div className="rounded-md bg-red-50 p-4">
        <p className="text-sm text-red-800">브랜드를 불러오는데 실패했습니다: {error}</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {Array.isArray(brands) && brands.map((brand) => (
        <Link
          key={brand.id}
          href={`/brands/${brand.slug}`}
          className="group relative rounded-lg border border-gray-200 bg-white p-6 shadow-sm transition-all hover:shadow-lg hover:border-primary/50"
        >
          {/* Brand Logo/Initial */}
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-lg bg-primary/10 text-primary">
            {brand.logoUrl ? (
              <img src={brand.logoUrl} alt={brand.nameKo} className="h-12 w-12 object-contain" />
            ) : (
              <Building2 className="h-8 w-8" />
            )}
          </div>

          {/* Brand Info */}
          <div className="mb-4">
            <h3 className="text-lg font-semibold text-gray-900 group-hover:text-primary">
              {brand.nameKo}
            </h3>
            {brand.nameCn && (
              <p className="text-sm text-gray-500">{brand.nameCn}</p>
            )}
            {brand.description && (
              <p className="mt-2 text-sm text-gray-600 line-clamp-2">
                {brand.description}
              </p>
            )}
          </div>

          {/* Brand Stats */}
          <div className="flex items-center justify-between text-sm text-gray-500">
            <div className="flex items-center gap-1">
              <Package className="h-4 w-4" />
              <span>{brand._count?.products || 0} 상품</span>
            </div>
            {brand.isActive ? (
              <span className="inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800">
                활성
              </span>
            ) : (
              <span className="inline-flex items-center rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-800">
                비활성
              </span>
            )}
          </div>

          {/* Own Brand Indicator */}
          {userBrandId === brand.id && (
            <div className="absolute -top-2 -right-2 rounded-full bg-primary px-3 py-1 text-xs font-medium text-white shadow-sm">
              내 브랜드
            </div>
          )}
        </Link>
      ))}
    </div>
  )
}