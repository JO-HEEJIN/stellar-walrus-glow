'use client'

import { useState, useEffect } from 'react'

interface FilterValues {
  status?: string
  startDate?: string
  endDate?: string
  search?: string
  brandId?: string
}

interface OrderFiltersProps {
  onFiltersChange: (filters: FilterValues) => void
  userRole: string
}

const statusOptions = [
  { value: '', label: '전체 상태' },
  { value: 'PENDING', label: '결제 대기' },
  { value: 'PAID', label: '결제 완료' },
  { value: 'PREPARING', label: '상품 준비중' },
  { value: 'SHIPPED', label: '배송중' },
  { value: 'DELIVERED', label: '배송 완료' },
  { value: 'CANCELLED', label: '취소됨' },
]

export default function OrderFilters({ onFiltersChange, userRole }: OrderFiltersProps) {
  const [filters, setFilters] = useState<FilterValues>({
    status: '',
    startDate: '',
    endDate: '',
    search: '',
    brandId: '',
  })
  
  const [brands, setBrands] = useState<Array<{ id: string; nameKo: string }>>([])

  // Get default date range (last 30 days)
  useEffect(() => {
    const endDate = new Date()
    const startDate = new Date()
    startDate.setDate(startDate.getDate() - 30)
    
    const defaultFilters = {
      ...filters,
      startDate: startDate.toISOString().split('T')[0],
      endDate: endDate.toISOString().split('T')[0],
    }
    
    setFilters(defaultFilters)
    onFiltersChange(defaultFilters)
  }, [])

  // Load brands for filtering (only for MASTER_ADMIN)
  useEffect(() => {
    if (userRole === 'MASTER_ADMIN') {
      const fetchBrands = async () => {
        try {
          const response = await fetch('/api/brands', {
            credentials: 'include',
          })
          if (response.ok) {
            const data = await response.json()
            setBrands(data.data || [])
          }
        } catch (err) {
          console.error('Failed to fetch brands:', err)
        }
      }
      fetchBrands()
    }
  }, [userRole])

  const handleFilterChange = (key: keyof FilterValues, value: string) => {
    const newFilters = { ...filters, [key]: value }
    setFilters(newFilters)
    onFiltersChange(newFilters)
  }

  const handleClearFilters = () => {
    const clearedFilters = {
      status: '',
      startDate: '',
      endDate: '',
      search: '',
      brandId: '',
    }
    setFilters(clearedFilters)
    onFiltersChange(clearedFilters)
  }

  const handleQuickDateRange = (days: number) => {
    const endDate = new Date()
    const startDate = new Date()
    startDate.setDate(startDate.getDate() - days)
    
    const newFilters = {
      ...filters,
      startDate: startDate.toISOString().split('T')[0],
      endDate: endDate.toISOString().split('T')[0],
    }
    
    setFilters(newFilters)
    onFiltersChange(newFilters)
  }

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Search */}
        <div>
          <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-1">
            검색 (주문번호, 고객명)
          </label>
          <input
            type="text"
            id="search"
            value={filters.search}
            onChange={(e) => handleFilterChange('search', e.target.value)}
            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
            placeholder="검색어를 입력하세요"
          />
        </div>

        {/* Status Filter */}
        <div>
          <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">
            주문 상태
          </label>
          <select
            id="status"
            value={filters.status}
            onChange={(e) => handleFilterChange('status', e.target.value)}
            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
          >
            {statusOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        {/* Brand Filter (only for MASTER_ADMIN) */}
        {userRole === 'MASTER_ADMIN' && (
          <div>
            <label htmlFor="brandId" className="block text-sm font-medium text-gray-700 mb-1">
              브랜드
            </label>
            <select
              id="brandId"
              value={filters.brandId}
              onChange={(e) => handleFilterChange('brandId', e.target.value)}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
            >
              <option value="">전체 브랜드</option>
              {brands.map((brand) => (
                <option key={brand.id} value={brand.id}>
                  {brand.nameKo}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Date Range */}
        <div className="md:col-span-2 lg:col-span-1">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            기간
          </label>
          <div className="flex space-x-2">
            <input
              type="date"
              value={filters.startDate}
              onChange={(e) => handleFilterChange('startDate', e.target.value)}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
            />
            <input
              type="date"
              value={filters.endDate}
              onChange={(e) => handleFilterChange('endDate', e.target.value)}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
            />
          </div>
        </div>
      </div>

      {/* Quick Date Range Buttons */}
      <div className="mt-4 flex flex-wrap gap-2">
        <span className="text-sm font-medium text-gray-700">빠른 설정:</span>
        <button
          onClick={() => handleQuickDateRange(7)}
          className="px-3 py-1 text-xs bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200"
        >
          최근 7일
        </button>
        <button
          onClick={() => handleQuickDateRange(30)}
          className="px-3 py-1 text-xs bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200"
        >
          최근 30일
        </button>
        <button
          onClick={() => handleQuickDateRange(90)}
          className="px-3 py-1 text-xs bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200"
        >
          최근 3개월
        </button>
        <button
          onClick={handleClearFilters}
          className="px-3 py-1 text-xs bg-red-100 text-red-700 rounded-md hover:bg-red-200"
        >
          필터 초기화
        </button>
      </div>

      {/* Active Filters Display */}
      <div className="mt-4 flex flex-wrap gap-2">
        {Object.entries(filters).map(([key, value]) => {
          if (!value) return null
          
          let displayValue = value
          if (key === 'status') {
            displayValue = statusOptions.find(opt => opt.value === value)?.label || value
          } else if (key === 'brandId') {
            displayValue = brands.find(brand => brand.id === value)?.nameKo || value
          }
          
          return (
            <span
              key={key}
              className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary"
            >
              {key === 'search' ? '검색' : 
               key === 'status' ? '상태' :
               key === 'brandId' ? '브랜드' :
               key === 'startDate' ? '시작일' :
               key === 'endDate' ? '종료일' : key}: {displayValue}
              <button
                onClick={() => handleFilterChange(key as keyof FilterValues, '')}
                className="ml-1 text-primary hover:text-primary/70"
              >
                ×
              </button>
            </span>
          )
        })}
      </div>
    </div>
  )
}