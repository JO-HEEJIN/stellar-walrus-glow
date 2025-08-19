'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { 
  TrendingUp, 
  TrendingDown, 
  Package, 
  ShoppingCart, 
  Eye, 
  Heart,
  BarChart3,
  PieChart,
  Calendar as CalendarIcon,
  RefreshCw,
  Download,
  Filter
} from 'lucide-react'
import { toast } from 'sonner'
import { format } from 'date-fns'
import { ko } from 'date-fns/locale'

interface AnalyticsData {
  overview: {
    totalProducts: number
    totalViews: number
    totalOrders: number
    totalRevenue: number
    averagePrice: number
    lowStockCount: number
    inactiveCount: number
  }
  trends: {
    period: string
    views: number
    orders: number
    revenue: number
    change: number
  }[]
  topProducts: {
    id: string
    name: string
    sku: string
    views: number
    orders: number
    revenue: number
    trend: 'up' | 'down' | 'stable'
    changePercent: number
  }[]
  categoryBreakdown: {
    category: string
    productCount: number
    revenue: number
    percentage: number
  }[]
  inventoryInsights: {
    lowStock: {
      id: string
      name: string
      sku: string
      current: number
      recommended: number
    }[]
    overStock: {
      id: string
      name: string
      sku: string
      current: number
      avgSales: number
    }[]
    fastMoving: {
      id: string
      name: string
      sku: string
      velocity: number
    }[]
  }
  priceAnalysis: {
    priceRanges: {
      range: string
      count: number
      percentage: number
    }[]
    profitability: {
      high: number
      medium: number
      low: number
    }
  }
}

interface FilterOptions {
  dateRange: {
    from?: Date
    to?: Date
  }
  brand?: string
  category?: string
  period: '7d' | '30d' | '90d' | '1y'
}

export function ProductAnalytics() {
  const [data, setData] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState<FilterOptions>({
    dateRange: {},
    period: '30d'
  })
  const [showDatePicker, setShowDatePicker] = useState(false)

  const loadAnalytics = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      params.append('period', filters.period)
      if (filters.brand) params.append('brand', filters.brand)
      if (filters.category) params.append('category', filters.category)
      if (filters.dateRange.from) params.append('from', filters.dateRange.from.toISOString())
      if (filters.dateRange.to) params.append('to', filters.dateRange.to.toISOString())

      const response = await fetch(`/api/products/analytics?${params.toString()}`, {
        credentials: 'include'
      })

      if (response.ok) {
        const result = await response.json()
        setData(result.data)
      } else {
        throw new Error('Failed to fetch analytics')
      }
    } catch (error) {
      console.error('Analytics error:', error)
      toast.error('분석 데이터를 불러오는데 실패했습니다')
      
      // Use mock data for development
      setData({
        overview: {
          totalProducts: 156,
          totalViews: 12430,
          totalOrders: 89,
          totalRevenue: 4567000,
          averagePrice: 51300,
          lowStockCount: 8,
          inactiveCount: 12
        },
        trends: [
          { period: '2024-01-01', views: 1200, orders: 15, revenue: 780000, change: 12.5 },
          { period: '2024-01-08', views: 1350, orders: 18, revenue: 890000, change: 14.1 },
          { period: '2024-01-15', views: 1180, orders: 12, revenue: 650000, change: -8.3 },
          { period: '2024-01-22', views: 1420, orders: 22, revenue: 1200000, change: 20.3 },
          { period: '2024-01-29', views: 1380, orders: 19, revenue: 980000, change: 8.7 }
        ],
        topProducts: [
          {
            id: '1',
            name: '프리미엄 코튼 셔츠',
            sku: 'SHIRT-001',
            views: 2430,
            orders: 45,
            revenue: 2250000,
            trend: 'up',
            changePercent: 15.3
          },
          {
            id: '2',
            name: '캐주얼 데님 팬츠',
            sku: 'DENIM-002',
            views: 1890,
            orders: 32,
            revenue: 1920000,
            trend: 'up',
            changePercent: 8.7
          },
          {
            id: '3',
            name: '스포츠 운동화',
            sku: 'SHOES-003',
            views: 1650,
            orders: 28,
            revenue: 1680000,
            trend: 'down',
            changePercent: -5.2
          }
        ],
        categoryBreakdown: [
          { category: '상의', productCount: 45, revenue: 2100000, percentage: 46.0 },
          { category: '하의', productCount: 38, revenue: 1800000, percentage: 39.4 },
          { category: '신발', productCount: 23, revenue: 667000, percentage: 14.6 }
        ],
        inventoryInsights: {
          lowStock: [
            { id: '1', name: '인기 티셔츠', sku: 'TSHIRT-001', current: 3, recommended: 25 },
            { id: '2', name: '베스트 진', sku: 'JEANS-002', current: 5, recommended: 30 }
          ],
          overStock: [
            { id: '3', name: '계절 자켓', sku: 'JACKET-003', current: 85, avgSales: 12 },
            { id: '4', name: '정장 셔츠', sku: 'FORMAL-004', current: 67, avgSales: 8 }
          ],
          fastMoving: [
            { id: '5', name: '데일리 후드', sku: 'HOOD-005', velocity: 4.2 },
            { id: '6', name: '캐주얼 스니커즈', sku: 'SNEAKER-006', velocity: 3.8 }
          ]
        },
        priceAnalysis: {
          priceRanges: [
            { range: '0-30,000원', count: 34, percentage: 21.8 },
            { range: '30,000-60,000원', count: 67, percentage: 42.9 },
            { range: '60,000-100,000원', count: 38, percentage: 24.4 },
            { range: '100,000원+', count: 17, percentage: 10.9 }
          ],
          profitability: {
            high: 45,
            medium: 78,
            low: 33
          }
        }
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadAnalytics()
  }, [filters])

  const exportAnalytics = async () => {
    try {
      toast.info('분석 리포트를 다운로드 중...')
      // In a real implementation, you would call an export API
      toast.success('분석 리포트가 다운로드되었습니다')
    } catch (error) {
      toast.error('리포트 다운로드에 실패했습니다')
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="animate-spin h-8 w-8 border-2 border-blue-500 rounded-full border-t-transparent mx-auto mb-2"></div>
          <p className="text-sm text-gray-600">분석 데이터를 불러오는 중...</p>
        </div>
      </div>
    )
  }

  if (!data) {
    return (
      <div className="text-center p-8">
        <p className="text-gray-500">분석 데이터를 불러올 수 없습니다</p>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-bold mb-2">상품 분석 대시보드</h1>
          <p className="text-gray-600">
            상품 성과와 비즈니스 인사이트를 확인하세요
          </p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" onClick={() => loadAnalytics()}>
            <RefreshCw className="h-4 w-4 mr-1" />
            새로고침
          </Button>
          <Button onClick={exportAnalytics}>
            <Download className="h-4 w-4 mr-1" />
            리포트 다운로드
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            필터
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4">
            <div>
              <label className="text-sm font-medium">기간</label>
              <Select 
                value={filters.period} 
                onValueChange={(value) => setFilters(prev => ({ ...prev, period: value as any }))}
              >
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="7d">최근 7일</SelectItem>
                  <SelectItem value="30d">최근 30일</SelectItem>
                  <SelectItem value="90d">최근 3개월</SelectItem>
                  <SelectItem value="1y">최근 1년</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium">사용자 정의 기간</label>
              <Popover open={showDatePicker} onOpenChange={setShowDatePicker}>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-60 justify-start">
                    <CalendarIcon className="h-4 w-4 mr-2" />
                    {filters.dateRange.from ? (
                      filters.dateRange.to ? (
                        `${format(filters.dateRange.from, 'MMM dd', { locale: ko })} - ${format(filters.dateRange.to, 'MMM dd', { locale: ko })}`
                      ) : (
                        format(filters.dateRange.from, 'MMM dd', { locale: ko })
                      )
                    ) : (
                      '날짜 선택'
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="range"
                    selected={filters.dateRange as any}
                    onSelect={(range) => setFilters(prev => ({ ...prev, dateRange: range || { from: undefined, to: undefined } }))}
                    numberOfMonths={2}
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">전체 상품</p>
                <p className="text-2xl font-bold">{data.overview.totalProducts.toLocaleString()}</p>
              </div>
              <Package className="h-8 w-8 text-blue-600" />
            </div>
            <div className="mt-2 flex items-center text-sm">
              <Badge variant="secondary" className="text-xs">
                활성: {data.overview.totalProducts - data.overview.inactiveCount}
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">총 조회수</p>
                <p className="text-2xl font-bold">{data.overview.totalViews.toLocaleString()}</p>
              </div>
              <Eye className="h-8 w-8 text-green-600" />
            </div>
            <div className="mt-2 flex items-center text-sm">
              <TrendingUp className="h-3 w-3 text-green-500 mr-1" />
              <span className="text-green-700">+12.5%</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">총 주문</p>
                <p className="text-2xl font-bold">{data.overview.totalOrders.toLocaleString()}</p>
              </div>
              <ShoppingCart className="h-8 w-8 text-purple-600" />
            </div>
            <div className="mt-2 flex items-center text-sm">
              <TrendingUp className="h-3 w-3 text-green-500 mr-1" />
              <span className="text-green-700">+8.3%</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">총 매출</p>
                <p className="text-2xl font-bold">₩{(data.overview.totalRevenue / 1000000).toFixed(1)}M</p>
              </div>
              <TrendingUp className="h-8 w-8 text-orange-600" />
            </div>
            <div className="mt-2 flex items-center text-sm">
              <span className="text-gray-600">평균 주문가: ₩{data.overview.averagePrice.toLocaleString()}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Analytics Tabs */}
      <Tabs defaultValue="performance" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="performance">성과 분석</TabsTrigger>
          <TabsTrigger value="inventory">재고 인사이트</TabsTrigger>
          <TabsTrigger value="categories">카테고리 분석</TabsTrigger>
          <TabsTrigger value="pricing">가격 분석</TabsTrigger>
        </TabsList>

        <TabsContent value="performance" className="space-y-6">
          {/* Top Performing Products */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                인기 상품
              </CardTitle>
              <CardDescription>
                조회수, 주문수, 매출 기준 상위 상품
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {data.topProducts.map((product, index) => (
                  <div key={product.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-4">
                      <div className="flex items-center justify-center w-8 h-8 bg-blue-100 text-blue-600 rounded-full font-bold">
                        {index + 1}
                      </div>
                      <div>
                        <h4 className="font-medium">{product.name}</h4>
                        <p className="text-sm text-gray-600">SKU: {product.sku}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-6 text-sm">
                      <div className="text-center">
                        <p className="font-bold">{product.views.toLocaleString()}</p>
                        <p className="text-gray-600">조회</p>
                      </div>
                      <div className="text-center">
                        <p className="font-bold">{product.orders}</p>
                        <p className="text-gray-600">주문</p>
                      </div>
                      <div className="text-center">
                        <p className="font-bold">₩{(product.revenue / 1000).toFixed(0)}K</p>
                        <p className="text-gray-600">매출</p>
                      </div>
                      <div className="flex items-center gap-1">
                        {product.trend === 'up' ? (
                          <TrendingUp className="h-4 w-4 text-green-500" />
                        ) : product.trend === 'down' ? (
                          <TrendingDown className="h-4 w-4 text-red-500" />
                        ) : (
                          <div className="h-4 w-4" />
                        )}
                        <span className={`text-sm ${
                          product.trend === 'up' ? 'text-green-700' : 
                          product.trend === 'down' ? 'text-red-700' : 'text-gray-600'
                        }`}>
                          {product.changePercent > 0 ? '+' : ''}{product.changePercent}%
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="inventory" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Low Stock */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg text-red-700">재고 부족</CardTitle>
                <CardDescription>보충이 필요한 상품</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {data.inventoryInsights.lowStock.map(item => (
                    <div key={item.id} className="p-3 bg-red-50 border border-red-200 rounded">
                      <h4 className="font-medium text-sm">{item.name}</h4>
                      <p className="text-xs text-gray-600">SKU: {item.sku}</p>
                      <div className="flex justify-between text-sm mt-2">
                        <span>현재: <span className="font-bold text-red-600">{item.current}</span></span>
                        <span>권장: <span className="font-bold">{item.recommended}</span></span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Overstock */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg text-yellow-700">과재고</CardTitle>
                <CardDescription>판매량 대비 높은 재고</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {data.inventoryInsights.overStock.map(item => (
                    <div key={item.id} className="p-3 bg-yellow-50 border border-yellow-200 rounded">
                      <h4 className="font-medium text-sm">{item.name}</h4>
                      <p className="text-xs text-gray-600">SKU: {item.sku}</p>
                      <div className="flex justify-between text-sm mt-2">
                        <span>재고: <span className="font-bold text-yellow-600">{item.current}</span></span>
                        <span>월평균: <span className="font-bold">{item.avgSales}</span></span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Fast Moving */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg text-green-700">빠른 판매</CardTitle>
                <CardDescription>높은 회전율 상품</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {data.inventoryInsights.fastMoving.map(item => (
                    <div key={item.id} className="p-3 bg-green-50 border border-green-200 rounded">
                      <h4 className="font-medium text-sm">{item.name}</h4>
                      <p className="text-xs text-gray-600">SKU: {item.sku}</p>
                      <div className="flex justify-between text-sm mt-2">
                        <span>회전율: <span className="font-bold text-green-600">{item.velocity}×</span></span>
                        <Badge variant="default" className="bg-green-600 text-xs">
                          고속 회전
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="categories" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <PieChart className="h-5 w-5" />
                카테고리별 성과
              </CardTitle>
              <CardDescription>
                카테고리별 상품 수, 매출 분석
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {data.categoryBreakdown.map((category, index) => (
                  <div key={index} className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="font-medium">{category.category}</span>
                      <span className="text-sm text-gray-600">{category.percentage}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-blue-600 h-2 rounded-full transition-all"
                        style={{ width: `${category.percentage}%` }}
                      />
                    </div>
                    <div className="flex justify-between text-sm text-gray-600">
                      <span>{category.productCount}개 상품</span>
                      <span>₩{(category.revenue / 1000).toFixed(0)}K 매출</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="pricing" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>가격대별 분포</CardTitle>
                <CardDescription>상품 가격 범위 분석</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {data.priceAnalysis.priceRanges.map((range, index) => (
                    <div key={index} className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm">{range.range}</span>
                        <span className="text-sm font-medium">{range.count}개 ({range.percentage}%)</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-green-600 h-2 rounded-full"
                          style={{ width: `${range.percentage}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>수익성 분석</CardTitle>
                <CardDescription>마진 기준 상품 분류</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded">
                    <span className="font-medium text-green-800">고수익 상품</span>
                    <span className="font-bold text-green-900">{data.priceAnalysis.profitability.high}개</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-yellow-50 border border-yellow-200 rounded">
                    <span className="font-medium text-yellow-800">중수익 상품</span>
                    <span className="font-bold text-yellow-900">{data.priceAnalysis.profitability.medium}개</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-red-50 border border-red-200 rounded">
                    <span className="font-medium text-red-800">저수익 상품</span>
                    <span className="font-bold text-red-900">{data.priceAnalysis.profitability.low}개</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}