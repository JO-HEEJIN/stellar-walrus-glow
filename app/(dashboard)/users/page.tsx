import { requireAuth } from '@/lib/auth'
import { redirect } from 'next/navigation'

export default async function UsersPage() {
  const user = await requireAuth()

  // Only MASTER_ADMIN can access this page
  if (user.role !== 'MASTER_ADMIN') {
    redirect('/unauthorized')
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
        <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 sm:rounded-lg">
          <table className="min-w-full divide-y divide-gray-300">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                  이름
                </th>
                <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                  이메일
                </th>
                <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                  역할
                </th>
                <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                  소속
                </th>
                <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                  가입일
                </th>
                <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                  상태
                </th>
                <th className="relative py-3.5 pl-3 pr-4 sm:pr-6">
                  <span className="sr-only">관리</span>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              <tr>
                <td className="whitespace-nowrap px-3 py-4 text-sm font-medium text-gray-900">
                  관리자
                </td>
                <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                  {user.email}
                </td>
                <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                  {user.role}
                </td>
                <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                  플랫폼 관리자
                </td>
                <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                  -
                </td>
                <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                  <span className="inline-flex rounded-full bg-green-100 px-2 text-xs font-semibold leading-5 text-green-800">
                    활성
                  </span>
                </td>
                <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                  <a href="#" className="text-primary hover:text-primary/90">
                    편집
                  </a>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}