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
  let brands = await getBrands();

  // API에서 브랜드를 가져오지 못한 경우, 임시로 실제 브랜드 목록 표시
  if (brands.length === 0) {
    brands = [
      {
        id: 'malbon-golf',
        nameKo: 'MALBON GOLF',
        nameCn: '말본골프',
        slug: 'malbon-golf',
        description: '말본 골프(MALBON GOLF)는 패션 디자이너 스테판 말본과 에리카 말본 부부가 론칭한 스트릿 감성의 라이프스타일 골프 웨어 브랜드입니다.',
        logoUrl: 'https://images.unsplash.com/photo-1544966503-7cc5ac882d5f?w=100&h=100&fit=crop',
        productCount: 12
      },
      {
        id: 'southcape',
        nameKo: 'SOUTHCAPE',
        nameCn: '사우스케이프',
        slug: 'southcape',
        description: '사우스케이프가 골프 & 리조트 분야의 새로운 이상향을 제시한 것과 같이 골프웨어 분야에서도 새로운 이정표를 제시합니다.',
        logoUrl: 'https://images.unsplash.com/photo-1473496169904-658ba7c44d8a?w=100&h=100&fit=crop',
        productCount: 8
      },
      {
        id: 'st-andrews',
        nameKo: 'St.Andrews',
        nameCn: '세인트앤드류스',
        slug: 'st-andrews',
        description: '스코틀랜드의 클래식함을 바탕으로 품격이 넘치는 라이프 스타일을 패션과 결합한 하이엔드 골프웨어',
        logoUrl: 'https://images.unsplash.com/photo-1544966503-7cc5ac882d5f?w=100&h=100&fit=crop',
        productCount: 15
      },
      {
        id: 'g-fore',
        nameKo: 'G/FORE',
        nameCn: '지포어',
        slug: 'g-fore',
        description: '2011년 LA 런칭 후 글로벌 브랜드로 성장, "골프의 전통성을 존중하는 파괴적인 럭셔리"를 컨셉으로 젊은 감각과 모던한 디자인을 선보입니다.',
        logoUrl: 'https://images.unsplash.com/photo-1521369909029-2afed882baee?w=100&h=100&fit=crop',
        productCount: 10
      }
    ];
  }

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