'use client'

import { useState, useEffect } from 'react'
import { formatPrice } from '@/lib/utils'
import { useCartStore } from '@/lib/stores/cart'
import { ShoppingCart, Package } from 'lucide-react'

interface Product {
  id: string
  sku: string
  nameKo: string
  nameCn?: string
  descriptionKo?: string
  descriptionCn?: string
  basePrice: number
  status: string
  createdAt: string
}

interface BrandProductsProps {
  brandId: string
  brandName?: string
  userRole: string
}

export default function BrandProducts({ brandId, brandName, userRole }: BrandProductsProps) {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalItems, setTotalItems] = useState(0)
  const addItem = useCartStore((state) => state.addItem)

  useEffect(() => {
    fetchProducts()
  }, [page, brandId])

  const fetchProducts = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/products?brandId=${brandId}&page=${page}&limit=12`, {
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
  }

  if (loading) {
    return (
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {[...Array(8)].map((_, i) => (
          <div key={i} className="animate-pulse">
            <div className="bg-gray-200 rounded-lg h-64"></div>
          </div>
        ))}
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

  if (products.length === 0) {
    return (
      <div className="text-center py-12">
        <Package className="mx-auto h-12 w-12 text-gray-400" />
        <h3 className="mt-2 text-sm font-medium text-gray-900">상품이 없습니다</h3>
        <p className="mt-1 text-sm text-gray-500">이 브랜드에는 아직 등록된 상품이 없습니다.</p>
      </div>
    )
  }

  return (
    <div>
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {products.map((product) => (
          <div
            key={product.id}
            className="group relative rounded-lg border border-gray-200 bg-white p-4 shadow-sm transition-all hover:shadow-md"
          >
            {/* Product Image Placeholder */}
            <div className="aspect-square w-full overflow-hidden rounded-lg bg-gray-100 mb-4">
              <div className="flex h-full items-center justify-center">
                <Package className="h-12 w-12 text-gray-400" />
              </div>
            </div>

            {/* Product Info */}
            <div className="space-y-2">
              <h3 className="text-sm font-medium text-gray-900 line-clamp-2">
                {product.nameKo}
              </h3>
              {product.nameCn && (
                <p className="text-xs text-gray-500 line-clamp-1">{product.nameCn}</p>
              )}
              <p className="text-sm text-gray-600 line-clamp-2">
                {product.descriptionKo || '설명이 없습니다'}
              </p>
              <div className="flex items-center justify-between pt-2">
                <span className="text-lg font-semibold text-gray-900">
                  {formatPrice(Number(product.basePrice))}
                </span>
                {product.status === 'ACTIVE' ? (
                  <span className="inline-flex items-center rounded-full bg-green-100 px-2 py-1 text-xs font-medium text-green-800">
                    판매중
                  </span>
                ) : (
                  <span className="inline-flex items-center rounded-full bg-gray-100 px-2 py-1 text-xs font-medium text-gray-800">
                    {product.status}
                  </span>
                )}
              </div>
            </div>

            {/* Add to Cart Button for Buyers */}
            {userRole === 'BUYER' && product.status === 'ACTIVE' && (
              <button
                onClick={() => addItem({
                  id: product.id,
                  productId: product.id,
                  name: product.nameKo,
                  brandName: brandName || '',
                  price: Number(product.basePrice),
                  imageUrl: '/placeholder.svg'
                })}
                className="mt-4 w-full inline-flex items-center justify-center rounded-md bg-primary px-3 py-2 text-sm font-medium text-white hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
              >
                <ShoppingCart className="h-4 w-4 mr-2" />
                장바구니에 담기
              </button>
            )}
          </div>
        ))}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-8 flex items-center justify-center space-x-2">
          <button
            onClick={() => setPage(page - 1)}
            disabled={page === 1}
            className="relative inline-flex items-center px-4 py-2 text-sm font-medium rounded-md text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            이전
          </button>
          <span className="text-sm text-gray-700">
            {page} / {totalPages} 페이지
          </span>
          <button
            onClick={() => setPage(page + 1)}
            disabled={page === totalPages}
            className="relative inline-flex items-center px-4 py-2 text-sm font-medium rounded-md text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            다음
          </button>
        </div>
      )}

      {/* Total Items */}
      <div className="mt-4 text-center text-sm text-gray-500">
        총 {totalItems}개의 상품
      </div>
    </div>
  )
}