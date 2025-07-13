'use client'

import { useState, useEffect } from 'react'
import { formatPrice, formatDateTime } from '@/lib/utils'
import { OrderStatus, Role } from '@/types'

interface OrderManagementProps {
  userRole: string
}

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

export default function OrderManagement({ userRole }: OrderManagementProps) {
  const [orders, setOrders] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedOrder, setSelectedOrder] = useState<any>(null)
  const [statusUpdateModal, setStatusUpdateModal] = useState<{
    open: boolean
    orderId: string
    currentStatus: OrderStatus
  } | null>(null)
  const [statusForm, setStatusForm] = useState({
    status: '',
    reason: '',
    trackingNumber: '',
  })
  const [updating, setUpdating] = useState(false)

  useEffect(() => {
    fetchOrders()
  }, [])

  const fetchOrders = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/orders')
      
      if (!response.ok) {
        throw new Error('Failed to fetch orders')
      }

      const result = await response.json()
      setOrders(result.data || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  const fetchOrderDetails = async (orderId: string) => {
    try {
      const response = await fetch(`/api/orders/${orderId}`)
      
      if (!response.ok) {
        throw new Error('Failed to fetch order details')
      }

      const result = await response.json()
      setSelectedOrder(result.data)
    } catch (err) {
      alert('주문 상세 정보를 불러오는데 실패했습니다.')
    }
  }

  const getValidTransitions = (currentStatus: OrderStatus): OrderStatus[] => {
    const transitions: Record<OrderStatus, OrderStatus[]> = {
      [OrderStatus.PENDING]: [OrderStatus.PAID, OrderStatus.CANCELLED],
      [OrderStatus.PAID]: [OrderStatus.PREPARING, OrderStatus.CANCELLED],
      [OrderStatus.PREPARING]: [OrderStatus.SHIPPED, OrderStatus.CANCELLED],
      [OrderStatus.SHIPPED]: [OrderStatus.DELIVERED],
      [OrderStatus.DELIVERED]: [],
      [OrderStatus.CANCELLED]: []
    }
    return transitions[currentStatus] || []
  }

  const handleStatusUpdate = async () => {
    if (!statusUpdateModal || !statusForm.status) return

    if (statusForm.status === OrderStatus.SHIPPED && !statusForm.trackingNumber) {
      alert('배송 상태로 변경하려면 송장번호를 입력해주세요.')
      return
    }

    setUpdating(true)
    try {
      const response = await fetch(`/api/orders/${statusUpdateModal.orderId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(statusForm),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error?.message || 'Failed to update status')
      }

      alert('주문 상태가 성공적으로 변경되었습니다.')
      setStatusUpdateModal(null)
      setStatusForm({ status: '', reason: '', trackingNumber: '' })
      fetchOrders()
      
      if (selectedOrder && selectedOrder.id === statusUpdateModal.orderId) {
        fetchOrderDetails(statusUpdateModal.orderId)
      }
    } catch (err) {
      alert(err instanceof Error ? err.message : '상태 변경에 실패했습니다.')
    } finally {
      setUpdating(false)
    }
  }

  const canUpdateStatus = userRole === Role.MASTER_ADMIN || userRole === Role.BRAND_ADMIN

  if (loading) {
    return (
      <div className="animate-pulse">
        <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-20 bg-gray-200 rounded"></div>
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="rounded-md bg-red-50 p-4">
        <p className="text-sm text-red-800">주문을 불러오는데 실패했습니다: {error}</p>
      </div>
    )
  }

  return (
    <>
      <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 sm:rounded-lg">
        <table className="min-w-full divide-y divide-gray-300">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                주문번호
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                주문일시
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                고객
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                상품
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                금액
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                상태
              </th>
              <th className="relative px-6 py-3">
                <span className="sr-only">Actions</span>
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {orders.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-6 py-4 text-center text-sm text-gray-500">
                  주문 내역이 없습니다.
                </td>
              </tr>
            ) : (
              orders.map((order) => (
                <tr key={order.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {order.orderNumber}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatDateTime(order.createdAt)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {order.user?.email}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {order.items[0]?.product?.nameKo || 'Unknown'}
                    {order.items.length > 1 && ` 외 ${order.items.length - 1}개`}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {formatPrice(Number(order.totalAmount))}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex rounded-full px-2 text-xs font-semibold leading-5 ${statusColors[order.status as keyof typeof statusColors]}`}>
                      {statusLabels[order.status as keyof typeof statusLabels]}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                    <button
                      onClick={() => fetchOrderDetails(order.id)}
                      className="text-primary hover:text-primary/90"
                    >
                      상세보기
                    </button>
                    {canUpdateStatus && getValidTransitions(order.status).length > 0 && (
                      <button
                        onClick={() => {
                          setStatusUpdateModal({
                            open: true,
                            orderId: order.id,
                            currentStatus: order.status,
                          })
                          setStatusForm({ status: '', reason: '', trackingNumber: '' })
                        }}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        상태변경
                      </button>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Order Detail Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="px-6 py-4 border-b">
              <h3 className="text-lg font-medium text-gray-900">
                주문 상세: {selectedOrder.orderNumber}
              </h3>
            </div>
            <div className="px-6 py-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="text-sm font-medium text-gray-900 mb-4">주문 정보</h4>
                  <dl className="space-y-2">
                    <div>
                      <dt className="text-sm font-medium text-gray-500">주문일시</dt>
                      <dd className="text-sm text-gray-900">{formatDateTime(selectedOrder.createdAt)}</dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-gray-500">현재 상태</dt>
                      <dd className="mt-1">
                        <span className={`inline-flex rounded-full px-2 text-xs font-semibold leading-5 ${statusColors[selectedOrder.status as keyof typeof statusColors]}`}>
                          {statusLabels[selectedOrder.status as keyof typeof statusLabels]}
                        </span>
                      </dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-gray-500">결제 방법</dt>
                      <dd className="text-sm text-gray-900">
                        {selectedOrder.paymentMethod === 'BANK_TRANSFER' ? '계좌이체' : '카드'}
                      </dd>
                    </div>
                    {selectedOrder.trackingInfo && (
                      <div>
                        <dt className="text-sm font-medium text-gray-500">송장번호</dt>
                        <dd className="text-sm text-gray-900">{selectedOrder.trackingInfo.trackingNumber}</dd>
                      </div>
                    )}
                  </dl>
                </div>

                <div>
                  <h4 className="text-sm font-medium text-gray-900 mb-4">배송 정보</h4>
                  <dl className="space-y-2">
                    <div>
                      <dt className="text-sm font-medium text-gray-500">수령인</dt>
                      <dd className="text-sm text-gray-900">{selectedOrder.shippingAddress?.name}</dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-gray-500">연락처</dt>
                      <dd className="text-sm text-gray-900">{selectedOrder.shippingAddress?.phone}</dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-gray-500">배송지</dt>
                      <dd className="text-sm text-gray-900">
                        {selectedOrder.shippingAddress?.address}
                        {selectedOrder.shippingAddress?.addressDetail && ` ${selectedOrder.shippingAddress.addressDetail}`}
                        <br />
                        (우편번호: {selectedOrder.shippingAddress?.zipCode})
                      </dd>
                    </div>
                  </dl>
                </div>
              </div>

              <div className="mt-6">
                <h4 className="text-sm font-medium text-gray-900 mb-4">주문 상품</h4>
                <div className="border rounded-lg overflow-hidden">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">상품명</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">브랜드</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">수량</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">단가</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">금액</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {selectedOrder.items.map((item: any) => (
                        <tr key={item.id}>
                          <td className="px-4 py-2 text-sm text-gray-900">{item.product.nameKo}</td>
                          <td className="px-4 py-2 text-sm text-gray-500">{item.product.brand?.nameKo}</td>
                          <td className="px-4 py-2 text-sm text-gray-500">{item.quantity}</td>
                          <td className="px-4 py-2 text-sm text-gray-500">{formatPrice(Number(item.price))}</td>
                          <td className="px-4 py-2 text-sm text-gray-900">{formatPrice(Number(item.price) * item.quantity)}</td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot className="bg-gray-50">
                      <tr>
                        <td colSpan={4} className="px-4 py-2 text-sm font-medium text-gray-900 text-right">
                          총 금액
                        </td>
                        <td className="px-4 py-2 text-sm font-medium text-gray-900">
                          {formatPrice(Number(selectedOrder.totalAmount))}
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </div>

              {selectedOrder.statusHistory && selectedOrder.statusHistory.length > 0 && (
                <div className="mt-6">
                  <h4 className="text-sm font-medium text-gray-900 mb-4">상태 변경 이력</h4>
                  <div className="flow-root">
                    <ul className="-mb-8">
                      {selectedOrder.statusHistory.map((history: any, idx: number) => (
                        <li key={history.id || idx}>
                          <div className="relative pb-8">
                            {idx !== selectedOrder.statusHistory.length - 1 && (
                              <span className="absolute top-4 left-4 -ml-px h-full w-0.5 bg-gray-200" aria-hidden="true" />
                            )}
                            <div className="relative flex space-x-3">
                              <div>
                                <span className={`h-8 w-8 rounded-full flex items-center justify-center ring-8 ring-white ${
                                  history.status === OrderStatus.CANCELLED ? 'bg-red-500' :
                                  history.status === OrderStatus.DELIVERED ? 'bg-green-500' :
                                  'bg-gray-400'
                                }`}>
                                  <span className="text-white text-xs">{idx + 1}</span>
                                </span>
                              </div>
                              <div className="flex min-w-0 flex-1 justify-between space-x-4 pt-1.5">
                                <div>
                                  <p className="text-sm text-gray-500">
                                    {history.action}: <span className="font-medium text-gray-900">{statusLabels[history.status as keyof typeof statusLabels]}</span>
                                    {history.reason && <span className="block text-xs mt-1">사유: {history.reason}</span>}
                                    {history.trackingNumber && <span className="block text-xs mt-1">송장번호: {history.trackingNumber}</span>}
                                  </p>
                                </div>
                                <div className="whitespace-nowrap text-right text-sm text-gray-500">
                                  <time dateTime={history.changedAt}>{formatDateTime(history.changedAt)}</time>
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
            <div className="px-6 py-4 border-t flex justify-end">
              <button
                onClick={() => setSelectedOrder(null)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
              >
                닫기
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Status Update Modal */}
      {statusUpdateModal && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full">
            <div className="px-6 py-4 border-b">
              <h3 className="text-lg font-medium text-gray-900">
                주문 상태 변경
              </h3>
            </div>
            <div className="px-6 py-4">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    현재 상태
                  </label>
                  <p className="mt-1">
                    <span className={`inline-flex rounded-full px-2 text-xs font-semibold leading-5 ${statusColors[statusUpdateModal.currentStatus]}`}>
                      {statusLabels[statusUpdateModal.currentStatus]}
                    </span>
                  </p>
                </div>

                <div>
                  <label htmlFor="status" className="block text-sm font-medium text-gray-700">
                    변경할 상태
                  </label>
                  <select
                    id="status"
                    value={statusForm.status}
                    onChange={(e) => setStatusForm({ ...statusForm, status: e.target.value })}
                    className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm rounded-md"
                  >
                    <option value="">선택하세요</option>
                    {getValidTransitions(statusUpdateModal.currentStatus).map((status) => (
                      <option key={status} value={status}>
                        {statusLabels[status]}
                      </option>
                    ))}
                  </select>
                </div>

                {statusForm.status === OrderStatus.SHIPPED && (
                  <div>
                    <label htmlFor="trackingNumber" className="block text-sm font-medium text-gray-700">
                      송장번호 <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      id="trackingNumber"
                      value={statusForm.trackingNumber}
                      onChange={(e) => setStatusForm({ ...statusForm, trackingNumber: e.target.value })}
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary sm:text-sm"
                      placeholder="송장번호를 입력하세요"
                    />
                  </div>
                )}

                <div>
                  <label htmlFor="reason" className="block text-sm font-medium text-gray-700">
                    변경 사유 (선택사항)
                  </label>
                  <textarea
                    id="reason"
                    rows={3}
                    value={statusForm.reason}
                    onChange={(e) => setStatusForm({ ...statusForm, reason: e.target.value })}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary sm:text-sm"
                    placeholder="상태 변경 사유를 입력하세요"
                  />
                </div>
              </div>
            </div>
            <div className="px-6 py-4 border-t flex justify-end space-x-3">
              <button
                onClick={() => setStatusUpdateModal(null)}
                disabled={updating}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50"
              >
                취소
              </button>
              <button
                onClick={handleStatusUpdate}
                disabled={updating || !statusForm.status}
                className="px-4 py-2 text-sm font-medium text-white bg-primary border border-transparent rounded-md hover:bg-primary/90 disabled:opacity-50"
              >
                {updating ? '처리중...' : '변경'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}