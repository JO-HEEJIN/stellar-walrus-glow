'use client'

import { useRouter } from 'next/navigation'
import { ProductFormWithImages } from '@/components/products/product-form-with-images'
import { toast } from 'sonner'
import { useEffect, useState } from 'react'

interface EditProductPageProps {
  params: { id: string }
}

export default function EditProductPage({ params }: EditProductPageProps) {
  const router = useRouter()
  const [product, setProduct] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isAuthorized, setIsAuthorized] = useState(false)

  useEffect(() => {
    const loadProduct = async () => {
      try {
        // Check auth first
        const authResponse = await fetch('/api/auth/me')
        if (!authResponse.ok) {
          toast.error('로그인이 필요합니다')
          router.push('/login')
          return
        }

        const authData = await authResponse.json()
        
        // Only BRAND_ADMIN and MASTER_ADMIN can edit products
        if (authData.user.role !== 'BRAND_ADMIN' && authData.user.role !== 'MASTER_ADMIN') {
          toast.error('권한이 없습니다')
          router.push('/products')
          return
        }

        setIsAuthorized(true)

        // Load product data
        const response = await fetch(`/api/products/${params.id}`)
        if (!response.ok) {
          if (response.status === 404) {
            toast.error('상품을 찾을 수 없습니다')
          } else {
            toast.error('상품 정보를 불러오는데 실패했습니다')
          }
          router.push('/products')
          return
        }

        const data = await response.json()
        setProduct(data.data)
      } catch (error) {
        console.error('Error loading product:', error)
        toast.error('상품 정보를 불러오는 중 오류가 발생했습니다')
        router.push('/products')
      } finally {
        setIsLoading(false)
      }
    }

    loadProduct()
  }, [params.id, router])

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-lg">상품 정보를 불러오는 중...</div>
      </div>
    )
  }

  if (!isAuthorized || !product) {
    return null
  }

  const handleSubmit = async (data: any) => {
    try {
      const response = await fetch(`/api/products/${params.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || '상품 수정에 실패했습니다')
      }

      toast.success('상품이 성공적으로 수정되었습니다')
      router.push('/products')
    } catch (error: any) {
      toast.error(error.message || '상품 수정 중 오류가 발생했습니다')
      throw error // Re-throw to let the form handle loading state
    }
  }

  // Transform product data for the form
  const initialData = {
    brandId: product.brandId,
    categoryId: product.categoryId || '',
    sku: product.sku,
    nameKo: product.nameKo,
    nameCn: product.nameCn || '',
    descriptionKo: product.descriptionKo || '',
    descriptionCn: product.descriptionCn || '',
    basePrice: product.basePrice,
    inventory: product.inventory,
    thumbnailImage: product.thumbnailImage || '',
    images: product.images || [],
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <ProductFormWithImages 
        initialData={initialData}
        onSubmit={handleSubmit}
        onCancel={() => router.push('/products')}
        isEditing={true}
      />
    </div>
  )
}