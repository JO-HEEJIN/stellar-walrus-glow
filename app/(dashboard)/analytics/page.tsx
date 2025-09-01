'use client'

import { useState, useEffect } from 'react'
import { 
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer 
} from 'recharts'
import { 
  TrendingUp, TrendingDown, Package, Users, ShoppingCart, AlertTriangle,
  DollarSign
} from 'lucide-react'
import { formatPrice } from '@/lib/utils'

interface OverviewData {
  overview: {
    todayRevenue: number
    todayOrders: number
    yesterdayRevenue: number
    yesterdayOrders: number
    revenueChange: string
    orderChange: string
    totalUsers: number
    newUsersToday: number
    totalProducts: number
    lowStockProducts: number
  }
  ordersByStatus: Array<{
    status: string
    count: number
  }>
  dailyRevenue: Array<{
    date: string
    orders: number
    revenue: number
  }>
  topProducts: Array<{
    productId: string
    productName: string
    productSku: string
    brandName: string
    quantity: number
    revenue: number
    orderCount: number
  }>
}

interface RevenueData {
  categoryBreakdown: Array<{
    categoryId: string
    categoryName: string
    totalRevenue: number
    orderCount: number
  }>
  brandComparison: Array<{
    brandId: string
    brandName: string
    totalRevenue: number
    orderCount: number
  }>
}

const statusColors = {
  PENDING: '#fbbf24',
  PAID: '#60a5fa',
  PREPARING: '#818cf8',
  SHIPPED: '#a78bfa',
  DELIVERED: '#34d399',
  CANCELLED: '#f87171',
}

const statusLabels = {
  PENDING: '결제 대기',
  PAID: '결제 완료',
  PREPARING: '상품 준비중',
  SHIPPED: '배송중',
  DELIVERED: '배송 완료',
  CANCELLED: '취소됨',
}

export default function AnalyticsPage() {
  const [loading, setLoading] = useState(true)
  const [overviewData, setOverviewData] = useState<OverviewData | null>(null)
  const [revenueData, setRevenueData] = useState<RevenueData | null>(null)
  const [period] = useState<'daily' | 'weekly' | 'monthly'>('daily')
  const [userRole, setUserRole] = useState<string>('')

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        // Check authentication
        const authResponse = await fetch('/api/auth/me')
        if (authResponse.ok) {
          const authData = await authResponse.json()
          setUserRole(authData.user.role)
          
          if (authData.user.role === 'BUYER') {
            // Redirect buyers away from analytics
            window.location.href = '/dashboard'
            return
          }
        }

        // Fetch overview data
        const overviewResponse = await fetch('/api/analytics/overview', {
          credentials: 'include',
        })
        if (overviewResponse.ok) {
          const data = await overviewResponse.json()
          setOverviewData(data)
        }

        // Fetch revenue data
        const revenueResponse = await fetch(`/api/analytics/revenue?period=${period}`, {
          credentials: 'include',
        })
        if (revenueResponse.ok) {
          const data = await revenueResponse.json()
          setRevenueData(data)
        }
      } catch (error) {
        console.error('Failed to fetch analytics:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchAnalytics()
  }, [period])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!overviewData) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">분석 데이터를 불러올 수 없습니다.</p>
      </div>
    )
  }

  const { 
    overview = {
      todayRevenue: 0,
      todayOrders: 0,
      yesterdayRevenue: 0,
      yesterdayOrders: 0,
      revenueChange: '0',
      orderChange: '0',
      totalUsers: 0,
      newUsersToday: 0,
      totalProducts: 0,
      lowStockProducts: 0
    }, 
    ordersByStatus = [], 
    dailyRevenue = [], 
    topProducts = [] 
  } = overviewData || {}

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-gray-900">분석 대시보드</h1>
        <p className="mt-2 text-sm text-gray-700">
          매출 및 주문 통계를 한눈에 확인하세요
        </p>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <DollarSign className="h-6 w-6 text-gray-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    오늘 매출
                  </dt>
                  <dd className="flex items-baseline">
                    <div className="text-2xl font-semibold text-gray-900">
                      {formatPrice(overview.todayRevenue)}
                    </div>
                    <div className={`ml-2 flex items-baseline text-sm font-semibold ${
                      parseFloat(overview.revenueChange) >= 0 ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {parseFloat(overview.revenueChange) >= 0 ? (
                        <TrendingUp className="h-4 w-4 mr-1" />
                      ) : (
                        <TrendingDown className="h-4 w-4 mr-1" />
                      )}
                      {overview.revenueChange}%
                    </div>
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <ShoppingCart className="h-6 w-6 text-gray-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    오늘 주문
                  </dt>
                  <dd className="flex items-baseline">
                    <div className="text-2xl font-semibold text-gray-900">
                      {overview.todayOrders}건
                    </div>
                    <div className={`ml-2 flex items-baseline text-sm font-semibold ${
                      parseFloat(overview.orderChange) >= 0 ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {parseFloat(overview.orderChange) >= 0 ? (
                        <TrendingUp className="h-4 w-4 mr-1" />
                      ) : (
                        <TrendingDown className="h-4 w-4 mr-1" />
                      )}
                      {overview.orderChange}%
                    </div>
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        {userRole === 'MASTER_ADMIN' && (
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <Users className="h-6 w-6 text-gray-400" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      전체 사용자
                    </dt>
                    <dd className="flex items-baseline">
                      <div className="text-2xl font-semibold text-gray-900">
                        {overview.totalUsers}명
                      </div>
                      <div className="ml-2 text-sm text-gray-500">
                        (+{overview.newUsersToday} 오늘)
                      </div>
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Package className="h-6 w-6 text-gray-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    전체 상품
                  </dt>
                  <dd className="flex items-baseline">
                    <div className="text-2xl font-semibold text-gray-900">
                      {overview.totalProducts}개
                    </div>
                    {overview.lowStockProducts > 0 && (
                      <div className="ml-2 flex items-center text-sm text-amber-600">
                        <AlertTriangle className="h-4 w-4 mr-1" />
                        {overview.lowStockProducts} 재고부족
                      </div>
                    )}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Charts Row */}
      <div className="mt-8 grid grid-cols-1 gap-5 lg:grid-cols-2">
        {/* Daily Revenue Chart */}
        <div className="bg-white overflow-hidden shadow rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            일별 매출 추이
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={dailyRevenue}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="date" 
                tickFormatter={(date) => new Date(date).toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' })}
              />
              <YAxis tickFormatter={(value) => `₩${(value / 1000000).toFixed(1)}M`} />
              <Tooltip 
                formatter={(value: number) => formatPrice(value)}
                labelFormatter={(date) => new Date(date).toLocaleDateString('ko-KR')}
              />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="revenue" 
                stroke="#3b82f6" 
                name="매출" 
                strokeWidth={2}
              />
              <Line 
                type="monotone" 
                dataKey="orders" 
                stroke="#10b981" 
                name="주문수" 
                yAxisId="right"
                strokeWidth={2}
              />
              <YAxis yAxisId="right" orientation="right" />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Order Status Pie Chart */}
        <div className="bg-white overflow-hidden shadow rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            주문 상태별 현황
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={ordersByStatus.map(item => ({
                  name: statusLabels[item.status as keyof typeof statusLabels] || item.status,
                  value: item.count,
                  status: item.status
                }))}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${((percent || 0) * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {ordersByStatus.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={statusColors[entry.status as keyof typeof statusColors] || '#94a3b8'} 
                  />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Revenue Analysis */}
      {revenueData && (
        <div className="mt-8 grid grid-cols-1 gap-5 lg:grid-cols-2">
          {/* Category Breakdown */}
          <div className="bg-white overflow-hidden shadow rounded-lg p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              카테고리별 매출
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart 
                data={revenueData.categoryBreakdown.slice(0, 5)}
                layout="vertical"
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" tickFormatter={(value) => `₩${(value / 1000000).toFixed(1)}M`} />
                <YAxis dataKey="categoryName" type="category" width={100} />
                <Tooltip formatter={(value: number) => formatPrice(value)} />
                <Bar dataKey="totalRevenue" fill="#3b82f6" name="매출" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Brand Comparison (MASTER_ADMIN only) */}
          {userRole === 'MASTER_ADMIN' && revenueData.brandComparison && (
            <div className="bg-white overflow-hidden shadow rounded-lg p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                브랜드별 매출
              </h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart 
                  data={revenueData.brandComparison.slice(0, 5)}
                  layout="vertical"
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" tickFormatter={(value) => `₩${(value / 1000000).toFixed(1)}M`} />
                  <YAxis dataKey="brandName" type="category" width={100} />
                  <Tooltip formatter={(value: number) => formatPrice(value)} />
                  <Bar dataKey="totalRevenue" fill="#10b981" name="매출" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      )}

      {/* Top Products Table */}
      <div className="mt-8 bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:px-6">
          <h3 className="text-lg font-medium text-gray-900">
            인기 상품 TOP 5
          </h3>
        </div>
        <div className="border-t border-gray-200">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  상품
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  브랜드
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  판매수량
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  주문건수
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  매출
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {topProducts.map((product) => (
                <tr key={product.productId}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {product.productName}
                      </div>
                      <div className="text-sm text-gray-500">
                        {product.productSku}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {product.brandName}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {product.quantity}개
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {product.orderCount}건
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {formatPrice(product.revenue)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}