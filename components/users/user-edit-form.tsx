'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

interface UserFormData {
  name: string
  email: string
  role: 'MASTER_ADMIN' | 'BRAND_ADMIN' | 'BUYER'
  status: 'ACTIVE' | 'SUSPENDED'
  brandId: string | null
}

interface Brand {
  id: string
  nameKo: string
  nameCn?: string
}

interface UserEditFormProps {
  userId: string
  onSuccess?: () => void
}

export default function UserEditForm({ userId, onSuccess }: UserEditFormProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [loadingUser, setLoadingUser] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [brands, setBrands] = useState<Brand[]>([])
  const [formData, setFormData] = useState<UserFormData>({
    name: '',
    email: '',
    role: 'BUYER',
    status: 'ACTIVE',
    brandId: null,
  })

  // Load user data
  useEffect(() => {
    const loadUser = async () => {
      try {
        const response = await fetch(`/api/users/${userId}`)
        if (!response.ok) {
          throw new Error('Failed to load user')
        }
        
        const data = await response.json()
        const user = data.data
        
        setFormData({
          name: user.name || '',
          email: user.email || '',
          role: user.role,
          status: user.status,
          brandId: user.brandId,
        })
      } catch (error) {
        console.error('Failed to load user:', error)
        setError('사용자 정보를 불러오는데 실패했습니다.')
      } finally {
        setLoadingUser(false)
      }
    }

    loadUser()
  }, [userId])

  // Load brands for brand selection
  useEffect(() => {
    const fetchBrands = async () => {
      try {
        const response = await fetch('/api/brands', {
          credentials: 'include',
        })
        if (response.ok) {
          const data = await response.json()
          setBrands(data.data || [])
        }
      } catch (err) {
        console.error('Failed to fetch brands:', err)
      }
    }

    fetchBrands()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      const response = await fetch(`/api/users/${userId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(formData),
      })

      if (!response.ok) {
        const data = await response.json()
        console.error('User update failed:', data)
        throw new Error(data.error?.message || data.error || 'Failed to update user')
      }

      // Success
      if (onSuccess) {
        onSuccess()
      } else {
        router.push('/users')
        router.refresh()
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  if (loadingUser) {
    return <div className="text-center py-4">로딩 중...</div>
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="rounded-md bg-red-50 p-4">
          <p className="text-sm text-red-800">{error}</p>
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700">
            이름 *
          </label>
          <input
            type="text"
            id="name"
            required
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
            placeholder="사용자 이름"
          />
        </div>

        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700">
            이메일 *
          </label>
          <input
            type="email"
            id="email"
            required
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
            placeholder="user@example.com"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        <div>
          <label htmlFor="role" className="block text-sm font-medium text-gray-700">
            역할 *
          </label>
          <select
            id="role"
            required
            value={formData.role}
            onChange={(e) => setFormData({ ...formData, role: e.target.value as any })}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
          >
            <option value="BUYER">구매자</option>
            <option value="BRAND_ADMIN">브랜드 관리자</option>
            <option value="MASTER_ADMIN">최고 관리자</option>
          </select>
        </div>

        <div>
          <label htmlFor="status" className="block text-sm font-medium text-gray-700">
            상태 *
          </label>
          <select
            id="status"
            required
            value={formData.status}
            onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
          >
            <option value="ACTIVE">활성</option>
            <option value="SUSPENDED">정지</option>
          </select>
        </div>
      </div>

      {formData.role === 'BRAND_ADMIN' && (
        <div>
          <label htmlFor="brandId" className="block text-sm font-medium text-gray-700">
            소속 브랜드
          </label>
          <select
            id="brandId"
            value={formData.brandId || ''}
            onChange={(e) => setFormData({ ...formData, brandId: e.target.value || null })}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
          >
            <option value="">브랜드를 선택하세요</option>
            {brands.map((brand) => (
              <option key={brand.id} value={brand.id}>
                {brand.nameKo}
              </option>
            ))}
          </select>
        </div>
      )}

      <div className="border-t pt-6">
        <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
          <div className="flex">
            <div className="ml-3">
              <h3 className="text-sm font-medium text-yellow-800">
                주의사항
              </h3>
              <div className="mt-2 text-sm text-yellow-700">
                <ul className="list-disc pl-5 space-y-1">
                  <li>사용자의 역할을 변경하면 접근 권한이 즉시 변경됩니다.</li>
                  <li>브랜드 관리자는 반드시 소속 브랜드를 선택해야 합니다.</li>
                  <li>사용자를 정지하면 로그인이 불가능해집니다.</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-end space-x-3">
        <button
          type="button"
          onClick={() => router.back()}
          className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
        >
          취소
        </button>
        <button
          type="submit"
          disabled={loading}
          className="px-4 py-2 text-sm font-medium text-white bg-primary border border-transparent rounded-md hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? '저장 중...' : '변경사항 저장'}
        </button>
      </div>
    </form>
  )
}