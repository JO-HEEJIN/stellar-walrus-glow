'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'

function ConfirmEmailContent() {
  const [confirmationCode, setConfirmationCode] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const router = useRouter()
  const searchParams = useSearchParams()
  
  const username = searchParams.get('username')
  const email = searchParams.get('email')

  useEffect(() => {
    if (!username) {
      router.push('/register')
    }
  }, [username, router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    if (!confirmationCode.trim()) {
      setError('인증 코드를 입력해주세요')
      setIsLoading(false)
      return
    }

    try {
      const response = await fetch('/api/auth/confirm-signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          username, 
          confirmationCode: confirmationCode.trim() 
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || '인증에 실패했습니다')
      }

      setIsSuccess(true)
      setTimeout(() => {
        router.push('/login?message=이메일 인증이 완료되었습니다. 로그인해주세요.')
      }, 2000)
    } catch (err) {
      setError(err instanceof Error ? err.message : '인증 중 오류가 발생했습니다')
    } finally {
      setIsLoading(false)
    }
  }

  const handleResendCode = async () => {
    setError('')
    setIsLoading(true)

    try {
      const response = await fetch('/api/auth/resend-confirmation', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || '인증 코드 재전송에 실패했습니다')
      }

      alert('인증 코드가 재전송되었습니다. 이메일을 확인해주세요.')
    } catch (err) {
      setError(err instanceof Error ? err.message : '재전송 중 오류가 발생했습니다')
    } finally {
      setIsLoading(false)
    }
  }

  if (isSuccess) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full space-y-8 text-center">
          <div className="text-green-600">
            <h2 className="text-3xl font-bold">인증 완료!</h2>
            <p className="mt-2">로그인 페이지로 이동합니다...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            이메일 인증
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            {email ? `${email}로 전송된` : '이메일로 전송된'} 인증 코드를 입력하세요
          </p>
        </div>
        
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div>
            <label htmlFor="confirmationCode" className="block text-sm font-medium text-gray-700">
              인증 코드
            </label>
            <input
              id="confirmationCode"
              name="confirmationCode"
              type="text"
              required
              className="mt-1 appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
              placeholder="6자리 인증 코드를 입력하세요"
              value={confirmationCode}
              onChange={(e) => setConfirmationCode(e.target.value)}
              maxLength={6}
            />
          </div>

          {error && (
            <div className="text-red-600 text-sm text-center">{error}</div>
          )}

          <div>
            <button
              type="submit"
              disabled={isLoading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
            >
              {isLoading ? '인증 중...' : '인증하기'}
            </button>
          </div>

          <div className="text-center space-y-2">
            <button
              type="button"
              onClick={handleResendCode}
              disabled={isLoading}
              className="text-sm text-blue-600 hover:text-blue-500 disabled:opacity-50"
            >
              인증 코드 재전송
            </button>
            <div>
              <Link
                href="/register"
                className="text-sm text-gray-600 hover:text-gray-500"
              >
                회원가입으로 돌아가기
              </Link>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}

export default function ConfirmEmailPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">로딩 중...</p>
        </div>
      </div>
    }>
      <ConfirmEmailContent />
    </Suspense>
  )
}