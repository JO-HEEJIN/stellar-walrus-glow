'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { z } from 'zod'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'

const updateUserSchema = z.object({
  email: z.string().email('유효한 이메일 주소를 입력해주세요'),
  name: z.string().min(2, '이름은 최소 2자 이상이어야 합니다'),
  role: z.enum(['BUYER', 'BRAND_ADMIN', 'MASTER_ADMIN']),
  brandId: z.string().optional().nullable(),
  isActive: z.boolean(),
})

interface Brand {
  id: string
  nameKo: string
  isActive: boolean
}

interface UserData {
  id: string
  email: string
  name: string | null
  role: string
  isActive: boolean
  brandId: string | null
  brand?: {
    id: string
    nameKo: string
  } | null
}

export default function EditUserPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [brands, setBrands] = useState<Brand[]>([])
  const [userData, setUserData] = useState<UserData | null>(null)
  const [formData, setFormData] = useState({
    email: '',
    name: '',
    role: 'BUYER',
    brandId: '',
    isActive: true,
  })
  const [errors, setErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    checkAuth()
    loadBrands()
    loadUser()
  }, [params.id])

  const checkAuth = async () => {
    try {
      const response = await fetch('/api/auth/me')
      if (response.ok) {
        const data = await response.json()
        if (data.user.role !== 'MASTER_ADMIN') {
          toast.error('권한이 없습니다')
          router.push('/dashboard')
        }
      }
    } catch (error) {
      console.error('Auth check error:', error)
    }
  }

  const loadUser = async () => {
    try {
      const response = await fetch(`/api/users/${params.id}`)
      if (!response.ok) {
        throw new Error('사용자를 찾을 수 없습니다')
      }
      const data = await response.json()
      const user = data.data
      setUserData(user)
      setFormData({
        email: user.email || '',
        name: user.name || '',
        role: user.role,
        brandId: user.brandId || '',
        isActive: user.isActive,
      })
    } catch (error) {
      toast.error(error instanceof Error ? error.message : '사용자 정보를 불러오는데 실패했습니다')
      router.push('/users')
    }
  }

  const loadBrands = async () => {
    try {
      const response = await fetch('/api/brands')
      if (response.ok) {
        const data = await response.json()
        setBrands(data.data.filter((b: Brand) => b.isActive))
      }
    } catch (error) {
      console.error('Error loading brands:', error)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrors({})

    try {
      // Validate form data
      const validatedData = updateUserSchema.parse(formData)
      
      // Check if brand is required
      if (validatedData.role === 'BRAND_ADMIN' && !validatedData.brandId) {
        setErrors({ brandId: '브랜드 관리자는 브랜드를 선택해야 합니다' })
        return
      }

      setLoading(true)

      const response = await fetch(`/api/users/${params.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(validatedData),
      })

      if (!response.ok) {
        const data = await response.json()
        if (response.status === 409) {
          setErrors({ email: '이미 존재하는 이메일입니다' })
          return
        }
        throw new Error(data.error?.message || '사용자 수정에 실패했습니다')
      }

      toast.success('사용자 정보가 성공적으로 수정되었습니다')
      router.push('/users')
    } catch (error) {
      if (error instanceof z.ZodError) {
        const fieldErrors: Record<string, string> = {}
        error.errors.forEach((err) => {
          if (err.path[0]) {
            fieldErrors[err.path[0].toString()] = err.message
          }
        })
        setErrors(fieldErrors)
      } else {
        toast.error(error instanceof Error ? error.message : '사용자 수정 중 오류가 발생했습니다')
      }
    } finally {
      setLoading(false)
    }
  }

  if (!userData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-lg">로딩 중...</div>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-6">
        <Link
          href="/users"
          className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          사용자 목록으로 돌아가기
        </Link>
      </div>

      <div className="bg-white shadow sm:rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg font-medium leading-6 text-gray-900">
            사용자 정보 수정
          </h3>
          <p className="mt-1 text-sm text-gray-500">
            사용자의 정보를 수정합니다.
          </p>

          <form onSubmit={handleSubmit} className="mt-6 space-y-6">
            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                이메일 *
              </label>
              <input
                type="email"
                id="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                required
              />
              {errors.email && (
                <p className="mt-1 text-sm text-red-600">{errors.email}</p>
              )}
            </div>

            {/* Name */}
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                이름 *
              </label>
              <input
                type="text"
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                required
              />
              {errors.name && (
                <p className="mt-1 text-sm text-red-600">{errors.name}</p>
              )}
            </div>

            {/* Role */}
            <div>
              <label htmlFor="role" className="block text-sm font-medium text-gray-700">
                역할 *
              </label>
              <select
                id="role"
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              >
                <option value="BUYER">구매자</option>
                <option value="BRAND_ADMIN">브랜드 관리자</option>
                <option value="MASTER_ADMIN">마스터 관리자</option>
              </select>
            </div>

            {/* Brand (only for BRAND_ADMIN) */}
            {formData.role === 'BRAND_ADMIN' && (
              <div>
                <label htmlFor="brandId" className="block text-sm font-medium text-gray-700">
                  브랜드 *
                </label>
                <select
                  id="brandId"
                  value={formData.brandId}
                  onChange={(e) => setFormData({ ...formData, brandId: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                  required
                >
                  <option value="">브랜드를 선택하세요</option>
                  {brands.map((brand) => (
                    <option key={brand.id} value={brand.id}>
                      {brand.nameKo}
                    </option>
                  ))}
                </select>
                {errors.brandId && (
                  <p className="mt-1 text-sm text-red-600">{errors.brandId}</p>
                )}
              </div>
            )}

            {/* Active Status */}
            <div>
              <label className="block text-sm font-medium text-gray-700">
                계정 상태
              </label>
              <div className="mt-2">
                <label className="inline-flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.isActive}
                    onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="ml-2 text-sm text-gray-700">활성 계정</span>
                </label>
              </div>
              <p className="mt-1 text-xs text-gray-500">
                비활성화된 계정은 로그인할 수 없습니다.
              </p>
            </div>

            {/* Submit Buttons */}
            <div className="flex justify-end space-x-3 pt-6">
              <button
                type="button"
                onClick={() => router.push('/users')}
                className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                취소
              </button>
              <button
                type="submit"
                disabled={loading}
                className="inline-flex justify-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
              >
                {loading ? '수정 중...' : '사용자 수정'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}