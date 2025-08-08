'use client'

import { notFound, useSearchParams } from 'next/navigation'
import { getStoreBySlug } from '@/lib/config/stores'
import { Search, Filter, Grid, List } from 'lucide-react'

interface StoreSearchPageProps {
  params: { storeSlug: string }
}

export default function StoreSearchPage({ params }: StoreSearchPageProps) {
  const store = getStoreBySlug(params.storeSlug)
  const searchParams = useSearchParams()
  const query = searchParams.get('q') || ''
  
  if (!store) {
    notFound()
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Search Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              검색 결과
            </h1>
            <p className="text-gray-600 mt-1">
              "{query}" 검색 결과 - {store.nameKo}
            </p>
          </div>
          <div className="flex items-center space-x-4">
            <button className="flex items-center px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-700 hover:bg-gray-50">
              <Filter className="w-4 h-4 mr-2" />
              필터
            </button>
            <div className="flex border border-gray-300 rounded-lg">
              <button className="px-3 py-2 text-sm bg-blue-50 text-blue-600 border-r border-gray-300">
                <Grid className="w-4 h-4" />
              </button>
              <button className="px-3 py-2 text-sm text-gray-600 hover:bg-gray-50">
                <List className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
        
        {/* Search Stats */}
        <div className="flex items-center justify-between py-4 border-t border-b border-gray-200">
          <div className="text-sm text-gray-600">
            총 {getMockSearchResults(store.id, query).length}개의 결과를 찾았습니다.
          </div>
          <div className="flex items-center space-x-4">
            <select className="text-sm border border-gray-300 rounded-md px-3 py-1">
              <option>관련도순</option>
              <option>인기순</option>
              <option>가격 낮은순</option>
              <option>가격 높은순</option>
              <option>최신순</option>
            </select>
          </div>
        </div>
      </div>

      {/* Search Results */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {getMockSearchResults(store.id, query).map((result, index) => (
          <div key={index} className="bg-white rounded-lg border border-gray-200 hover:shadow-md transition-shadow duration-200">
            <div className="aspect-square bg-gray-200 rounded-t-lg"></div>
            <div className="p-4">
              <h3 className="text-sm font-medium text-gray-900 mb-2">
                {result.name}
              </h3>
              <p className="text-xs text-gray-500 mb-2">
                {result.brand}
              </p>
              <div className="flex items-center justify-between">
                <span className="text-lg font-bold text-gray-900">
                  {result.price}
                </span>
                <div className="flex items-center">
                  <span className="text-yellow-400">★</span>
                  <span className="text-sm text-gray-600 ml-1">
                    {result.rating}
                  </span>
                </div>
              </div>
              {result.isOnSale && (
                <div className="mt-2">
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                    할인
                  </span>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* No Results */}
      {getMockSearchResults(store.id, query).length === 0 && (
        <div className="text-center py-12">
          <Search className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            검색 결과가 없습니다
          </h3>
          <p className="text-gray-600 mb-6">
            다른 키워드로 다시 검색해보세요.
          </p>
          <div className="flex flex-wrap justify-center gap-2">
            {getStoreSearchSuggestions(store.id).map((suggestion, index) => (
              <button
                key={index}
                className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm hover:bg-gray-200"
              >
                {suggestion}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Load More */}
      {getMockSearchResults(store.id, query).length > 0 && (
        <div className="text-center mt-8">
          <button className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50">
            더 많은 결과 보기
          </button>
        </div>
      )}
    </div>
  )
}

function getMockSearchResults(storeId: string, query: string) {
  if (!query.trim()) return []
  
  // Mock search results based on store
  const results: Record<string, any[]> = {
    'k-fashion': [
      { name: '미니멀 블라우스', brand: 'K-Style', price: '89,000원', rating: '4.8', isOnSale: true },
      { name: '스트릿 자켓', brand: 'Seoul Fashion', price: '159,000원', rating: '4.6', isOnSale: false },
      { name: '빈티지 드레스', brand: 'Retro K', price: '129,000원', rating: '4.9', isOnSale: true },
      { name: '모던 팬츠', brand: 'Urban Korea', price: '79,000원', rating: '4.5', isOnSale: false }
    ],
    'golf-wear': [
      { name: '기능성 골프셔츠', brand: 'Golf Pro', price: '89,000원', rating: '4.7', isOnSale: false },
      { name: '골프 팬츠', brand: 'Green Zone', price: '119,000원', rating: '4.5', isOnSale: true },
      { name: '골프화', brand: 'Swing Master', price: '189,000원', rating: '4.8', isOnSale: false }
    ],
    'boutique': [
      { name: '실크 이브닝드레스', brand: 'Luxury Seoul', price: '459,000원', rating: '4.9', isOnSale: false },
      { name: '디자이너 수트', brand: 'Premium K', price: '689,000원', rating: '4.8', isOnSale: true }
    ],
    'accessories': [
      { name: '가죽 핸드백', brand: 'Bag Seoul', price: '219,000원', rating: '4.6', isOnSale: false },
      { name: '실버 시계', brand: 'Time Korea', price: '169,000원', rating: '4.7', isOnSale: true },
      { name: '진주 목걸이', brand: 'Jewelry K', price: '129,000원', rating: '4.8', isOnSale: false }
    ],
    'shoes': [
      { name: '가죽 스니커즈', brand: 'Shoe Seoul', price: '149,000원', rating: '4.5', isOnSale: true },
      { name: '하이힐', brand: 'Heel Korea', price: '119,000원', rating: '4.6', isOnSale: false },
      { name: '부츠', brand: 'Boot Master', price: '189,000원', rating: '4.7', isOnSale: false }
    ]
  }
  
  return results[storeId] || results['k-fashion']
}

function getStoreSearchSuggestions(storeId: string) {
  const suggestions: Record<string, string[]> = {
    'k-fashion': ['드레스', '블라우스', '스커트', '자켓', '팬츠'],
    'golf-wear': ['골프셰어', '골프화', '모자', '장갑', '가방'],
    'boutique': ['이브닝드레스', '수트', '코트', '명품가방', '주얼리'],
    'accessories': ['가방', '시계', '목걸이', '귀걸이', '팔찌'],
    'shoes': ['스니커즈', '하이힐', '부츠', '플랫슈즈', '샌들']
  }
  
  return suggestions[storeId] || suggestions['k-fashion']
}