'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ImageUpload } from '@/components/upload/image-upload'

export default function NewBrandPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [userRole, setUserRole] = useState<string | null>(null)
  
  const [formData, setFormData] = useState({
    nameKo: '',
    nameCn: '',
    slug: '',
    description: '',
    logoUrl: '',
    isActive: true,
  })

  // Check user role on mount
  useEffect(() => {
    const checkUserRole = async () => {
      try {
        const response = await fetch('/api/auth/me', {
          credentials: 'include',
        })
        if (response.ok) {
          const data = await response.json()
          setUserRole(data.user?.role || null)
        }
      } catch (err) {
        console.error('Failed to check user role:', err)
      }
    }
    checkUserRole()
  }, [])

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
        // Check for specific error details
        if (data.code === 'AUTHORIZATION_ROLE_REQUIRED') {
          throw new Error('브랜드 등록 권한이 없습니다. MASTER_ADMIN 권한이 필요합니다.')
        } else if (data.code === 'AUTHENTICATION_REQUIRED') {
          throw new Error('로그인이 필요합니다.')
        } else if (data.code === 'VALIDATION_FAILED') {
          throw new Error(data.details?.message || data.error || '입력한 정보를 확인해주세요.')
        }
        throw new Error(data.error || '브랜드 생성에 실패했습니다')
      }

      // Check for warnings (e.g., mock mode)
      if (data.warning) {
        console.warn('Brand creation warning:', data.warning)
      }

      // Show success message
      alert('브랜드가 성공적으로 등록되었습니다!')
      router.push('/brands')
    } catch (err) {
      console.error('Brand creation error:', err)
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

          {userRole && userRole !== 'MASTER_ADMIN' && (
            <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 px-4 py-3 rounded">
              <p className="font-semibold">권한 안내</p>
              <p className="text-sm mt-1">브랜드 등록은 MASTER_ADMIN 권한이 필요합니다.</p>
              <p className="text-sm">현재 권한: {userRole}</p>
              <p className="text-sm mt-2">테스트를 위해 다음 계정으로 로그인하세요:</p>
              <ul className="text-sm list-disc list-inside mt-1">
                <li>ID: master@kfashion.com / PW: password123</li>
                <li>ID: demo / PW: demo</li>
                <li>ID: admin / PW: admin</li>
              </ul>
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
              pattern="[a-z0-9\-]+"
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
            <label className="block text-sm font-medium text-gray-700 mb-2">
              브랜드 로고
            </label>
            <ImageUpload
              onUploadComplete={(url) => {
                setFormData({ ...formData, logoUrl: url })
              }}
              onUploadError={(error) => {
                setError(`로고 업로드 실패: ${error}`)
              }}
              maxFiles={1}
              existingImages={formData.logoUrl ? [formData.logoUrl] : []}
              brandId="new-brand"
              imageType="brand"
              accept="image/*"
              maxSize={2} // 2MB for logos
            />
            {formData.logoUrl && (
              <div className="mt-2">
                <p className="text-xs text-green-600">로고가 업로드되었습니다</p>
              </div>
            )}
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