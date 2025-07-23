'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function ForgotPasswordPage() {
  const [step, setStep] = useState<'request' | 'confirm'>('request')
  const [username, setUsername] = useState('')
  const [confirmationCode, setConfirmationCode] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleRequestReset = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    setIsLoading(true)

    try {
      const response = await fetch('/api/auth/forgot-password/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Failed to send reset code')
      }

      setSuccess('비밀번호 재설정 코드가 이메일로 전송되었습니다.')
      setStep('confirm')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setIsLoading(false)
    }
  }

  const handleConfirmReset = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess('')

    if (newPassword !== confirmPassword) {
      setError('새 비밀번호가 일치하지 않습니다.')
      return
    }

    if (newPassword.length < 8) {
      setError('비밀번호는 8자 이상이어야 합니다.')
      return
    }

    setIsLoading(true)

    try {
      const response = await fetch('/api/auth/confirm-forgot-password/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, confirmationCode, newPassword }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Failed to reset password')
      }

      setSuccess('비밀번호가 성공적으로 재설정되었습니다. 로그인 페이지로 이동합니다.')
      
      setTimeout(() => {
        router.push('/login')
      }, 2000)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            비밀번호 찾기
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            {step === 'request' 
              ? '사용자명을 입력하면 비밀번호 재설정 코드를 보내드립니다.'
              : '이메일로 받은 코드를 입력하고 새 비밀번호를 설정하세요.'
            }
          </p>
        </div>

        {step === 'request' ? (
          <form className="mt-8 space-y-6" onSubmit={handleRequestReset}>
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-gray-700">
                사용자명
              </label>
              <input
                id="username"
                name="username"
                type="text"
                required
                className="mt-1 appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                placeholder="kf001"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            </div>

            {error && (
              <div className="text-red-600 text-sm text-center">{error}</div>
            )}

            {success && (
              <div className="text-green-600 text-sm text-center">{success}</div>
            )}

            <div>
              <button
                type="submit"
                disabled={isLoading}
                className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
              >
                {isLoading ? '코드 전송 중...' : '재설정 코드 전송'}
              </button>
            </div>
          </form>
        ) : (
          <form className="mt-8 space-y-6" onSubmit={handleConfirmReset}>
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
                placeholder="이메일로 받은 6자리 코드"
                value={confirmationCode}
                onChange={(e) => setConfirmationCode(e.target.value)}
              />
            </div>

            <div>
              <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700">
                새 비밀번호
              </label>
              <input
                id="newPassword"
                name="newPassword"
                type="password"
                required
                className="mt-1 appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                placeholder="새 비밀번호를 입력하세요"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
              />
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                새 비밀번호 확인
              </label>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                required
                className="mt-1 appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                placeholder="새 비밀번호를 다시 입력하세요"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </div>

            {error && (
              <div className="text-red-600 text-sm text-center">{error}</div>
            )}

            {success && (
              <div className="text-green-600 text-sm text-center">{success}</div>
            )}

            <div>
              <button
                type="submit"
                disabled={isLoading}
                className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
              >
                {isLoading ? '비밀번호 재설정 중...' : '비밀번호 재설정'}
              </button>
            </div>

            <div className="text-center">
              <button
                type="button"
                onClick={() => {
                  setStep('request')
                  setError('')
                  setSuccess('')
                }}
                className="text-sm text-blue-600 hover:text-blue-500"
              >
                ← 다른 사용자명으로 다시 시도
              </button>
            </div>
          </form>
        )}

        <div className="text-center space-y-2">
          <Link
            href="/login"
            className="font-medium text-blue-600 hover:text-blue-500"
          >
            로그인 페이지로 돌아가기
          </Link>
          <div>
            <Link
              href="/forgot-id"
              className="font-medium text-blue-600 hover:text-blue-500"
            >
              사용자명을 잊어버리셨나요?
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}