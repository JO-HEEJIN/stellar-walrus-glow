'use client'

import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import ProductEditForm from '@/components/products/product-edit-form'

export default function EditProductPage() {
  const params = useParams()
  const router = useRouter()
  const productId = params.id as string

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-8">
        <Link
          href="/products"
          className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          상품 목록으로 돌아가기
        </Link>
      </div>

      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h1 className="text-2xl font-semibold text-gray-900 mb-6">상품 수정</h1>
          <ProductEditForm 
            productId={productId}
            onSuccess={() => {
              router.push('/products')
              router.refresh()
            }} 
          />
        </div>
      </div>
    </div>
  )
}