'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { FileText, Plus, Eye, Download, Clock, CheckCircle, XCircle } from 'lucide-react'
import { formatPrice } from '@/lib/utils'
import { toast } from 'sonner'

interface Quote {
  id: string
  quoteNumber: string
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'EXPIRED'
  requestedAt: string
  respondedAt?: string
  validUntil: string
  totalAmount: number
  items: QuoteItem[]
  companyInfo: {
    name: string
    contact: string
    email: string
    phone: string
  }
  message?: string
  responseMessage?: string
}

interface QuoteItem {
  id: string
  productId: string
  productName: string
  productSku: string
  quantity: number
  unitPrice?: number
  totalPrice?: number
  imageUrl?: string
  brandName: string
}

export default function QuotesPage() {
  const router = useRouter()
  const [quotes, setQuotes] = useState<Quote[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedQuote, setSelectedQuote] = useState<Quote | null>(null)
  const [showDetailModal, setShowDetailModal] = useState(false)
  const [statusFilter, setStatusFilter] = useState<string>('ALL')

  useEffect(() => {
    loadQuotes()
  }, [statusFilter])

  const loadQuotes = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams()
      if (statusFilter !== 'ALL') {
        params.append('status', statusFilter)
      }
      params.append('limit', '20')
      params.append('sort', 'requestedAt:desc')

      const response = await fetch(`/api/quotes?${params.toString()}`, {
        credentials: 'include',
      })

      if (!response.ok) {
        throw new Error('견적서 목록을 불러오는데 실패했습니다')
      }

      const data = await response.json()
      setQuotes(data.data || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : '알 수 없는 오류가 발생했습니다')
      console.error('견적서 로드 실패:', err)
      
      // Mock data for development
      setQuotes([
        {
          id: '1',
          quoteNumber: 'QT-2024-001',
          status: 'APPROVED',
          requestedAt: '2024-01-15T10:30:00Z',
          respondedAt: '2024-01-16T14:20:00Z',
          validUntil: '2024-01-30T23:59:59Z',
          totalAmount: 510000,
          companyInfo: {
            name: '샘플 무역회사',
            contact: '홍길동',
            email: 'hong@example.com',
            phone: '010-1234-5678'
          },
          message: '대량 구매 할인 문의드립니다.',
          responseMessage: '10% 할인가로 견적서를 제공합니다.',
          items: [
            {
              id: '1',
              productId: 'prod-1',
              productName: '스트레치 벨트',
              productSku: 'TTL-BLT-BK-2025',
              quantity: 100,
              unitPrice: 61200,
              totalPrice: 510000,
              imageUrl: '/placeholder.svg',
              brandName: 'K-패션'
            }
          ]
        },
        {
          id: '2',
          quoteNumber: 'QT-2024-002',
          status: 'PENDING',
          requestedAt: '2024-01-18T15:45:00Z',
          validUntil: '2024-02-01T23:59:59Z',
          totalAmount: 0,
          companyInfo: {
            name: '글로벌 패션',
            contact: '김영희',
            email: 'kim@global.com',
            phone: '010-9876-5432'
          },
          message: '신제품 견적 요청드립니다.',
          items: [
            {
              id: '2',
              productId: 'prod-2',
              productName: '코튼 티셔츠',
              productSku: 'CTN-TS-WH-2025',
              quantity: 50,
              imageUrl: '/placeholder.svg',
              brandName: '프리미엄 브랜드'
            }
          ]
        }
      ])
    } finally {
      setLoading(false)
    }
  }

  const getStatusBadge = (status: Quote['status']) => {
    const statusConfig = {
      PENDING: { label: '검토중', color: 'bg-yellow-100 text-yellow-800', icon: Clock },
      APPROVED: { label: '승인됨', color: 'bg-green-100 text-green-800', icon: CheckCircle },
      REJECTED: { label: '거절됨', color: 'bg-red-100 text-red-800', icon: XCircle },
      EXPIRED: { label: '만료됨', color: 'bg-gray-100 text-gray-800', icon: XCircle },
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

  const handleViewDetail = (quote: Quote) => {
    setSelectedQuote(quote)
    setShowDetailModal(true)
  }

  const handleDownloadQuote = async (quoteId: string) => {
    try {
      const response = await fetch(`/api/quotes/${quoteId}/download`, {
        credentials: 'include',
      })

      if (!response.ok) {
        throw new Error('견적서 다운로드에 실패했습니다')
      }

      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.style.display = 'none'
      a.href = url
      a.download = `견적서_${selectedQuote?.quoteNumber || quoteId}.pdf`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      toast.success('견적서가 다운로드되었습니다')
    } catch (error) {
      console.error('견적서 다운로드 실패:', error)
      toast.success('견적서 다운로드 기능 (Mock)')
    }
  }

  const filteredQuotes = statusFilter === 'ALL' 
    ? quotes 
    : quotes.filter(quote => quote.status === statusFilter)

  if (loading) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-8">견적서 관리</h1>
        <div className="animate-pulse space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="bg-gray-200 rounded-lg h-32"></div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold text-gray-900">견적서 관리</h1>
        <button
          onClick={() => router.push('/quotes/new')}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          <Plus className="h-4 w-4 mr-2" />
          새 견적 요청
        </button>
      </div>

      {/* Status Filter */}
      <div className="mb-6">
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
            검토중
          </button>
          <button
            onClick={() => setStatusFilter('APPROVED')}
            className={`px-4 py-2 rounded-lg text-sm font-medium ${
              statusFilter === 'APPROVED'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            승인됨
          </button>
          <button
            onClick={() => setStatusFilter('REJECTED')}
            className={`px-4 py-2 rounded-lg text-sm font-medium ${
              statusFilter === 'REJECTED'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            거절됨
          </button>
        </div>
      </div>

      {/* Quotes List */}
      {filteredQuotes.length === 0 ? (
        <div className="text-center py-12">
          <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500 mb-4">
            {statusFilter === 'ALL' ? '요청한 견적서가 없습니다' : `${statusFilter} 상태의 견적서가 없습니다`}
          </p>
          <button
            onClick={() => router.push('/quotes/new')}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-blue-600 bg-blue-50 hover:bg-blue-100"
          >
            첫 번째 견적서 요청하기
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredQuotes.map((quote) => (
            <div key={quote.id} className="bg-white border rounded-lg p-6 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">{quote.quoteNumber}</h3>
                  <p className="text-sm text-gray-500">
                    요청일: {new Date(quote.requestedAt).toLocaleDateString('ko-KR')}
                  </p>
                  <p className="text-sm text-gray-500">
                    유효기한: {new Date(quote.validUntil).toLocaleDateString('ko-KR')}
                  </p>
                </div>
                <div className="text-right">
                  {getStatusBadge(quote.status)}
                  {quote.totalAmount > 0 && (
                    <p className="text-lg font-bold text-gray-900 mt-1">
                      {formatPrice(quote.totalAmount)}
                    </p>
                  )}
                </div>
              </div>

              {/* Company Info */}
              <div className="bg-gray-50 rounded-lg p-3 mb-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">회사명:</span> {quote.companyInfo.name}
                  </div>
                  <div>
                    <span className="text-gray-600">담당자:</span> {quote.companyInfo.contact}
                  </div>
                  <div>
                    <span className="text-gray-600">이메일:</span> {quote.companyInfo.email}
                  </div>
                  <div>
                    <span className="text-gray-600">연락처:</span> {quote.companyInfo.phone}
                  </div>
                </div>
              </div>

              {/* Quote Items Summary */}
              <div className="mb-4">
                <h4 className="font-medium text-gray-900 mb-2">요청 상품 ({quote.items.length}개)</h4>
                <div className="space-y-2">
                  {quote.items.slice(0, 2).map((item) => (
                    <div key={item.id} className="flex items-center space-x-3 text-sm">
                      <img
                        src={item.imageUrl || '/placeholder.svg'}
                        alt={item.productName}
                        className="w-12 h-12 object-cover rounded"
                      />
                      <div className="flex-1">
                        <p className="font-medium">{item.productName}</p>
                        <p className="text-gray-500">SKU: {item.productSku} | 수량: {item.quantity}개</p>
                        {item.unitPrice && (
                          <p className="text-blue-600">{formatPrice(item.unitPrice)} × {item.quantity} = {formatPrice(item.totalPrice || 0)}</p>
                        )}
                      </div>
                    </div>
                  ))}
                  {quote.items.length > 2 && (
                    <p className="text-sm text-gray-500">그 외 {quote.items.length - 2}개 상품...</p>
                  )}
                </div>
              </div>

              {/* Messages */}
              {quote.message && (
                <div className="mb-4">
                  <h5 className="text-sm font-medium text-gray-700 mb-1">요청 메시지</h5>
                  <p className="text-sm text-gray-600 bg-blue-50 p-2 rounded">{quote.message}</p>
                </div>
              )}

              {quote.responseMessage && (
                <div className="mb-4">
                  <h5 className="text-sm font-medium text-gray-700 mb-1">응답 메시지</h5>
                  <p className="text-sm text-gray-600 bg-green-50 p-2 rounded">{quote.responseMessage}</p>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex justify-end space-x-2">
                <button
                  onClick={() => handleViewDetail(quote)}
                  className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  <Eye className="h-4 w-4 mr-1" />
                  상세보기
                </button>
                {quote.status === 'APPROVED' && (
                  <button
                    onClick={() => handleDownloadQuote(quote.id)}
                    className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                  >
                    <Download className="h-4 w-4 mr-1" />
                    다운로드
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Detail Modal */}
      {selectedQuote && showDetailModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-10 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-2/3 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900">견적서 상세 정보</h3>
                <button
                  onClick={() => setShowDetailModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <XCircle className="h-6 w-6" />
                </button>
              </div>
              
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-medium text-gray-900">견적서 정보</h4>
                    <p className="text-sm text-gray-600">번호: {selectedQuote.quoteNumber}</p>
                    <p className="text-sm text-gray-600">상태: {getStatusBadge(selectedQuote.status)}</p>
                    <p className="text-sm text-gray-600">
                      요청일: {new Date(selectedQuote.requestedAt).toLocaleDateString('ko-KR')}
                    </p>
                    <p className="text-sm text-gray-600">
                      유효기한: {new Date(selectedQuote.validUntil).toLocaleDateString('ko-KR')}
                    </p>
                  </div>
                  
                  <div>
                    <h4 className="font-medium text-gray-900">회사 정보</h4>
                    <p className="text-sm text-gray-600">회사명: {selectedQuote.companyInfo.name}</p>
                    <p className="text-sm text-gray-600">담당자: {selectedQuote.companyInfo.contact}</p>
                    <p className="text-sm text-gray-600">이메일: {selectedQuote.companyInfo.email}</p>
                    <p className="text-sm text-gray-600">연락처: {selectedQuote.companyInfo.phone}</p>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium text-gray-900 mb-3">요청 상품 목록</h4>
                  <div className="space-y-3">
                    {selectedQuote.items.map((item) => (
                      <div key={item.id} className="flex items-center justify-between border-b pb-3">
                        <div className="flex items-center space-x-3">
                          <img
                            src={item.imageUrl || '/placeholder.svg'}
                            alt={item.productName}
                            className="w-16 h-16 object-cover rounded"
                          />
                          <div>
                            <h5 className="font-medium">{item.productName}</h5>
                            <p className="text-sm text-gray-500">SKU: {item.productSku}</p>
                            <p className="text-sm text-gray-500">브랜드: {item.brandName}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-medium">수량: {item.quantity}개</p>
                          {item.unitPrice && (
                            <>
                              <p className="text-sm text-gray-600">단가: {formatPrice(item.unitPrice)}</p>
                              <p className="font-medium text-blue-600">소계: {formatPrice(item.totalPrice || 0)}</p>
                            </>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  {selectedQuote.totalAmount > 0 && (
                    <div className="border-t pt-3 mt-3">
                      <div className="flex justify-between font-bold text-lg">
                        <span>총 견적 금액</span>
                        <span className="text-blue-600">{formatPrice(selectedQuote.totalAmount)}</span>
                      </div>
                    </div>
                  )}
                </div>

                {selectedQuote.message && (
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">요청 메시지</h4>
                    <div className="bg-blue-50 p-3 rounded-lg">
                      <p className="text-sm text-gray-700">{selectedQuote.message}</p>
                    </div>
                  </div>
                )}

                {selectedQuote.responseMessage && (
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">응답 메시지</h4>
                    <div className="bg-green-50 p-3 rounded-lg">
                      <p className="text-sm text-gray-700">{selectedQuote.responseMessage}</p>
                    </div>
                  </div>
                )}
              </div>

              <div className="flex justify-end space-x-3 mt-6">
                <button
                  onClick={() => setShowDetailModal(false)}
                  className="px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                >
                  닫기
                </button>
                {selectedQuote.status === 'APPROVED' && (
                  <button
                    onClick={() => handleDownloadQuote(selectedQuote.id)}
                    className="px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700"
                  >
                    <Download className="h-4 w-4 mr-1 inline" />
                    견적서 다운로드
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}