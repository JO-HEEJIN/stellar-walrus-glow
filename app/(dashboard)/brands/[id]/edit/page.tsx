'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ImageUpload } from '@/components/upload/image-upload'

interface Brand {
  id: string
  nameKo: string
  nameCn?: string
  slug: string
  description?: string
  logoUrl?: string
  isActive: boolean
}

export default function EditBrandPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState('')
  
  const [formData, setFormData] = useState({
    nameKo: '',
    nameCn: '',
    slug: '',
    description: '',
    logoUrl: '',
    isActive: true,
  })

  useEffect(() => {
    const fetchBrand = async () => {
      try {
        const response = await fetch(`/api/brands/${params.id}`, {
          credentials: 'include',
        })
        if (!response.ok) {
          throw new Error('브랜드 정보를 불러올 수 없습니다')
        }
        const data = await response.json()
        const brand = data.data
        
        setFormData({
          nameKo: brand.nameKo,
          nameCn: brand.nameCn || '',
          slug: brand.slug,
          description: brand.description || '',
          logoUrl: brand.logoUrl || '',
          isActive: brand.isActive,
        })
      } catch (err) {
        setError(err instanceof Error ? err.message : '브랜드 정보를 불러오는 중 오류가 발생했습니다')
      } finally {
        setIsLoading(false)
      }
    }

    fetchBrand()
  }, [params.id])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSaving(true)
    setError('')

    try {
      const response = await fetch(`/api/brands/${params.id}`, {
        method: 'PUT',
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
        throw new Error(data.error || '브랜드 수정에 실패했습니다')
      }

      router.push('/brands')
    } catch (err) {
      setError(err instanceof Error ? err.message : '브랜드 수정에 실패했습니다')
    } finally {
      setIsSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!confirm('정말 이 브랜드를 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.')) {
      return
    }

    setIsSaving(true)
    setError('')

    try {
      const response = await fetch(`/api/brands/${params.id}`, {
        method: 'DELETE',
        credentials: 'include',
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || '브랜드 삭제에 실패했습니다')
      }

      router.push('/brands')
    } catch (err) {
      setError(err instanceof Error ? err.message : '브랜드 삭제에 실패했습니다')
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-lg">로딩 중...</div>
      </div>
    )
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
          <h1 className="text-3xl font-bold text-gray-900">브랜드 수정</h1>
          <p className="mt-2 text-gray-600">브랜드 정보를 수정하세요</p>
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
                onChange={(e) => setFormData({ ...formData, nameKo: e.target.value })}
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
              onUploadComplete={(url, file) => {
                console.log('Logo upload completed:', { url, fileName: file.name })
                setFormData({ ...formData, logoUrl: url })
              }}
              onUploadError={(error) => {
                console.error('Logo upload error:', error)
                setError(`로고 업로드 실패: ${error}`)
              }}
              onImageRemove={(url) => {
                console.log('Logo removed:', url)
                setFormData({ ...formData, logoUrl: '' })
              }}
              maxFiles={1}
              existingImages={formData.logoUrl ? [formData.logoUrl] : []}
              brandId={params.id}
              imageType="brand"
              accept="image/*"
              maxSize={2} // 2MB for logos
            />
            {formData.logoUrl && (
              <div className="mt-2">
                <p className="text-xs text-green-600">로고가 업로드되었습니다</p>
              </div>
            )}
            {!formData.logoUrl && (
              <div className="mt-2">
                <p className="text-xs text-gray-500">로고를 업로드하세요 (선택사항)</p>
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
              <span className="ml-2 text-sm text-gray-700">활성 상태</span>
            </label>
          </div>

          <div className="flex justify-between">
            <button
              type="button"
              onClick={handleDelete}
              disabled={isSaving}
              className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50"
            >
              브랜드 삭제
            </button>
            
            <div className="flex space-x-3">
              <Link
                href="/brands"
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                취소
              </Link>
              <button
                type="submit"
                disabled={isSaving}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
              >
                {isSaving ? '저장 중...' : '변경사항 저장'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}