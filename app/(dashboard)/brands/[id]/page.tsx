'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'

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
              <button className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700">
                브랜드 편집
              </button>
              <button className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700">
                상품 추가
              </button>
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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-2">연락처</h3>
                <div className="space-y-1">
                  <p className="text-sm text-gray-900">이메일: {brand.contact.email}</p>
                  <p className="text-sm text-gray-900">전화: {brand.contact.phone}</p>
                  <p className="text-sm text-gray-900">주소: {brand.contact.address}</p>
                </div>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-2">기타 정보</h3>
                <div className="space-y-1">
                  {brand.website && (
                    <p className="text-sm text-gray-900">
                      웹사이트: <a href={brand.website} className="text-blue-600 hover:text-blue-800">{brand.website}</a>
                    </p>
                  )}
                </div>
              </div>
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
                <button className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700">
                  첫 상품 추가하기
                </button>
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
                        <button className="flex-1 bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700">
                          편집
                        </button>
                        <button className="flex-1 bg-gray-600 text-white px-3 py-1 rounded text-sm hover:bg-gray-700">
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