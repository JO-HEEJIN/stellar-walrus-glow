'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { ProductFormWithImages } from '@/components/products/product-form-with-images'
import { toast } from 'sonner'
import { useEffect, useState } from 'react'
import ErrorBoundary from '@/components/error-boundary'

export default function NewProductPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isAuthorized, setIsAuthorized] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [duplicateProductData, setDuplicateProductData] = useState(null)
  const duplicateId = searchParams.get('duplicate')

  useEffect(() => {
    const checkAuth = async () => {
      try {
        // 개발 모드에서는 권한 체크를 건너뛰기
        if (process.env.NODE_ENV === 'development' || process.env.NEXT_PUBLIC_SKIP_AUTH === 'true') {
          console.log('🔧 Development mode: skipping auth check in product creation page')
          setIsAuthorized(true)
          // Load duplicate product data if needed
          if (duplicateId) {
            await loadDuplicateProduct(duplicateId)
          }
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
          
          // Only BRAND_ADMIN and MASTER_ADMIN can create products
          if (data.user && (data.user.role === 'BRAND_ADMIN' || data.user.role === 'MASTER_ADMIN')) {
            console.log('✅ User authorized:', data.user.role)
            setIsAuthorized(true)
            // Load duplicate product data if needed
            if (duplicateId) {
              await loadDuplicateProduct(duplicateId)
            }
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
          // Load duplicate product data if needed
          if (duplicateId) {
            await loadDuplicateProduct(duplicateId)
          }
        } else {
          toast.error('인증 확인 중 오류가 발생했습니다')
          router.push('/admin-products')
        }
      } finally {
        setIsLoading(false)
      }
    }

    const loadDuplicateProduct = async (productId: string) => {
      try {
        console.log('🔄 Loading product for duplication:', productId)
        const response = await fetch(`/api/products/${productId}`, {
          credentials: 'include',
        })

        if (response.ok) {
          const data = await response.json()
          if (data.success && data.data) {
            // Prepare duplicate data by clearing ID, SKU, and modifying title
            const originalProduct = data.data
            const duplicateData = {
              ...originalProduct,
              id: undefined, // Clear ID for new product
              sku: `${originalProduct.sku}-COPY`, // Modify SKU to avoid conflicts
              nameKo: `${originalProduct.nameKo} (복사본)`,
              nameCn: originalProduct.nameCn ? `${originalProduct.nameCn} (复制品)` : undefined,
              images: [], // Don't copy images (user can upload new ones)
              imageUrl: null,
              thumbnailImage: null,
              status: 'INACTIVE', // Start as inactive
              inventory: 0, // Reset inventory
            }
            setDuplicateProductData(duplicateData)
            toast.success('상품 정보를 복사했습니다. SKU와 이미지를 확인해주세요.')
          }
        } else {
          console.error('Failed to load product for duplication')
          toast.error('복사할 상품을 불러오는데 실패했습니다.')
        }
      } catch (error) {
        console.error('Error loading duplicate product:', error)
        toast.error('상품 복사 중 오류가 발생했습니다.')
      }
    }

    checkAuth()
  }, [router, duplicateId])

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-lg">
          {duplicateId ? '상품 복사 준비 중...' : '권한 확인 중...'}
        </div>
      </div>
    )
  }

  if (!isAuthorized) {
    return null
  }

  const handleSubmit = async (data: any) => {
    try {
      const response = await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        let errorMessage = '상품 등록에 실패했습니다'
        try {
          const error = await response.json()
          console.error('Product creation API error:', error)
          
          if (error.error?.message) {
            errorMessage = error.error.message
          } else if (error.message) {
            errorMessage = error.message
          } else if (error.error?.details) {
            errorMessage = `Validation error: ${JSON.stringify(error.error.details)}`
          }
          
          // Specific error handling
          if (response.status === 409) {
            errorMessage = 'SKU가 이미 존재합니다. 다른 SKU를 사용해주세요.'
          } else if (response.status === 400) {
            errorMessage = `입력 데이터 오류: ${errorMessage}`
          }
        } catch (parseError) {
          console.error('Failed to parse error response:', parseError)
          errorMessage = `HTTP ${response.status}: ${response.statusText}`
        }
        
        throw new Error(errorMessage)
      }

      toast.success('상품이 성공적으로 등록되었습니다')
      // 성공 시 바로 리다이렉트 (onCancel은 컴포넌트에서 처리)
      router.push('/admin-products')
    } catch (error: any) {
      toast.error(error.message || '상품 등록 중 오류가 발생했습니다')
      throw error // Re-throw to let the form handle loading state
    }
  }

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-gray-50">
        <ErrorBoundary>
          <ProductFormWithImages 
            initialData={duplicateProductData}
            isDuplicating={!!duplicateId}
            onSubmit={handleSubmit}
            onCancel={() => router.push('/admin-products')}
          />
        </ErrorBoundary>
      </div>
    </ErrorBoundary>
  )
}