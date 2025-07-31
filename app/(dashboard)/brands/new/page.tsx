'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function NewBrandPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  
  const [formData, setFormData] = useState({
    nameKo: '',
    nameCn: '',
    slug: '',
    description: '',
    logoUrl: '',
    isActive: true,
  })

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
  }

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const nameKo = e.target.value
    setFormData({
      ...formData,
      nameKo,
      slug: generateSlug(nameKo),
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    try {
      const response = await fetch('/api/brands', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          ...formData,
          logoUrl: formData.logoUrl || null,
          nameCn: formData.nameCn || null,
          description: formData.description || null,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || '브랜드 생성에 실패했습니다')
      }

      router.push('/brands')
    } catch (err) {
      setError(err instanceof Error ? err.message : '브랜드 생성에 실패했습니다')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8">
          <Link
            href="/brands"
            className="text-blue-600 hover:text-blue-800 flex items-center gap-2 mb-4"
          >
            ← 브랜드 목록으로
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">새 브랜드 등록</h1>
          <p className="mt-2 text-gray-600">새로운 브랜드 정보를 입력하세요</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-6 space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="nameKo" className="block text-sm font-medium text-gray-700 mb-1">
                브랜드명 (한국어) *
              </label>
              <input
                id="nameKo"
                type="text"
                required
                value={formData.nameKo}
                onChange={handleNameChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="예: 나이키"
              />
            </div>

            <div>
              <label htmlFor="nameCn" className="block text-sm font-medium text-gray-700 mb-1">
                브랜드명 (중국어)
              </label>
              <input
                id="nameCn"
                type="text"
                value={formData.nameCn}
                onChange={(e) => setFormData({ ...formData, nameCn: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="예: 耐克"
              />
            </div>
          </div>

          <div>
            <label htmlFor="slug" className="block text-sm font-medium text-gray-700 mb-1">
              URL 슬러그 *
            </label>
            <input
              id="slug"
              type="text"
              required
              value={formData.slug}
              onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="예: nike"
              pattern="^[a-z0-9-]+$"
              title="소문자, 숫자, 하이픈만 사용 가능합니다"
            />
            <p className="text-sm text-gray-500 mt-1">소문자, 숫자, 하이픈만 사용 가능합니다</p>
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
              브랜드 설명
            </label>
            <textarea
              id="description"
              rows={3}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="브랜드에 대한 간단한 설명을 입력하세요"
            />
          </div>

          <div>
            <label htmlFor="logoUrl" className="block text-sm font-medium text-gray-700 mb-1">
              로고 URL
            </label>
            <input
              id="logoUrl"
              type="url"
              value={formData.logoUrl}
              onChange={(e) => setFormData({ ...formData, logoUrl: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="https://example.com/logo.png"
            />
          </div>

          <div>
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={formData.isActive}
                onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="ml-2 text-sm text-gray-700">활성 상태로 등록</span>
            </label>
          </div>

          <div className="flex justify-end space-x-3">
            <Link
              href="/brands"
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
            >
              취소
            </Link>
            <button
              type="submit"
              disabled={isLoading}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
            >
              {isLoading ? '등록 중...' : '브랜드 등록'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}