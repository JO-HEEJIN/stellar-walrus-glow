'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import CartButton from '@/components/cart/cart-button'
import NotificationBell from '@/components/notifications/notification-bell'
import { STORES } from '@/lib/config/stores'

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
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const router = useRouter()

  useEffect(() => {
    const checkAuth = async () => {
      try {
        // 개발 모드에서 인증 우회
        if (process.env.NODE_ENV === 'development' || process.env.NEXT_PUBLIC_SKIP_AUTH === 'true') {
          console.log('🔧 Development mode: skipping auth check in dashboard layout')
          setUser({
            username: 'dev-user',
            email: 'dev@kfashion.com',
            role: 'MASTER_ADMIN'
          })
          setIsLoading(false)
          return
        }

        const response = await fetch('/api/auth/me', {
          credentials: 'include'
        })
        if (response.ok) {
          const data = await response.json()
          setUser(data.user)
        } else {
          console.log('Auth failed, redirecting to login')
          router.push('/login')
        }
      } catch (error) {
        console.error('Auth check error:', error)
        
        // 개발 환경에서는 에러 시에도 우회
        if (process.env.NODE_ENV === 'development') {
          console.log('🔧 Development mode: using fallback user due to auth error')
          setUser({
            username: 'dev-user-fallback',
            email: 'dev-fallback@kfashion.com',
            role: 'MASTER_ADMIN'
          })
        } else {
          router.push('/login')
        }
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
                    href="/my-page"
                    className="rounded-md px-3 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                  >
                    마이페이지
                  </Link>
                  <Link
                    href="/admin-products"
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
                        href="/inventory"
                        className="rounded-md px-3 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                      >
                        재고 관리
                      </Link>
                      <Link
                        href="/analytics"
                        className="rounded-md px-3 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                      >
                        분석
                      </Link>
                      <Link
                        href="/admin-brands"
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
                <div className="mr-3">
                  <NotificationBell userId={user.email} userRole={user.role} />
                </div>
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
            {/* Mobile menu button */}
            <div className="flex md:hidden">
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="inline-flex items-center justify-center rounded-md p-2 text-gray-600 hover:bg-gray-100 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500"
                aria-expanded="false"
              >
                <span className="sr-only">메인 메뉴 열기</span>
                {!isMobileMenuOpen ? (
                  <svg className="block h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
                  </svg>
                ) : (
                  <svg className="block h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile menu */}
        <div className={`md:hidden ${isMobileMenuOpen ? 'block' : 'hidden'}`}>
          <div className="space-y-1 px-2 pb-3 pt-2">
            <Link
              href="/dashboard"
              onClick={() => setIsMobileMenuOpen(false)}
              className="block rounded-md px-3 py-2 text-base font-medium text-gray-900 hover:bg-gray-100"
            >
              대시보드
            </Link>
            <Link
              href="/my-page"
              onClick={() => setIsMobileMenuOpen(false)}
              className="block rounded-md px-3 py-2 text-base font-medium text-gray-600 hover:bg-gray-100 hover:text-gray-900"
            >
              마이페이지
            </Link>
            <Link
              href="/admin-products"
              onClick={() => setIsMobileMenuOpen(false)}
              className="block rounded-md px-3 py-2 text-base font-medium text-gray-600 hover:bg-gray-100 hover:text-gray-900"
            >
              상품 관리
            </Link>
            <Link
              href="/orders"
              onClick={() => setIsMobileMenuOpen(false)}
              className="block rounded-md px-3 py-2 text-base font-medium text-gray-600 hover:bg-gray-100 hover:text-gray-900"
            >
              주문 관리
            </Link>
            {user.role === 'BUYER' && (
              <Link
                href="/cart"
                onClick={() => setIsMobileMenuOpen(false)}
                className="block rounded-md px-3 py-2 text-base font-medium text-gray-600 hover:bg-gray-100 hover:text-gray-900"
              >
                장바구니
              </Link>
            )}
            {['BRAND_ADMIN', 'MASTER_ADMIN'].includes(user.role) && (
              <>
                <Link
                  href="/inventory"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="block rounded-md px-3 py-2 text-base font-medium text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                >
                  재고 관리
                </Link>
                <Link
                  href="/analytics"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="block rounded-md px-3 py-2 text-base font-medium text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                >
                  분석
                </Link>
                <Link
                  href="/admin-brands"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="block rounded-md px-3 py-2 text-base font-medium text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                >
                  브랜드 관리
                </Link>
              </>
            )}
            {user.role === 'MASTER_ADMIN' && (
              <Link
                href="/users"
                onClick={() => setIsMobileMenuOpen(false)}
                className="block rounded-md px-3 py-2 text-base font-medium text-gray-600 hover:bg-gray-100 hover:text-gray-900"
              >
                사용자 관리
              </Link>
            )}
          </div>
          <div className="border-t border-gray-200 px-2 py-3">
            <div className="px-3">
              {user.role === 'BUYER' && (
                <div className="mb-3">
                  <CartButton />
                </div>
              )}
              <div className="mb-3 flex items-center justify-between">
                <div>
                  <div className="text-base font-medium text-gray-800">{user.username}</div>
                  <div className="text-sm font-medium text-gray-500">{user.role}</div>
                </div>
                <NotificationBell userId={user.email} userRole={user.role} />
              </div>
            </div>
            <div className="px-2">
              <button
                onClick={handleLogout}
                className="block w-full rounded-md bg-red-600 px-3 py-2 text-center text-base font-medium text-white hover:bg-red-700"
              >
                로그아웃
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Store Navigation */}
      <div className="border-b border-gray-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-12 space-x-6 overflow-x-auto">
            {STORES.map((store) => (
              <Link
                key={store.id}
                href={store.path}
                className="inline-flex items-center whitespace-nowrap border-b-2 border-transparent px-1 py-3 text-sm font-medium text-gray-500 hover:border-gray-300 hover:text-gray-700 transition-colors duration-200"
              >
                <span className="mr-2">{store.icon}</span>
                {store.nameKo}
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Main content */}
      <main>{children}</main>
    </div>
  )
}