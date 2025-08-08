'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Search, X } from 'lucide-react'
import { type Store } from '@/lib/config/stores'

interface StoreSearchBarProps {
  store: Store
  placeholder?: string
}

export default function StoreSearchBar({ 
  store, 
  placeholder = "상품, 브랜드, 스타일을 검색하세요..." 
}: StoreSearchBarProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [isFocused, setIsFocused] = useState(false)
  const router = useRouter()

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      router.push(`${store.path}/search?q=${encodeURIComponent(searchQuery.trim())}`)
    }
  }

  const clearSearch = () => {
    setSearchQuery('')
  }

  return (
    <div className="bg-gray-50 border-b border-gray-200">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="py-4">
          <form onSubmit={handleSearch} className="relative">
            <div className={`relative flex items-center rounded-lg bg-white border-2 transition-colors duration-200 ${
              isFocused ? 'border-blue-500 shadow-md' : 'border-gray-200 hover:border-gray-300'
            }`}>
              <div className="flex-shrink-0 pl-4">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => setIsFocused(true)}
                onBlur={() => setIsFocused(false)}
                placeholder={placeholder}
                className="flex-1 border-0 bg-transparent py-3 pl-3 pr-12 text-gray-900 placeholder:text-gray-500 focus:outline-none focus:ring-0 sm:text-sm"
              />
              
              {searchQuery && (
                <button
                  type="button"
                  onClick={clearSearch}
                  className="flex-shrink-0 p-2 text-gray-400 hover:text-gray-600"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
              
              <button
                type="submit"
                className="flex-shrink-0 rounded-r-lg bg-blue-600 px-6 py-3 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                검색
              </button>
            </div>
            
            {/* Store context indicator */}
            <div className="absolute -top-1 left-4">
              <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium text-white ${store.color}`}>
                {store.icon} {store.nameKo}
              </span>
            </div>
          </form>
          
          {/* Popular searches */}
          <div className="mt-3">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-sm text-gray-500">인기 검색어:</span>
              {getPopularSearches(store).map((term, index) => (
                <button
                  key={index}
                  onClick={() => setSearchQuery(term)}
                  className="rounded-full bg-white px-3 py-1 text-xs text-gray-600 hover:bg-gray-100 border border-gray-200"
                >
                  {term}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function getPopularSearches(store: Store): string[] {
  const searchTerms: Record<string, string[]> = {
    'k-fashion': ['한복', '스트릿웨어', 'K-pop', '미니멀', '빈티지'],
    'golf-wear': ['골프웨어', '골프화', '골프모자', '기능성', '브랜드'],
    'boutique': ['명품', '디자이너', '한정판', '프리미엄', '럭셔리'],
    'accessories': ['가방', '지갑', '시계', '주얼리', '스카프'],
    'shoes': ['스니커즈', '부츠', '하이힐', '플랫슈즈', '런닝화']
  }
  
  return searchTerms[store.id] || ['신상', '베스트', '할인', '브랜드', '인기']
}