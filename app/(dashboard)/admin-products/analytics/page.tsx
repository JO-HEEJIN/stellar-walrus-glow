'use client'

import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { ProductAnalytics } from '@/components/products/product-analytics'
import { toast } from 'sonner'
import ErrorBoundary from '@/components/error-boundary'

export default function AnalyticsPage() {
  const router = useRouter()
  const [isAuthorized, setIsAuthorized] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const checkAuth = async () => {
      try {
        // 개발 모드에서는 권한 체크를 건너뛰기
        if (process.env.NODE_ENV === 'development' || process.env.NEXT_PUBLIC_SKIP_AUTH === 'true') {
          console.log('🔧 Development mode: skipping auth check in analytics page')
          setIsAuthorized(true)
          setIsLoading(false)
          return
        }

        console.log('🔍 Starting auth check...')
        
        const response = await fetch('/api/auth/me', {
          method: 'GET',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
          },
        })
        
        console.log('🔍 Auth API response status:', response.status)
        
        if (response.ok) {
          const data = await response.json()
          console.log('🔍 Auth data received:', data)
          
          // Only BRAND_ADMIN and MASTER_ADMIN can view analytics
          if (data.user && (data.user.role === 'BRAND_ADMIN' || data.user.role === 'MASTER_ADMIN')) {
            console.log('✅ User authorized:', data.user.role)
            setIsAuthorized(true)
          } else {
            console.log('❌ User not authorized:', data.user?.role)
            toast.error('권한이 없습니다')
            router.push('/admin-products')
          }
        } else {
          const errorData = await response.text().catch(() => 'Unknown error')
          console.error('❌ Auth API failed:', response.status, errorData)
          toast.error('로그인이 필요합니다')
          router.push('/login')
        }
      } catch (error: any) {
        console.error('❌ Auth check error:', {
          message: error.message,
          stack: error.stack,
          name: error.name
        })
        
        // 개발 환경에서는 에러 시에도 권한 체크를 건너뛰기
        if (process.env.NODE_ENV === 'development' || process.env.NEXT_PUBLIC_SKIP_AUTH === 'true') {
          console.log('🔧 Development mode: auth error, but allowing access')
          setIsAuthorized(true)
        } else {
          toast.error('인증 확인 중 오류가 발생했습니다')
          router.push('/admin-products')
        }
      } finally {
        setIsLoading(false)
      }
    }

    checkAuth()
  }, [router])

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-lg">권한 확인 중...</div>
      </div>
    )
  }

  if (!isAuthorized) {
    return null
  }

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-gray-50">
        <ErrorBoundary>
          <ProductAnalytics />
        </ErrorBoundary>
      </div>
    </ErrorBoundary>
  )
}