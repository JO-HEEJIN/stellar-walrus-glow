'use client'

import { useState, useEffect } from 'react'
import EnhancedOrderManagement from '@/components/orders/enhanced-order-management'

export default function OrdersPage() {
  const [userRole, setUserRole] = useState<string>('')
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState({})

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await fetch('/api/auth/me')
        if (response.ok) {
          const data = await response.json()
          setUserRole(data.user.role)
        }
      } catch (error) {
        console.error('Auth check error:', error)
      } finally {
        setLoading(false)
      }
    }

    checkAuth()
  }, [])

  if (loading) {
    return <div className="text-center py-4">로딩 중...</div>
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <h1 className="text-2xl font-semibold text-gray-900">주문 관리</h1>
          <p className="mt-2 text-sm text-gray-700">
            주문 내역을 확인하고 상태를 관리합니다.
          </p>
        </div>
        <div className="mt-4 sm:ml-16 sm:mt-0 sm:flex-none">
          <button
            onClick={() => window.location.href = '/orders/export'}
            className="block rounded-md bg-primary px-3 py-2 text-center text-sm font-semibold text-white shadow-sm hover:bg-primary/90"
          >
            주문 내역 내보내기
          </button>
        </div>
      </div>

      <div className="mt-8">
        <EnhancedOrderManagement userRole={userRole} filters={filters} />
      </div>
    </div>
  )
}