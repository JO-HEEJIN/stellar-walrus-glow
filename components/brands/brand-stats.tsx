'use client'

import { useState, useEffect } from 'react'
import { TrendingUp, ShoppingCart, Package, Users, DollarSign, BarChart3 } from 'lucide-react'
import { formatPrice } from '@/lib/utils'

interface BrandStatsData {
  totalProducts: number
  activeProducts: number
  totalOrders: number
  totalRevenue: number
  totalUsers: number
  recentOrders: Array<{
    id: string
    orderNumber: string
    totalAmount: number
    status: string
    createdAt: string
    buyer: {
      name: string
      email: string
    }
  }>
  topProducts: Array<{
    id: string
    nameKo: string
    orderCount: number
    revenue: number
  }>
}

interface BrandStatsProps {
  brandId: string
}

export default function BrandStats({ brandId }: BrandStatsProps) {
  const [stats, setStats] = useState<BrandStatsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchStats()
  }, [brandId])

  const fetchStats = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/brands/${brandId}/stats`, {
        credentials: 'include',
      })
      
      if (!response.ok) {
        throw new Error('Failed to fetch brand statistics')
      }

      const data = await response.json()
      setStats(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="bg-gray-200 rounded-lg h-32"></div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="rounded-md bg-red-50 p-4">
        <p className="text-sm text-red-800">통계를 불러오는데 실패했습니다: {error}</p>
      </div>
    )
  }

  if (!stats) {
    return null
  }

  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <div className="relative overflow-hidden rounded-lg bg-white px-4 py-5 shadow sm:px-6 sm:py-6">
          <dt>
            <div className="absolute rounded-md bg-primary p-3">
              <Package className="h-6 w-6 text-white" />
            </div>
            <p className="ml-16 truncate text-sm font-medium text-gray-500">전체 상품</p>
          </dt>
          <dd className="ml-16 flex items-baseline">
            <p className="text-2xl font-semibold text-gray-900">{stats.totalProducts}</p>
            <p className="ml-2 flex items-baseline text-sm font-semibold text-green-600">
              <span className="text-gray-500">활성: {stats.activeProducts}</span>
            </p>
          </dd>
        </div>

        <div className="relative overflow-hidden rounded-lg bg-white px-4 py-5 shadow sm:px-6 sm:py-6">
          <dt>
            <div className="absolute rounded-md bg-primary p-3">
              <ShoppingCart className="h-6 w-6 text-white" />
            </div>
            <p className="ml-16 truncate text-sm font-medium text-gray-500">총 주문</p>
          </dt>
          <dd className="ml-16 flex items-baseline">
            <p className="text-2xl font-semibold text-gray-900">{stats.totalOrders}</p>
          </dd>
        </div>

        <div className="relative overflow-hidden rounded-lg bg-white px-4 py-5 shadow sm:px-6 sm:py-6">
          <dt>
            <div className="absolute rounded-md bg-primary p-3">
              <DollarSign className="h-6 w-6 text-white" />
            </div>
            <p className="ml-16 truncate text-sm font-medium text-gray-500">총 매출</p>
          </dt>
          <dd className="ml-16 flex items-baseline">
            <p className="text-2xl font-semibold text-gray-900">{formatPrice(stats.totalRevenue)}</p>
          </dd>
        </div>

        <div className="relative overflow-hidden rounded-lg bg-white px-4 py-5 shadow sm:px-6 sm:py-6">
          <dt>
            <div className="absolute rounded-md bg-primary p-3">
              <Users className="h-6 w-6 text-white" />
            </div>
            <p className="ml-16 truncate text-sm font-medium text-gray-500">브랜드 사용자</p>
          </dt>
          <dd className="ml-16 flex items-baseline">
            <p className="text-2xl font-semibold text-gray-900">{stats.totalUsers}</p>
          </dd>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Recent Orders */}
        <div className="overflow-hidden bg-white shadow sm:rounded-lg">
          <div className="px-4 py-5 sm:px-6">
            <h3 className="text-base font-semibold leading-6 text-gray-900">최근 주문</h3>
          </div>
          <div className="border-t border-gray-200">
            {stats.recentOrders.length === 0 ? (
              <div className="px-4 py-5 text-center text-sm text-gray-500">
                아직 주문이 없습니다.
              </div>
            ) : (
              <ul className="divide-y divide-gray-200">
                {stats.recentOrders.map((order) => (
                  <li key={order.id} className="px-4 py-4 sm:px-6">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900">
                          주문번호: {order.orderNumber}
                        </p>
                        <p className="text-sm text-gray-500">{order.buyer.name}</p>
                      </div>
                      <div className="ml-4 flex-shrink-0">
                        <p className="text-sm font-medium text-gray-900">
                          {formatPrice(order.totalAmount)}
                        </p>
                        <p className="text-xs text-gray-500">
                          {new Date(order.createdAt).toLocaleDateString('ko-KR')}
                        </p>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        {/* Top Products */}
        <div className="overflow-hidden bg-white shadow sm:rounded-lg">
          <div className="px-4 py-5 sm:px-6">
            <h3 className="text-base font-semibold leading-6 text-gray-900">인기 상품</h3>
          </div>
          <div className="border-t border-gray-200">
            {stats.topProducts.length === 0 ? (
              <div className="px-4 py-5 text-center text-sm text-gray-500">
                아직 판매 데이터가 없습니다.
              </div>
            ) : (
              <ul className="divide-y divide-gray-200">
                {stats.topProducts.map((product) => (
                  <li key={product.id} className="px-4 py-4 sm:px-6">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900">{product.nameKo}</p>
                        <p className="text-sm text-gray-500">주문 {product.orderCount}건</p>
                      </div>
                      <div className="ml-4 flex-shrink-0">
                        <p className="text-sm font-medium text-gray-900">
                          {formatPrice(product.revenue)}
                        </p>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}