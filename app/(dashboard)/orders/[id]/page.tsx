'use client'

import { useParams, useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { ArrowLeft, Package, Truck, CheckCircle, XCircle } from 'lucide-react'
import { formatPrice, formatDateTime } from '@/lib/utils'

const statusColors = {
  PENDING: 'bg-yellow-100 text-yellow-800',
  PAID: 'bg-blue-100 text-blue-800',
  PREPARING: 'bg-indigo-100 text-indigo-800',
  SHIPPED: 'bg-purple-100 text-purple-800',
  DELIVERED: 'bg-green-100 text-green-800',
  CANCELLED: 'bg-red-100 text-red-800',
}

const statusLabels = {
  PENDING: '결제 대기',
  PAID: '결제 완료',
  PREPARING: '상품 준비중',
  SHIPPED: '배송중',
  DELIVERED: '배송 완료',
  CANCELLED: '취소됨',
}

const statusIcons = {
  PENDING: Package,
  PAID: CheckCircle,
  PREPARING: Package,
  SHIPPED: Truck,
  DELIVERED: CheckCircle,
  CANCELLED: XCircle,
}

export default function OrderDetailPage() {
  const params = useParams()
  const router = useRouter()
  const orderId = params.id as string

  const [order, setOrder] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [userRole, setUserRole] = useState<string>('')

  useEffect(() => {
    const checkAuthAndLoadOrder = async () => {
      try {
        // Check authentication
        const authResponse = await fetch('/api/auth/me')
        if (authResponse.ok) {
          const authData = await authResponse.json()
          setUserRole(authData.user.role)
        }

        // Load order details
        const orderResponse = await fetch(`/api/orders/${orderId}`, {
          credentials: 'include',
        })

        if (!orderResponse.ok) {
          throw new Error('Failed to load order')
        }

        const orderData = await orderResponse.json()
        setOrder(orderData.data)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load order')
      } finally {
        setLoading(false)
      }
    }

    checkAuthAndLoadOrder()
  }, [orderId])

  if (loading) {
    return <div className="text-center py-4">로딩 중...</div>
  }

  if (error) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="rounded-md bg-red-50 p-4">
          <p className="text-sm text-red-800">{error}</p>
        </div>
      </div>
    )
  }

  if (!order) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="text-center py-12">
          <p className="text-gray-500">주문을 찾을 수 없습니다.</p>
        </div>
      </div>
    )
  }

  const StatusIcon = statusIcons[order.status as keyof typeof statusIcons]

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-8">
        <Link
          href="/orders"
          className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          주문 목록으로 돌아가기
        </Link>
      </div>

      <div className="bg-white shadow rounded-lg">
        {/* Header */}
        <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-semibold text-gray-900">
                주문 상세: {order.orderNumber}
              </h1>
              <p className="mt-1 text-sm text-gray-500">
                {formatDateTime(order.createdAt)} 주문
              </p>
            </div>
            <div className="flex items-center space-x-3">
              <StatusIcon className="h-6 w-6 text-gray-400" />
              <span className={`inline-flex rounded-full px-3 py-1 text-sm font-semibold ${statusColors[order.status as keyof typeof statusColors]}`}>
                {statusLabels[order.status as keyof typeof statusLabels]}
              </span>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="px-4 py-5 sm:p-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Order Information */}
            <div className="lg:col-span-2 space-y-8">
              {/* Order Items */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">주문 상품</h3>
                <div className="border rounded-lg overflow-hidden">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">상품</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">브랜드</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">수량</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">단가</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">금액</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {order.items.map((item: any) => (
                        <tr key={item.id}>
                          <td className="px-4 py-4">
                            <div className="flex items-center">
                              {item.product.thumbnailImage && (
                                <img
                                  src={item.product.thumbnailImage}
                                  alt={item.product.nameKo}
                                  className="h-10 w-10 rounded-lg object-cover mr-3"
                                />
                              )}
                              <div>
                                <div className="text-sm font-medium text-gray-900">
                                  {item.product.nameKo}
                                </div>
                                <div className="text-sm text-gray-500">
                                  SKU: {item.product.sku}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-4 text-sm text-gray-500">
                            {item.product.brand?.nameKo}
                          </td>
                          <td className="px-4 py-4 text-sm text-gray-500">
                            {item.quantity}
                          </td>
                          <td className="px-4 py-4 text-sm text-gray-500">
                            {formatPrice(Number(item.price))}
                          </td>
                          <td className="px-4 py-4 text-sm font-medium text-gray-900">
                            {formatPrice(Number(item.price) * item.quantity)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot className="bg-gray-50">
                      <tr>
                        <td colSpan={4} className="px-4 py-3 text-sm font-medium text-gray-900 text-right">
                          총 주문 금액
                        </td>
                        <td className="px-4 py-3 text-sm font-bold text-gray-900">
                          {formatPrice(Number(order.totalAmount))}
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </div>

              {/* Status History */}
              {order.statusHistory && order.statusHistory.length > 0 && (
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">주문 진행 상황</h3>
                  <div className="flow-root">
                    <ul className="-mb-8">
                      {order.statusHistory.map((history: any, idx: number) => (
                        <li key={history.id || idx}>
                          <div className="relative pb-8">
                            {idx !== order.statusHistory.length - 1 && (
                              <span className="absolute top-4 left-4 -ml-px h-full w-0.5 bg-gray-200" />
                            )}
                            <div className="relative flex space-x-3">
                              <div>
                                <span className={`h-8 w-8 rounded-full flex items-center justify-center ring-8 ring-white ${
                                  history.status === 'CANCELLED' ? 'bg-red-500' :
                                  history.status === 'DELIVERED' ? 'bg-green-500' :
                                  'bg-gray-400'
                                }`}>
                                  <span className="text-white text-xs font-medium">{idx + 1}</span>
                                </span>
                              </div>
                              <div className="flex min-w-0 flex-1 justify-between space-x-4 pt-1.5">
                                <div>
                                  <p className="text-sm text-gray-500">
                                    상태 변경: <span className="font-medium text-gray-900">{statusLabels[history.status as keyof typeof statusLabels]}</span>
                                  </p>
                                  {history.reason && (
                                    <p className="text-xs text-gray-500 mt-1">사유: {history.reason}</p>
                                  )}
                                  {history.trackingNumber && (
                                    <p className="text-xs text-gray-500 mt-1">송장번호: {history.trackingNumber}</p>
                                  )}
                                </div>
                                <div className="whitespace-nowrap text-right text-sm text-gray-500">
                                  <time>{formatDateTime(history.changedAt)}</time>
                                  <p className="text-xs">{history.changedBy}</p>
                                </div>
                              </div>
                            </div>
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Customer Information */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="text-sm font-medium text-gray-900 mb-3">고객 정보</h3>
                <dl className="space-y-2">
                  <div>
                    <dt className="text-xs font-medium text-gray-500">이름</dt>
                    <dd className="text-sm text-gray-900">{order.user?.name || '정보 없음'}</dd>
                  </div>
                  <div>
                    <dt className="text-xs font-medium text-gray-500">이메일</dt>
                    <dd className="text-sm text-gray-900">{order.user?.email || '정보 없음'}</dd>
                  </div>
                </dl>
              </div>

              {/* Shipping Information */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="text-sm font-medium text-gray-900 mb-3">배송 정보</h3>
                <dl className="space-y-2">
                  <div>
                    <dt className="text-xs font-medium text-gray-500">수령인</dt>
                    <dd className="text-sm text-gray-900">{order.shippingAddress?.name}</dd>
                  </div>
                  <div>
                    <dt className="text-xs font-medium text-gray-500">연락처</dt>
                    <dd className="text-sm text-gray-900">{order.shippingAddress?.phone}</dd>
                  </div>
                  <div>
                    <dt className="text-xs font-medium text-gray-500">주소</dt>
                    <dd className="text-sm text-gray-900">
                      {order.shippingAddress?.address}
                      {order.shippingAddress?.addressDetail && ` ${order.shippingAddress.addressDetail}`}
                      <br />
                      <span className="text-xs text-gray-500">
                        우편번호: {order.shippingAddress?.zipCode}
                      </span>
                    </dd>
                  </div>
                </dl>
              </div>

              {/* Payment Information */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="text-sm font-medium text-gray-900 mb-3">결제 정보</h3>
                <dl className="space-y-2">
                  <div>
                    <dt className="text-xs font-medium text-gray-500">결제 방법</dt>
                    <dd className="text-sm text-gray-900">
                      {order.paymentMethod === 'BANK_TRANSFER' ? '계좌이체' : '카드결제'}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-xs font-medium text-gray-500">결제 금액</dt>
                    <dd className="text-sm font-medium text-gray-900">
                      {formatPrice(Number(order.totalAmount))}
                    </dd>
                  </div>
                </dl>
              </div>

              {/* Memo */}
              {order.memo && (
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="text-sm font-medium text-gray-900 mb-3">주문 메모</h3>
                  <p className="text-sm text-gray-700">{order.memo}</p>
                </div>
              )}

              {/* Actions */}
              {(userRole === 'MASTER_ADMIN' || userRole === 'BRAND_ADMIN') && (
                <div className="bg-white border rounded-lg p-4">
                  <h3 className="text-sm font-medium text-gray-900 mb-3">관리 작업</h3>
                  <div className="space-y-2">
                    <button
                      onClick={() => router.push(`/orders/${orderId}/edit`)}
                      className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-md"
                    >
                      주문 상태 변경
                    </button>
                    <button
                      onClick={() => window.print()}
                      className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-md"
                    >
                      주문서 인쇄
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}