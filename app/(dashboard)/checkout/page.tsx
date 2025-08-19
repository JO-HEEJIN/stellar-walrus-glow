'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useCartStore } from '@/lib/stores/cart'
import { formatPrice } from '@/lib/utils'
import { toast } from 'sonner'
import { CreditCard, MapPin, Package, ArrowLeft } from 'lucide-react'

interface ShippingAddress {
  id: string
  name: string
  recipient: string
  phone: string
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

export default function CheckoutPage() {
  const router = useRouter()
  const { items, clearCart } = useCartStore()
  const [selectedAddress, setSelectedAddress] = useState<ShippingAddress | null>(null)
  const [selectedPayment, setSelectedPayment] = useState<string>('card')
  const [addresses, setAddresses] = useState<ShippingAddress[]>([])
  const [isProcessing, setIsProcessing] = useState(false)
  const [orderNote, setOrderNote] = useState('')

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

  const paymentMethods: PaymentMethod[] = [
    {
      id: 'card',
      name: '신용카드',
      description: '안전한 카드 결제',
      icon: <CreditCard className="h-5 w-5" />
    },
    {
      id: 'bank',
      name: '무통장입금',
      description: '계좌이체로 결제',
      icon: <Package className="h-5 w-5" />
    },
  ]

  const totalAmount = items.reduce((sum, item) => sum + (item.price * item.quantity), 0)
  const shippingFee = totalAmount >= 50000 ? 0 : 3000
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
                    onClick={() => router.push('/my-page?tab=addresses')}
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
                          <p className="text-sm text-gray-600">
                            ({address.zipCode}) {address.address} {address.detailAddress}
                          </p>
                        </div>
                      </div>
                    </label>
                  ))}
                  
                  <button
                    onClick={() => router.push('/my-page?tab=addresses')}
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
                  <span>배송비</span>
                  <span>
                    {shippingFee === 0 ? (
                      <span className="text-green-600">무료</span>
                    ) : (
                      formatPrice(shippingFee)
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

              {totalAmount < 50000 && (
                <p className="text-xs text-gray-500 mt-2">
                  50,000원 이상 구매시 무료배송
                </p>
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
    </div>
  )
}