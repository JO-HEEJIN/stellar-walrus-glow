'use client'

import { notFound } from 'next/navigation'
import { getStoreBySlug, getNavigationItemBySlug } from '@/lib/config/stores'
import { Package, TrendingUp, Star, Users, Calendar, Flame, Award, Sun } from 'lucide-react'

interface StoreCategoryPageProps {
  params: { 
    storeSlug: string
    category: string 
  }
}

const categoryIcons: Record<string, any> = {
  content: Package,
  recommend: Star,
  ranking: TrendingUp,
  sale: Award,
  brands: Users,
  releases: Calendar,
  'sports-week': Flame,
  'hot-summer': Sun
}

export default function StoreCategoryPage({ params }: StoreCategoryPageProps) {
  const store = getStoreBySlug(params.storeSlug)
  const navigationItem = getNavigationItemBySlug(params.category)
  
  if (!store || !navigationItem) {
    notFound()
  }

  const Icon = categoryIcons[navigationItem.slug] || Package

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Category Header */}
      <div className="mb-8">
        <div className="flex items-center mb-4">
          <div className={`${store.color} rounded-lg p-3 mr-4`}>
            <Icon className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              {store.nameKo} - {navigationItem.nameKo}
            </h1>
            <p className="text-gray-600 mt-1">
              {navigationItem.description}
            </p>
          </div>
        </div>
        
        <div className="border-b border-gray-200 pb-4">
          <nav className="flex space-x-6">
            <button className="text-blue-600 border-b-2 border-blue-600 pb-2 px-1 text-sm font-medium">
              전체
            </button>
            <button className="text-gray-500 hover:text-gray-700 pb-2 px-1 text-sm font-medium">
              신상품
            </button>
            <button className="text-gray-500 hover:text-gray-700 pb-2 px-1 text-sm font-medium">
              인기순
            </button>
            <button className="text-gray-500 hover:text-gray-700 pb-2 px-1 text-sm font-medium">
              가격순
            </button>
          </nav>
        </div>
      </div>

      {/* Category Content */}
      <div className="grid grid-cols-1 gap-6">
        {/* Coming Soon Notice */}
        <div className="bg-white border border-gray-200 rounded-lg p-8 text-center">
          <div className={`mx-auto flex h-12 w-12 items-center justify-center rounded-lg ${store.color} mb-4`}>
            <Icon className="h-6 w-6 text-white" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {navigationItem.nameKo} 페이지 준비 중
          </h3>
          <p className="text-gray-600 mb-6">
            {store.nameKo} {navigationItem.nameKo} 콘텐츠를 준비하고 있습니다.<br />
            곧 다양한 상품과 정보를 만나보실 수 있습니다.
          </p>
          
          {/* Mock Content Preview */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-8">
            {[1, 2, 3, 4, 5, 6].map((item) => (
              <div key={item} className="bg-gray-100 rounded-lg p-4 animate-pulse">
                <div className="w-full h-32 bg-gray-200 rounded-lg mb-4"></div>
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </div>
            ))}
          </div>
          
          <div className="mt-6">
            <button className={`${store.color} text-white px-6 py-2 rounded-lg hover:opacity-90 transition-opacity`}>
              알림 받기
            </button>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <div className="bg-white rounded-lg border border-gray-200 p-4 text-center">
            <div className="text-2xl font-bold text-gray-900">
              {getCategoryStats(store.id, navigationItem.slug).items}
            </div>
            <div className="text-sm text-gray-500">준비 중인 상품</div>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-4 text-center">
            <div className="text-2xl font-bold text-gray-900">
              {getCategoryStats(store.id, navigationItem.slug).brands}
            </div>
            <div className="text-sm text-gray-500">참여 브랜드</div>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-4 text-center">
            <div className="text-2xl font-bold text-gray-900">
              {getCategoryStats(store.id, navigationItem.slug).updates}
            </div>
            <div className="text-sm text-gray-500">주간 업데이트</div>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-4 text-center">
            <div className="text-2xl font-bold text-gray-900">
              {getCategoryStats(store.id, navigationItem.slug).engagement}
            </div>
            <div className="text-sm text-gray-500">관심도</div>
          </div>
        </div>
      </div>
    </div>
  )
}

function getCategoryStats(storeId: string, category: string) {
  // Mock stats for different categories
  const baseStats = {
    items: Math.floor(Math.random() * 500) + 100,
    brands: Math.floor(Math.random() * 30) + 10,
    updates: Math.floor(Math.random() * 10) + 3,
    engagement: (Math.random() * 2 + 3).toFixed(1)
  }
  
  return baseStats
}