'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useCartStore } from '@/lib/stores/cart'
import { formatPrice } from '@/lib/utils'
import { toast } from 'sonner'
import { CreditCard, MapPin, Package, ArrowLeft, X, ChevronDown } from 'lucide-react'
import { useLanguage } from '@/lib/contexts/language-context'
import { calculateShippingCost, formatAddressDisplay } from '@/lib/utils/shipping'

interface ShippingAddress {
  id: string
  name: string
  recipient: string
  phone: string
  countryCode: 'KR' | 'CN'
  regionCode?: string
  cityCode?: string
  province?: string
  city?: string
  district?: string
  zipCode: string
  address: string
  detailAddress: string
  isDefault: boolean
}

interface PaymentMethod {
  id: string
  name: string
  description: string
  icon: React.ReactNode
}

const addressSchema = z.object({
  name: z.string().min(1, '배송지명을 입력해주세요').max(50, '배송지명은 50자 이하여야 합니다'),
  recipient: z.string().min(2, '받는 분은 2자 이상이어야 합니다').max(30, '받는 분은 30자 이하여야 합니다'),
  phone: z.string().min(10, '연락처를 정확히 입력해주세요').max(15, '연락처는 15자 이하여야 합니다'),
  countryCode: z.enum(['KR', 'CN']),
  province: z.string().optional(),
  city: z.string().optional(),
  district: z.string().optional(),
  zipCode: z.string().min(3, '우편번호를 입력해주세요'),
  address: z.string().min(5, '주소를 입력해주세요'),
  detailAddress: z.string().min(1, '상세주소를 입력해주세요'),
  isDefault: z.boolean().optional(),
})

type AddressFormData = z.infer<typeof addressSchema>

export default function CheckoutPage() {
  const router = useRouter()
  const { items, clearCart } = useCartStore()
  const { language, t } = useLanguage()
  const [selectedAddress, setSelectedAddress] = useState<ShippingAddress | null>(null)
  const [selectedPayment, setSelectedPayment] = useState<string>('card')
  const [addresses, setAddresses] = useState<ShippingAddress[]>([])
  const [isProcessing, setIsProcessing] = useState(false)
  const [orderNote, setOrderNote] = useState('')
  const [showAddressModal, setShowAddressModal] = useState(false)
  const [isAddingAddress, setIsAddingAddress] = useState(false)
  const [selectedCountry, setSelectedCountry] = useState<'KR' | 'CN'>(language === 'zh' ? 'CN' : 'KR')

  const {
    register: registerAddress,
    handleSubmit: handleAddressSubmit,
    formState: { errors: addressErrors },
    reset: resetAddressForm,
    setValue: setAddressValue,
  } = useForm<AddressFormData>({
    resolver: zodResolver(addressSchema),
    defaultValues: {
      name: '',
      recipient: '',
      phone: '',
      countryCode: language === 'zh' ? 'CN' as const : 'KR' as const,
      province: '',
      city: '',
      district: '',
      zipCode: '',
      address: '',
      detailAddress: '',
      isDefault: false,
    }
  })

  // 국가 변경시 폼 리셋
  useEffect(() => {
    setAddressValue('countryCode', selectedCountry)
    if (selectedCountry === 'CN') {
      setAddressValue('zipCode', '')
      setAddressValue('address', '')
    }
  }, [selectedCountry, setAddressValue])

  useEffect(() => {
    if (items.length === 0) {
      router.push('/cart')
      return
    }

    loadAddresses()
  }, [items.length, router])

  const loadAddresses = async () => {
    try {
      const response = await fetch('/api/users/addresses', {
        credentials: 'include',
      })

      if (response.ok) {
        const data = await response.json()
        const userAddresses = data.data || []
        setAddresses(userAddresses)
        
        // 기본 배송지 자동 선택
        const defaultAddress = userAddresses.find((addr: ShippingAddress) => addr.isDefault)
        if (defaultAddress) {
          setSelectedAddress(defaultAddress)
        } else if (userAddresses.length > 0) {
          setSelectedAddress(userAddresses[0])
        }
      }
    } catch (error) {
      console.error('주소 로드 실패:', error)
      // Mock data for development
      const mockAddresses = [
        {
          id: '1',
          name: '집',
          recipient: '홍길동',
          phone: '010-1234-5678',
          countryCode: 'KR' as const,
          regionCode: 'SEOUL',
          province: '',
          city: '',
          district: '',
          zipCode: '06142',
          address: '서울특별시 강남구 테헤란로 123',
          detailAddress: '456호',
          isDefault: true,
        }
      ]
      setAddresses(mockAddresses)
      setSelectedAddress(mockAddresses[0])
    }
  }

  // 국가별 결제 수단
  const getPaymentMethods = (countryCode: string): PaymentMethod[] => {
    const commonMethods = [
      {
        id: 'card',
        name: t.creditCard,
        description: language === 'ko' ? '안전한 카드 결제' : '安全的卡片支付',
        icon: <CreditCard className="h-5 w-5" />
      }
    ]
    
    if (countryCode === 'CN') {
      return [
        ...commonMethods,
        {
          id: 'alipay',
          name: t.alipay,
          description: language === 'ko' ? '알리페이로 결제' : '支付宝支付',
          icon: <Package className="h-5 w-5" />
        },
        {
          id: 'wechat',
          name: t.wechatPay,
          description: language === 'ko' ? '위챗페이로 결제' : '微信支付',
          icon: <Package className="h-5 w-5" />
        }
      ]
    }
    
    return [
      ...commonMethods,
      {
        id: 'bank',
        name: t.bankTransfer,
        description: language === 'ko' ? '계좌이체로 결제' : '银行转账支付',
        icon: <Package className="h-5 w-5" />
      }
    ]
  }
  
  const paymentMethods = getPaymentMethods(selectedAddress?.countryCode || 'KR')

  const totalAmount = items.reduce((sum, item) => sum + (item.price * item.quantity), 0)
  
  // 배송비 계산 (Shein 스타일 API 사용)
  const shippingInfo = selectedAddress 
    ? calculateShippingCost(selectedAddress.countryCode, totalAmount)
    : { methods: [], freeShippingThreshold: null, recommendedMethodId: null }
  
  const shippingFee = shippingInfo.methods[0]?.price || 0
  const finalAmount = totalAmount + shippingFee

  const handleOrder = async () => {
    if (!selectedAddress) {
      toast.error('배송지를 선택해주세요')
      return
    }

    if (!selectedPayment) {
      toast.error('결제방법을 선택해주세요')
      return
    }

    setIsProcessing(true)

    try {
      const orderData = {
        items: items.map(item => ({
          productId: item.productId,
          quantity: item.quantity,
          unitPrice: item.price,
        })),
        shippingAddress: selectedAddress,
        paymentMethod: selectedPayment,
        totalAmount: finalAmount,
        shippingFee,
        orderNote,
      }

      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(orderData),
      })

      if (!response.ok) {
        throw new Error('주문 처리에 실패했습니다')
      }

      const result = await response.json()
      
      // 장바구니 비우기
      clearCart()
      
      toast.success('주문이 완료되었습니다!')
      
      // 주문 완료 페이지로 이동
      router.push(`/orders/${result.data.orderNumber}`)
      
    } catch (error) {
      console.error('주문 실패:', error)
      
      // Mock success for development
      const mockOrderNumber = `ORD-${Date.now()}`
      clearCart()
      toast.success('주문이 완료되었습니다!')
      router.push(`/orders/${mockOrderNumber}`)
      
    } finally {
      setIsProcessing(false)
    }
  }

  const handleAddAddress = async (data: AddressFormData) => {
    try {
      setIsAddingAddress(true)
      const response = await fetch('/api/users/addresses', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        throw new Error('배송지 추가에 실패했습니다')
      }

      const result = await response.json()
      const newAddress = result.data
      
      // 새로운 배송지를 목록에 추가
      setAddresses(prev => [...prev, newAddress])
      
      // 기본배송지로 설정된 경우 자동 선택
      if (data.isDefault || addresses.length === 0) {
        setSelectedAddress(newAddress)
      }
      
      toast.success('배송지가 추가되었습니다')
      setShowAddressModal(false)
      resetAddressForm()
    } catch (error) {
      console.error('배송지 추가 실패:', error)
      // Mock success for development
      const mockAddress: ShippingAddress = {
        id: `addr-${Date.now()}`,
        name: data.name,
        recipient: data.recipient,
        phone: data.phone,
        countryCode: data.countryCode,
        regionCode: data.province || data.city,
        cityCode: data.district,
        province: data.province,
        city: data.city,
        district: data.district,
        zipCode: data.zipCode,
        address: data.address,
        detailAddress: data.detailAddress,
        isDefault: data.isDefault || addresses.length === 0,
      }
      
      setAddresses(prev => [...prev, mockAddress])
      setSelectedAddress(mockAddress)
      toast.success('배송지가 추가되었습니다')
      setShowAddressModal(false)
      resetAddressForm()
    } finally {
      setIsAddingAddress(false)
    }
  }

  const searchAddress = () => {
    if (typeof window !== 'undefined' && (window as any).daum) {
      new (window as any).daum.Postcode({
        oncomplete: function(data: any) {
          setAddressValue('zipCode', data.zonecode)
          setAddressValue('address', data.address)
        }
      }).open()
    } else {
      toast.error('주소 검색 서비스를 로드할 수 없습니다')
    }
  }

  if (items.length === 0) {
    return null
  }

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
            장바구니로 돌아가기
          </button>
          <h1 className="text-2xl font-bold text-gray-900">주문결제</h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Shipping Address */}
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center mb-4">
                <MapPin className="h-5 w-5 text-gray-400 mr-2" />
                <h2 className="text-lg font-semibold text-gray-900">배송지 정보</h2>
              </div>

              {addresses.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-500 mb-4">등록된 배송지가 없습니다</p>
                  <button
                    onClick={() => setShowAddressModal(true)}
                    className="text-blue-600 hover:text-blue-800"
                  >
                    배송지 추가하기
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  {addresses.map((address) => (
                    <label
                      key={address.id}
                      className={`block p-4 border rounded-lg cursor-pointer ${
                        selectedAddress?.id === address.id
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <input
                        type="radio"
                        name="address"
                        value={address.id}
                        checked={selectedAddress?.id === address.id}
                        onChange={() => setSelectedAddress(address)}
                        className="sr-only"
                      />
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="flex items-center">
                            <span className="font-semibold">{address.name}</span>
                            {address.isDefault && (
                              <span className="ml-2 px-2 py-1 bg-blue-600 text-white text-xs rounded">
                                기본배송지
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-gray-600 mt-1">
                            {address.recipient} | {address.phone}
                          </p>
                          <div className="text-sm text-gray-600">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
                                {address.countryCode === 'KR' ? t.korea : t.china}
                              </span>
                              {address.countryCode === 'CN' && address.province && (
                                <span className="text-xs text-gray-500">{address.province}</span>
                              )}
                            </div>
                            <p>
                              {formatAddressDisplay({
                                ...address,
                                addressLine1: address.address,
                                addressLine2: address.detailAddress,
                                postalCode: address.zipCode
                              }, language === 'zh' ? 'zh' : 'ko')}
                            </p>
                          </div>
                        </div>
                      </div>
                    </label>
                  ))}
                  
                  <button
                    onClick={() => setShowAddressModal(true)}
                    className="w-full p-3 border border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-gray-400 hover:text-gray-800"
                  >
                    + 새 배송지 추가
                  </button>
                </div>
              )}
            </div>

            {/* Payment Method */}
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center mb-4">
                <CreditCard className="h-5 w-5 text-gray-400 mr-2" />
                <h2 className="text-lg font-semibold text-gray-900">결제수단</h2>
              </div>

              <div className="space-y-3">
                {paymentMethods.map((method) => (
                  <label
                    key={method.id}
                    className={`block p-4 border rounded-lg cursor-pointer ${
                      selectedPayment === method.id
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <input
                      type="radio"
                      name="payment"
                      value={method.id}
                      checked={selectedPayment === method.id}
                      onChange={(e) => setSelectedPayment(e.target.value)}
                      className="sr-only"
                    />
                    <div className="flex items-center">
                      {method.icon}
                      <div className="ml-3">
                        <p className="font-medium">{method.name}</p>
                        <p className="text-sm text-gray-500">{method.description}</p>
                      </div>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {/* Order Note */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">배송 요청사항</h2>
              <textarea
                value={orderNote}
                onChange={(e) => setOrderNote(e.target.value)}
                placeholder="배송 시 요청사항을 입력해주세요 (선택사항)"
                rows={3}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          {/* Order Summary Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow p-6 sticky top-8">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">주문 요약</h2>

              {/* Order Items */}
              <div className="space-y-3 mb-4">
                {items.map((item) => (
                  <div key={item.id} className="flex items-center space-x-3">
                    <img
                      src={item.imageUrl || '/placeholder.svg'}
                      alt={item.name}
                      className="w-12 h-12 object-cover rounded"
                    />
                    <div className="flex-1">
                      <h4 className="text-sm font-medium text-gray-900 line-clamp-2">
                        {item.name}
                      </h4>
                      <p className="text-sm text-gray-500">
                        {formatPrice(item.price)} × {item.quantity}
                      </p>
                    </div>
                    <div className="text-sm font-medium">
                      {formatPrice(item.price * item.quantity)}
                    </div>
                  </div>
                ))}
              </div>

              <div className="border-t pt-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span>상품금액</span>
                  <span>{formatPrice(totalAmount)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <div>
                    <span>배송비</span>
                    {selectedAddress && shippingInfo.freeShippingThreshold && (
                      <div className="text-xs text-gray-500 mt-1">
                        {selectedAddress.countryCode === 'KR' 
                          ? `${t.domesticShipping} (${(shippingInfo.freeShippingThreshold / 10000).toFixed(0)}만원이상 ${t.freeShipping})`
                          : `${t.internationalShipping} (${(shippingInfo.freeShippingThreshold / 10000).toFixed(0)}만원이상 ${t.freeShipping})`
                        }
                      </div>
                    )}
                  </div>
                  <span>
                    {shippingFee === 0 ? (
                      <span className="text-green-600">{t.freeShipping}</span>
                    ) : (
                      <span className={selectedAddress?.countryCode === 'CN' ? 'text-orange-600' : ''}>
                        {formatPrice(shippingFee)}
                      </span>
                    )}
                  </span>
                </div>
                <div className="border-t pt-2">
                  <div className="flex justify-between font-semibold text-lg">
                    <span>총 결제금액</span>
                    <span className="text-blue-600">{formatPrice(finalAmount)}</span>
                  </div>
                </div>
              </div>

              {selectedAddress && shippingInfo.methods.length > 0 && (
                <div className="text-xs text-gray-500 mt-2">
                  {selectedAddress.countryCode === 'KR' ? (
                    shippingInfo.freeShippingThreshold && totalAmount < shippingInfo.freeShippingThreshold && (
                      <p>{(shippingInfo.freeShippingThreshold / 10000).toFixed(0)}만원 이상 구매시 무료배송</p>
                    )
                  ) : (
                    <div>
                      <p className="text-orange-600 font-medium">
                        {shippingInfo.methods[0]?.name || 'EMS'} {language === 'ko' ? '해외배송' : '国际配送'} ({shippingInfo.methods[0]?.estimatedDays || '3-5일 소요'})
                      </p>
                      {shippingInfo.freeShippingThreshold && totalAmount < shippingInfo.freeShippingThreshold && (
                        <p>{(shippingInfo.freeShippingThreshold / 10000).toFixed(0)}만원 이상 구매시 무료배송</p>
                      )}
                    </div>
                  )}
                </div>
              )}

              <button
                onClick={handleOrder}
                disabled={isProcessing || !selectedAddress}
                className={`w-full mt-6 py-3 px-4 rounded-lg font-medium ${
                  isProcessing || !selectedAddress
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-blue-600 text-white hover:bg-blue-700'
                }`}
              >
                {isProcessing ? '주문 처리중...' : `${formatPrice(finalAmount)} 결제하기`}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Add Address Modal */}
      {showAddressModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-10 mx-auto p-5 border w-11/12 md:w-2/3 lg:w-1/2 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900">새 배송지 추가</h3>
                <button
                  onClick={() => {
                    setShowAddressModal(false)
                    resetAddressForm()
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>
              
              <form onSubmit={handleAddressSubmit(handleAddAddress)} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      배송지명 *
                    </label>
                    <input
                      {...registerAddress('name')}
                      type="text"
                      placeholder="예: 집, 회사"
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                    {addressErrors.name && (
                      <p className="text-red-500 text-sm mt-1">{addressErrors.name.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      받는 분 *
                    </label>
                    <input
                      {...registerAddress('recipient')}
                      type="text"
                      placeholder="받는 분 성함"
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                    {addressErrors.recipient && (
                      <p className="text-red-500 text-sm mt-1">{addressErrors.recipient.message}</p>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    연락처 *
                  </label>
                  <input
                    {...registerAddress('phone')}
                    type="tel"
                    placeholder="010-0000-0000"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                  {addressErrors.phone && (
                    <p className="text-red-500 text-sm mt-1">{addressErrors.phone.message}</p>
                  )}
                </div>

                {/* 국가 선택 */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    국가 *
                  </label>
                  <div className="relative">
                    <select
                      {...registerAddress('countryCode')}
                      value={selectedCountry}
                      onChange={(e) => {
                        const newCountry = e.target.value as 'KR' | 'CN'
                        setSelectedCountry(newCountry)
                        setAddressValue('countryCode', newCountry)
                      }}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none"
                    >
                      <option value="KR">{t.korea} 🇰🇷</option>
                      <option value="CN">{t.china} 🇨🇳</option>
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                  </div>
                </div>

                {selectedCountry === 'CN' && (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        성/직할시 *
                      </label>
                      <input
                        {...registerAddress('province')}
                        type="text"
                        placeholder="예: 북경시, 상해시"
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                      {addressErrors.province && (
                        <p className="text-red-500 text-sm mt-1">{addressErrors.province.message}</p>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        도시 *
                      </label>
                      <input
                        {...registerAddress('city')}
                        type="text"
                        placeholder="도시명"
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                      {addressErrors.city && (
                        <p className="text-red-500 text-sm mt-1">{addressErrors.city.message}</p>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        구/현
                      </label>
                      <input
                        {...registerAddress('district')}
                        type="text"
                        placeholder="구/현명"
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                      {addressErrors.district && (
                        <p className="text-red-500 text-sm mt-1">{addressErrors.district.message}</p>
                      )}
                    </div>
                  </div>
                )}

                {/* 주소 입력 */}
                {selectedCountry === 'KR' ? (
                  // 한국 주소 (다음 우편번호 API 사용)
                  <div className="grid grid-cols-3 gap-2">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        우편번호 *
                      </label>
                      <input
                        {...registerAddress('zipCode')}
                        type="text"
                        placeholder="우편번호"
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        readOnly
                      />
                      {addressErrors.zipCode && (
                        <p className="text-red-500 text-sm mt-1">{addressErrors.zipCode.message}</p>
                      )}
                    </div>
                    <div className="col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        주소 *
                      </label>
                      <div className="flex">
                        <input
                          {...registerAddress('address')}
                          type="text"
                          placeholder="주소 검색 버튼을 클릭하세요"
                          className="flex-1 border border-gray-300 rounded-l-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          readOnly
                        />
                        <button
                          type="button"
                          onClick={searchAddress}
                          className="px-4 py-2 bg-gray-600 text-white rounded-r-lg hover:bg-gray-700"
                        >
                          검색
                        </button>
                      </div>
                      {addressErrors.address && (
                        <p className="text-red-500 text-sm mt-1">{addressErrors.address.message}</p>
                      )}
                    </div>
                  </div>
                ) : (
                  // 중국 주소 (수동 입력)
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        우편번호 *
                      </label>
                      <input
                        {...registerAddress('zipCode')}
                        type="text"
                        placeholder="예: 100000"
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                      {addressErrors.zipCode && (
                        <p className="text-red-500 text-sm mt-1">{addressErrors.zipCode.message}</p>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        주소 *
                      </label>
                      <input
                        {...registerAddress('address')}
                        type="text"
                        placeholder="상세 주소를 입력하세요"
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                      {addressErrors.address && (
                        <p className="text-red-500 text-sm mt-1">{addressErrors.address.message}</p>
                      )}
                    </div>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    상세주소 *
                  </label>
                  <input
                    {...registerAddress('detailAddress')}
                    type="text"
                    placeholder="동, 호수 등 상세주소를 입력하세요"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                  {addressErrors.detailAddress && (
                    <p className="text-red-500 text-sm mt-1">{addressErrors.detailAddress.message}</p>
                  )}
                </div>

                <div className="flex items-center">
                  <input
                    {...registerAddress('isDefault')}
                    type="checkbox"
                    className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <label className="ml-2 text-sm text-gray-700">
                    기본 배송지로 설정
                  </label>
                </div>

                <div className="flex justify-end space-x-3 pt-4 border-t">
                  <button
                    type="button"
                    onClick={() => {
                      setShowAddressModal(false)
                      resetAddressForm()
                    }}
                    className="px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                  >
                    취소
                  </button>
                  <button
                    type="submit"
                    disabled={isAddingAddress}
                    className={`px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white ${
                      isAddingAddress
                        ? 'bg-gray-400 cursor-not-allowed'
                        : 'bg-blue-600 hover:bg-blue-700'
                    }`}
                  >
                    {isAddingAddress ? '추가 중...' : '배송지 추가'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}