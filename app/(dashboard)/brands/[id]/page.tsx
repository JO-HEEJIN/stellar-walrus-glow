'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { checkAuthStatus } from '@/lib/auth-utils'

interface Brand {
  id: string
  nameKo: string
  nameCn?: string
  slug: string
  description?: string
  logoUrl?: string
  isActive: boolean
  productCount: number
  recentProducts: {
    id: string
    nameKo: string
    thumbnailImage?: string
    basePrice: number
    createdAt: string
  }[]
  createdAt: string
  updatedAt: string
}

interface Product {
  id: string
  name: string
  description: string
  price: number
  image: string
  category: string
  stock: number
  status: 'ACTIVE' | 'INACTIVE'
}

export default function BrandDetailPage() {
  const params = useParams()
  const brandId = params.id as string
  
  const [brand, setBrand] = useState<Brand | null>(null)
  const [products, setProducts] = useState<Product[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const fetchBrandData = async () => {
      try {
        setIsLoading(true)
        
        // Fetch brand details
        const brandResponse = await fetch(`/api/brands/${brandId}`)
        if (!brandResponse.ok) {
          throw new Error('브랜드 정보를 불러올 수 없습니다')
        }
        const brandData = await brandResponse.json()
        setBrand(brandData.data)
        
        // Fetch brand products
        const productsResponse = await fetch(`/api/brands/${brandId}/products`)
        if (!productsResponse.ok) {
          throw new Error('상품 정보를 불러올 수 없습니다')
        }
        const productsData = await productsResponse.json()
        setProducts(productsData)
        
      } catch (err) {
        setError(err instanceof Error ? err.message : '데이터를 불러오는 중 오류가 발생했습니다')
      } finally {
        setIsLoading(false)
      }
    }

    fetchBrandData()
  }, [brandId])

  const handleDeleteProduct = async (productId: string, productName: string) => {
    if (!confirm(`정말 "${productName}" 상품을 삭제하시겠습니까?`)) {
      return
    }

    // 인증 상태 확인
    const authStatus = checkAuthStatus()
    if (!authStatus.isAuthenticated) {
      alert('로그인이 필요합니다. 다시 로그인해주세요.')
      window.location.href = '/auth/signin'
      return
    }

    try {
      const response = await fetch(`/api/products/${productId}`, {
        method: 'DELETE',
        credentials: 'include',
      })

      if (!response.ok) {
        const errorData = await response.json()
        if (response.status === 401) {
          throw new Error('로그인이 필요합니다. 다시 로그인해주세요.')
        } else if (response.status === 409) {
          throw new Error(errorData.message || '이 상품은 주문에서 사용 중이므로 삭제할 수 없습니다.')
        } else if (response.status === 403) {
          throw new Error('상품 삭제 권한이 없습니다.')
        } else if (response.status === 404) {
          throw new Error('상품을 찾을 수 없습니다.')
        }
        throw new Error(errorData.message || '상품 삭제에 실패했습니다')
      }

      // Remove from local state
      setProducts(prev => prev.filter(p => p.id !== productId))
      alert('상품이 삭제되었습니다.')
    } catch (error) {
      console.error('Product deletion error:', error)
      alert(error instanceof Error ? error.message : '상품 삭제에 실패했습니다.')
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-lg">로딩 중...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-600 mb-4">{error}</div>
          <Link href="/brands" className="text-blue-600 hover:text-blue-800">
            브랜드 목록으로 돌아가기
          </Link>
        </div>
      </div>
    )
  }

  if (!brand) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-gray-600 mb-4">브랜드를 찾을 수 없습니다</div>
          <Link href="/brands" className="text-blue-600 hover:text-blue-800">
            브랜드 목록으로 돌아가기
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <nav className="mb-8 flex" aria-label="Breadcrumb">
          <ol className="inline-flex items-center space-x-1 md:space-x-3">
            <li className="inline-flex items-center">
              <Link href="/dashboard" className="text-gray-700 hover:text-blue-600">
                대시보드
              </Link>
            </li>
            <li>
              <div className="flex items-center">
                <span className="mx-2 text-gray-400">/</span>
                <Link href="/brands" className="text-gray-700 hover:text-blue-600">
                  브랜드
                </Link>
              </div>
            </li>
            <li>
              <div className="flex items-center">
                <span className="mx-2 text-gray-400">/</span>
                <span className="text-gray-500">{brand.nameKo}</span>
              </div>
            </li>
          </ol>
        </nav>

        {/* Brand Header */}
        <div className="mb-8 bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              {brand.logoUrl && (
                <img 
                  src={brand.logoUrl} 
                  alt={brand.nameKo} 
                  className="h-16 w-16 rounded-lg object-cover"
                />
              )}
              <div>
                <h1 className="text-3xl font-bold text-gray-900">{brand.nameKo}</h1>
                <p className="text-gray-600 mt-1">{brand.description}</p>
              </div>
            </div>
            <div className="flex space-x-2">
              <Link
                href={`/brands/${brandId}/edit`}
                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 inline-block text-center"
              >
                브랜드 편집
              </Link>
              <Link
                href={`/products/new?brandId=${brandId}`}
                className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 inline-block text-center"
              >
                상품 추가
              </Link>
            </div>
          </div>
        </div>

        {/* Brand Stats */}
        <div className="mb-8 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="text-2xl">📦</div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">총 상품 수</p>
                <p className="text-2xl font-semibold text-gray-900">{brand.productCount}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="text-2xl">🛒</div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">총 주문 수</p>
                <p className="text-2xl font-semibold text-gray-900">-</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="text-2xl">💰</div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">월간 매출</p>
                <p className="text-2xl font-semibold text-gray-900">
                  -
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Brand Info */}
        <div className="mb-8 bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">브랜드 정보</h2>
          </div>
          <div className="p-6">
            <div className="text-center text-gray-500">
              <p className="text-sm">연락처 및 추가 정보는 준비 중입니다.</p>
            </div>
          </div>
        </div>

        {/* Brand Products */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">브랜드 상품</h2>
          </div>
          <div className="p-6">
            {products.length === 0 ? (
              <div className="text-center py-8">
                <div className="text-gray-400 text-lg mb-4">상품이 없습니다</div>
                <Link
                  href={`/products/new?brandId=${brandId}`}
                  className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 inline-block"
                >
                  첫 상품 추가하기
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {products.map((product) => (
                  <div key={product.id} className="border rounded-lg overflow-hidden">
                    <img 
                      src={product.image} 
                      alt={product.name}
                      className="w-full h-48 object-cover"
                    />
                    <div className="p-4">
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">{product.name}</h3>
                      <p className="text-gray-600 text-sm mb-2">{product.description}</p>
                      <div className="flex items-center justify-between">
                        <span className="text-lg font-bold text-blue-600">
                          ₩{product.price.toLocaleString()}
                        </span>
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          product.status === 'ACTIVE' 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {product.status === 'ACTIVE' ? '활성' : '비활성'}
                        </span>
                      </div>
                      <div className="mt-2 text-sm text-gray-500">
                        재고: {product.stock}개
                      </div>
                      <div className="mt-4 flex space-x-2">
                        <Link
                          href={`/products/${product.id}/edit`}
                          className="flex-1 bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700 text-center inline-block"
                        >
                          편집
                        </Link>
                        <button 
                          onClick={() => handleDeleteProduct(product.id, product.name)}
                          className="flex-1 bg-gray-600 text-white px-3 py-1 rounded text-sm hover:bg-gray-700"
                        >
                          삭제
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}