'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { 
  ArrowLeft, 
  Package, 
  Truck, 
  CheckCircle, 
  XCircle, 
  Clock,
  CreditCard,
  User,
  MapPin,
  Phone,
  Mail,
  Calendar,
  Edit3,
  Save,
  X
} from 'lucide-react'
import { formatPrice, formatDateTime } from '@/lib/utils'
import { toast } from 'sonner'

const statusColors = {
  PENDING: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  PAID: 'bg-blue-100 text-blue-800 border-blue-200',
  PREPARING: 'bg-indigo-100 text-indigo-800 border-indigo-200',
  SHIPPED: 'bg-purple-100 text-purple-800 border-purple-200',
  DELIVERED: 'bg-green-100 text-green-800 border-green-200',
  CANCELLED: 'bg-red-100 text-red-800 border-red-200',
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
  PENDING: Clock,
  PAID: CreditCard,
  PREPARING: Package,
  SHIPPED: Truck,
  DELIVERED: CheckCircle,
  CANCELLED: XCircle,
}

const statusFlow = ['PENDING', 'PAID', 'PREPARING', 'SHIPPED', 'DELIVERED']

interface EnhancedOrderDetailProps {
  orderId: string
  userRole: string
}

export default function EnhancedOrderDetail({ orderId, userRole }: EnhancedOrderDetailProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const editMode = searchParams.get('edit') === 'status'
  
  const [order, setOrder] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isEditing, setIsEditing] = useState(editMode)
  const [statusForm, setStatusForm] = useState({
    status: '',
    reason: '',
    trackingNumber: '',
  })
  const [updating, setUpdating] = useState(false)

  useEffect(() => {
    fetchOrderDetails()
  }, [orderId])

  useEffect(() => {
    if (order && isEditing) {
      setStatusForm({
        status: order.status,
        reason: '',
        trackingNumber: order.trackingInfo?.trackingNumber || '',
      })
    }
  }, [order, isEditing])

  const fetchOrderDetails = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/orders/${orderId}`, {
        credentials: 'include',
      })
      
      if (!response.ok) {
        throw new Error('주문 정보를 불러오는데 실패했습니다')
      }

      const result = await response.json()
      setOrder(result.data)
    } catch (err) {
      setError(err instanceof Error ? err.message : '오류가 발생했습니다')
    } finally {
      setLoading(false)
    }
  }

  const handleStatusUpdate = async () => {
    if (!statusForm.status || statusForm.status === order.status) {
      toast.error('변경할 상태를 선택해주세요')
      return
    }

    try {
      setUpdating(true)
      const response = await fetch(`/api/orders/${orderId}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(statusForm),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error?.message || '상태 변경에 실패했습니다')
      }

      toast.success('주문 상태가 성공적으로 변경되었습니다')
      await fetchOrderDetails()
      setIsEditing(false)
      
      // Remove edit query param
      const newUrl = new URL(window.location.href)
      newUrl.searchParams.delete('edit')
      router.replace(newUrl.pathname + newUrl.search)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : '상태 변경에 실패했습니다')
    } finally {
      setUpdating(false)
    }
  }

  const getValidTransitions = (currentStatus: string): string[] => {
    const statusIndex = statusFlow.indexOf(currentStatus)
    if (statusIndex === -1) return []
    
    const validStatuses = []
    
    // Can move to next status
    if (statusIndex < statusFlow.length - 1) {
      validStatuses.push(statusFlow[statusIndex + 1])
    }
    
    // Can cancel if not delivered
    if (currentStatus !== 'DELIVERED' && currentStatus !== 'CANCELLED') {
      validStatuses.push('CANCELLED')
    }
    
    return validStatuses
  }

  const getStatusProgress = (currentStatus: string) => {
    const currentIndex = statusFlow.indexOf(currentStatus)
    if (currentStatus === 'CANCELLED') {
      return -1 // Special case for cancellation
    }
    return currentIndex
  }

  if (loading) {
    return (
      <div className="animate-pulse space-y-6">
        <div className="h-8 bg-gray-200 rounded w-1/4"></div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-gray-200 rounded-lg h-64"></div>
            <div className="bg-gray-200 rounded-lg h-48"></div>
          </div>
          <div className="bg-gray-200 rounded-lg h-96"></div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <XCircle className="mx-auto h-12 w-12 text-red-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">오류 발생</h3>
          <p className="mt-1 text-sm text-gray-500">{error}</p>
          <div className="mt-6">
            <Link
              href="/orders"
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              주문 목록으로 돌아가기
            </Link>
          </div>
        </div>
      </div>
    )
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Package className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">주문을 찾을 수 없습니다</h3>
          <div className="mt-6">
            <Link
              href="/orders"
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              주문 목록으로 돌아가기
            </Link>
          </div>
        </div>
      </div>
    )
  }

  const canUpdateStatus = (userRole === 'MASTER_ADMIN' || userRole === 'BRAND_ADMIN') && 
                          getValidTransitions(order.status).length > 0
  const StatusIcon = statusIcons[order.status as keyof typeof statusIcons]
  const currentProgress = getStatusProgress(order.status)

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/orders"
            className="inline-flex items-center text-sm font-medium text-gray-500 hover:text-gray-700 mb-4"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            주문 목록으로 돌아가기
          </Link>
          
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">주문 상세</h1>
              <p className="mt-1 text-sm text-gray-500">주문번호: {order.orderNumber}</p>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="flex items-center">
                <StatusIcon className="h-5 w-5 mr-2 text-gray-400" />
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${
                  statusColors[order.status as keyof typeof statusColors]
                }`}>
                  {statusLabels[order.status as keyof typeof statusLabels]}
                </span>
              </div>
              
              {canUpdateStatus && !isEditing && (
                <button
                  onClick={() => setIsEditing(true)}
                  className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                >
                  <Edit3 className="mr-2 h-4 w-4" />
                  상태 변경
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Status Edit Mode */}
        {isEditing && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">주문 상태 변경</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  새로운 상태
                </label>
                <select
                  value={statusForm.status}
                  onChange={(e) => setStatusForm(prev => ({ ...prev, status: e.target.value }))}
                  className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                >
                  <option value="">상태 선택</option>
                  {getValidTransitions(order.status).map((status) => (
                    <option key={status} value={status}>
                      {statusLabels[status as keyof typeof statusLabels]}
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  송장번호 (선택사항)
                </label>
                <input
                  type="text"
                  value={statusForm.trackingNumber}
                  onChange={(e) => setStatusForm(prev => ({ ...prev, trackingNumber: e.target.value }))}
                  placeholder="송장번호 입력"
                  className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  변경 사유 (선택사항)
                </label>
                <input
                  type="text"
                  value={statusForm.reason}
                  onChange={(e) => setStatusForm(prev => ({ ...prev, reason: e.target.value }))}
                  placeholder="변경 사유 입력"
                  className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
            </div>
            
            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => {
                  setIsEditing(false)
                  const newUrl = new URL(window.location.href)
                  newUrl.searchParams.delete('edit')
                  router.replace(newUrl.pathname + newUrl.search)
                }}
                className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
              >
                <X className="mr-2 h-4 w-4" />
                취소
              </button>
              <button
                onClick={handleStatusUpdate}
                disabled={updating}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {updating ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    변경 중...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    상태 변경
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Status Timeline */}
            {order.status !== 'CANCELLED' && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-6">주문 진행 상황</h3>
                
                <div className="relative">
                  <div className="absolute left-4 top-8 bottom-0 w-0.5 bg-gray-200"></div>
                  
                  {statusFlow.map((status, index) => {
                    const isCompleted = index < currentProgress
                    const isCurrent = index === currentProgress
                    const StatusStepIcon = statusIcons[status as keyof typeof statusIcons]
                    
                    return (
                      <div key={status} className="relative flex items-start pb-8 last:pb-0">
                        <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center border-2 ${
                          isCompleted 
                            ? 'bg-green-600 border-green-600' 
                            : isCurrent 
                              ? 'bg-blue-600 border-blue-600' 
                              : 'bg-white border-gray-300'
                        }`}>
                          <StatusStepIcon className={`h-4 w-4 ${
                            isCompleted || isCurrent ? 'text-white' : 'text-gray-400'
                          }`} />
                        </div>
                        
                        <div className="ml-4 flex-1">
                          <h4 className={`text-sm font-medium ${
                            isCompleted || isCurrent ? 'text-gray-900' : 'text-gray-500'
                          }`}>
                            {statusLabels[status as keyof typeof statusLabels]}
                          </h4>
                          {isCurrent && (
                            <p className="text-xs text-gray-500 mt-1">현재 상태</p>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}

            {/* Order Items */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">주문 상품</h3>
              
              <div className="space-y-4">
                {order.items.map((item: any) => (
                  <div key={item.id} className="flex items-center space-x-4 pb-4 border-b border-gray-100 last:border-0 last:pb-0">
                    {item.product?.thumbnailImage && (
                      <div className="w-16 h-16 rounded-lg border overflow-hidden bg-gray-50 flex items-center justify-center">
                        <img
                          src={item.product.thumbnailImage}
                          alt={item.product.nameKo}
                          className="max-w-full max-h-full object-contain"
                        />
                      </div>
                    )}
                    
                    <div className="flex-1">
                      <h4 className="text-sm font-medium text-gray-900">
                        {item.product?.nameKo || 'Unknown Product'}
                      </h4>
                      <p className="text-sm text-gray-500">
                        {item.product?.brand?.nameKo} · 수량: {item.quantity}개
                      </p>
                    </div>
                    
                    <div className="text-right">
                      <p className="text-sm font-medium text-gray-900">
                        {formatPrice(Number(item.price))}
                      </p>
                      <p className="text-xs text-gray-500">개당</p>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="mt-6 pt-4 border-t border-gray-200">
                <div className="flex justify-between items-center">
                  <span className="text-base font-medium text-gray-900">총 결제금액</span>
                  <span className="text-lg font-bold text-gray-900">
                    {formatPrice(Number(order.totalAmount))}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Order Info */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">주문 정보</h3>
              
              <dl className="space-y-3">
                <div>
                  <dt className="text-sm font-medium text-gray-500 flex items-center">
                    <Calendar className="h-4 w-4 mr-2" />
                    주문일시
                  </dt>
                  <dd className="text-sm text-gray-900 mt-1">
                    {formatDateTime(order.createdAt)}
                  </dd>
                </div>
                
                <div>
                  <dt className="text-sm font-medium text-gray-500 flex items-center">
                    <CreditCard className="h-4 w-4 mr-2" />
                    결제방법
                  </dt>
                  <dd className="text-sm text-gray-900 mt-1">
                    {order.paymentMethod === 'BANK_TRANSFER' ? '계좌이체' : '카드결제'}
                  </dd>
                </div>
                
                {order.trackingInfo?.trackingNumber && (
                  <div>
                    <dt className="text-sm font-medium text-gray-500 flex items-center">
                      <Truck className="h-4 w-4 mr-2" />
                      송장번호
                    </dt>
                    <dd className="text-sm text-gray-900 mt-1">
                      {order.trackingInfo.trackingNumber}
                    </dd>
                  </div>
                )}
                
                {order.memo && (
                  <div>
                    <dt className="text-sm font-medium text-gray-500">주문 메모</dt>
                    <dd className="text-sm text-gray-900 mt-1">{order.memo}</dd>
                  </div>
                )}
              </dl>
            </div>

            {/* Customer Info */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">고객 정보</h3>
              
              <dl className="space-y-3">
                <div>
                  <dt className="text-sm font-medium text-gray-500 flex items-center">
                    <User className="h-4 w-4 mr-2" />
                    고객명
                  </dt>
                  <dd className="text-sm text-gray-900 mt-1">
                    {order.user?.name || order.shippingAddress?.name || '-'}
                  </dd>
                </div>
                
                <div>
                  <dt className="text-sm font-medium text-gray-500 flex items-center">
                    <Mail className="h-4 w-4 mr-2" />
                    이메일
                  </dt>
                  <dd className="text-sm text-gray-900 mt-1">
                    {order.user?.email || '-'}
                  </dd>
                </div>
              </dl>
            </div>

            {/* Shipping Address */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">배송 정보</h3>
              
              <dl className="space-y-3">
                <div>
                  <dt className="text-sm font-medium text-gray-500 flex items-center">
                    <User className="h-4 w-4 mr-2" />
                    받는분
                  </dt>
                  <dd className="text-sm text-gray-900 mt-1">
                    {order.shippingAddress?.name || '-'}
                  </dd>
                </div>
                
                <div>
                  <dt className="text-sm font-medium text-gray-500 flex items-center">
                    <Phone className="h-4 w-4 mr-2" />
                    연락처
                  </dt>
                  <dd className="text-sm text-gray-900 mt-1">
                    {order.shippingAddress?.phone || '-'}
                  </dd>
                </div>
                
                <div>
                  <dt className="text-sm font-medium text-gray-500 flex items-center">
                    <MapPin className="h-4 w-4 mr-2" />
                    배송주소
                  </dt>
                  <dd className="text-sm text-gray-900 mt-1">
                    {order.shippingAddress?.zipCode && `(${order.shippingAddress.zipCode}) `}
                    {order.shippingAddress?.address}
                    {order.shippingAddress?.addressDetail && `, ${order.shippingAddress.addressDetail}`}
                  </dd>
                </div>
              </dl>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}