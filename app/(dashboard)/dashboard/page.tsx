import { requireAuth } from '@/lib/auth'

export default async function DashboardPage() {
  const user = await requireAuth()

  return (
    <div className="mx-auto max-w-7xl py-6 sm:px-6 lg:px-8">
      <div className="px-4 py-6 sm:px-0">
        <h1 className="text-3xl font-bold tracking-tight text-gray-900 mb-8">대시보드</h1>
        
        <div className="rounded-lg bg-white p-6 shadow">
          <h2 className="text-xl font-semibold mb-4">환영합니다!</h2>
          
          <div className="space-y-2">
            <p className="text-gray-600">
              <span className="font-medium">이메일:</span> {user.email}
            </p>
            <p className="text-gray-600">
              <span className="font-medium">권한:</span> {user.role || 'BUYER'}
            </p>
            {user.brandId && (
              <p className="text-gray-600">
                <span className="font-medium">브랜드 ID:</span> {user.brandId}
              </p>
            )}
          </div>

          <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <div className="rounded-lg border border-gray-200 p-4">
              <h3 className="font-medium text-gray-900">상품 관리</h3>
              <p className="mt-1 text-sm text-gray-500">상품을 등록하고 관리합니다</p>
              <a href="/products" className="mt-3 inline-block text-sm font-medium text-primary hover:text-primary/90">
                바로가기 →
              </a>
            </div>

            <div className="rounded-lg border border-gray-200 p-4">
              <h3 className="font-medium text-gray-900">주문 관리</h3>
              <p className="mt-1 text-sm text-gray-500">주문 내역을 확인하고 처리합니다</p>
              <a href="/orders" className="mt-3 inline-block text-sm font-medium text-primary hover:text-primary/90">
                바로가기 →
              </a>
            </div>

            {['BRAND_ADMIN', 'MASTER_ADMIN'].includes(user.role) && (
              <div className="rounded-lg border border-gray-200 p-4">
                <h3 className="font-medium text-gray-900">브랜드 관리</h3>
                <p className="mt-1 text-sm text-gray-500">브랜드 정보를 관리합니다</p>
                <a href="/brands" className="mt-3 inline-block text-sm font-medium text-primary hover:text-primary/90">
                  바로가기 →
                </a>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}