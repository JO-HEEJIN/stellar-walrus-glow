import { requireAuth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import ProductForm from '@/components/products/product-form'

export default async function NewProductPage() {
  const user = await requireAuth()

  // Only BRAND_ADMIN and MASTER_ADMIN can create products
  if (!['BRAND_ADMIN', 'MASTER_ADMIN'].includes(user.role)) {
    redirect('/unauthorized')
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-gray-900">상품 등록</h1>
        <p className="mt-2 text-sm text-gray-700">
          새로운 상품을 등록합니다.
        </p>
      </div>

      <div className="bg-white shadow sm:rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <ProductForm />
        </div>
      </div>
    </div>
  )
}