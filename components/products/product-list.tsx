'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { formatPrice } from '@/lib/utils'
import { useCartStore } from '@/lib/stores/cart'
import { ShoppingCart, ImageOff } from 'lucide-react'
import ProductFilters, { FilterValues } from './product-filters'
import { ProductListAd, MobileAd } from '@/components/ads/ad-layouts'
import ErrorBoundary from '@/components/error-boundary'

interface Product {
  id: string
  sku: string
  nameKo: string
  nameCn?: string
  descriptionKo?: string
  descriptionCn?: string
  basePrice: number
  brandId: string
  inventory: number
  status: string
  thumbnailImage?: string | null
  images?: string[] | null
  brand?: {
    id: string
    nameKo: string
    nameCn?: string
  }
  createdAt: string
}

interface ProductListProps {
  userRole: string
}

export default function ProductList({ userRole }: ProductListProps) {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalItems, setTotalItems] = useState(0)
  const [filters, setFilters] = useState<FilterValues>({})
  const addItem = useCartStore((state) => state.addItem)

  const loadProducts = useCallback(async () => {
    try {
      setLoading(true)
      
      // Build query string
      const params = new URLSearchParams()
      params.append('page', page.toString())
      params.append('limit', '10')
      
      // Add filters
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== '') {
          params.append(key, value.toString())
        }
      })
      
      const response = await fetch(`/api/products?${params.toString()}`, {
        credentials: 'include',
      })
      
      if (!response.ok) {
        throw new Error('Failed to fetch products')
      }

      const data = await response.json()
      setProducts(data.data || [])
      setTotalPages(data.meta?.totalPages || 1)
      setTotalItems(data.meta?.totalItems || 0)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }, [page, filters])

  useEffect(() => {
    loadProducts()
  }, [loadProducts])

  const handleFiltersChange = (newFilters: FilterValues) => {
    setFilters(newFilters)
    setPage(1) // Reset to first page when filters change
  }


  const handleDelete = async (productId: string) => {
    if (!confirm('정말로 이 상품을 삭제하시겠습니까?')) return

    try {
      const response = await fetch(`/api/products/${productId}`, {
        method: 'DELETE',
        credentials: 'include',
      })

      if (!response.ok) {
        const data = await response.json()
        if (response.status === 409) {
          // Product is in use
          alert('이 상품은 주문에서 사용 중이므로 삭제할 수 없습니다.')
          return
        }
        throw new Error(data.error?.message || 'Failed to delete product')
      }

      // Immediately remove the product from the local state
      setProducts(prevProducts => prevProducts.filter(p => p.id !== productId))
      setTotalItems(prev => prev - 1)
      
      alert('상품이 삭제되었습니다.')
      
      // Also reload to ensure we're in sync with the server
      setTimeout(() => {
        loadProducts()
      }, 100)
    } catch (err) {
      alert(err instanceof Error ? err.message : '상품 삭제에 실패했습니다.')
    }
  }

  if (loading) {
    return (
      <div className="animate-pulse">
        <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-20 bg-gray-200 rounded"></div>
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="rounded-md bg-red-50 p-4">
        <p className="text-sm text-red-800">상품을 불러오는데 실패했습니다: {error}</p>
      </div>
    )
  }

  return (
    <div>
      {/* Search and Filters */}
      <ProductFilters onFiltersChange={handleFiltersChange} />
      
      {/* Results Summary */}
      {!loading && totalItems > 0 && (
        <div className="mb-4 text-sm text-gray-600">
          총 {totalItems}개의 상품이 있습니다.
        </div>
      )}
      
      {/* Product Grid */}
      {products.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500">등록된 상품이 없습니다.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {products.map((product, index) => [
            // Product card
            (<div key={product.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
              {/* Product Image */}
              <Link href={`/products/${product.id}`}>
                <div className="aspect-square relative bg-gray-100 cursor-pointer">
                  {product.thumbnailImage ? (
                    <div className="w-full h-full flex items-center justify-center bg-gray-50">
                    <img
                      src={product.thumbnailImage}
                      alt={product.nameKo}
                      className="max-w-full max-h-full object-contain"
                    />
                  </div>
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <ImageOff className="h-12 w-12 text-gray-400" />
                    </div>
                  )}
                </div>
              </Link>
              
              {/* Product Info */}
              <div className="p-4">
                <Link href={`/products/${product.id}`}>
                  <h3 className="text-lg font-semibold text-gray-900 mb-1 hover:underline cursor-pointer">
                    {product.nameKo}
                  </h3>
                </Link>
                {product.brand && (
                  <p className="text-sm text-gray-600 mb-2">
                    {product.brand.nameKo}
                  </p>
                )}
                <p className="text-sm text-gray-500 mb-3 line-clamp-2">
                  {product.descriptionKo || '상품 설명이 없습니다.'}
                </p>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-lg font-bold text-gray-900">
                    {formatPrice(Number(product.basePrice))}
                  </span>
                  <span className="text-xs text-gray-500">
                    SKU: {product.sku}
                  </span>
                </div>
                
                {/* Inventory Status */}
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm text-gray-600">
                    재고: {product.inventory}개
                  </span>
                  <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${
                    product.status === 'ACTIVE' 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {product.status === 'ACTIVE' ? '판매중' : '판매중지'}
                  </span>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2">
                  {userRole === 'BUYER' && (
                    <button
                      onClick={() => {
                        if (product.inventory > 0) {
                          addItem({
                            id: product.id,
                            productId: product.id,
                            name: product.nameKo,
                            brandName: product.brand?.nameKo || '',
                            price: Number(product.basePrice),
                            imageUrl: product.thumbnailImage || '/placeholder.svg'
                          })
                        }
                      }}
                      disabled={product.inventory === 0}
                      className={`flex-1 inline-flex items-center justify-center px-4 py-2 rounded-md transition-colors ${
                        product.inventory === 0
                          ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                          : 'bg-primary text-white hover:bg-primary/90'
                      }`}
                    >
                      <ShoppingCart className="h-4 w-4 mr-2" />
                      {product.inventory === 0 ? '품절' : '장바구니 담기'}
                    </button>
                  )}
                  {['BRAND_ADMIN', 'MASTER_ADMIN'].includes(userRole) && (
                    <>
                      <button
                        onClick={() => window.location.href = `/products/${product.id}/edit`}
                        className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                      >
                        수정
                      </button>
                      <button
                        onClick={() => handleDelete(product.id)}
                        className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
                      >
                        삭제
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>),
            // Insert ad every 8 products
            ...((index + 1) % 8 === 0 && index < products.length - 1 ? [
              <ErrorBoundary key={`ad-boundary-${index}`} fallback={<div className="bg-gray-100 rounded-lg p-4 text-center text-gray-500 text-sm">광고를 불러올 수 없습니다</div>}>
                <ProductListAd 
                  key={`ad-${index}`}
                  adSlot={process.env.NEXT_PUBLIC_GOOGLE_ADSENSE_PRODUCTS_SLOT || '4919529387'}
                />
              </ErrorBoundary>
            ] : [])
          ]).flat()}
        </div>
      )}

      {/* Mobile Ad */}
      <ErrorBoundary fallback={<div className="bg-gray-100 rounded-lg p-4 text-center text-gray-500 text-sm my-6 md:hidden">모바일 광고를 불러올 수 없습니다</div>}>
        <MobileAd 
          adSlot={process.env.NEXT_PUBLIC_GOOGLE_ADSENSE_MOBILE_SLOT || 'XXXXXXXXXX'} 
          className="my-6"
        />
      </ErrorBoundary>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-4 flex items-center justify-between">
          <button
            onClick={() => setPage(page - 1)}
            disabled={page === 1}
            className="relative inline-flex items-center px-4 py-2 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            이전
          </button>
          <span className="text-sm text-gray-700">
            {page} / {totalPages} 페이지
          </span>
          <button
            onClick={() => setPage(page + 1)}
            disabled={page === totalPages}
            className="relative inline-flex items-center px-4 py-2 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            다음
          </button>
        </div>
      )}
    </div>
  )
}