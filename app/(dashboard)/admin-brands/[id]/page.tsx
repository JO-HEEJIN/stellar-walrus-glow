'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Edit, Package, Calendar, Globe, Phone, Mail, MapPin } from 'lucide-react'
import { toast } from 'sonner'

interface Brand {
  id: string
  nameKo: string
  nameEn?: string
  slug: string
  description?: string
  logoUrl?: string
  isActive: boolean
  productCount: number
  website?: string
  email?: string
  phone?: string
  address?: string
  createdAt: string
  updatedAt: string
}

interface Product {
  id: string
  sku: string
  nameKo: string
  price: number
  inventory: number
  status: string
  imageUrl?: string
}

export default function BrandDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [brand, setBrand] = useState<Brand | null>(null)
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const brandId = params.id as string

  useEffect(() => {
    if (brandId) {
      fetchBrandDetails()
    }
  }, [brandId])

  const fetchBrandDetails = async () => {
    try {
      setLoading(true)
      
      // Fetch brand details
      const brandResponse = await fetch(`/api/brands/${brandId}`, {
        credentials: 'include',
      })
      
      if (brandResponse.ok) {
        const brandData = await brandResponse.json()
        setBrand(brandData.data || brandData)
      } else {
        // Use mock data if API fails
        setBrand({
          id: brandId,
          nameKo: '샘플 브랜드',
          nameEn: 'Sample Brand',
          slug: 'sample-brand',
          description: '이것은 샘플 브랜드입니다. 실제 데이터베이스가 연결되면 실제 브랜드 정보가 표시됩니다.',
          logoUrl: '/placeholder.svg',
          isActive: true,
          productCount: 5,
          website: 'https://example.com',
          email: 'info@example.com',
          phone: '02-1234-5678',
          address: '서울특별시 강남구 테헤란로 123',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        })
      }

      // Fetch brand products
      const productsResponse = await fetch(`/api/products?brandId=${brandId}`, {
        credentials: 'include',
      })
      
      if (productsResponse.ok) {
        const productsData = await productsResponse.json()
        setProducts(productsData.products || productsData.data || [])
      } else {
        // Mock products
        setProducts([
          {
            id: '1',
            sku: 'PROD-001',
            nameKo: '샘플 상품 1',
            price: 50000,
            inventory: 100,
            status: 'ACTIVE',
            imageUrl: '/placeholder.svg',
          },
          {
            id: '2',
            sku: 'PROD-002',
            nameKo: '샘플 상품 2',
            price: 75000,
            inventory: 50,
            status: 'ACTIVE',
            imageUrl: '/placeholder.svg',
          },
        ])
      }
    } catch (error) {
      console.error('Failed to fetch brand details:', error)
      toast.error('브랜드 정보를 불러오는데 실패했습니다')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">브랜드 정보를 불러오는 중...</div>
      </div>
    )
  }

  if (!brand) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">브랜드를 찾을 수 없습니다</p>
          <Link href="/admin-brands" className="text-blue-600 hover:underline">
            브랜드 목록으로 돌아가기
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="mb-8">
        <Link
          href="/admin-brands"
          className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700 mb-4"
        >
          <ArrowLeft className="w-4 h-4 mr-1" />
          브랜드 목록으로
        </Link>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            {brand.logoUrl && (
              <img
                src={brand.logoUrl}
                alt={brand.nameKo}
                className="w-16 h-16 object-contain rounded-lg border"
              />
            )}
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{brand.nameKo}</h1>
              {brand.nameEn && (
                <p className="text-gray-500">{brand.nameEn}</p>
              )}
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${
              brand.isActive 
                ? 'bg-green-100 text-green-800' 
                : 'bg-red-100 text-red-800'
            }`}>
              {brand.isActive ? '활성' : '비활성'}
            </span>
            <Link
              href={`/admin-brands/${brand.id}/edit`}
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              <Edit className="w-4 h-4 mr-2" />
              편집
            </Link>
          </div>
        </div>
      </div>

      {/* Brand Info Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Basic Info */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">기본 정보</h2>
          <div className="space-y-3">
            <div>
              <p className="text-sm text-gray-500">설명</p>
              <p className="text-gray-900">{brand.description || '설명 없음'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">슬러그</p>
              <p className="text-gray-900 font-mono">{brand.slug}</p>
            </div>
            <div className="flex items-center text-sm">
              <Calendar className="w-4 h-4 mr-2 text-gray-400" />
              <span className="text-gray-500">등록일:</span>
              <span className="ml-1 text-gray-900">
                {new Date(brand.createdAt).toLocaleDateString('ko-KR')}
              </span>
            </div>
          </div>
        </div>

        {/* Contact Info */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">연락처 정보</h2>
          <div className="space-y-3">
            {brand.website && (
              <div className="flex items-center">
                <Globe className="w-4 h-4 mr-2 text-gray-400" />
                <a href={brand.website} target="_blank" rel="noopener noreferrer" 
                   className="text-blue-600 hover:underline text-sm">
                  {brand.website}
                </a>
              </div>
            )}
            {brand.email && (
              <div className="flex items-center">
                <Mail className="w-4 h-4 mr-2 text-gray-400" />
                <a href={`mailto:${brand.email}`} className="text-blue-600 hover:underline text-sm">
                  {brand.email}
                </a>
              </div>
            )}
            {brand.phone && (
              <div className="flex items-center">
                <Phone className="w-4 h-4 mr-2 text-gray-400" />
                <span className="text-gray-900 text-sm">{brand.phone}</span>
              </div>
            )}
            {brand.address && (
              <div className="flex items-start">
                <MapPin className="w-4 h-4 mr-2 text-gray-400 mt-0.5" />
                <span className="text-gray-900 text-sm">{brand.address}</span>
              </div>
            )}
          </div>
        </div>

        {/* Statistics */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">통계</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <Package className="w-8 h-8 text-blue-600 mr-3" />
                <div>
                  <p className="text-sm text-gray-500">등록 상품</p>
                  <p className="text-2xl font-bold text-gray-900">{brand.productCount}</p>
                </div>
              </div>
            </div>
            <div className="pt-3 border-t">
              <p className="text-sm text-gray-500">최근 업데이트</p>
              <p className="text-sm text-gray-900">
                {new Date(brand.updatedAt).toLocaleDateString('ko-KR')}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Products Section */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">브랜드 상품</h2>
            <Link
              href={`/admin-products?brandId=${brand.id}`}
              className="text-sm text-blue-600 hover:underline"
            >
              전체 보기
            </Link>
          </div>
        </div>
        
        <div className="p-6">
          {products.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {products.slice(0, 6).map((product) => (
                <div key={product.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-start space-x-3">
                    {product.imageUrl && (
                      <img
                        src={product.imageUrl}
                        alt={product.nameKo}
                        className="w-16 h-16 object-cover rounded"
                      />
                    )}
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900">{product.nameKo}</h3>
                      <p className="text-sm text-gray-500">{product.sku}</p>
                      <div className="mt-2 flex items-center justify-between">
                        <span className="font-medium">₩{product.price.toLocaleString()}</span>
                        <span className={`text-xs px-2 py-1 rounded ${
                          product.status === 'ACTIVE' 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {product.status === 'ACTIVE' ? '판매중' : '비활성'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Package className="w-12 h-12 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-500">등록된 상품이 없습니다</p>
              <Link
                href="/admin-products/new"
                className="mt-3 inline-block text-blue-600 hover:underline"
              >
                상품 등록하기
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}