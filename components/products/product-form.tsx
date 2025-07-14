'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'

interface ProductFormData {
  brandId: string
  sku: string
  nameKo: string
  nameCn?: string
  descriptionKo?: string
  descriptionCn?: string
  categoryId?: string
  basePrice: number
  inventory: number
}

interface ProductFormProps {
  onSuccess?: () => void
}

export default function ProductForm({ onSuccess }: ProductFormProps) {
  const router = useRouter()
  const { data: session, status } = useSession()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [brands, setBrands] = useState<Array<{ id: string; nameKo: string }>>([])
  const [formData, setFormData] = useState<ProductFormData>({
    brandId: '',
    sku: '',
    nameKo: '',
    nameCn: '',
    descriptionKo: '',
    descriptionCn: '',
    categoryId: '',
    basePrice: 0,
    inventory: 0,
  })

  // Set brand ID based on user's role
  useEffect(() => {
    if (session?.user) {
      if (session.user.role === 'BRAND_ADMIN') {
        // For testing, use the test brand ID if brandId is not set
        const brandId = session.user.brandId || 'cmd1c568s000113ja11hjgk9a'
        setFormData(prev => ({ ...prev, brandId }))
      } else if (session.user.role === 'MASTER_ADMIN') {
        // For master admin, we should fetch available brands
        fetchBrands()
      }
    }
  }, [session])

  const fetchBrands = async () => {
    try {
      const response = await fetch('/api/brands', {
        credentials: 'include',
      })
      if (response.ok) {
        const data = await response.json()
        setBrands(data.data || [])
        // Set the first brand as default if available
        if (data.data && data.data.length > 0) {
          setFormData(prev => ({ ...prev, brandId: data.data[0].id }))
        }
      }
    } catch (err) {
      console.error('Failed to fetch brands:', err)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    console.log('Session status:', status)
    console.log('Session data:', session)
    console.log('Form data:', formData)

    try {
      // Clean up form data before sending
      const cleanedData = {
        ...formData,
        categoryId: formData.categoryId || null, // Use null instead of undefined for JSON
      }
      
      console.log('Cleaned data being sent:', cleanedData)
      
      const response = await fetch('/api/products', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(cleanedData),
      })

      if (!response.ok) {
        const data = await response.json()
        console.error('Product creation failed:', data)
        throw new Error(data.error?.message || data.error || 'Failed to create product')
      }

      // Success - redirect or callback
      if (onSuccess) {
        onSuccess()
      } else {
        router.push('/products')
        router.refresh()
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  if (status === 'loading') {
    return <div className="text-center py-4">로딩 중...</div>
  }

  if (status === 'unauthenticated') {
    return (
      <div className="rounded-md bg-yellow-50 p-4">
        <p className="text-sm text-yellow-800">로그인이 필요합니다.</p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="rounded-md bg-red-50 p-4">
          <p className="text-sm text-red-800">{error}</p>
        </div>
      )}

      {/* Debug info - remove in production */}
      <div className="rounded-md bg-gray-100 p-4 text-xs">
        <p>Session Status: {status}</p>
        <p>User Role: {session?.user?.role || 'N/A'}</p>
        <p>Brand ID: {session?.user?.brandId || 'N/A'}</p>
        <p>Form Brand ID: {formData.brandId || 'N/A'}</p>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        <div>
          <label htmlFor="brandId" className="block text-sm font-medium text-gray-700">
            브랜드 *
          </label>
          {session?.user?.role === 'BRAND_ADMIN' ? (
            <input
              type="text"
              id="brandId"
              required
              value={formData.brandId}
              disabled
              className="mt-1 block w-full rounded-md border-gray-300 bg-gray-100 shadow-sm sm:text-sm"
              placeholder="브랜드 ID"
            />
          ) : (
            <select
              id="brandId"
              required
              value={formData.brandId}
              onChange={(e) => setFormData({ ...formData, brandId: e.target.value })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
            >
              <option value="">브랜드를 선택하세요</option>
              {brands.map((brand) => (
                <option key={brand.id} value={brand.id}>
                  {brand.nameKo}
                </option>
              ))}
            </select>
          )}
        </div>

        <div>
          <label htmlFor="sku" className="block text-sm font-medium text-gray-700">
            SKU *
          </label>
          <input
            type="text"
            id="sku"
            required
            value={formData.sku}
            onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
            placeholder="예: PROD-001"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        <div>
          <label htmlFor="nameKo" className="block text-sm font-medium text-gray-700">
            상품명 (한국어) *
          </label>
          <input
            type="text"
            id="nameKo"
            required
            value={formData.nameKo}
            onChange={(e) => setFormData({ ...formData, nameKo: e.target.value })}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
            placeholder="예: 프리미엄 셔츠"
          />
        </div>

        <div>
          <label htmlFor="nameCn" className="block text-sm font-medium text-gray-700">
            상품명 (중국어)
          </label>
          <input
            type="text"
            id="nameCn"
            value={formData.nameCn}
            onChange={(e) => setFormData({ ...formData, nameCn: e.target.value })}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
            placeholder="예: 高级衬衫"
          />
        </div>
      </div>

      <div>
        <label htmlFor="descriptionKo" className="block text-sm font-medium text-gray-700">
          상품 설명 (한국어)
        </label>
        <textarea
          id="descriptionKo"
          rows={3}
          value={formData.descriptionKo}
          onChange={(e) => setFormData({ ...formData, descriptionKo: e.target.value })}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
          placeholder="상품에 대한 자세한 설명을 입력하세요"
        />
      </div>

      <div>
        <label htmlFor="descriptionCn" className="block text-sm font-medium text-gray-700">
          상품 설명 (중국어)
        </label>
        <textarea
          id="descriptionCn"
          rows={3}
          value={formData.descriptionCn}
          onChange={(e) => setFormData({ ...formData, descriptionCn: e.target.value })}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
          placeholder="产品详细说明"
        />
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
        <div>
          <label htmlFor="basePrice" className="block text-sm font-medium text-gray-700">
            가격 (원) *
          </label>
          <input
            type="number"
            id="basePrice"
            required
            min="0"
            value={formData.basePrice}
            onChange={(e) => setFormData({ ...formData, basePrice: parseInt(e.target.value) || 0 })}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
            placeholder="89000"
          />
        </div>

        <div>
          <label htmlFor="inventory" className="block text-sm font-medium text-gray-700">
            재고 수량 *
          </label>
          <input
            type="number"
            id="inventory"
            required
            min="0"
            value={formData.inventory}
            onChange={(e) => setFormData({ ...formData, inventory: parseInt(e.target.value) || 0 })}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
            placeholder="100"
          />
        </div>

        <div>
          <label htmlFor="categoryId" className="block text-sm font-medium text-gray-700">
            카테고리 ID
          </label>
          <input
            type="text"
            id="categoryId"
            value={formData.categoryId}
            onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
            placeholder="카테고리 ID (선택사항)"
          />
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
          {loading ? '저장 중...' : '상품 등록'}
        </button>
      </div>
    </form>
  )
}