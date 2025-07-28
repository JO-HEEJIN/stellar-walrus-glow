'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useCartStore } from '@/lib/stores/cart'
import { formatPrice } from '@/lib/utils'
import { MIN_ORDER_AMOUNT } from '@/lib/domain/models'
import { Trash2 } from 'lucide-react'

export default function CartPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const { items, updateQuantity, removeItem, clearCart, getTotalAmount } = useCartStore()
  const totalAmount = getTotalAmount()

  const handleCheckout = async () => {
    if (items.length === 0) return
    
    // Check minimum order amount
    if (totalAmount < MIN_ORDER_AMOUNT) {
      alert(`최소 주문 금액은 ${formatPrice(MIN_ORDER_AMOUNT)}입니다. 현재 금액: ${formatPrice(totalAmount)}`)
      return
    }

    setLoading(true)
    try {
      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          items: items.map(item => ({
            productId: item.productId,
            quantity: item.quantity,
          })),
          shippingAddress: {
            // In a real app, this would come from a form
            name: '홍길동',
            phone: '010-1234-5678',
            address: '서울시 강남구 테헤란로 123',
            addressDetail: '456호',
            zipCode: '06234',
          },
          paymentMethod: 'CARD',
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        console.error('Order creation failed:', errorData)
        
        // Handle specific error messages
        if (response.status === 422 && errorData.error?.message?.includes('최소 주문 금액')) {
          alert(errorData.error.message)
        } else {
          alert(errorData.error?.message || '주문 처리 중 오류가 발생했습니다.')
        }
        return
      }

      const result = await response.json()
      clearCart()
      alert(`주문이 완료되었습니다. 주문번호: ${result.data.order.orderNumber}`)
      router.push('/orders')
    } catch (error) {
      console.error('Order error:', error)
      alert(error instanceof Error ? error.message : '주문 처리 중 오류가 발생했습니다.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <h1 className="text-2xl font-semibold text-gray-900 mb-8">장바구니</h1>

      {items.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500 mb-4">장바구니가 비어있습니다.</p>
          <button
            onClick={() => router.push('/products')}
            className="text-primary hover:text-primary/90"
          >
            상품 보러가기 →
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <div className="bg-white shadow overflow-hidden sm:rounded-lg">
              <ul className="divide-y divide-gray-200">
                {items.map((item) => (
                  <li key={item.productId} className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <h3 className="text-sm font-medium text-gray-900">
                          {item.productName}
                        </h3>
                        <p className="mt-1 text-sm text-gray-500">
                          {formatPrice(item.price)} / 개
                        </p>
                      </div>
                      <div className="flex items-center space-x-4">
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                            className="text-gray-400 hover:text-gray-500"
                          >
                            -
                          </button>
                          <input
                            type="number"
                            value={item.quantity}
                            onChange={(e) => updateQuantity(item.productId, parseInt(e.target.value) || 0)}
                            className="w-16 text-center border-gray-300 rounded-md"
                            min="1"
                          />
                          <button
                            onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                            className="text-gray-400 hover:text-gray-500"
                          >
                            +
                          </button>
                        </div>
                        <div className="text-sm font-medium text-gray-900 w-24 text-right">
                          {formatPrice(item.price * item.quantity)}
                        </div>
                        <button
                          onClick={() => removeItem(item.productId)}
                          className="text-red-600 hover:text-red-900"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div>
            <div className="bg-white shadow overflow-hidden sm:rounded-lg p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4">주문 요약</h2>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">상품 금액</span>
                  <span className="text-gray-900">{formatPrice(totalAmount)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">배송비</span>
                  <span className="text-gray-900">무료</span>
                </div>
                <div className="border-t pt-2 mt-2">
                  <div className="flex justify-between">
                    <span className="text-base font-medium text-gray-900">총 금액</span>
                    <span className="text-base font-medium text-gray-900">
                      {formatPrice(totalAmount)}
                    </span>
                  </div>
                </div>
                
                {/* 최소 주문 금액 안내 */}
                {totalAmount < MIN_ORDER_AMOUNT && (
                  <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
                    <div className="flex">
                      <div className="ml-3">
                        <p className="text-sm text-yellow-800">
                          최소 주문 금액: {formatPrice(MIN_ORDER_AMOUNT)}
                        </p>
                        <p className="text-sm text-yellow-700">
                          {formatPrice(MIN_ORDER_AMOUNT - totalAmount)} 더 주문하시면 결제가 가능합니다.
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
              <button
                onClick={handleCheckout}
                disabled={loading || items.length === 0 || totalAmount < MIN_ORDER_AMOUNT}
                className="mt-6 w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? '처리중...' : '주문하기'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}