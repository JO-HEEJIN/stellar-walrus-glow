'use client'

import { useState } from 'react'
import Link from 'next/link'

export default function ForgotIdPage() {
  const [email, setEmail] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [foundUsername, setFoundUsername] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleFindId = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    setFoundUsername('')
    setIsLoading(true)

    try {
      const response = await fetch('/api/auth/forgot-id/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Failed to find username')
      }

      setFoundUsername(data.username)
      setSuccess('사용자명을 찾았습니다!')
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
            사용자명 찾기
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            가입 시 사용한 이메일 주소를 입력하면 사용자명을 알려드립니다.
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleFindId}>
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
              이메일 주소
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              className="mt-1 appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
              placeholder="example@k-fashions.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          {error && (
            <div className="text-red-600 text-sm text-center">{error}</div>
          )}

          {success && foundUsername && (
            <div className="bg-green-50 border border-green-200 rounded-md p-4">
              <div className="text-green-800 text-sm text-center">
                <p className="font-medium">{success}</p>
                <p className="mt-2">
                  <strong>사용자명:</strong> <span className="font-mono text-lg">{foundUsername}</span>
                </p>
              </div>
            </div>
          )}

          <div>
            <button
              type="submit"
              disabled={isLoading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
            >
              {isLoading ? '사용자명 찾는 중...' : '사용자명 찾기'}
            </button>
          </div>
        </form>

        <div className="text-center space-y-2">
          <Link
            href="/login"
            className="font-medium text-blue-600 hover:text-blue-500"
          >
            로그인 페이지로 돌아가기
          </Link>
          <div>
            <Link
              href="/forgot-password"
              className="font-medium text-blue-600 hover:text-blue-500"
            >
              비밀번호를 잊어버리셨나요?
            </Link>
          </div>
        </div>

        <div className="mt-6">
          <div className="rounded-md bg-blue-50 p-4">
            <div className="flex">
              <div className="ml-3">
                <h3 className="text-sm font-medium text-blue-800">안내</h3>
                <div className="mt-2 text-sm text-blue-700">
                  <p>사용자명을 찾은 후 비밀번호가 기억나지 않으시면 비밀번호 찾기를 이용하세요.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}