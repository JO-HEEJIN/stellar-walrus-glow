'use client'

import { useState, useEffect } from 'react'
import UserList from '@/components/users/user-list'

export default function UsersPage() {
  const [userRole, setUserRole] = useState<string>('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await fetch('/api/auth/me')
        if (response.ok) {
          const data = await response.json()
          console.log('📊 Users page auth data:', data)
          setUserRole(data.user.role)
        } else {
          console.error('Auth response failed:', response.status)
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

  // Only MASTER_ADMIN can access user management
  console.log('🔐 Current user role for users page:', userRole)
  if (userRole !== 'MASTER_ADMIN') {
    console.log('❌ Access denied - user role is not MASTER_ADMIN')
    return (
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="rounded-md bg-yellow-50 p-4">
          <p className="text-sm text-yellow-800">
            사용자 관리 페이지는 최고 관리자만 접근할 수 있습니다. (현재 역할: {userRole})
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <h1 className="text-2xl font-semibold text-gray-900">사용자 관리</h1>
          <p className="mt-2 text-sm text-gray-700">
            플랫폼 사용자를 관리합니다.
          </p>
        </div>
        <div className="mt-4 sm:ml-16 sm:mt-0 sm:flex-none">
          <button
            type="button"
            className="block rounded-md bg-primary px-3 py-2 text-center text-sm font-semibold text-white shadow-sm hover:bg-primary/90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
          >
            사용자 초대
          </button>
        </div>
      </div>

      <div className="mt-8">
        <UserList userRole={userRole} />
      </div>
    </div>
  )
}