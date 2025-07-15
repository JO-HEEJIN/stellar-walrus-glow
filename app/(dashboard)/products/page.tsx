import Link from 'next/link'
import ProductList from '@/components/products/product-list'

export default function ProductsPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <h1 className="text-2xl font-semibold text-gray-900">상품 관리</h1>
          <p className="mt-2 text-sm text-gray-700">
            브랜드 상품을 등록하고 관리합니다.
          </p>
        </div>
        <div className="mt-4 sm:ml-16 sm:mt-0 sm:flex-none">
          <Link
            href="/products/new"
            className="block rounded-md bg-primary px-3 py-2 text-center text-sm font-semibold text-white shadow-sm hover:bg-primary/90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
          >
            상품 등록
          </Link>
        </div>
      </div>

      <div className="mt-8">
        <ProductList />
      </div>
    </div>
  )
}