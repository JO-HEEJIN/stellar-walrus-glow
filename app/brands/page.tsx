import { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';

export const metadata: Metadata = {
  title: '브랜드 목록 - GOLF B2B',
  description: '골프 B2B 플랫폼에서 다양한 브랜드의 상품을 만나보세요',
};

interface Brand {
  id: string;
  nameKo: string;
  nameCn?: string;
  slug: string;
  description?: string;
  logoUrl?: string;
  productCount: number;
}

async function getBrands(): Promise<Brand[]> {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/brands`,
      { cache: 'no-store' }
    );

    if (!response.ok) {
      console.error('Failed to fetch brands:', response.status);
      return [];
    }

    const data = await response.json();
    return data.data || [];
  } catch (error) {
    console.error('Error fetching brands:', error);
    return [];
  }
}

export default async function BrandsPage() {
  const brands = await getBrands();

  return (
    <div className="min-h-screen bg-white">
      {/* Page Header */}
      <div className="bg-gray-50 py-16 mb-10">
        <div className="max-w-[1280px] mx-auto px-5">
          <h1 className="text-4xl font-black text-center mb-4">브랜드 목록</h1>
          <p className="text-lg text-gray-600 text-center">
            프리미엄 골프 브랜드의 다양한 상품을 만나보세요
          </p>
        </div>
      </div>

      <div className="max-w-[1280px] mx-auto px-5 pb-16">
        {brands.length > 0 ? (
          <>
            <div className="flex justify-between items-center mb-8">
              <span className="text-sm text-gray-600">
                총 {brands.length}개 브랜드
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {brands.map((brand) => (
                <BrandCard key={brand.id} brand={brand} />
              ))}
            </div>
          </>
        ) : (
          <div className="text-center py-20">
            <div className="text-4xl mb-4">🏪</div>
            <div className="text-lg font-medium text-gray-900 mb-2">브랜드가 없습니다</div>
            <div className="text-sm text-gray-500">곧 다양한 브랜드가 입점할 예정입니다.</div>
          </div>
        )}
      </div>
    </div>
  );
}

function BrandCard({ brand }: { brand: Brand }) {
  return (
    <Link
      href={`/brands/${brand.slug}`}
      className="group block bg-white border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-all hover:-translate-y-1"
    >
      {/* Brand Logo */}
      <div className="flex items-center justify-center h-24 mb-4 bg-gray-50 rounded-lg">
        {brand.logoUrl ? (
          <Image
            src={brand.logoUrl}
            alt={brand.nameKo}
            width={80}
            height={40}
            className="object-contain"
          />
        ) : (
          <div className="text-xl font-bold text-gray-400">
            {brand.nameKo.slice(0, 2)}
          </div>
        )}
      </div>

      {/* Brand Info */}
      <div className="text-center">
        <h3 className="text-lg font-bold mb-2 group-hover:text-indigo-600 transition-colors">
          {brand.nameKo}
        </h3>
        {brand.nameCn && (
          <p className="text-sm text-gray-500 mb-3">{brand.nameCn}</p>
        )}
        {brand.description && (
          <p className="text-xs text-gray-600 mb-4 line-clamp-2">
            {brand.description}
          </p>
        )}
        <div className="inline-flex items-center gap-1 px-3 py-1 bg-indigo-50 text-indigo-600 rounded-full text-xs font-medium">
          <span>📦</span>
          {brand.productCount}개 상품
        </div>
      </div>
    </Link>
  );
}