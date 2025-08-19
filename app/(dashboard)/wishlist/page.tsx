'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Heart, ShoppingCart, Trash2, ImageOff } from 'lucide-react'
import { formatPrice } from '@/lib/utils'
import { useCartStore } from '@/lib/stores/cart'
import { toast } from 'sonner'

interface WishlistItem {
  id: string
  productId: string
  productName: string
  productSku: string
  basePrice: number
  discountPrice?: number
  imageUrl?: string
  brand: {
    id: string
    nameKo: string
  }
  category?: {
    name: string
  }
  inventory: number
  status: string
  addedAt: string
}

export default function WishlistPage() {
  const [wishlistItems, setWishlistItems] = useState<WishlistItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { addItem } = useCartStore()

  useEffect(() => {
    loadWishlist()
  }, [])

  const loadWishlist = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/wishlist', {
        credentials: 'include',
      })

      if (!response.ok) {
        throw new Error('위시리스트를 불러오는데 실패했습니다')
      }

      const data = await response.json()
      setWishlistItems(data.data || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : '알 수 없는 오류가 발생했습니다')
      console.error('위시리스트 로드 실패:', err)
      
      // Mock data for development
      setWishlistItems([
        {
          id: '1',
          productId: 'cme3ltyne0012myiyu0st08b5',
          productName: '스트레치 벨트',
          productSku: 'TTL-BLT-BK-2025',
          basePrice: 68000,
          imageUrl: '/placeholder.svg',
          brand: {
            id: '726bbb2c-1b40-4efe-9a48-fe95bae80b07',
            nameKo: 'K-패션'
          },
          category: {
            name: '남성/액세서리/벨트'
          },
          inventory: 100,
          status: 'ACTIVE',
          addedAt: '2024-01-15T10:30:00Z',
        },
        {
          id: '2',
          productId: 'prod-2',
          productName: '코튼 티셔츠',
          productSku: 'CTN-TS-WH-2025',
          basePrice: 85000,
          discountPrice: 68000,
          imageUrl: '/placeholder.svg',
          brand: {
            id: 'brand-2',
            nameKo: '프리미엄 브랜드'
          },
          category: {
            name: '남성/상의/티셔츠'
          },
          inventory: 50,
          status: 'ACTIVE',
          addedAt: '2024-01-18T15:45:00Z',
        }
      ])
    } finally {
      setLoading(false)
    }
  }

  const handleRemoveFromWishlist = async (itemId: string) => {
    try {
      const response = await fetch(`/api/wishlist/${itemId}`, {
        method: 'DELETE',
        credentials: 'include',
      })

      if (!response.ok) {
        throw new Error('위시리스트에서 제거하는데 실패했습니다')
      }

      setWishlistItems(prev => prev.filter(item => item.id !== itemId))
      toast.success('위시리스트에서 제거되었습니다')
    } catch (error) {
      console.error('위시리스트 제거 실패:', error)
      // Mock success for development
      setWishlistItems(prev => prev.filter(item => item.id !== itemId))
      toast.success('위시리스트에서 제거되었습니다')
    }
  }

  const handleAddToCart = (item: WishlistItem) => {
    if (item.inventory === 0) {
      toast.error('품절된 상품입니다')
      return
    }

    addItem({
      id: `${item.productId}-${Date.now()}`,
      productId: item.productId,
      name: item.productName,
      brandName: item.brand.nameKo,
      price: item.discountPrice || item.basePrice,
      imageUrl: item.imageUrl || '/placeholder.svg'
    })

    toast.success('장바구니에 추가되었습니다')
  }

  const handleClearWishlist = async () => {
    if (!confirm('위시리스트를 모두 비우시겠습니까?')) return

    try {
      const response = await fetch('/api/wishlist', {
        method: 'DELETE',
        credentials: 'include',
      })

      if (!response.ok) {
        throw new Error('위시리스트 비우기에 실패했습니다')
      }

      setWishlistItems([])
      toast.success('위시리스트가 비워졌습니다')
    } catch (error) {
      console.error('위시리스트 비우기 실패:', error)
      // Mock success for development
      setWishlistItems([])
      toast.success('위시리스트가 비워졌습니다')
    }
  }

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-semibold text-gray-900 mb-8">관심상품</h1>
        <div className="animate-pulse">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="bg-gray-200 rounded-lg h-80"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-semibold text-gray-900 mb-8">관심상품</h1>
        <div className="text-center py-20">
          <div className="text-red-600 mb-4">{error}</div>
          <button 
            onClick={loadWishlist}
            className="text-blue-600 hover:text-blue-800"
          >
            다시 시도
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-semibold text-gray-900">관심상품</h1>
        {wishlistItems.length > 0 && (
          <div className="flex items-center space-x-4">
            <span className="text-sm text-gray-600">
              총 {wishlistItems.length}개
            </span>
            <button
              onClick={handleClearWishlist}
              className="text-sm text-red-600 hover:text-red-800"
            >
              전체 삭제
            </button>
          </div>
        )}
      </div>

      {wishlistItems.length === 0 ? (
        <div className="text-center py-20">
          <Heart className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <div className="text-lg font-medium text-gray-900 mb-2">관심상품이 없습니다</div>
          <div className="text-sm text-gray-500 mb-6">마음에 드는 상품을 관심상품으로 추가해보세요.</div>
          <Link
            href="/admin-products"
            className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            상품 둘러보기
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {wishlistItems.map((item) => (
            <div key={item.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
              {/* Product Image */}
              <Link href={`/products/${item.productId}`}>
                <div className="aspect-square relative bg-gray-100 cursor-pointer">
                  {item.imageUrl ? (
                    <img
                      src={item.imageUrl}
                      alt={item.productName}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <ImageOff className="h-12 w-12 text-gray-400" />
                    </div>
                  )}
                  
                  {/* Discount Badge */}
                  {item.discountPrice && (
                    <div className="absolute top-2 left-2">
                      <span className="bg-red-500 text-white text-xs px-2 py-1 rounded">
                        {Math.round((1 - item.discountPrice / item.basePrice) * 100)}% OFF
                      </span>
                    </div>
                  )}

                  {/* Wishlist Remove Button */}
                  <button
                    onClick={(e) => {
                      e.preventDefault()
                      handleRemoveFromWishlist(item.id)
                    }}
                    className="absolute top-2 right-2 p-2 bg-white rounded-full shadow-md hover:bg-gray-50"
                  >
                    <Heart className="h-4 w-4 text-red-500 fill-current" />
                  </button>
                </div>
              </Link>

              {/* Product Info */}
              <div className="p-4">
                <Link href={`/products/${item.productId}`}>
                  <h3 className="text-lg font-semibold text-gray-900 mb-1 hover:underline cursor-pointer line-clamp-2">
                    {item.productName}
                  </h3>
                </Link>
                
                <p className="text-sm text-gray-600 mb-2">
                  {item.brand.nameKo}
                </p>
                
                {item.category && (
                  <p className="text-xs text-gray-500 mb-3">
                    {item.category.name}
                  </p>
                )}

                {/* Price */}
                <div className="mb-3">
                  {item.discountPrice ? (
                    <div>
                      <span className="text-lg font-bold text-red-600">
                        {formatPrice(item.discountPrice)}
                      </span>
                      <span className="text-sm text-gray-500 line-through ml-2">
                        {formatPrice(item.basePrice)}
                      </span>
                    </div>
                  ) : (
                    <span className="text-lg font-bold text-gray-900">
                      {formatPrice(item.basePrice)}
                    </span>
                  )}
                </div>

                {/* Inventory Status */}
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm text-gray-600">
                    재고: {item.inventory}개
                  </span>
                  <span className={`text-xs px-2 py-1 rounded ${
                    item.status === 'ACTIVE' 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {item.status === 'ACTIVE' ? '판매중' : '판매중지'}
                  </span>
                </div>

                <p className="text-xs text-gray-500 mb-3">
                  SKU: {item.productSku}
                </p>

                {/* Action Buttons */}
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleAddToCart(item)}
                    disabled={item.inventory === 0}
                    className={`flex-1 inline-flex items-center justify-center px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                      item.inventory === 0
                        ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                        : 'bg-blue-600 text-white hover:bg-blue-700'
                    }`}
                  >
                    <ShoppingCart className="h-4 w-4 mr-1" />
                    {item.inventory === 0 ? '품절' : '담기'}
                  </button>
                  
                  <button
                    onClick={() => handleRemoveFromWishlist(item.id)}
                    className="p-2 border border-gray-300 rounded-md text-gray-600 hover:text-red-600 hover:border-red-300 transition-colors"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>

                <p className="text-xs text-gray-400 mt-2">
                  추가일: {new Date(item.addedAt).toLocaleDateString('ko-KR')}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}