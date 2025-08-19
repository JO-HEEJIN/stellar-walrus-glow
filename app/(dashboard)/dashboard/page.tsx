'use client'

import { useState, useEffect } from 'react'
import { BannerAd, SidebarAd } from '@/components/ads/ad-layouts'
import { StatsCard } from '@/components/dashboard/stats-card'
import { RevenueChart } from '@/components/dashboard/revenue-chart'
import { OrderStatusChart } from '@/components/dashboard/order-status-chart'
import { TopProductsTable } from '@/components/dashboard/top-products-table'
import { BestsellerProducts } from '@/components/products/bestseller-products'

export default function DashboardPage() {
  const [loading, setLoading] = useState(true)
  const [analyticsData, setAnalyticsData] = useState<any>(null)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchAnalytics()
  }, [])

  const fetchAnalytics = async () => {
    try {
      const response = await fetch('/api/analytics/overview', {
        credentials: 'include'
      })
      
      if (!response.ok) {
        throw new Error('Failed to fetch analytics')
      }
      
      const data = await response.json()
      setAnalyticsData(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load analytics')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">로딩 중...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-red-600">{error}</div>
      </div>
    )
  }

  const { overview, ordersByStatus, dailyRevenue, topProducts } = analyticsData || {}

  return (
    <div className="mx-auto max-w-7xl py-6 sm:px-6 lg:px-8">
      <div className="px-4 py-6 sm:px-0">
        {/* Dashboard Banner Ad */}
        <BannerAd 
          adSlot={process.env.NEXT_PUBLIC_GOOGLE_ADSENSE_BANNER_SLOT || 'XXXXXXXXXX'} 
          className="mb-8"
        />

        <h1 className="text-3xl font-bold tracking-tight text-gray-900 mb-8">대시보드</h1>
        
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatsCard
            title="오늘 매출"
            value={`₩${overview?.todayRevenue?.toLocaleString() || 0}`}
            change={overview?.revenueChange ? {
              value: parseFloat(overview.revenueChange),
              isPositive: parseFloat(overview.revenueChange) > 0
            } : undefined}
            icon={
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            }
          />
          
          <StatsCard
            title="오늘 주문"
            value={overview?.todayOrders || 0}
            change={overview?.orderChange ? {
              value: parseFloat(overview.orderChange),
              isPositive: parseFloat(overview.orderChange) > 0
            } : undefined}
            icon={
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
            }
          />
          
          <StatsCard
            title="전체 상품"
            value={overview?.totalProducts || 0}
            subtitle={`재고 부족: ${overview?.lowStockProducts || 0}개`}
            icon={
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
            }
          />
          
          {overview?.totalUsers !== undefined && overview.totalUsers > 0 && (
            <StatsCard
              title="전체 사용자"
              value={overview.totalUsers}
              subtitle={`오늘 신규: ${overview.newUsersToday || 0}명`}
              icon={
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              }
            />
          )}
        </div>

        <div className="flex gap-8">
          {/* Main Content */}
          <div className="flex-1 space-y-8">
            {/* Revenue Chart */}
            {dailyRevenue && dailyRevenue.length > 0 && (
              <RevenueChart data={dailyRevenue} title="최근 7일 매출 추이" />
            )}

            {/* Bestseller Products Section */}
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">베스트셀러 상품 🔥</h3>
                <a href="/products/bestsellers" className="text-sm text-blue-600 hover:text-blue-800">
                  전체보기 →
                </a>
              </div>
              <BestsellerProducts period="30days" limit={5} compact />
            </div>

            {/* Order Status and Top Products */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {ordersByStatus && ordersByStatus.length > 0 && (
                <OrderStatusChart data={ordersByStatus} />
              )}
              
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">빠른 메뉴</h3>
                <div className="space-y-3">
                  <a href="/products" className="flex items-center p-3 rounded-lg hover:bg-gray-50 transition-colors">
                    <div className="flex-shrink-0 w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                      <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <p className="text-sm font-medium text-gray-900">상품 관리</p>
                      <p className="text-xs text-gray-500">새 상품 등록 및 재고 관리</p>
                    </div>
                  </a>
                  
                  <a href="/orders" className="flex items-center p-3 rounded-lg hover:bg-gray-50 transition-colors">
                    <div className="flex-shrink-0 w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                      <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <p className="text-sm font-medium text-gray-900">주문 관리</p>
                      <p className="text-xs text-gray-500">주문 확인 및 배송 처리</p>
                    </div>
                  </a>
                  
                  <a href="/analytics" className="flex items-center p-3 rounded-lg hover:bg-gray-50 transition-colors">
                    <div className="flex-shrink-0 w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                      <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <p className="text-sm font-medium text-gray-900">상세 분석</p>
                      <p className="text-xs text-gray-500">매출 및 고객 분석 리포트</p>
                    </div>
                  </a>
                </div>
              </div>
            </div>

            {/* Top Products Table */}
            {topProducts && topProducts.length > 0 && (
              <TopProductsTable products={topProducts} />
            )}
          </div>

          {/* Sidebar with Ad */}
          <div className="w-80 hidden lg:block">
            <SidebarAd 
              adSlot={process.env.NEXT_PUBLIC_GOOGLE_ADSENSE_SIDEBAR_SLOT || 'XXXXXXXXXX'} 
            />
          </div>
        </div>
      </div>
    </div>
  )
}