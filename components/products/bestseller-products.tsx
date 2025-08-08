'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { TrendingUp, Award, Flame, Crown } from 'lucide-react'

interface BestsellerProduct {
  rank: number
  product: {
    id: string
    nameKo: string
    nameCn?: string
    descriptionKo?: string
    category: string
    basePrice: number
    thumbnailImage?: string
    brand?: {
      id: string
      nameKo: string
      logoUrl?: string
    }
  }
  salesData: {
    totalQuantity: number
    orderCount: number
    revenue: number
  }
}

interface BestsellerProductsProps {
  period?: '7days' | '30days' | '90days' | 'all'
  limit?: number
  showRevenue?: boolean
  compact?: boolean
}

export function BestsellerProducts({ 
  period = '30days', 
  limit = 5, 
  showRevenue = false,
  compact = false 
}: BestsellerProductsProps) {
  const [bestsellers, setBestsellers] = useState<BestsellerProduct[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchBestsellers()
  }, [period, limit])

  const fetchBestsellers = async () => {
    try {
      setLoading(true)
      setError(null)

      const response = await fetch(`/api/products/bestsellers?period=${period}&limit=${limit}`)
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => null)
        const errorMessage = errorData?.error?.message || `베스트셀러 데이터를 불러오는데 실패했습니다 (${response.status})`
        throw new Error(errorMessage)
      }

      const data = await response.json()
      setBestsellers(data.bestsellers || [])
    } catch (err) {
      console.error('Failed to fetch bestsellers:', err)
      setError(err instanceof Error ? err.message : '알 수 없는 오류가 발생했습니다')
    } finally {
      setLoading(false)
    }
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('ko-KR', {
      style: 'currency',
      currency: 'KRW'
    }).format(price)
  }

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Crown className="w-5 h-5 text-yellow-500" />
      case 2:
        return <Award className="w-5 h-5 text-gray-400" />
      case 3:
        return <Award className="w-5 h-5 text-orange-600" />
      default:
        return <Flame className="w-4 h-4 text-red-500" />
    }
  }

  const getRankBadgeColor = (rank: number) => {
    switch (rank) {
      case 1:
        return 'bg-gradient-to-r from-yellow-400 to-yellow-600 text-white'
      case 2:
        return 'bg-gradient-to-r from-gray-300 to-gray-500 text-white'
      case 3:
        return 'bg-gradient-to-r from-orange-400 to-orange-600 text-white'
      default:
        return 'bg-gray-100 text-gray-700'
    }
  }

  if (loading) {
    return (
      <div className="animate-pulse">
        <div className="space-y-3">
          {[...Array(limit)].map((_, i) => (
            <div key={i} className="h-20 bg-gray-200 rounded-lg"></div>
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-red-600">{error}</p>
      </div>
    )
  }

  if (bestsellers.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">아직 판매 데이터가 없습니다</p>
      </div>
    )
  }

  if (compact) {
    // 컴팩트 버전 (대시보드용)
    return (
      <div className="space-y-3">
        {bestsellers.map((item) => (
          <Link
            key={item.product.id}
            href={`/products/${item.product.id}`}
            className="flex items-center space-x-3 p-3 bg-white rounded-lg hover:shadow-md transition-shadow"
          >
            <div className={`flex items-center justify-center w-8 h-8 rounded-full ${getRankBadgeColor(item.rank)}`}>
              <span className="text-sm font-bold">{item.rank}</span>
            </div>
            
            {item.product.thumbnailImage && (
              <div className="w-12 h-12 rounded-lg overflow-hidden bg-gray-50 flex items-center justify-center">
                <img
                  src={item.product.thumbnailImage}
                  alt={item.product.nameKo}
                  className="max-w-full max-h-full object-contain"
                />
              </div>
            )}
            
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">
                {item.product.nameKo}
              </p>
              <p className="text-xs text-gray-500">
                판매 {item.salesData.totalQuantity}개
              </p>
            </div>
            
            <div className="text-right">
              <p className="text-sm font-semibold text-gray-900">
                {formatPrice(item.product.basePrice)}
              </p>
              {showRevenue && (
                <p className="text-xs text-green-600">
                  매출 {formatPrice(item.salesData.revenue)}
                </p>
              )}
            </div>
          </Link>
        ))}
      </div>
    )
  }

  // 전체 버전
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {bestsellers.map((item) => (
        <div key={item.product.id} className="relative bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
          {/* 랭킹 배지 */}
          <div className={`absolute top-2 left-2 z-10 flex items-center space-x-1 px-3 py-1 rounded-full ${getRankBadgeColor(item.rank)}`}>
            {getRankIcon(item.rank)}
            <span className="font-bold text-sm">#{item.rank}</span>
          </div>

          <Link href={`/products/${item.product.id}`}>
            {/* 상품 이미지 */}
            <div className="aspect-square relative bg-gray-100">
              {item.product.thumbnailImage ? (
                <div className="w-full h-full flex items-center justify-center bg-gray-50">
                  <img
                    src={item.product.thumbnailImage}
                    alt={item.product.nameKo}
                    className="max-w-full max-h-full object-contain"
                  />
                </div>
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <div className="text-4xl">📦</div>
                </div>
              )}
              
              {/* 판매 정보 오버레이 */}
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-3">
                <div className="flex items-center justify-between text-white">
                  <div className="flex items-center space-x-2">
                    <TrendingUp className="w-4 h-4" />
                    <span className="text-sm font-medium">
                      {item.salesData.totalQuantity}개 판매
                    </span>
                  </div>
                  <span className="text-xs">
                    주문 {item.salesData.orderCount}건
                  </span>
                </div>
              </div>
            </div>

            {/* 상품 정보 */}
            <div className="p-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-1">
                {item.product.nameKo}
              </h3>
              
              {item.product.brand && (
                <p className="text-sm text-gray-600 mb-2">
                  {item.product.brand.nameKo}
                </p>
              )}
              
              <div className="flex items-center justify-between">
                <span className="text-xl font-bold text-gray-900">
                  {formatPrice(item.product.basePrice)}
                </span>
                
                {showRevenue && (
                  <div className="text-right">
                    <p className="text-xs text-gray-500">총 매출</p>
                    <p className="text-sm font-semibold text-green-600">
                      {formatPrice(item.salesData.revenue)}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </Link>
        </div>
      ))}
    </div>
  )
}