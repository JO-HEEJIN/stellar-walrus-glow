'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Upload, X, Image as ImageIcon } from 'lucide-react'

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
  images?: string[]
  thumbnailImage?: string
}

interface UploadedImage {
  url: string
  key: string
  name: string
  size: number
  type: string
}

interface ProductFormProps {
  onSuccess?: () => void
}

export default function ProductForm({ onSuccess }: ProductFormProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [uploadingImage, setUploadingImage] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [brands, setBrands] = useState<Array<{ id: string; nameKo: string }>>([])
  const [uploadedImages, setUploadedImages] = useState<UploadedImage[]>([])
  const [thumbnailImage, setThumbnailImage] = useState<UploadedImage | null>(null)
  const [userRole, setUserRole] = useState<string>('')
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
    images: [],
    thumbnailImage: '',
  })

  // Set brand ID based on user's role
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await fetch('/api/auth/me')
        if (response.ok) {
          const data = await response.json()
          setUserRole(data.user.role)
          
          // Set appropriate brand based on user role
          if (data.user.role === 'BRAND_ADMIN') {
            // For brand admin, set their brand ID (or default)
            const brandId = 'cmd1c568s000113ja11hjgk9a' // Default brand ID
            setFormData(prev => ({ ...prev, brandId }))
          } else if (data.user.role === 'MASTER_ADMIN') {
            // For master admin, fetch available brands
            fetchBrands()
          }
        } else {
          // Redirect to login if not authenticated
          router.push('/login')
        }
      } catch (error) {
        console.error('Auth check error:', error)
        router.push('/login')
      }
    }

    checkAuth()
  }, [])

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

  const handleImageUpload = async (file: File, imageType: 'product' | 'thumbnail') => {
    setUploadingImage(true)
    setError(null)

    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('imageType', imageType)
      
      const response = await fetch('/api/upload', {
        method: 'POST',
        credentials: 'include',
        body: formData,
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error?.message || 'Upload failed')
      }

      const result = await response.json()
      const uploadedImage = result.data as UploadedImage

      if (imageType === 'thumbnail') {
        setThumbnailImage(uploadedImage)
        setFormData(prev => ({ ...prev, thumbnailImage: uploadedImage.url }))
      } else {
        setUploadedImages(prev => [...prev, uploadedImage])
        setFormData(prev => ({ 
          ...prev, 
          images: [...(prev.images || []), uploadedImage.url] 
        }))
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed')
    } finally {
      setUploadingImage(false)
    }
  }

  const handleRemoveImage = (index: number, imageType: 'product' | 'thumbnail') => {
    if (imageType === 'thumbnail') {
      setThumbnailImage(null)
      setFormData(prev => ({ ...prev, thumbnailImage: '' }))
    } else {
      setUploadedImages(prev => prev.filter((_, i) => i !== index))
      setFormData(prev => ({ 
        ...prev, 
        images: prev.images?.filter((_, i) => i !== index) || [] 
      }))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    console.log('Form data:', formData)

    try {
      // Clean up form data before sending
      const cleanedData = {
        ...formData,
        categoryId: formData.categoryId || null,
        images: uploadedImages.map(img => img.url),
        thumbnailImage: thumbnailImage?.url || null,
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

  if (!userRole) {
    return <div className="text-center py-4">로딩 중...</div>
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
        <p>User Role: {userRole || 'N/A'}</p>
        <p>Form Brand ID: {formData.brandId || 'N/A'}</p>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        <div>
          <label htmlFor="brandId" className="block text-sm font-medium text-gray-700">
            브랜드 *
          </label>
          {userRole === 'BRAND_ADMIN' ? (
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

      {/* Image Upload Section */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium text-gray-900">상품 이미지</h3>
        
        {/* Thumbnail Image */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            대표 이미지 (썸네일)
          </label>
          <div className="flex items-start space-x-4">
            {thumbnailImage ? (
              <div className="relative">
                <div className="h-32 w-32 rounded-lg border overflow-hidden bg-gray-50 flex items-center justify-center">
                  <img
                    src={thumbnailImage.url}
                    alt="Thumbnail"
                    className="max-w-full max-h-full object-contain"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => handleRemoveImage(0, 'thumbnail')}
                  className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <label className="h-32 w-32 flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-gray-400">
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0]
                    if (file) handleImageUpload(file, 'thumbnail')
                  }}
                  className="hidden"
                  disabled={uploadingImage}
                />
                <ImageIcon className="h-8 w-8 text-gray-400" />
                <span className="mt-2 text-xs text-gray-500">썸네일 업로드</span>
              </label>
            )}
          </div>
        </div>

        {/* Product Images */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            상품 상세 이미지
          </label>
          <div className="grid grid-cols-4 gap-4">
            {uploadedImages.map((image, index) => (
              <div key={index} className="relative">
                <div className="h-32 w-32 rounded-lg border overflow-hidden bg-gray-50 flex items-center justify-center">
                  <img
                    src={image.url}
                    alt={`Product ${index + 1}`}
                    className="max-w-full max-h-full object-contain"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => handleRemoveImage(index, 'product')}
                  className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ))}
            {uploadedImages.length < 5 && (
              <label className="h-32 w-32 flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-gray-400">
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0]
                    if (file) handleImageUpload(file, 'product')
                  }}
                  className="hidden"
                  disabled={uploadingImage}
                />
                <Upload className="h-8 w-8 text-gray-400" />
                <span className="mt-2 text-xs text-gray-500">이미지 추가</span>
              </label>
            )}
          </div>
          <p className="mt-2 text-xs text-gray-500">
            최대 5장까지 업로드 가능합니다. 권장 크기: 800x800px
          </p>
        </div>
        
        {uploadingImage && (
          <div className="text-sm text-gray-600">
            이미지 업로드 중...
          </div>
        )}
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