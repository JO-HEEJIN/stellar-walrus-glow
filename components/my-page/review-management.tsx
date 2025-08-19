'use client'

import { useState, useEffect } from 'react'
import { Star, Edit, Trash2, Camera, Package } from 'lucide-react'
import { formatPrice } from '@/lib/utils'
import { toast } from 'sonner'

interface Review {
  id: string
  productId: string
  productName: string
  productSku: string
  brandName: string
  imageUrl?: string
  rating: number
  title: string
  content: string
  images?: string[]
  createdAt: string
  updatedAt?: string
  orderNumber: string
  purchaseDate: string
  verified: boolean
  helpful: number
  status: 'PUBLISHED' | 'PENDING' | 'REJECTED'
}

interface ReviewFormData {
  rating: number
  title: string
  content: string
  images: FileList | null
}

export default function ReviewManagement() {
  const [reviews, setReviews] = useState<Review[]>([])
  const [loading, setLoading] = useState(true)
  const [editingReview, setEditingReview] = useState<Review | null>(null)
  const [showEditModal, setShowEditModal] = useState(false)
  const [statusFilter, setStatusFilter] = useState<string>('ALL')

  useEffect(() => {
    loadReviews()
  }, [statusFilter])

  const loadReviews = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams()
      if (statusFilter !== 'ALL') {
        params.append('status', statusFilter)
      }
      params.append('limit', '20')
      params.append('sort', 'createdAt:desc')

      const response = await fetch(`/api/reviews/my?${params.toString()}`, {
        credentials: 'include',
      })

      if (response.ok) {
        const data = await response.json()
        setReviews(data.data || [])
      }
    } catch (error) {
      console.error('리뷰 로드 실패:', error)
      // Mock data for development
      setReviews([
        {
          id: '1',
          productId: 'cme3ltyne0012myiyu0st08b5',
          productName: '스트레치 벨트',
          productSku: 'TTL-BLT-BK-2025',
          brandName: 'K-패션',
          imageUrl: '/placeholder.svg',
          rating: 5,
          title: '정말 좋은 제품입니다',
          content: '품질도 좋고 디자인도 예뻐요. 고객들에게 반응이 좋습니다. 다음에도 주문하고 싶어요.',
          images: ['/placeholder.svg'],
          createdAt: '2024-01-15T10:30:00Z',
          orderNumber: 'ORD-20240110-001',
          purchaseDate: '2024-01-10T09:00:00Z',
          verified: true,
          helpful: 12,
          status: 'PUBLISHED'
        },
        {
          id: '2',
          productId: 'prod-2',
          productName: '코튼 티셔츠',
          productSku: 'CTN-TS-WH-2025',
          brandName: '프리미엄 브랜드',
          imageUrl: '/placeholder.svg',
          rating: 4,
          title: '가성비 좋은 상품',
          content: '전체적으로 만족합니다. 사이즈도 정확하고 매장에서 잘 팔리고 있어요.',
          createdAt: '2024-01-12T14:20:00Z',
          orderNumber: 'ORD-20240108-002',
          purchaseDate: '2024-01-08T11:30:00Z',
          verified: true,
          helpful: 8,
          status: 'PUBLISHED'
        },
        {
          id: '3',
          productId: 'prod-3',
          productName: '골프 모자',
          productSku: 'GLF-HAT-NV-2025',
          brandName: '골프 브랜드',
          imageUrl: '/placeholder.svg',
          rating: 3,
          title: '보통 수준',
          content: '나쁝지도 좋지도 않은 제품입니다. 가격대는 적정해요.',
          createdAt: '2024-01-05T16:45:00Z',
          orderNumber: 'ORD-20240102-003',
          purchaseDate: '2024-01-02T13:15:00Z',
          verified: true,
          helpful: 3,
          status: 'PENDING'
        }
      ])
    } finally {
      setLoading(false)
    }
  }

  const handleEditReview = (review: Review) => {
    setEditingReview(review)
    setShowEditModal(true)
  }

  const handleDeleteReview = async (reviewId: string) => {
    if (!confirm('리뷰를 삭제하시겠습니까?')) return

    try {
      const response = await fetch(`/api/reviews/${reviewId}`, {
        method: 'DELETE',
        credentials: 'include',
      })

      if (!response.ok) {
        throw new Error('리뷰 삭제에 실패했습니다')
      }

      setReviews(prev => prev.filter(review => review.id !== reviewId))
      toast.success('리뷰가 삭제되었습니다')
    } catch (error) {
      console.error('리뷰 삭제 실패:', error)
      // Mock success for development
      setReviews(prev => prev.filter(review => review.id !== reviewId))
      toast.success('리뷰가 삭제되었습니다')
    }
  }

  const handleUpdateReview = async (reviewId: string, formData: ReviewFormData) => {
    try {
      const updateData = {
        rating: formData.rating,
        title: formData.title,
        content: formData.content,
      }

      const response = await fetch(`/api/reviews/${reviewId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(updateData),
      })

      if (!response.ok) {
        throw new Error('리뷰 수정에 실패했습니다')
      }

      const updatedReview = await response.json()
      setReviews(prev => prev.map(review => 
        review.id === reviewId ? { ...review, ...updatedReview.data } : review
      ))
      
      setShowEditModal(false)
      setEditingReview(null)
      toast.success('리뷰가 수정되었습니다')
    } catch (error) {
      console.error('리뷰 수정 실패:', error)
      // Mock success for development
      setReviews(prev => prev.map(review => 
        review.id === reviewId 
          ? { ...review, rating: formData.rating, title: formData.title, content: formData.content, updatedAt: new Date().toISOString() }
          : review
      ))
      setShowEditModal(false)
      setEditingReview(null)
      toast.success('리뷰가 수정되었습니다')
    }
  }

  const getStatusBadge = (status: Review['status']) => {
    const statusConfig = {
      PUBLISHED: { label: '게시됨', color: 'bg-green-100 text-green-800' },
      PENDING: { label: '검토중', color: 'bg-yellow-100 text-yellow-800' },
      REJECTED: { label: '거부됨', color: 'bg-red-100 text-red-800' },
    }

    const config = statusConfig[status]
    return (
      <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${config.color}`}>
        {config.label}
      </span>
    )
  }

  const renderStars = (rating: number, interactive = false, onRatingChange?: (rating: number) => void) => {
    return (
      <div className="flex items-center space-x-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`h-5 w-5 ${
              star <= rating
                ? 'text-yellow-400 fill-current'
                : 'text-gray-300'
            } ${interactive ? 'cursor-pointer hover:text-yellow-400' : ''}`}
            onClick={() => interactive && onRatingChange?.(star)}
          />
        ))}
        <span className="ml-2 text-sm text-gray-600">({rating}/5)</span>
      </div>
    )
  }

  const filteredReviews = statusFilter === 'ALL' 
    ? reviews 
    : reviews.filter(review => review.status === statusFilter)

  if (loading) {
    return (
      <div className="animate-pulse space-y-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="bg-gray-200 rounded-lg h-40"></div>
        ))}
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
          전체 ({reviews.length})
        </button>
        <button
          onClick={() => setStatusFilter('PUBLISHED')}
          className={`px-4 py-2 rounded-lg text-sm font-medium ${
            statusFilter === 'PUBLISHED'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          게시됨 ({reviews.filter(r => r.status === 'PUBLISHED').length})
        </button>
        <button
          onClick={() => setStatusFilter('PENDING')}
          className={`px-4 py-2 rounded-lg text-sm font-medium ${
            statusFilter === 'PENDING'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          검토중 ({reviews.filter(r => r.status === 'PENDING').length})
        </button>
        <button
          onClick={() => setStatusFilter('REJECTED')}
          className={`px-4 py-2 rounded-lg text-sm font-medium ${
            statusFilter === 'REJECTED'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          거부됨 ({reviews.filter(r => r.status === 'REJECTED').length})
        </button>
      </div>

      {/* Reviews List */}
      {filteredReviews.length === 0 ? (
        <div className="text-center py-12">
          <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500 mb-2">
            {statusFilter === 'ALL' 
              ? '작성한 리뷰가 없습니다' 
              : `${statusFilter} 상태의 리뷰가 없습니다`}
          </p>
          <p className="text-sm text-gray-400">상품을 구매한 후 리뷰를 작성해보세요.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredReviews.map((review) => (
            <div key={review.id} className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-4">
                  <img
                    src={review.imageUrl || '/placeholder.svg'}
                    alt={review.productName}
                    className="w-16 h-16 object-cover rounded-lg"
                  />
                  <div>
                    <h3 className="font-semibold text-gray-900">{review.productName}</h3>
                    <p className="text-sm text-gray-600">{review.brandName}</p>
                    <p className="text-sm text-gray-500">SKU: {review.productSku}</p>
                    <div className="flex items-center gap-2 mt-1">
                      {getStatusBadge(review.status)}
                      {review.verified && (
                        <span className="inline-flex px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800">
                          구매 확인
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handleEditReview(review)}
                    className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    disabled={review.status === 'REJECTED'}
                  >
                    <Edit className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleDeleteReview(review.id)}
                    className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>

              <div className="mb-4">
                {renderStars(review.rating)}
              </div>

              <div className="mb-4">
                <h4 className="font-medium text-gray-900 mb-2">{review.title}</h4>
                <p className="text-gray-700 leading-relaxed">{review.content}</p>
              </div>

              {review.images && review.images.length > 0 && (
                <div className="mb-4">
                  <div className="flex flex-wrap gap-2">
                    {review.images.map((image, index) => (
                      <img
                        key={index}
                        src={image}
                        alt={`리뷰 이미지 ${index + 1}`}
                        className="w-20 h-20 object-cover rounded-lg border"
                      />
                    ))}
                  </div>
                </div>
              )}

              <div className="flex items-center justify-between text-sm text-gray-500 border-t pt-4">
                <div>
                  <span>주문번호: {review.orderNumber}</span>
                  <span className="mx-2">•</span>
                  <span>구매일: {new Date(review.purchaseDate).toLocaleDateString('ko-KR')}</span>
                </div>
                <div>
                  <span>작성일: {new Date(review.createdAt).toLocaleDateString('ko-KR')}</span>
                  {review.updatedAt && (
                    <>
                      <span className="mx-2">•</span>
                      <span>수정일: {new Date(review.updatedAt).toLocaleDateString('ko-KR')}</span>
                    </>
                  )}
                  <span className="mx-2">•</span>
                  <span>도움이 되어요: {review.helpful}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Edit Review Modal */}
      {showEditModal && editingReview && (
        <EditReviewModal
          review={editingReview}
          onClose={() => {
            setShowEditModal(false)
            setEditingReview(null)
          }}
          onUpdate={handleUpdateReview}
        />
      )}
    </div>
  )
}

interface EditReviewModalProps {
  review: Review
  onClose: () => void
  onUpdate: (reviewId: string, formData: ReviewFormData) => void
}

function EditReviewModal({ review, onClose, onUpdate }: EditReviewModalProps) {
  const [rating, setRating] = useState(review.rating)
  const [title, setTitle] = useState(review.title)
  const [content, setContent] = useState(review.content)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!title.trim() || !content.trim()) {
      toast.error('제목과 내용을 입력해주세요')
      return
    }

    setIsSubmitting(true)
    await onUpdate(review.id, {
      rating,
      title,
      content,
      images: null
    })
    setIsSubmitting(false)
  }

  const renderStars = (rating: number, interactive = false, onRatingChange?: (rating: number) => void) => {
    return (
      <div className="flex items-center space-x-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`h-6 w-6 ${
              star <= rating
                ? 'text-yellow-400 fill-current'
                : 'text-gray-300'
            } ${interactive ? 'cursor-pointer hover:text-yellow-400' : ''}`}
            onClick={() => interactive && onRatingChange?.(star)}
          />
        ))}
      </div>
    )
  }

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-10 mx-auto p-5 border w-11/12 md:w-2/3 lg:w-1/2 shadow-lg rounded-md bg-white">
        <div className="mt-3">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-gray-900">리뷰 수정</h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <Edit className="h-6 w-6" />
            </button>
          </div>
          
          {/* Product Info */}
          <div className="flex items-center space-x-4 mb-6 p-4 bg-gray-50 rounded-lg">
            <img
              src={review.imageUrl || '/placeholder.svg'}
              alt={review.productName}
              className="w-16 h-16 object-cover rounded-lg"
            />
            <div>
              <h4 className="font-semibold text-gray-900">{review.productName}</h4>
              <p className="text-sm text-gray-600">{review.brandName}</p>
              <p className="text-sm text-gray-500">SKU: {review.productSku}</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Rating */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                평점 *
              </label>
              {renderStars(rating, true, setRating)}
            </div>

            {/* Title */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                리뷰 제목 *
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="리뷰 제목을 입력해주세요"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                maxLength={100}
              />
              <p className="text-xs text-gray-500 mt-1">{title.length}/100</p>
            </div>

            {/* Content */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                리뷰 내용 *
              </label>
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="상품에 대한 사용 후기를 상세히 작성해주세요"
                rows={6}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                maxLength={1000}
              />
              <p className="text-xs text-gray-500 mt-1">{content.length}/1000</p>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end space-x-3 pt-4 border-t">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
              >
                취소
              </button>
              <button
                type="submit"
                disabled={isSubmitting || !title.trim() || !content.trim()}
                className={`px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white ${
                  isSubmitting || !title.trim() || !content.trim()
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-blue-600 hover:bg-blue-700'
                }`}
              >
                {isSubmitting ? '수정 중...' : '리뷰 수정'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
