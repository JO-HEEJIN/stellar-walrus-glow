import { requireAuth } from '@/lib/auth'
import { redirect } from 'next/navigation'

export default async function BrandsPage() {
  const user = await requireAuth()

  // Only BRAND_ADMIN and MASTER_ADMIN can access this page
  if (!['BRAND_ADMIN', 'MASTER_ADMIN'].includes(user.role)) {
    redirect('/unauthorized')
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <h1 className="text-2xl font-semibold text-gray-900">브랜드 관리</h1>
          <p className="mt-2 text-sm text-gray-700">
            브랜드 정보를 관리합니다.
          </p>
        </div>
        {user.role === 'MASTER_ADMIN' && (
          <div className="mt-4 sm:ml-16 sm:mt-0 sm:flex-none">
            <button
              type="button"
              className="block rounded-md bg-primary px-3 py-2 text-center text-sm font-semibold text-white shadow-sm hover:bg-primary/90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
            >
              브랜드 추가
            </button>
          </div>
        )}
      </div>

      <div className="mt-8">
        <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 sm:rounded-lg">
          <table className="min-w-full divide-y divide-gray-300">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                  브랜드명
                </th>
                <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                  대표자
                </th>
                <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                  연락처
                </th>
                <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                  등록일
                </th>
                <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                  상태
                </th>
                <th className="relative py-3.5 pl-3 pr-4 sm:pr-6">
                  <span className="sr-only">편집</span>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              <tr>
                <td colSpan={6} className="whitespace-nowrap px-3 py-8 text-sm text-gray-500">
                  <div className="text-center text-gray-400">
                    등록된 브랜드가 없습니다.
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}