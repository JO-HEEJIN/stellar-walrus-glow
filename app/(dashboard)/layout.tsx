import { requireAuth } from '@/lib/auth'
import Link from 'next/link'
import SignOutButton from '@/components/auth/sign-out-button'
import CartButton from '@/components/cart/cart-button'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const user = await requireAuth()

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
                    <Link
                      href="/brands"
                      className="rounded-md px-3 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                    >
                      브랜드 관리
                    </Link>
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
                  {user.email}
                </div>
                <SignOutButton />
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