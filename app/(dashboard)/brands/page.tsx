'use client'

import { useState, useEffect } from 'react'
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
  createdAt: string
  updatedAt: string
}

export default function BrandsPage() {
  const [brands, setBrands] = useState<Brand[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [deletingId, setDeletingId] = useState<string | null>(null)

  useEffect(() => {
    const fetchBrands = async () => {
      try {
        setIsLoading(true)
        const response = await fetch('/api/brands')
        if (!response.ok) {
          throw new Error('브랜드 목록을 불러올 수 없습니다')
        }
        const data = await response.json()
        setBrands(data.data || [])
      } catch (err) {
        setError(err instanceof Error ? err.message : '데이터를 불러오는 중 오류가 발생했습니다')
      } finally {
        setIsLoading(false)
      }
    }

    fetchBrands()
  }, [])

  const handleDelete = async (brandId: string, brandName: string) => {
    if (!confirm(`정말로 "${brandName}" 브랜드를 삭제하시겠습니까?\n\n주의: 이 작업은 취소할 수 없습니다.`)) {
      return
    }

    setDeletingId(brandId)
    try {
      const response = await fetch(`/api/brands/${brandId}`, {
        method: 'DELETE',
        credentials: 'include',
      })

      if (!response.ok) {
        const data = await response.json()
        if (data.code === 'VALIDATION_FAILED' && data.details?.message?.includes('products')) {
          throw new Error('이 브랜드에 등록된 상품이 있어 삭제할 수 없습니다. 먼저 모든 상품을 삭제하거나 다른 브랜드로 이동시켜주세요.')
        }
        throw new Error(data.error || '브랜드 삭제에 실패했습니다')
      }

      // Remove the brand from the list or update its status
      const updatedBrands = brands.map(brand => 
        brand.id === brandId ? { ...brand, isActive: false } : brand
      )
      setBrands(updatedBrands)
      
      alert('브랜드가 비활성화되었습니다.')
    } catch (err) {
      alert(err instanceof Error ? err.message : '브랜드 삭제 중 오류가 발생했습니다')
    } finally {
      setDeletingId(null)
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
          <button 
            onClick={() => window.location.reload()}
            className="text-blue-600 hover:text-blue-800"
          >
            다시 시도
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Page Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">브랜드 관리</h1>
              <p className="mt-2 text-gray-600">등록된 브랜드를 관리하고 상세 정보를 확인하세요</p>
            </div>
            <Link href="/brands/new" className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 inline-block">
              새 브랜드 등록
            </Link>
          </div>
        </div>

        {/* Brands Grid */}
        {brands.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <div className="text-gray-400 text-lg mb-4">등록된 브랜드가 없습니다</div>
            <Link href="/brands/new" className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 inline-block">
              첫 브랜드 등록하기
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {brands.map((brand) => (
              <div key={brand.id} className="bg-white rounded-lg shadow hover:shadow-md transition-shadow">
                <div className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      {brand.logoUrl ? (
                        <div className="h-12 w-12 rounded-lg border overflow-hidden bg-gray-50 flex items-center justify-center">
                          <img 
                            src={brand.logoUrl} 
                            alt={brand.nameKo} 
                            className="max-w-full max-h-full object-contain"
                          />
                        </div>
                      ) : (
                        <div className="h-12 w-12 bg-gray-200 rounded-lg flex items-center justify-center">
                          <span className="text-gray-400 text-lg">🏢</span>
                        </div>
                      )}
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">{brand.nameKo}</h3>
                        {brand.nameCn && <p className="text-sm text-gray-500">{brand.nameCn}</p>}
                        <span className={`inline-flex px-2 py-1 rounded-full text-xs ${
                          brand.isActive 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {brand.isActive ? '활성' : '비활성'}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <p className="text-gray-600 text-sm mb-4">{brand.description || '브랜드 설명이 없습니다'}</p>
                  
                  <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                    <span>상품 {brand.productCount}개</span>
                    <span>생성일: {new Date(brand.createdAt).toLocaleDateString('ko-KR')}</span>
                  </div>
                  
                  <div className="flex space-x-2">
                    <Link 
                      href={`/brands/${brand.id}`}
                      className="flex-1 bg-blue-600 text-white px-3 py-2 rounded text-sm text-center hover:bg-blue-700"
                    >
                      상세 보기
                    </Link>
                    <Link 
                      href={`/brands/${brand.id}/edit`}
                      className="flex-1 bg-gray-600 text-white px-3 py-2 rounded text-sm hover:bg-gray-700 text-center"
                    >
                      편집
                    </Link>
                    <button
                      onClick={() => handleDelete(brand.id, brand.nameKo)}
                      disabled={deletingId === brand.id || !brand.isActive}
                      className={`px-3 py-2 rounded text-sm ${
                        brand.isActive
                          ? 'bg-red-600 text-white hover:bg-red-700'
                          : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      } ${deletingId === brand.id ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                      {deletingId === brand.id ? '삭제 중...' : brand.isActive ? '삭제' : '비활성'}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}