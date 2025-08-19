'use client'

import { useState, useEffect } from 'react'
import { User, Package, MapPin, Star, Settings } from 'lucide-react'

interface UserProfile {
  id: string
  username: string
  email: string
  role: string
  name?: string
  phone?: string
  createdAt: string
}

interface OrderSummary {
  total: number
  pending: number
  completed: number
  cancelled: number
}

interface ReviewSummary {
  total: number
  avgRating: number
}

export default function MyPage() {
  const [user, setUser] = useState<UserProfile | null>(null)
  const [orderSummary, setOrderSummary] = useState<OrderSummary>({
    total: 0,
    pending: 0,
    completed: 0,
    cancelled: 0,
  })
  const [reviewSummary, setReviewSummary] = useState<ReviewSummary>({
    total: 0,
    avgRating: 0,
  })
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('overview')

  useEffect(() => {
    const loadUserData = async () => {
      try {
        // Load user profile
        const userResponse = await fetch('/api/auth/me', {
          credentials: 'include',
        })
        
        if (userResponse.ok) {
          const userData = await userResponse.json()
          setUser(userData.user)
        }

        // Mock data for now - will be replaced with real API calls
        setOrderSummary({
          total: 15,
          pending: 2,
          completed: 12,
          cancelled: 1,
        })

        setReviewSummary({
          total: 8,
          avgRating: 4.5,
        })
      } catch (error) {
        console.error('Failed to load user data:', error)
      } finally {
        setLoading(false)
      }
    }

    loadUserData()
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-lg">마이페이지를 불러오는 중...</div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-red-600">사용자 정보를 불러올 수 없습니다.</div>
      </div>
    )
  }

  const tabs = [
    { id: 'overview', name: '개요', icon: User },
    { id: 'orders', name: '주문내역', icon: Package },
    { id: 'addresses', name: '배송지 관리', icon: MapPin },
    { id: 'reviews', name: '나의 리뷰', icon: Star },
    { id: 'settings', name: '계정 설정', icon: Settings },
  ]

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">마이페이지</h1>
        <p className="mt-2 text-sm text-gray-600">
          계정 정보와 주문 내역을 관리할 수 있습니다.
        </p>
      </div>

      {/* User Profile Card */}
      <div className="mb-8 bg-white rounded-lg shadow p-6">
        <div className="flex items-center space-x-4">
          <div className="h-16 w-16 rounded-full bg-blue-100 flex items-center justify-center">
            <User className="h-8 w-8 text-blue-600" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-gray-900">{user.name || user.username}</h2>
            <p className="text-gray-600">{user.email}</p>
            <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${
              user.role === 'MASTER_ADMIN' 
                ? 'bg-red-100 text-red-800' 
                : user.role === 'BRAND_ADMIN'
                ? 'bg-yellow-100 text-yellow-800'
                : 'bg-blue-100 text-blue-800'
            }`}>
              {user.role === 'MASTER_ADMIN' ? '마스터 관리자' : 
               user.role === 'BRAND_ADMIN' ? '브랜드 관리자' : '구매자'}
            </span>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">총 주문수</p>
              <p className="text-2xl font-bold text-gray-900">{orderSummary.total}</p>
            </div>
            <Package className="h-8 w-8 text-blue-600" />
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">진행중인 주문</p>
              <p className="text-2xl font-bold text-gray-900">{orderSummary.pending}</p>
            </div>
            <Package className="h-8 w-8 text-orange-600" />
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">작성한 리뷰</p>
              <p className="text-2xl font-bold text-gray-900">{reviewSummary.total}</p>
            </div>
            <Star className="h-8 w-8 text-yellow-600" />
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="bg-white rounded-lg shadow">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8 px-6">
            {tabs.map((tab) => {
              const Icon = tab.icon
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Icon className="h-5 w-5 mr-2" />
                  {tab.name}
                </button>
              )
            })}
          </nav>
        </div>

        {/* Tab Content */}
        <div className="p-6">
          {activeTab === 'overview' && (
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">계정 개요</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">사용자명</label>
                  <p className="mt-1 text-sm text-gray-900">{user.username}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">이메일</label>
                  <p className="mt-1 text-sm text-gray-900">{user.email}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">가입일</label>
                  <p className="mt-1 text-sm text-gray-900">
                    {new Date(user.createdAt || '').toLocaleDateString('ko-KR')}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">계정 유형</label>
                  <p className="mt-1 text-sm text-gray-900">
                    {user.role === 'MASTER_ADMIN' ? '마스터 관리자' : 
                     user.role === 'BRAND_ADMIN' ? '브랜드 관리자' : '구매자'}
                  </p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'orders' && (
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">주문 내역</h3>
              <div className="text-gray-600">
                <p>주문 내역 기능을 구현 중입니다.</p>
                <p className="mt-2">현재 통계:</p>
                <ul className="mt-2 space-y-1 text-sm">
                  <li>• 총 주문수: {orderSummary.total}건</li>
                  <li>• 진행중: {orderSummary.pending}건</li>
                  <li>• 완료: {orderSummary.completed}건</li>
                  <li>• 취소: {orderSummary.cancelled}건</li>
                </ul>
              </div>
            </div>
          )}

          {activeTab === 'addresses' && (
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">배송지 관리</h3>
              <div className="text-gray-600">
                <p>배송지 관리 기능을 구현 중입니다.</p>
              </div>
            </div>
          )}

          {activeTab === 'reviews' && (
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">나의 리뷰</h3>
              <div className="text-gray-600">
                <p>리뷰 관리 기능을 구현 중입니다.</p>
                <p className="mt-2">현재 통계:</p>
                <ul className="mt-2 space-y-1 text-sm">
                  <li>• 작성한 리뷰: {reviewSummary.total}개</li>
                  <li>• 평균 평점: {reviewSummary.avgRating}점</li>
                </ul>
              </div>
            </div>
          )}

          {activeTab === 'settings' && (
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">계정 설정</h3>
              <div className="text-gray-600">
                <p>계정 설정 기능을 구현 중입니다.</p>
                <p className="mt-2">개인정보 수정, 비밀번호 변경 등의 기능이 제공될 예정입니다.</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}