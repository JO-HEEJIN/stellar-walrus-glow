import Link from 'next/link'
import { redirect } from 'next/navigation'
import { auth } from '@/auth'

export default async function RegisterPage() {
  // Check if already authenticated
  const session = await auth()
  if (session) {
    redirect('/dashboard')
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="mt-6 text-center text-3xl font-bold tracking-tight text-gray-900">
          회원가입
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          K-Fashion 도매 플랫폼에 가입하세요
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white px-4 py-8 shadow sm:rounded-lg sm:px-10">
          <div className="space-y-6">
            <div className="rounded-md bg-blue-50 p-4">
              <div className="flex">
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-blue-800">회원가입 안내</h3>
                  <div className="mt-2 text-sm text-blue-700">
                    <p>AWS Cognito를 통해 회원가입이 진행됩니다.</p>
                    <p className="mt-1">가입 후 관리자 승인이 필요할 수 있습니다.</p>
                  </div>
                </div>
              </div>
            </div>

            <form action={async () => {
              'use server'
              const { signIn } = await import('@/auth')
              // Cognito will handle the registration flow
              await signIn('cognito', {
                redirectTo: '/dashboard'
              })
            }}>
              <button
                type="submit"
                className="flex w-full justify-center rounded-md bg-primary px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-primary/90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
              >
                AWS Cognito로 회원가입
              </button>
            </form>

            <div className="text-center">
              <span className="text-sm text-gray-600">
                이미 계정이 있으신가요?{' '}
                <Link href="/login" className="font-medium text-primary hover:text-primary/90">
                  로그인
                </Link>
              </span>
            </div>

            <div className="text-center">
              <Link href="/" className="text-sm text-gray-600 hover:text-gray-900">
                홈으로 돌아가기
              </Link>
            </div>
          </div>
        </div>

        <div className="mt-6">
          <div className="rounded-md bg-yellow-50 p-4">
            <div className="flex">
              <div className="ml-3">
                <h3 className="text-sm font-medium text-yellow-800">회원 유형</h3>
                <div className="mt-2 text-sm text-yellow-700 space-y-1">
                  <p><strong>바이어(BUYER):</strong> 상품 구매 및 주문</p>
                  <p><strong>브랜드 관리자(BRAND_ADMIN):</strong> 브랜드 상품 관리</p>
                  <p><strong>마스터 관리자(MASTER_ADMIN):</strong> 플랫폼 전체 관리</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}