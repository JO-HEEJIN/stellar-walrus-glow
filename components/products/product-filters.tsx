'use client'

import { useState, useEffect, useCallback } from 'react'
import { Search, Filter, X } from 'lucide-react'
import { debounce } from '@/lib/utils'

interface ProductFiltersProps {
  onFiltersChange: (filters: FilterValues) => void
}

export interface FilterValues {
  search?: string
  brandId?: string
  categoryId?: string
  status?: string
  minPrice?: number
  maxPrice?: number
  sortBy?: string
  order?: string
}

export default function ProductFilters({ onFiltersChange }: ProductFiltersProps) {
  const [search, setSearch] = useState('')
  const [brandId, setBrandId] = useState('')
  const [categoryId, setCategoryId] = useState('')
  const [status, setStatus] = useState('')
  const [minPrice, setMinPrice] = useState('')
  const [maxPrice, setMaxPrice] = useState('')
  const [sortBy, setSortBy] = useState('createdAt')
  const [order, setOrder] = useState('desc')
  const [showFilters, setShowFilters] = useState(false)
  const [brands, setBrands] = useState<Array<{ id: string; nameKo: string }>>([])

  // Fetch brands
  useEffect(() => {
    fetch('/api/brands', { credentials: 'include' })
      .then(res => res.json())
      .then(data => setBrands(data.data || []))
      .catch(console.error)
  }, [])

  // Debounced search
  const debouncedSearch = useCallback(
    debounce((value: string) => {
      updateFilters({ search: value })
    }, 500),
    [search, brandId, categoryId, status, minPrice, maxPrice, sortBy, order]
  )

  const updateFilters = (updates: Partial<FilterValues>) => {
    const newFilters: FilterValues = {
      search: search || undefined,
      brandId: brandId || undefined,
      categoryId: categoryId || undefined,
      status: status || undefined,
      minPrice: minPrice ? Number(minPrice) : undefined,
      maxPrice: maxPrice ? Number(maxPrice) : undefined,
      sortBy: sortBy || undefined,
      order: order || undefined,
      ...updates,
    }

    // Remove undefined values
    Object.keys(newFilters).forEach(key => {
      if (newFilters[key as keyof FilterValues] === undefined) {
        delete newFilters[key as keyof FilterValues]
      }
    })

    onFiltersChange(newFilters)
  }

  const handleSearchChange = (value: string) => {
    setSearch(value)
    debouncedSearch(value)
  }

  const handleFilterChange = () => {
    updateFilters({})
  }

  const clearFilters = () => {
    setSearch('')
    setBrandId('')
    setCategoryId('')
    setStatus('')
    setMinPrice('')
    setMaxPrice('')
    setSortBy('createdAt')
    setOrder('desc')
    onFiltersChange({})
  }

  const hasActiveFilters = search || brandId || categoryId || status || minPrice || maxPrice

  return (
    <div className="mb-6 space-y-4">
      {/* Search Bar */}
      <div className="flex gap-2">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
          <input
            type="text"
            value={search}
            onChange={(e) => handleSearchChange(e.target.value)}
            placeholder="상품명, SKU로 검색..."
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
          />
        </div>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={`px-4 py-2 border rounded-lg flex items-center gap-2 transition-colors ${
            showFilters ? 'bg-primary text-white border-primary' : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
          }`}
        >
          <Filter className="h-5 w-5" />
          필터
          {hasActiveFilters && (
            <span className="ml-1 px-2 py-0.5 text-xs bg-red-500 text-white rounded-full">
              {[search, brandId, categoryId, status, minPrice, maxPrice].filter(Boolean).length}
            </span>
          )}
        </button>
      </div>

      {/* Filter Panel */}
      {showFilters && (
        <div className="bg-gray-50 p-4 rounded-lg space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Brand Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                브랜드
              </label>
              <select
                value={brandId}
                onChange={(e) => {
                  setBrandId(e.target.value)
                  handleFilterChange()
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary focus:border-primary"
              >
                <option value="">전체</option>
                {brands.map((brand) => (
                  <option key={brand.id} value={brand.id}>
                    {brand.nameKo}
                  </option>
                ))}
              </select>
            </div>

            {/* Status Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                상태
              </label>
              <select
                value={status}
                onChange={(e) => {
                  setStatus(e.target.value)
                  handleFilterChange()
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary focus:border-primary"
              >
                <option value="">전체</option>
                <option value="ACTIVE">판매중</option>
                <option value="INACTIVE">판매중지</option>
                <option value="OUT_OF_STOCK">품절</option>
              </select>
            </div>

            {/* Price Range */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                가격대 (원)
              </label>
              <div className="flex gap-2">
                <input
                  type="number"
                  value={minPrice}
                  onChange={(e) => {
                    setMinPrice(e.target.value)
                    handleFilterChange()
                  }}
                  placeholder="최소"
                  className="w-1/2 px-3 py-2 border border-gray-300 rounded-md focus:ring-primary focus:border-primary"
                />
                <input
                  type="number"
                  value={maxPrice}
                  onChange={(e) => {
                    setMaxPrice(e.target.value)
                    handleFilterChange()
                  }}
                  placeholder="최대"
                  className="w-1/2 px-3 py-2 border border-gray-300 rounded-md focus:ring-primary focus:border-primary"
                />
              </div>
            </div>

            {/* Sort Options */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                정렬
              </label>
              <div className="flex gap-2">
                <select
                  value={sortBy}
                  onChange={(e) => {
                    setSortBy(e.target.value)
                    handleFilterChange()
                  }}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-primary focus:border-primary"
                >
                  <option value="createdAt">등록일</option>
                  <option value="basePrice">가격</option>
                  <option value="nameKo">이름</option>
                </select>
                <select
                  value={order}
                  onChange={(e) => {
                    setOrder(e.target.value)
                    handleFilterChange()
                  }}
                  className="w-24 px-3 py-2 border border-gray-300 rounded-md focus:ring-primary focus:border-primary"
                >
                  <option value="desc">내림차순</option>
                  <option value="asc">오름차순</option>
                </select>
              </div>
            </div>
          </div>

          {/* Clear Filters Button */}
          {hasActiveFilters && (
            <div className="flex justify-end">
              <button
                onClick={clearFilters}
                className="text-sm text-gray-600 hover:text-gray-900 flex items-center gap-1"
              >
                <X className="h-4 w-4" />
                필터 초기화
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}