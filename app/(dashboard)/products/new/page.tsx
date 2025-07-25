'use client'

import { useRouter } from 'next/navigation'
import { ProductFormWithImages } from '@/components/products/product-form-with-images'
import { toast } from 'sonner'
import { useEffect, useState } from 'react'

export default function NewProductPage() {
  const router = useRouter()
  const [isAuthorized, setIsAuthorized] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await fetch('/api/auth/me')
        if (response.ok) {
          const data = await response.json()
          // Only BRAND_ADMIN and MASTER_ADMIN can create products
          if (data.user.role === 'BRAND_ADMIN' || data.user.role === 'MASTER_ADMIN') {
            setIsAuthorized(true)
          } else {
            toast.error('권한이 없습니다')
            router.push('/products')
          }
        } else {
          toast.error('로그인이 필요합니다')
          router.push('/login')
        }
      } catch (error) {
        console.error('Auth check error:', error)
        toast.error('인증 확인 중 오류가 발생했습니다')
        router.push('/products')
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

  const handleSubmit = async (data: any) => {
    try {
      const response = await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || '상품 등록에 실패했습니다')
      }

      toast.success('상품이 성공적으로 등록되었습니다')
      router.push('/products')
    } catch (error: any) {
      toast.error(error.message || '상품 등록 중 오류가 발생했습니다')
      throw error // Re-throw to let the form handle loading state
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <ProductFormWithImages 
        onSubmit={handleSubmit}
        onCancel={() => router.push('/products')}
      />
    </div>
  )
}