'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

interface Product {
  id: number
  brand: string
  name: string
  price: number
  originalPrice: number
  discount: number
  moq: number
  badge: string | null
  image: string
}

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedBrand, setSelectedBrand] = useState('전체')
  const [sortBy, setSortBy] = useState('추천순')

  // Mock data - 실제 환경에서는 API에서 가져옴
  const mockProducts: Product[] = [
    {
      id: 1,
      brand: 'MALBON GOLF',
      name: '말본 프리미엄 폴로셔츠 (화이트)',
      price: 82500,
      originalPrice: 150000,
      discount: 45,
      moq: 8,
      badge: 'SALE',
      image: 'https://images.unsplash.com/photo-1544966503-7cc5ac882d5f?w=300&h=400&fit=crop'
    },
    {
      id: 2,
      brand: 'SOUTHCAPE',
      name: '사우스케이프 프로 골프화 (화이트/네이비)',
      price: 205000,
      originalPrice: 250000,
      discount: 18,
      moq: 5,
      badge: null,
      image: 'https://images.unsplash.com/photo-1473496169904-658ba7c44d8a?w=300&h=400&fit=crop'
    },
    {
      id: 3,
      brand: 'St.Andrews',
      name: '세인트앤드류스 클래식 레더 벨트',
      price: 84000,
      originalPrice: 120000,
      discount: 30,
      moq: 15,
      badge: 'HOT',
      image: 'https://images.unsplash.com/photo-1544966503-7cc5ac882d5f?w=300&h=400&fit=crop'
    },
    {
      id: 4,
      brand: 'G/FORE',
      name: '지포어 퍼포먼스 쇼츠',
      price: 67500,
      originalPrice: 90000,
      discount: 25,
      moq: 12,
      badge: null,
      image: 'https://images.unsplash.com/photo-1521369909029-2afed882baee?w=300&h=400&fit=crop'
    },
    {
      id: 5,
      brand: 'MALBON GOLF',
      name: '말본 골프백 프리미엄',
      price: 225000,
      originalPrice: 300000,
      discount: 25,
      moq: 3,
      badge: 'BEST',
      image: 'https://images.unsplash.com/photo-1544966503-7cc5ac882d5f?w=300&h=400&fit=crop'
    },
    {
      id: 6,
      brand: 'SOUTHCAPE',
      name: '사우스케이프 바이저 캡',
      price: 45000,
      originalPrice: 60000,
      discount: 25,
      moq: 20,
      badge: null,
      image: 'https://images.unsplash.com/photo-1473496169904-658ba7c44d8a?w=300&h=400&fit=crop'
    }
  ]

  const brands = ['전체', 'MALBON GOLF', 'SOUTHCAPE', 'St.Andrews', 'G/FORE']
  const sortOptions = ['추천순', '신상품순', '판매량순', '낮은가격순', '높은가격순']

  useEffect(() => {
    // 실제 환경에서는 API 호출
    // const fetchProducts = async () => {
    //   try {
    //     const response = await fetch('/api/products')
    //     const data = await response.json()
    //     setProducts(data.products || [])
    //   } catch (error) {
    //     console.error('Failed to fetch products:', error)
    //   } finally {
    //     setLoading(false)
    //   }
    // }
    // fetchProducts()

    // Mock data 사용
    setProducts(mockProducts)
    setLoading(false)
  }, [])

  const filteredProducts = selectedBrand === '전체' 
    ? products 
    : products.filter(product => product.brand === selectedBrand)

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">상품을 불러오는 중...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="text-2xl font-bold text-gray-900 hover:text-blue-600">
              K-Fashion
            </Link>
            <nav className="hidden md:flex space-x-8">
              <Link href="/" className="text-gray-600 hover:text-gray-900">홈</Link>
              <Link href="/products" className="text-blue-600 font-medium">상품</Link>
              <Link href="/brands" className="text-gray-600 hover:text-gray-900">브랜드</Link>
            </nav>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">전체 상품</h1>
          <p className="text-gray-600">K-Fashion의 모든 상품을 확인하세요</p>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            {/* Brand Filter */}
            <div className="flex flex-wrap gap-2">
              {brands.map((brand) => (
                <button
                  key={brand}
                  onClick={() => setSelectedBrand(brand)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                    selectedBrand === brand
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {brand}
                </button>
              ))}
            </div>

            {/* Sort Options */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {sortOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredProducts.map((product) => (
            <Link
              key={product.id}
              href={`/products/${product.id}`}
              className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow overflow-hidden group"
            >
              <div className="relative">
                <img
                  src={product.image}
                  alt={product.name}
                  className="w-full h-64 object-cover group-hover:scale-105 transition-transform duration-300"
                />
                {product.badge && (
                  <div className={`absolute top-3 left-3 px-2 py-1 rounded text-xs font-bold text-white ${
                    product.badge === 'SALE' ? 'bg-red-500' :
                    product.badge === 'HOT' ? 'bg-orange-500' :
                    product.badge === 'BEST' ? 'bg-purple-500' : 'bg-gray-500'
                  }`}>
                    {product.badge}
                  </div>
                )}
                {product.discount > 0 && (
                  <div className="absolute top-3 right-3 bg-red-500 text-white px-2 py-1 rounded text-xs font-bold">
                    -{product.discount}%
                  </div>
                )}
              </div>

              <div className="p-4">
                <div className="text-sm text-gray-500 mb-1">{product.brand}</div>
                <h3 className="font-medium text-gray-900 mb-2 line-clamp-2">{product.name}</h3>
                
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-lg font-bold text-gray-900">
                    ₩{product.price.toLocaleString()}
                  </span>
                  {product.originalPrice > product.price && (
                    <span className="text-sm text-gray-500 line-through">
                      ₩{product.originalPrice.toLocaleString()}
                    </span>
                  )}
                </div>

                <div className="text-sm text-gray-600">
                  최소주문: {product.moq}개
                </div>
              </div>
            </Link>
          ))}
        </div>

        {filteredProducts.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-500 text-lg">선택한 브랜드의 상품이 없습니다.</div>
          </div>
        )}
      </div>
    </div>
  )
}