
interface BrandPageProps {
  params: { slug: string }
}

export default function BrandPage({ params }: BrandPageProps) {
  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="bg-white p-6 rounded-lg shadow">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">브랜드: {params.slug}</h1>
        <p className="text-gray-600">브랜드 상세 정보 페이지입니다.</p>
      </div>

      <div className="mt-8">
        <h2 className="text-xl font-semibold text-gray-900 mb-6">브랜드 상품</h2>
        <div className="bg-white p-6 rounded-lg shadow">
          <p className="text-gray-600">브랜드 상품 목록이 여기에 표시됩니다.</p>
        </div>
      </div>
    </div>
  )
}