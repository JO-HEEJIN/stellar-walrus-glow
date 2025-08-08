'use client'

import { notFound } from 'next/navigation'
import { getStoreBySlug } from '@/lib/config/stores'
import { Package, TrendingUp, Star, ShoppingBag } from 'lucide-react'

interface StorePageProps {
  params: { storeSlug: string }
}

export default function StorePage({ params }: StorePageProps) {
  const store = getStoreBySlug(params.storeSlug)
  
  if (!store) {
    notFound()
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Store Hero */}
      <div className={`${store.color} rounded-xl p-8 text-white mb-8`}>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold mb-2">
              {store.icon} {store.nameKo}
            </h1>
            <p className="text-xl opacity-90">
              {store.descriptionKo}
            </p>
          </div>
          <div className="hidden md:block">
            <div className="text-6xl opacity-20">
              {store.icon}
            </div>
          </div>
        </div>
      </div>

      {/* Store Stats */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-8">
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
                  <dd className="text-lg font-medium text-gray-900">
                    {getStoreStats(store.id).totalProducts}
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
                <TrendingUp className="h-6 w-6 text-gray-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    이번 달 판매
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {getStoreStats(store.id).monthlySales}
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
                <Star className="h-6 w-6 text-gray-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    평균 평점
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {getStoreStats(store.id).averageRating}
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
                <ShoppingBag className="h-6 w-6 text-gray-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    활성 브랜드
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {getStoreStats(store.id).activeBrands}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Featured Categories */}
      <div className="bg-white shadow rounded-lg mb-8">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-medium text-gray-900">인기 카테고리</h2>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
            {getFeaturedCategories(store.id).map((category, index) => (
              <div
                key={index}
                className="group relative rounded-lg border border-gray-200 bg-white p-4 hover:bg-gray-50 cursor-pointer transition-colors duration-200"
              >
                <div className="text-2xl mb-2">{category.icon}</div>
                <h3 className="text-sm font-medium text-gray-900">{category.name}</h3>
                <p className="text-xs text-gray-500">{category.count}개</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Getting Started */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-medium text-gray-900">시작하기</h2>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <div className="text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-lg bg-blue-100">
                <Package className="h-6 w-6 text-blue-600" />
              </div>
              <h3 className="mt-2 text-sm font-medium text-gray-900">상품 둘러보기</h3>
              <p className="mt-1 text-sm text-gray-500">
                {store.nameKo} 카테고리의 다양한 상품들을 확인해보세요.
              </p>
            </div>
            <div className="text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-lg bg-green-100">
                <TrendingUp className="h-6 w-6 text-green-600" />
              </div>
              <h3 className="mt-2 text-sm font-medium text-gray-900">트렌드 확인</h3>
              <p className="mt-1 text-sm text-gray-500">
                최신 트렌드와 인기 상품을 확인해보세요.
              </p>
            </div>
            <div className="text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-lg bg-purple-100">
                <Star className="h-6 w-6 text-purple-600" />
              </div>
              <h3 className="mt-2 text-sm font-medium text-gray-900">큐레이션</h3>
              <p className="mt-1 text-sm text-gray-500">
                전문가가 선별한 추천 상품들을 만나보세요.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function getStoreStats(storeId: string) {
  const stats: Record<string, any> = {
    'k-fashion': {
      totalProducts: '1,247',
      monthlySales: '328',
      averageRating: '4.8',
      activeBrands: '42'
    },
    'golf-wear': {
      totalProducts: '892',
      monthlySales: '156',
      averageRating: '4.6',
      activeBrands: '23'
    },
    'boutique': {
      totalProducts: '567',
      monthlySales: '98',
      averageRating: '4.9',
      activeBrands: '15'
    },
    'accessories': {
      totalProducts: '1,089',
      monthlySales: '234',
      averageRating: '4.7',
      activeBrands: '31'
    },
    'shoes': {
      totalProducts: '743',
      monthlySales: '189',
      averageRating: '4.5',
      activeBrands: '19'
    }
  }
  
  return stats[storeId] || stats['k-fashion']
}

function getFeaturedCategories(storeId: string) {
  const categories: Record<string, any[]> = {
    'k-fashion': [
      { name: '드레스', icon: '👗', count: 156 },
      { name: '스커트', icon: '👠', count: 89 },
      { name: '블라우스', icon: '👚', count: 234 },
      { name: '아우터', icon: '🧥', count: 167 },
      { name: '팬츠', icon: '👖', count: 198 },
      { name: '니트', icon: '🧶', count: 123 }
    ],
    'golf-wear': [
      { name: '골프셔츠', icon: '👕', count: 89 },
      { name: '골프팬츠', icon: '👖', count: 67 },
      { name: '골프화', icon: '👟', count: 45 },
      { name: '모자', icon: '🧢', count: 34 },
      { name: '장갑', icon: '🧤', count: 23 },
      { name: '가방', icon: '🎒', count: 18 }
    ],
    'boutique': [
      { name: '이브닝드레스', icon: '👗', count: 45 },
      { name: '수트', icon: '👔', count: 67 },
      { name: '코트', icon: '🧥', count: 34 },
      { name: '가방', icon: '👜', count: 89 },
      { name: '주얼리', icon: '💎', count: 123 },
      { name: '스카프', icon: '🧣', count: 56 }
    ],
    'accessories': [
      { name: '가방', icon: '👜', count: 234 },
      { name: '지갑', icon: '👛', count: 156 },
      { name: '시계', icon: '⌚', count: 89 },
      { name: '주얼리', icon: '💍', count: 178 },
      { name: '선글라스', icon: '🕶️', count: 67 },
      { name: '스카프', icon: '🧣', count: 45 }
    ],
    'shoes': [
      { name: '스니커즈', icon: '👟', count: 178 },
      { name: '하이힐', icon: '👠', count: 123 },
      { name: '부츠', icon: '👢', count: 98 },
      { name: '플랫슈즈', icon: '🥿', count: 87 },
      { name: '샌들', icon: '👡', count: 65 },
      { name: '로퍼', icon: '👞', count: 54 }
    ]
  }
  
  return categories[storeId] || categories['k-fashion']
}