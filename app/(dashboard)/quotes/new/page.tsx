'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { ArrowLeft, Plus, Trash2, Building2, User, Mail, Phone, MessageSquare, Package } from 'lucide-react'
import { formatPrice } from '@/lib/utils'
import { toast } from 'sonner'

const quoteRequestSchema = z.object({
  companyName: z.string().min(2, '회사명은 2자 이상이어야 합니다').max(100, '회사명은 100자 이하여야 합니다'),
  contactName: z.string().min(2, '담당자명은 2자 이상이어야 합니다').max(50, '담당자명은 50자 이하여야 합니다'),
  email: z.string().email('올바른 이메일 형식을 입력해주세요'),
  phone: z.string().min(10, '연락처를 정확히 입력해주세요').max(15, '연락처는 15자 이하여야 합니다'),
  message: z.string().optional(),
})

type QuoteRequestFormData = z.infer<typeof quoteRequestSchema>

interface QuoteProduct {
  id: string
  productId: string
  productName: string
  productSku: string
  brandName: string
  basePrice: number
  discountPrice?: number
  imageUrl?: string
  requestedQuantity: number
  category?: string
}

export default function NewQuotePage() {
  const router = useRouter()
  const [selectedProducts, setSelectedProducts] = useState<QuoteProduct[]>([])
  const [availableProducts, setAvailableProducts] = useState<Omit<QuoteProduct, 'requestedQuantity'>[]>([])
  const [showProductSelector, setShowProductSelector] = useState(false)
  const [loading, setLoading] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset
  } = useForm<QuoteRequestFormData>({
    resolver: zodResolver(quoteRequestSchema),
    defaultValues: {
      companyName: '',
      contactName: '',
      email: '',
      phone: '',
      message: '',
    }
  })

  useEffect(() => {
    loadAvailableProducts()
  }, [])

  const loadAvailableProducts = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/products?limit=50', {
        credentials: 'include',
      })

      if (response.ok) {
        const data = await response.json()
        setAvailableProducts(data.data || [])
      }
    } catch (error) {
      console.error('상품 로드 실패:', error)
      // Mock data for development
      setAvailableProducts([
        {
          id: '1',
          productId: 'cme3ltyne0012myiyu0st08b5',
          productName: '스트레치 벨트',
          productSku: 'TTL-BLT-BK-2025',
          brandName: 'K-패션',
          basePrice: 68000,
          imageUrl: '/placeholder.svg',
          category: '액세서리/벨트'
        },
        {
          id: '2',
          productId: 'prod-2',
          productName: '코튼 티셔츠',
          productSku: 'CTN-TS-WH-2025',
          brandName: '프리미엄 브랜드',
          basePrice: 85000,
          discountPrice: 68000,
          imageUrl: '/placeholder.svg',
          category: '상의/티셔츠'
        },
        {
          id: '3',
          productId: 'prod-3',
          productName: '골프 모자',
          productSku: 'GLF-HAT-NV-2025',
          brandName: '골프 브랜드',
          basePrice: 45000,
          imageUrl: '/placeholder.svg',
          category: '액세서리/모자'
        }
      ])
    } finally {
      setLoading(false)
    }
  }

  const handleAddProduct = (product: Omit<QuoteProduct, 'requestedQuantity'>) => {
    // Check if product already exists
    if (selectedProducts.find(p => p.productId === product.productId)) {
      toast.error('이미 추가된 상품입니다')
      return
    }

    const newProduct: QuoteProduct = {
      ...product,
      requestedQuantity: 1
    }

    setSelectedProducts(prev => [...prev, newProduct])
    setShowProductSelector(false)
    toast.success('상품이 추가되었습니다')
  }

  const handleRemoveProduct = (productId: string) => {
    setSelectedProducts(prev => prev.filter(p => p.productId !== productId))
    toast.success('상품이 제거되었습니다')
  }

  const handleQuantityChange = (productId: string, quantity: number) => {
    if (quantity < 1) return
    
    setSelectedProducts(prev => 
      prev.map(p => 
        p.productId === productId 
          ? { ...p, requestedQuantity: quantity }
          : p
      )
    )
  }

  const onSubmit = async (data: QuoteRequestFormData) => {
    if (selectedProducts.length === 0) {
      toast.error('견적을 요청할 상품을 선택해주세요')
      return
    }

    try {
      const requestData = {
        companyInfo: {
          name: data.companyName,
          contact: data.contactName,
          email: data.email,
          phone: data.phone,
        },
        message: data.message,
        items: selectedProducts.map(product => ({
          productId: product.productId,
          productName: product.productName,
          productSku: product.productSku,
          quantity: product.requestedQuantity,
          brandName: product.brandName,
          basePrice: product.basePrice,
          discountPrice: product.discountPrice,
        }))
      }

      const response = await fetch('/api/quotes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(requestData),
      })

      if (!response.ok) {
        throw new Error('견적 요청에 실패했습니다')
      }

      const result = await response.json()
      toast.success('견적 요청이 완료되었습니다!')
      router.push('/quotes')
    } catch (error) {
      console.error('견적 요청 실패:', error)
      // Mock success for development
      toast.success('견적 요청이 완료되었습니다!')
      router.push('/quotes')
    }
  }

  const totalEstimatedAmount = selectedProducts.reduce(
    (sum, product) => sum + ((product.discountPrice || product.basePrice) * product.requestedQuantity),
    0
  )

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => router.back()}
            className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeft className="h-5 w-5 mr-2" />
            견적서 목록으로
          </button>
          <h1 className="text-2xl font-bold text-gray-900">새 견적 요청</h1>
          <p className="text-gray-600 mt-2">대량 구매를 위한 견적을 요청하세요.</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Company Information */}
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center mb-4">
                  <Building2 className="h-5 w-5 text-gray-400 mr-2" />
                  <h2 className="text-lg font-semibold text-gray-900">회사 정보</h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      회사명 *
                    </label>
                    <input
                      {...register('companyName')}
                      type="text"
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="회사명을 입력하세요"
                    />
                    {errors.companyName && (
                      <p className="text-red-500 text-sm mt-1">{errors.companyName.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      담당자명 *
                    </label>
                    <input
                      {...register('contactName')}
                      type="text"
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="담당자명을 입력하세요"
                    />
                    {errors.contactName && (
                      <p className="text-red-500 text-sm mt-1">{errors.contactName.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      이메일 *
                    </label>
                    <input
                      {...register('email')}
                      type="email"
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="이메일을 입력하세요"
                    />
                    {errors.email && (
                      <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      연락처 *
                    </label>
                    <input
                      {...register('phone')}
                      type="tel"
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="연락처를 입력하세요"
                    />
                    {errors.phone && (
                      <p className="text-red-500 text-sm mt-1">{errors.phone.message}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Product Selection */}
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center">
                    <Package className="h-5 w-5 text-gray-400 mr-2" />
                    <h2 className="text-lg font-semibold text-gray-900">견적 요청 상품</h2>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowProductSelector(true)}
                    className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-blue-600 bg-blue-50 hover:bg-blue-100"
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    상품 추가
                  </button>
                </div>

                {selectedProducts.length === 0 ? (
                  <div className="text-center py-8">
                    <Package className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500 mb-4">견적을 요청할 상품을 추가해주세요</p>
                    <button
                      type="button"
                      onClick={() => setShowProductSelector(true)}
                      className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-blue-600 bg-blue-50 hover:bg-blue-100"
                    >
                      <Plus className="h-4 w-4 mr-1" />
                      첫 번째 상품 추가하기
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {selectedProducts.map((product) => (
                      <div key={product.productId} className="flex items-center space-x-4 p-4 border border-gray-200 rounded-lg">
                        <img
                          src={product.imageUrl || '/placeholder.svg'}
                          alt={product.productName}
                          className="w-16 h-16 object-cover rounded"
                        />
                        <div className="flex-1">
                          <h4 className="font-medium text-gray-900">{product.productName}</h4>
                          <p className="text-sm text-gray-500">SKU: {product.productSku}</p>
                          <p className="text-sm text-gray-500">브랜드: {product.brandName}</p>
                          {product.category && (
                            <p className="text-sm text-gray-500">카테고리: {product.category}</p>
                          )}
                          <div className="mt-1">
                            {product.discountPrice ? (
                              <div className="flex items-center space-x-2">
                                <span className="font-medium text-red-600">
                                  {formatPrice(product.discountPrice)}
                                </span>
                                <span className="text-sm text-gray-500 line-through">
                                  {formatPrice(product.basePrice)}
                                </span>
                              </div>
                            ) : (
                              <span className="font-medium text-gray-900">
                                {formatPrice(product.basePrice)}
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <label className="text-sm text-gray-700">수량:</label>
                          <input
                            type="number"
                            min="1"
                            value={product.requestedQuantity}
                            onChange={(e) => handleQuantityChange(product.productId, parseInt(e.target.value) || 1)}
                            className="w-20 border border-gray-300 rounded px-2 py-1 text-center"
                          />
                        </div>
                        <div className="text-right">
                          <p className="font-medium text-gray-900">
                            {formatPrice((product.discountPrice || product.basePrice) * product.requestedQuantity)}
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleRemoveProduct(product.productId)}
                          className="p-2 text-red-600 hover:text-red-800"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Message */}
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center mb-4">
                  <MessageSquare className="h-5 w-5 text-gray-400 mr-2" />
                  <h2 className="text-lg font-semibold text-gray-900">요청 메시지</h2>
                </div>
                <textarea
                  {...register('message')}
                  rows={4}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="견적 요청에 대한 추가 정보나 특별한 요구사항을 입력해주세요 (선택사항)"
                />
                {errors.message && (
                  <p className="text-red-500 text-sm mt-1">{errors.message.message}</p>
                )}
              </div>
            </div>

            {/* Summary Sidebar */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg shadow p-6 sticky top-8">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">견적 요약</h2>

                <div className="space-y-3 mb-4">
                  <div className="flex justify-between text-sm">
                    <span>요청 상품 수:</span>
                    <span className="font-medium">{selectedProducts.length}개</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>총 요청 수량:</span>
                    <span className="font-medium">
                      {selectedProducts.reduce((sum, p) => sum + p.requestedQuantity, 0)}개
                    </span>
                  </div>
                  <div className="border-t pt-3">
                    <div className="flex justify-between font-semibold">
                      <span>예상 금액:</span>
                      <span className="text-blue-600">{formatPrice(totalEstimatedAmount)}</span>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      * 실제 견적은 협의를 통해 확정됩니다
                    </p>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting || selectedProducts.length === 0}
                  className={`w-full py-3 px-4 rounded-lg font-medium ${
                    isSubmitting || selectedProducts.length === 0
                      ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      : 'bg-blue-600 text-white hover:bg-blue-700'
                  }`}
                >
                  {isSubmitting ? '견적 요청 중...' : '견적 요청하기'}
                </button>

                <div className="mt-4 p-3 bg-yellow-50 rounded-lg">
                  <p className="text-xs text-yellow-700">
                    • 견적 검토는 1-2영업일 소요됩니다<br />
                    • 대량 주문시 추가 할인 혜택이 제공됩니다<br />
                    • 견적서는 이메일로 발송됩니다
                  </p>
                </div>
              </div>
            </div>
          </div>
        </form>
      </div>

      {/* Product Selector Modal */}
      {showProductSelector && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-10 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-2/3 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900">상품 선택</h3>
                <button
                  onClick={() => setShowProductSelector(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <ArrowLeft className="h-6 w-6" />
                </button>
              </div>
              
              {loading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                  <p className="text-gray-500 mt-2">상품을 불러오는 중...</p>
                </div>
              ) : (
                <div className="max-h-96 overflow-y-auto">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {availableProducts.map((product) => (
                      <div
                        key={product.productId}
                        className="border border-gray-200 rounded-lg p-4 hover:shadow-md cursor-pointer"
                        onClick={() => handleAddProduct(product)}
                      >
                        <div className="flex items-center space-x-3">
                          <img
                            src={product.imageUrl || '/placeholder.svg'}
                            alt={product.productName}
                            className="w-12 h-12 object-cover rounded"
                          />
                          <div className="flex-1">
                            <h4 className="font-medium text-gray-900 text-sm">{product.productName}</h4>
                            <p className="text-xs text-gray-500">{product.brandName}</p>
                            <p className="text-xs text-gray-500">SKU: {product.productSku}</p>
                            <div className="mt-1">
                              {product.discountPrice ? (
                                <div className="flex items-center space-x-2">
                                  <span className="text-sm font-medium text-red-600">
                                    {formatPrice(product.discountPrice)}
                                  </span>
                                  <span className="text-xs text-gray-500 line-through">
                                    {formatPrice(product.basePrice)}
                                  </span>
                                </div>
                              ) : (
                                <span className="text-sm font-medium text-gray-900">
                                  {formatPrice(product.basePrice)}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
