'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import CartButton from '@/components/cart/cart-button'

interface User {
  username: string
  email: string
  role: 'MASTER_ADMIN' | 'BRAND_ADMIN' | 'BUYER'
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await fetch('/api/auth/me')
        if (response.ok) {
          const data = await response.json()
          setUser(data.user)
        } else {
          router.push('/login')
        }
      } catch (error) {
        console.error('Auth check error:', error)
        router.push('/login')
      } finally {
        setIsLoading(false)
      }
    }

    checkAuth()
  }, [router])

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' })
      localStorage.removeItem('token')
      router.push('/')
    } catch (error) {
      console.error('Logout error:', error)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-lg">로딩 중...</div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="bg-white shadow">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Link href="/dashboard" className="text-xl font-bold text-gray-900">
                  K-Fashion
                </Link>
              </div>
              <div className="hidden md:block">
                <div className="ml-10 flex items-baseline space-x-4">
                  <Link
                    href="/dashboard"
                    className="rounded-md px-3 py-2 text-sm font-medium text-gray-900 hover:bg-gray-100"
                  >
                    대시보드
                  </Link>
                  <Link
                    href="/products"
                    className="rounded-md px-3 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                  >
                    상품 관리
                  </Link>
                  <Link
                    href="/orders"
                    className="rounded-md px-3 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                  >
                    주문 관리
                  </Link>
                  {user.role === 'BUYER' && (
                    <Link
                      href="/cart"
                      className="rounded-md px-3 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                    >
                      장바구니
                    </Link>
                  )}
                  {['BRAND_ADMIN', 'MASTER_ADMIN'].includes(user.role) && (
                    <>
                      <Link
                        href="/analytics"
                        className="rounded-md px-3 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                      >
                        분석
                      </Link>
                      <Link
                        href="/brands"
                        className="rounded-md px-3 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                      >
                        브랜드 관리
                      </Link>
                    </>
                  )}
                  {user.role === 'MASTER_ADMIN' && (
                    <Link
                      href="/users"
                      className="rounded-md px-3 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                    >
                      사용자 관리
                    </Link>
                  )}
                </div>
              </div>
            </div>
            <div className="hidden md:block">
              <div className="ml-4 flex items-center md:ml-6">
                {user.role === 'BUYER' && (
                  <div className="mr-3">
                    <CartButton />
                  </div>
                )}
                <div className="mr-3 text-sm text-gray-600">
                  <div>{user.username}</div>
                  <div className="text-xs text-gray-500">{user.role}</div>
                </div>
                <button 
                  onClick={handleLogout}
                  className="rounded-md bg-red-600 px-3 py-2 text-sm font-semibold text-white hover:bg-red-700"
                >
                  로그아웃
                </button>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Main content */}
      <main>{children}</main>
    </div>
  )
}