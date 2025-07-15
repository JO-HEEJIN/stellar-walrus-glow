import BrandList from '@/components/brands/brand-list'

export default function BrandsPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <h1 className="text-2xl font-semibold text-gray-900">브랜드</h1>
          <p className="mt-2 text-sm text-gray-700">
            등록된 브랜드를 확인하고 상품을 둘러보세요.
          </p>
        </div>
      </div>

      <div className="mt-8">
        <BrandList />
      </div>
    </div>
  )
}