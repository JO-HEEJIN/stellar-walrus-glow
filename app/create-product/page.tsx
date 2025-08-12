'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function CreateProductPage() {
  const [brands, setBrands] = useState([])
  const [categories, setCategories] = useState([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [message, setMessage] = useState('페이지 로드됨')
  const [formData, setFormData] = useState({
    brandId: '',
    categoryId: '',
    sku: '',
    nameKo: '',
    nameCn: '',
    descriptionKo: '',
    basePrice: '',
    inventory: '',
    thumbnailImage: ''
  })
  const router = useRouter()

  useEffect(() => {
    loadInitialData()
  }, [])

  const loadInitialData = async () => {
    try {
      setMessage('브랜드 데이터 로딩 중...')
      
      // 브랜드 데이터 로드
      const brandsRes = await fetch('/api/brands', {
        credentials: 'include'
      })
      if (brandsRes.ok) {
        const brandsData = await brandsRes.json()
        setBrands(brandsData.data || [])
        setMessage(`✅ 브랜드 ${brandsData.data?.length || 0}개 로드됨`)
      } else {
        setMessage(`❌ 브랜드 로드 실패: ${brandsRes.status}`)
        // Mock 브랜드 데이터 사용
        setBrands([
          { id: '1', nameKo: '테스트 브랜드 1', nameCn: 'Test Brand 1' },
          { id: '2', nameKo: '테스트 브랜드 2', nameCn: 'Test Brand 2' },
        ])
      }

      // 카테고리 데이터 로드
      const categoriesRes = await fetch('/api/categories', {
        credentials: 'include'
      })
      if (categoriesRes.ok) {
        const categoriesData = await categoriesRes.json()
        setCategories(categoriesData.data || [])
        setMessage(prev => prev + ` | 카테고리 ${categoriesData.data?.length || 0}개 로드됨`)
      } else {
        setMessage(prev => prev + ` | ❌ 카테고리 로드 실패: ${categoriesRes.status}`)
        // Mock 카테고리 데이터 사용
        setCategories([
          { id: '1', name: '상의' },
          { id: '2', name: '하의' },
          { id: '3', name: '신발' },
        ])
      }

    } catch (error) {
      setMessage(`❌ 데이터 로드 오류: ${error}`)
      // Mock 데이터 사용
      setBrands([
        { id: '1', nameKo: '테스트 브랜드 1' },
        { id: '2', nameKo: '테스트 브랜드 2' }
      ])
      setCategories([
        { id: '1', name: '상의' },
        { id: '2', name: '하의' }
      ])
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const uploadTestImage = async () => {
    try {
      setMessage('테스트 이미지 업로드 중...')
      
      // 테스트 이미지 생성
      const canvas = document.createElement('canvas')
      canvas.width = 200
      canvas.height = 200
      const ctx = canvas.getContext('2d')!
      
      // 그라디언트 배경
      const gradient = ctx.createLinearGradient(0, 0, 200, 200)
      gradient.addColorStop(0, '#FF6B6B')
      gradient.addColorStop(1, '#4ECDC4')
      ctx.fillStyle = gradient
      ctx.fillRect(0, 0, 200, 200)
      
      // 텍스트
      ctx.fillStyle = '#FFFFFF'
      ctx.font = '20px Arial'
      ctx.fillText('TEST', 70, 100)
      ctx.fillText('IMAGE', 60, 130)
      
      const blob = await new Promise<Blob>(resolve => canvas.toBlob(resolve as any, 'image/png'))
      const file = new File([blob], 'test-product.png', { type: 'image/png' })
      
      const uploadFormData = new FormData()
      uploadFormData.append('file', file)
      uploadFormData.append('imageType', 'thumbnail')
      
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: uploadFormData,
        credentials: 'include'
      })
      
      if (response.ok) {
        const result = await response.json()
        setFormData(prev => ({
          ...prev,
          thumbnailImage: result.data.url
        }))
        setMessage(`✅ 이미지 업로드 성공: ${result.data.url.substring(0, 50)}...`)
      } else {
        const error = await response.json()
        setMessage(`❌ 이미지 업로드 실패: ${error.error?.message || response.status}`)
      }
      
    } catch (error) {
      setMessage(`❌ 이미지 업로드 오류: ${error}`)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.brandId || !formData.sku || !formData.nameKo || !formData.basePrice || !formData.inventory) {
      setMessage('❌ 필수 필드를 모두 입력해주세요')
      return
    }
    
    if (!formData.thumbnailImage) {
      setMessage('❌ 대표 이미지를 업로드해주세요')
      return
    }

    setIsSubmitting(true)
    setMessage('상품 등록 중...')

    try {
      const productData = {
        ...formData,
        basePrice: Number(formData.basePrice),
        inventory: Number(formData.inventory),
        categoryId: formData.categoryId || undefined,
        images: []
      }

      const response = await fetch('/api/products', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(productData),
      })

      if (response.ok) {
        const result = await response.json()
        setMessage(`🎉 상품 등록 성공! ID: ${result.data.id}`)
        
        // 폼 리셋
        setFormData({
          brandId: '',
          categoryId: '',
          sku: '',
          nameKo: '',
          nameCn: '',
          descriptionKo: '',
          basePrice: '',
          inventory: '',
          thumbnailImage: ''
        })
        
        setTimeout(() => {
          setMessage('새로운 상품을 등록할 수 있습니다')
        }, 3000)
      } else {
        const error = await response.json()
        setMessage(`❌ 상품 등록 실패: ${error.error?.message || error.message || response.status}`)
      }
    } catch (error) {
      setMessage(`❌ 상품 등록 오류: ${error}`)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-lg p-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-8 text-center">
          🛍️ 상품 등록 시스템
        </h1>

        {/* 상태 메시지 */}
        <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-sm font-mono text-blue-800">{message}</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* 브랜드 선택 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                브랜드 <span className="text-red-500">*</span>
              </label>
              <select
                name="brandId"
                value={formData.brandId}
                onChange={handleInputChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">브랜드 선택</option>
                {brands.map((brand: any) => (
                  <option key={brand.id} value={brand.id}>
                    {brand.nameKo} {brand.nameCn && `(${brand.nameCn})`}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                카테고리
              </label>
              <select
                name="categoryId"
                value={formData.categoryId}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">카테고리 선택 (선택사항)</option>
                {categories.map((category: any) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* SKU */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              SKU <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="sku"
              value={formData.sku}
              onChange={handleInputChange}
              required
              placeholder="예: PROD-001"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* 상품명 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                상품명 (한글) <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="nameKo"
                value={formData.nameKo}
                onChange={handleInputChange}
                required
                placeholder="한글 상품명"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                상품명 (중국어)
              </label>
              <input
                type="text"
                name="nameCn"
                value={formData.nameCn}
                onChange={handleInputChange}
                placeholder="中文产品名"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* 가격과 재고 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                가격 (원) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                name="basePrice"
                value={formData.basePrice}
                onChange={handleInputChange}
                required
                min="0"
                placeholder="10000"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                재고 <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                name="inventory"
                value={formData.inventory}
                onChange={handleInputChange}
                required
                min="0"
                placeholder="100"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* 상품 설명 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              상품 설명
            </label>
            <textarea
              name="descriptionKo"
              value={formData.descriptionKo}
              onChange={handleInputChange}
              rows={3}
              placeholder="상품에 대한 상세한 설명을 입력하세요..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* 이미지 업로드 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              대표 이미지 <span className="text-red-500">*</span>
            </label>
            
            <div className="space-y-3">
              <button
                type="button"
                onClick={uploadTestImage}
                className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                🖼️ 테스트 이미지 업로드
              </button>
              
              {formData.thumbnailImage && (
                <div className="flex items-center space-x-3">
                  <img 
                    src={formData.thumbnailImage} 
                    alt="대표 이미지" 
                    className="w-20 h-20 object-cover rounded-md border"
                  />
                  <div className="text-sm text-green-600">
                    ✅ 이미지가 업로드되었습니다
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* 제출 버튼 */}
          <div className="flex space-x-4 pt-6">
            <button
              type="button"
              onClick={() => router.push('/admin-products')}
              className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              취소
            </button>
            
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 px-6 py-3 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {isSubmitting ? '등록 중...' : '🚀 상품 등록'}
            </button>
          </div>
        </form>

        {/* 디버그 정보 */}
        <div className="mt-8 p-4 bg-gray-50 rounded-lg">
          <h3 className="text-sm font-semibold text-gray-700 mb-2">현재 폼 데이터:</h3>
          <pre className="text-xs text-gray-600 whitespace-pre-wrap">
            {JSON.stringify(formData, null, 2)}
          </pre>
        </div>
      </div>
    </div>
  )
}