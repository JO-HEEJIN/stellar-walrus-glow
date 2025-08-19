'use client'

import { useState, useEffect } from 'react'
import { Package, Truck, CheckCircle, XCircle, Clock, Eye } from 'lucide-react'
import { formatPrice } from '@/lib/utils'

interface Order {
  id: string
  orderNumber: string
  status: 'PENDING' | 'CONFIRMED' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED'
  totalAmount: number
  createdAt: string
  updatedAt: string
  items: OrderItem[]
  shippingAddress?: {
    name: string
    phone: string
    address: string
    zipCode: string
  }
  trackingNumber?: string
}

interface OrderItem {
  id: string
  productId: string
  productName: string
  productSku: string
  quantity: number
  unitPrice: number
  totalPrice: number
  imageUrl?: string
}

interface OrderHistoryProps {
  userId: string
}

export default function OrderHistory({ userId }: OrderHistoryProps) {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const [statusFilter, setStatusFilter] = useState<string>('ALL')

  useEffect(() => {
    loadOrders()
  }, [userId, statusFilter])

  const loadOrders = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams()
      if (statusFilter !== 'ALL') {
        params.append('status', statusFilter)
      }
      params.append('limit', '20')
      params.append('sort', 'createdAt:desc')

      const response = await fetch(`/api/orders?${params.toString()}`, {
        credentials: 'include',
      })

      if (!response.ok) {
        throw new Error('주문 내역을 불러오는데 실패했습니다')
      }

      const data = await response.json()
      setOrders(data.data?.orders || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : '알 수 없는 오류가 발생했습니다')
      // Mock data for development
      setOrders([
        {
          id: '1',
          orderNumber: 'ORD-2024-001',
          status: 'DELIVERED',
          totalAmount: 150000,
          createdAt: '2024-01-15T10:30:00Z',
          updatedAt: '2024-01-20T14:20:00Z',
          trackingNumber: 'TRK-123456789',
          items: [
            {
              id: '1',
              productId: 'prod-1',
              productName: '스트레치 벨트',
              productSku: 'TTL-BLT-BK-2025',
              quantity: 2,
              unitPrice: 68000,
              totalPrice: 136000,
              imageUrl: '/placeholder.svg'
            }
          ],
          shippingAddress: {
            name: '홍길동',
            phone: '010-1234-5678',
            address: '서울특별시 강남구 테헤란로 123',
            zipCode: '06142'
          }
        },
        {
          id: '2',
          orderNumber: 'ORD-2024-002',
          status: 'SHIPPED',
          totalAmount: 89000,
          createdAt: '2024-01-18T15:45:00Z',
          updatedAt: '2024-01-19T09:10:00Z',
          trackingNumber: 'TRK-987654321',
          items: [
            {
              id: '2',
              productId: 'prod-2',
              productName: '코튼 티셔츠',
              productSku: 'CTN-TS-WH-2025',
              quantity: 1,
              unitPrice: 85000,
              totalPrice: 85000,
              imageUrl: '/placeholder.svg'
            }
          ]
        },
        {
          id: '3',
          orderNumber: 'ORD-2024-003',
          status: 'PENDING',
          totalAmount: 245000,
          createdAt: '2024-01-20T11:20:00Z',
          updatedAt: '2024-01-20T11:20:00Z',
          items: [
            {
              id: '3',
              productId: 'prod-3',
              productName: '데님 자켓',
              productSku: 'DNM-JK-BL-2025',
              quantity: 1,
              unitPrice: 245000,
              totalPrice: 245000,
              imageUrl: '/placeholder.svg'
            }
          ]
        }
      ])
    } finally {
      setLoading(false)
    }
  }

  const getStatusBadge = (status: Order['status']) => {
    const statusConfig = {
      PENDING: { label: '주문 접수', color: 'bg-yellow-100 text-yellow-800', icon: Clock },
      CONFIRMED: { label: '주문 확인', color: 'bg-blue-100 text-blue-800', icon: CheckCircle },
      SHIPPED: { label: '배송 중', color: 'bg-purple-100 text-purple-800', icon: Truck },
      DELIVERED: { label: '배송 완료', color: 'bg-green-100 text-green-800', icon: Package },
      CANCELLED: { label: '주문 취소', color: 'bg-red-100 text-red-800', icon: XCircle },
    }

    const config = statusConfig[status]
    const Icon = config.icon

    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.color}`}>
        <Icon className="h-3 w-3 mr-1" />
        {config.label}
      </span>
    )
  }

  const filteredOrders = statusFilter === 'ALL' 
    ? orders 
    : orders.filter(order => order.status === statusFilter)

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-lg text-gray-600">주문 내역을 불러오는 중...</div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Status Filter */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setStatusFilter('ALL')}
          className={`px-4 py-2 rounded-lg text-sm font-medium ${
            statusFilter === 'ALL'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          전체
        </button>
        <button
          onClick={() => setStatusFilter('PENDING')}
          className={`px-4 py-2 rounded-lg text-sm font-medium ${
            statusFilter === 'PENDING'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          주문 접수
        </button>
        <button
          onClick={() => setStatusFilter('SHIPPED')}
          className={`px-4 py-2 rounded-lg text-sm font-medium ${
            statusFilter === 'SHIPPED'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          배송 중
        </button>
        <button
          onClick={() => setStatusFilter('DELIVERED')}
          className={`px-4 py-2 rounded-lg text-sm font-medium ${
            statusFilter === 'DELIVERED'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          배송 완료
        </button>
      </div>

      {/* Orders List */}
      {filteredOrders.length === 0 ? (
        <div className="text-center py-12">
          <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500">주문 내역이 없습니다</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredOrders.map((order) => (
            <div key={order.id} className="bg-white border rounded-lg p-6 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">{order.orderNumber}</h3>
                  <p className="text-sm text-gray-500">
                    주문일: {new Date(order.createdAt).toLocaleDateString('ko-KR')}
                  </p>
                </div>
                <div className="text-right">
                  {getStatusBadge(order.status)}
                  <p className="text-lg font-bold text-gray-900 mt-1">
                    {formatPrice(order.totalAmount)}
                  </p>
                </div>
              </div>

              {/* Order Items */}
              <div className="space-y-3 mb-4">
                {order.items.map((item) => (
                  <div key={item.id} className="flex items-center space-x-4">
                    <div className="flex-shrink-0 w-16 h-16 bg-gray-100 rounded-lg overflow-hidden">
                      <img
                        src={item.imageUrl || '/placeholder.svg'}
                        alt={item.productName}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900">{item.productName}</h4>
                      <p className="text-sm text-gray-500">SKU: {item.productSku}</p>
                      <p className="text-sm text-gray-500">
                        {formatPrice(item.unitPrice)} × {item.quantity}개 = {formatPrice(item.totalPrice)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Tracking Info */}
              {order.trackingNumber && (
                <div className="bg-gray-50 rounded-lg p-3 mb-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">운송장 번호</span>
                    <span className="text-sm font-medium text-gray-900">{order.trackingNumber}</span>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex justify-end space-x-2">
                <button
                  onClick={() => setSelectedOrder(order)}
                  className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  <Eye className="h-4 w-4 mr-1" />
                  상세보기
                </button>
                {order.status === 'DELIVERED' && (
                  <button className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                    리뷰 작성
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Order Detail Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900">주문 상세 정보</h3>
                <button
                  onClick={() => setSelectedOrder(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <XCircle className="h-6 w-6" />
                </button>
              </div>
              
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium text-gray-900">주문 정보</h4>
                  <p className="text-sm text-gray-600">주문번호: {selectedOrder.orderNumber}</p>
                  <p className="text-sm text-gray-600">
                    주문일: {new Date(selectedOrder.createdAt).toLocaleDateString('ko-KR')}
                  </p>
                  <p className="text-sm text-gray-600">상태: {getStatusBadge(selectedOrder.status)}</p>
                </div>

                {selectedOrder.shippingAddress && (
                  <div>
                    <h4 className="font-medium text-gray-900">배송 정보</h4>
                    <p className="text-sm text-gray-600">받는 사람: {selectedOrder.shippingAddress.name}</p>
                    <p className="text-sm text-gray-600">연락처: {selectedOrder.shippingAddress.phone}</p>
                    <p className="text-sm text-gray-600">
                      주소: ({selectedOrder.shippingAddress.zipCode}) {selectedOrder.shippingAddress.address}
                    </p>
                  </div>
                )}

                <div>
                  <h4 className="font-medium text-gray-900">주문 상품</h4>
                  <div className="space-y-2">
                    {selectedOrder.items.map((item) => (
                      <div key={item.id} className="flex justify-between text-sm">
                        <span>{item.productName} × {item.quantity}</span>
                        <span>{formatPrice(item.totalPrice)}</span>
                      </div>
                    ))}
                  </div>
                  <div className="border-t pt-2 mt-2">
                    <div className="flex justify-between font-medium">
                      <span>총 결제 금액</span>
                      <span>{formatPrice(selectedOrder.totalAmount)}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}