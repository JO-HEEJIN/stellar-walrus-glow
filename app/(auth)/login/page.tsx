import Link from 'next/link'
import { redirect } from 'next/navigation'
import { auth } from '@/auth'

export default async function LoginPage({
  searchParams,
}: {
  searchParams: { callbackUrl?: string; error?: string }
}) {
  // Check if already authenticated
  const session = await auth()
  if (session) {
    redirect(searchParams.callbackUrl || '/dashboard')
  }

  const error = searchParams.error

  return (
    <div className="flex min-h-screen flex-col items-center justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="mt-6 text-center text-3xl font-bold tracking-tight text-gray-900">
          로그인
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          K-Fashion 도매 플랫폼에 오신 것을 환영합니다
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white px-4 py-8 shadow sm:rounded-lg sm:px-10">
          {error && (
            <div className="mb-4 rounded-md bg-red-50 p-4">
              <div className="text-sm text-red-800">
                {error === 'OAuthSignin' && '로그인 시작 중 오류가 발생했습니다.'}
                {error === 'OAuthCallback' && '인증 처리 중 오류가 발생했습니다.'}
                {error === 'OAuthCreateAccount' && '계정 생성 중 오류가 발생했습니다.'}
                {error === 'EmailCreateAccount' && '계정 생성 중 오류가 발생했습니다.'}
                {error === 'Callback' && '로그인 처리 중 오류가 발생했습니다.'}
                {error === 'OAuthAccountNotLinked' && '이미 다른 방법으로 가입된 이메일입니다.'}
                {error === 'Default' && '로그인 중 오류가 발생했습니다.'}
              </div>
            </div>
          )}

          <div className="space-y-6">
            <form action={async () => {
              'use server'
              const { signIn } = await import('@/auth')
              await signIn('cognito', {
                redirectTo: searchParams.callbackUrl || '/dashboard'
              })
            }}>
              <button
                type="submit"
                className="flex w-full justify-center rounded-md bg-primary px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-primary/90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
              >
                AWS Cognito로 로그인
              </button>
            </form>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="bg-white px-2 text-gray-500">또는</span>
              </div>
            </div>

            <div className="text-center">
              <span className="text-sm text-gray-600">
                계정이 없으신가요?{' '}
                <Link href="/register" className="font-medium text-primary hover:text-primary/90">
                  회원가입
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
          <div className="rounded-md bg-blue-50 p-4">
            <div className="flex">
              <div className="ml-3">
                <h3 className="text-sm font-medium text-blue-800">테스트 안내</h3>
                <div className="mt-2 text-sm text-blue-700">
                  <p>AWS Cognito 사용자 풀에 등록된 계정으로 로그인하세요.</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-6">
          <div className="rounded-md bg-yellow-50 p-4">
            <div className="flex">
              <div className="ml-3">
                <h3 className="text-sm font-medium text-yellow-800">Cognito 설정 확인</h3>
                <div className="mt-2 text-sm text-yellow-700 space-y-1">
                  <p>Cognito App Client에서 다음 설정을 확인하세요:</p>
                  <p className="font-mono text-xs">Callback URL: {process.env.NEXTAUTH_URL}/api/auth/callback/cognito</p>
                  <p className="font-mono text-xs">Sign out URL: {process.env.NEXTAUTH_URL}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}