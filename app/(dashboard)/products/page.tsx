'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import ProductList from '@/components/products/product-list'

export default function ProductsPage() {
  const [user, setUser] = useState<{username: string, role: string} | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await fetch('/api/auth/me')
        if (response.ok) {
          const data = await response.json()
          setUser(data.user)
        }
      } catch (error) {
        console.error('Auth check error:', error)
      } finally {
        setIsLoading(false)
      }
    }

    checkAuth()
  }, [])

  if (isLoading) {
    return <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-lg">로딩 중...</div>
    </div>
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <h1 className="text-2xl font-semibold text-gray-900">
            {user?.role === 'BUYER' ? '상품 목록' : '상품 관리'}
          </h1>
          <p className="mt-2 text-sm text-gray-700">
            {user?.role === 'BUYER' 
              ? '상품을 둘러보고 장바구니에 담아보세요.'
              : '브랜드 상품을 등록하고 관리합니다.'
            }
          </p>
        </div>
        
        {/* 상품 등록 버튼은 BRAND_ADMIN과 MASTER_ADMIN만 볼 수 있음 */}
        {user?.role && ['BRAND_ADMIN', 'MASTER_ADMIN'].includes(user.role) && (
          <div className="mt-4 sm:ml-16 sm:mt-0 sm:flex-none">
            <Link
              href="/products/new"
              className="block rounded-md bg-blue-600 px-3 py-2 text-center text-sm font-semibold text-white shadow-sm hover:bg-blue-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
            >
              상품 등록
            </Link>
          </div>
        )}
      </div>

      <div className="mt-8">
        <ProductList userRole={user?.role || 'GUEST'} />
      </div>
    </div>
  )
}