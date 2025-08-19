'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Filter, Grid, List, ChevronDown, Heart, ShoppingCart } from 'lucide-react'
import { formatPrice } from '@/lib/utils'
import { useCartStore } from '@/lib/stores/cart'
import { toast } from 'sonner'

interface Product {
  id: string
  sku: string
  name: string
  brandName: string
  basePrice: number
  discountPrice?: number
  imageUrl?: string
  category: string
  subCategory: string
  inventory: number
  minOrderQty: number
  tags: string[]
  rating?: number
  reviewCount?: number
  isNew?: boolean
  isBest?: boolean
  discount?: number
}

const subcategories = [
  { id: 'all', name: '전체', count: 0 },
  { id: 'outer', name: '아우터', count: 0 },
  { id: 'tops', name: '상의', count: 0 },
  { id: 'bottoms', name: '하의', count: 0 },
  { id: 'accessories', name: '액세서리', count: 0 },
  { id: 'shoes', name: '신발', count: 0 },
]

const sortOptions = [
  { value: 'popular', label: '인기순' },
  { value: 'newest', label: '최신순' },
  { value: 'price_low', label: '가격 낮은순' },
  { value: 'price_high', label: '가격 높은순' },
  { value: 'rating', label: '평점순' },
  { value: 'discount', label: '할인순' },
]

const priceRanges = [
  { min: 0, max: 50000, label: '5만원 이하' },
  { min: 50000, max: 100000, label: '5-10만원' },
  { min: 100000, max: 200000, label: '10-20만원' },
  { min: 200000, max: 500000, label: '20-50만원' },
  { min: 500000, max: Infinity, label: '50만원 이상' },
]

export default function MenCategoryPage() {
  const { addItem } = useCartStore()
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [selectedSubcategory, setSelectedSubcategory] = useState('all')
  const [sortBy, setSortBy] = useState('popular')
  const [selectedPriceRange, setSelectedPriceRange] = useState<number | null>(null)
  const [showFilters, setShowFilters] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const itemsPerPage = 24

  useEffect(() => {
    loadProducts()
  }, [selectedSubcategory, sortBy, selectedPriceRange, currentPage])

  const loadProducts = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams({
        category: 'men',
        page: currentPage.toString(),
        limit: itemsPerPage.toString(),
        sort: sortBy,
      })
      
      if (selectedSubcategory !== 'all') {
        params.append('subcategory', selectedSubcategory)
      }
      
      if (selectedPriceRange !== null) {
        const range = priceRanges[selectedPriceRange]
        params.append('minPrice', range.min.toString())
        if (range.max !== Infinity) {
          params.append('maxPrice', range.max.toString())
        }
      }

      const response = await fetch(`/api/products?${params.toString()}`, {
        credentials: 'include',
      })

      if (response.ok) {
        const data = await response.json()
        setProducts(data.products || [])
        setTotalPages(Math.ceil(data.total / itemsPerPage))
      }
    } catch (error) {
      console.error('상품 로드 실패:', error)
      // Mock data for development
      const mockProducts: Product[] = [
        {
          id: '1',
          sku: 'MEN-OUT-001',
          name: '프리미엄 울 코트',
          brandName: 'PREMIUM BRAND',
          basePrice: 450000,
          discountPrice: 360000,
          imageUrl: '/placeholder.svg',
          category: 'men',
          subCategory: 'outer',
          inventory: 20,
          minOrderQty: 1,
          tags: ['outer', 'coat', 'wool', 'premium'],
          rating: 4.8,
          reviewCount: 24,
          isNew: false,
          isBest: true,
          discount: 20
        },
        {
          id: '2',
          sku: 'MEN-TOP-002',
          name: '코튼 말신 티셔츠',
          brandName: 'COTTON LABS',
          basePrice: 89000,
          imageUrl: '/placeholder.svg',
          category: 'men',
          subCategory: 'tops',
          inventory: 150,
          minOrderQty: 5,
          tags: ['tops', 'tshirt', 'cotton', 'casual'],
          rating: 4.5,
          reviewCount: 87,
          isNew: true,
          isBest: false
        },
        {
          id: '3',
          sku: 'MEN-BOT-003',
          name: '스리따 청바지',
          brandName: 'DENIM WORKS',
          basePrice: 120000,
          discountPrice: 96000,
          imageUrl: '/placeholder.svg',
          category: 'men',
          subCategory: 'bottoms',
          inventory: 80,
          minOrderQty: 2,
          tags: ['bottoms', 'jeans', 'denim', 'slim'],
          rating: 4.3,
          reviewCount: 156,
          isNew: false,
          isBest: false,
          discount: 20
        },
        {
          id: '4',
          sku: 'MEN-ACC-004',
          name: '레더 비즈니스 벨트',
          brandName: 'LEATHER CRAFT',
          basePrice: 85000,
          imageUrl: '/placeholder.svg',
          category: 'men',
          subCategory: 'accessories',
          inventory: 45,
          minOrderQty: 3,
          tags: ['accessories', 'belt', 'leather', 'business'],
          rating: 4.6,
          reviewCount: 32,
          isNew: false,
          isBest: true
        }
      ]
      setProducts(mockProducts)
      setTotalPages(1)
    } finally {
      setLoading(false)
    }
  }

  const handleAddToCart = (product: Product) => {
    addItem({
      id: `${product.id}-${Date.now()}`,
      productId: product.id,
      name: product.name,
      brandName: product.brandName,
      price: product.discountPrice || product.basePrice,
      quantity: product.minOrderQty,
      imageUrl: product.imageUrl || '/placeholder.svg'
    })
    toast.success('장바구니에 추가되었습니다')
  }

  const filteredProducts = products.filter(product => {
    if (selectedSubcategory !== 'all' && product.subCategory !== selectedSubcategory) {
      return false
    }
    
    if (selectedPriceRange !== null) {
      const range = priceRanges[selectedPriceRange]
      const price = product.discountPrice || product.basePrice
      if (price < range.min || price > range.max) {
        return false
      }
    }
    
    return true
  })

  const ProductCard = ({ product, isListView = false }: { product: Product; isListView?: boolean }) => {
    const currentPrice = product.discountPrice || product.basePrice
    
    if (isListView) {
      return (
        <div className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
          <div className="flex items-center space-x-4">
            <Link href={`/products/${product.id}`}>
              <div className="relative w-20 h-20 bg-gray-100 rounded-lg overflow-hidden cursor-pointer">
                <img
                  src={product.imageUrl || '/placeholder.svg'}
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
                {product.discount && (
                  <div className="absolute top-1 left-1">
                    <span className="bg-red-500 text-white text-xs px-1 py-0.5 rounded">
                      -{product.discount}%
                    </span>
                  </div>
                )}
              </div>
            </Link>
            
            <div className="flex-1">
              <Link href={`/products/${product.id}`}>
                <h3 className="font-semibold text-gray-900 hover:text-blue-600 cursor-pointer">
                  {product.name}
                </h3>
              </Link>
              <p className="text-sm text-gray-600 mb-1">{product.brandName}</p>
              <p className="text-xs text-gray-500 mb-2">SKU: {product.sku}</p>
              
              <div className="flex items-center space-x-2 mb-2">
                {product.discountPrice ? (
                  <>
                    <span className="text-lg font-bold text-red-600">
                      {formatPrice(product.discountPrice)}
                    </span>
                    <span className="text-sm text-gray-500 line-through">
                      {formatPrice(product.basePrice)}
                    </span>
                  </>
                ) : (
                  <span className="text-lg font-bold text-gray-900">
                    {formatPrice(product.basePrice)}
                  </span>
                )}
              </div>
              
              <div className="flex items-center space-x-4 text-sm text-gray-600">
                <span>최소 주문: {product.minOrderQty}개</span>
                <span>재고: {product.inventory}개</span>
                {product.rating && (
                  <div className="flex items-center">
                    <span className="text-yellow-400">★</span>
                    <span className="ml-1">{product.rating}</span>
                    <span className="text-gray-400">({product.reviewCount})</span>
                  </div>
                )}
              </div>
            </div>
            
            <div className="flex flex-col space-y-2">
              <button className="p-2 border border-gray-300 rounded-lg text-gray-600 hover:text-red-600 hover:border-red-300 transition-colors">
                <Heart className="h-4 w-4" />
              </button>
              <button
                onClick={() => handleAddToCart(product)}
                className="inline-flex items-center px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <ShoppingCart className="h-4 w-4 mr-1" />
                담기
              </button>
            </div>
          </div>
        </div>
      )
    }

    return (
      <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
        <Link href={`/products/${product.id}`}>
          <div className="aspect-square relative bg-gray-100 cursor-pointer">
            <img
              src={product.imageUrl || '/placeholder.svg'}
              alt={product.name}
              className="w-full h-full object-cover"
            />
            
            {/* Badges */}
            <div className="absolute top-2 left-2 flex flex-col space-y-1">
              {product.isNew && (
                <span className="bg-green-500 text-white text-xs px-2 py-1 rounded">
                  NEW
                </span>
              )}
              {product.isBest && (
                <span className="bg-blue-500 text-white text-xs px-2 py-1 rounded">
                  BEST
                </span>
              )}
              {product.discount && (
                <span className="bg-red-500 text-white text-xs px-2 py-1 rounded">
                  -{product.discount}%
                </span>
              )}
            </div>
            
            {/* Wishlist Button */}
            <button className="absolute top-2 right-2 p-2 bg-white rounded-full shadow-md hover:bg-gray-50">
              <Heart className="h-4 w-4 text-gray-400 hover:text-red-500" />
            </button>
          </div>
        </Link>

        <div className="p-4">
          <Link href={`/products/${product.id}`}>
            <h3 className="text-lg font-semibold text-gray-900 mb-1 hover:text-blue-600 cursor-pointer line-clamp-2">
              {product.name}
            </h3>
          </Link>
          
          <p className="text-sm text-gray-600 mb-2">{product.brandName}</p>
          
          <div className="mb-3">
            {product.discountPrice ? (
              <div>
                <span className="text-lg font-bold text-red-600">
                  {formatPrice(product.discountPrice)}
                </span>
                <span className="text-sm text-gray-500 line-through ml-2">
                  {formatPrice(product.basePrice)}
                </span>
              </div>
            ) : (
              <span className="text-lg font-bold text-gray-900">
                {formatPrice(product.basePrice)}
              </span>
            )}
          </div>
          
          <div className="flex items-center justify-between text-sm text-gray-600 mb-3">
            <span>최소: {product.minOrderQty}개</span>
            <span>재고: {product.inventory}개</span>
          </div>
          
          {product.rating && (
            <div className="flex items-center mb-3">
              <span className="text-yellow-400 text-sm">★</span>
              <span className="text-sm text-gray-600 ml-1">
                {product.rating} ({product.reviewCount})
              </span>
            </div>
          )}
          
          <button
            onClick={() => handleAddToCart(product)}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center"
          >
            <ShoppingCart className="h-4 w-4 mr-2" />
            장바구니 담기
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-2 text-sm text-gray-500 mb-4">
            <Link href="/" className="hover:text-gray-700">홈</Link>
            <span>/</span>
            <span>남성</span>
          </div>
          <h1 className="text-3xl font-bold text-gray-900">남성 패션</h1>
          <p className="text-gray-600 mt-2">남성을 위한 다양한 패션 아이템을 만나보세요.</p>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar Filters */}
          <div className="lg:w-64">
            <div className="bg-white rounded-lg shadow p-6 sticky top-8">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-semibold text-gray-900">필터</h2>
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className="lg:hidden"
                >
                  <Filter className="h-5 w-5" />
                </button>
              </div>
              
              <div className={`space-y-6 ${showFilters ? 'block' : 'hidden lg:block'}`}>
                {/* Subcategories */}
                <div>
                  <h3 className="font-medium text-gray-900 mb-3">카테고리</h3>
                  <div className="space-y-2">
                    {subcategories.map((subcategory) => (
                      <label key={subcategory.id} className="flex items-center">
                        <input
                          type="radio"
                          name="subcategory"
                          value={subcategory.id}
                          checked={selectedSubcategory === subcategory.id}
                          onChange={(e) => setSelectedSubcategory(e.target.value)}
                          className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                        />
                        <span className="ml-2 text-sm text-gray-700">{subcategory.name}</span>
                      </label>
                    ))}
                  </div>
                </div>
                
                {/* Price Range */}
                <div>
                  <h3 className="font-medium text-gray-900 mb-3">가격대</h3>
                  <div className="space-y-2">
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="priceRange"
                        checked={selectedPriceRange === null}
                        onChange={() => setSelectedPriceRange(null)}
                        className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      />
                      <span className="ml-2 text-sm text-gray-700">전체</span>
                    </label>
                    {priceRanges.map((range, index) => (
                      <label key={index} className="flex items-center">
                        <input
                          type="radio"
                          name="priceRange"
                          checked={selectedPriceRange === index}
                          onChange={() => setSelectedPriceRange(index)}
                          className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                        />
                        <span className="ml-2 text-sm text-gray-700">{range.label}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1">
            {/* Controls */}
            <div className="bg-white rounded-lg shadow p-4 mb-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <span className="text-sm text-gray-600">
                    총 {filteredProducts.length}개 상품
                  </span>
                </div>
                
                <div className="flex items-center space-x-4">
                  {/* Sort */}
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {sortOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                  
                  {/* View Mode */}
                  <div className="flex items-center border border-gray-300 rounded-lg">
                    <button
                      onClick={() => setViewMode('grid')}
                      className={`p-2 rounded-l-lg ${
                        viewMode === 'grid' ? 'bg-blue-600 text-white' : 'text-gray-600 hover:bg-gray-50'
                      }`}
                    >
                      <Grid className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => setViewMode('list')}
                      className={`p-2 rounded-r-lg ${
                        viewMode === 'list' ? 'bg-blue-600 text-white' : 'text-gray-600 hover:bg-gray-50'
                      }`}
                    >
                      <List className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Products */}
            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {[...Array(8)].map((_, i) => (
                  <div key={i} className="bg-gray-200 rounded-lg h-80 animate-pulse"></div>
                ))}
              </div>
            ) : filteredProducts.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-gray-500 mb-4">
                  <Filter className="h-12 w-12 mx-auto mb-4" />
                  <p>해당 조건에 맞는 상품이 없습니다.</p>
                  <p className="text-sm mt-2">다른 필터 조건을 시도해보세요.</p>
                </div>
              </div>
            ) : (
              <>
                <div className={viewMode === 'grid' 
                  ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6'
                  : 'space-y-4'
                }>
                  {filteredProducts.map((product) => (
                    <ProductCard 
                      key={product.id} 
                      product={product} 
                      isListView={viewMode === 'list'}
                    />
                  ))}
                </div>
                
                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="mt-8 flex justify-center">
                    <div className="flex items-center space-x-2">
                      {[...Array(totalPages)].map((_, i) => (
                        <button
                          key={i}
                          onClick={() => setCurrentPage(i + 1)}
                          className={`px-3 py-2 rounded-lg text-sm font-medium ${
                            currentPage === i + 1
                              ? 'bg-blue-600 text-white'
                              : 'bg-white text-gray-700 hover:bg-gray-50'
                          }`}
                        >
                          {i + 1}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
