import { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import Footer from '@/components/layout/footer';

export const metadata: Metadata = {
  title: 'GOLF B2B - 프리미엄 골프웨어 B2B 도매 플랫폼',
  description: '프리미엄 골프웨어 B2B 도매 플랫폼 - 대량구매, 브랜드 입점, 빠른 배송',
};

async function getProducts() {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/products?limit=8&sort=recommended`, {
      cache: 'no-store'
    });
    
    if (response.ok) {
      const data = await response.json();
      return data.data?.products || [];
    }
  } catch (error) {
    console.error('Error fetching products:', error);
  }
  
  return [];
}

async function getNewProducts() {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/products?limit=4&sort=newest`, {
      cache: 'no-store'
    });
    
    if (response.ok) {
      const data = await response.json();
      return data.data?.products || [];
    }
  } catch (error) {
    console.error('Error fetching new products:', error);
  }
  
  return [];
}

async function getBestProducts() {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/products?limit=4&category=best`, {
      cache: 'no-store'
    });
    
    if (response.ok) {
      const data = await response.json();
      return data.data?.products || [];
    }
  } catch (error) {
    console.error('Error fetching best products:', error);
  }
  
  return [];
}

export default async function HomePage() {
  const [recommendedProducts, newProducts, bestProducts] = await Promise.all([
    getProducts(),
    getNewProducts(),
    getBestProducts()
  ]);

  return (
    <>
      {/* 메인 헤더 */}
      <header className="bg-white shadow-sm">
        <div className="bg-gray-100 border-b">
          <div className="max-w-7xl mx-auto px-6 py-2">
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-4">
                <Link href="/about" className="text-gray-600 hover:text-black">회사소개</Link>
                <Link href="/brands" className="text-gray-600 hover:text-black">브랜드 입점문의</Link>
                <Link href="/contact" className="text-gray-600 hover:text-black">고객센터</Link>
              </div>
              <div className="flex items-center gap-4">
                <Link href="/help" className="text-gray-600 hover:text-black">도움말</Link>
                <span className="text-gray-400">|</span>
                <Link href="/auth/login" className="text-gray-600 hover:text-black">로그인</Link>
              </div>
            </div>
          </div>
        </div>
        
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="text-2xl font-black text-black">
              GOLF B2B
            </Link>
            
            <div className="flex-1 max-w-2xl mx-8">
              <div className="relative">
                <input
                  type="text"
                  placeholder="상품, 브랜드를 검색하세요..."
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                />
                <button className="absolute right-3 top-3 text-gray-500">
                  🔍
                </button>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <Link href="/dashboard/wishlist" className="flex items-center gap-1 text-gray-700 hover:text-black">
                ❤️ <span>관심상품</span>
              </Link>
              <Link href="/dashboard/cart" className="flex items-center gap-1 text-gray-700 hover:text-black">
                🛒 <span>장바구니</span>
              </Link>
              <Link href="/dashboard/quotes" className="flex items-center gap-1 text-gray-700 hover:text-black">
                📊 <span>견적서</span>
              </Link>
              <Link href="/dashboard" className="flex items-center gap-1 text-gray-700 hover:text-black">
                👤 <span>마이페이지</span>
              </Link>
            </div>
          </div>
        </div>
        
        <nav className="border-t">
          <div className="max-w-7xl mx-auto px-6">
            <div className="flex items-center gap-8">
              <Link href="/categories/clubs" className="py-4 text-gray-700 hover:text-black font-medium">클럽</Link>
              <Link href="/categories/balls" className="py-4 text-gray-700 hover:text-black font-medium">볼</Link>
              <Link href="/categories/apparel" className="py-4 text-gray-700 hover:text-black font-medium">의류</Link>
              <Link href="/categories/shoes" className="py-4 text-gray-700 hover:text-black font-medium">신발</Link>
              <Link href="/categories/accessories" className="py-4 text-gray-700 hover:text-black font-medium">액세서리</Link>
              <Link href="/categories/sale" className="py-4 text-red-500 hover:text-red-600 font-bold">🔥 세일</Link>
            </div>
          </div>
        </nav>
      </header>

      <main>
        {/* B2B 정보 바 */}
        <div className="bg-gray-100 border-b">
          <div className="max-w-7xl mx-auto px-6 py-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-8">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-600">최소주문금액:</span>
                  <span className="text-sm font-semibold">50만원</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-600">예상 배송기간:</span>
                  <span className="text-sm font-semibold">3-5 영업일</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-600">결제방법:</span>
                  <span className="text-sm font-semibold">후불결제, 카드결제</span>
                </div>
              </div>
              <Link
                href="/dashboard/quotes"
                className="px-6 py-2 bg-black text-white text-sm font-medium rounded hover:bg-gray-800 transition-colors"
              >
                대량구매 문의
              </Link>
            </div>
          </div>
        </div>

        {/* 브랜드 필터 */}
        <div className="border-b">
          <div className="max-w-7xl mx-auto px-6 py-4">
            <div className="flex items-center gap-3 flex-wrap">
              <Link
                href="/brands"
                className="px-4 py-2 bg-black text-white text-sm font-medium rounded-full hover:bg-gray-800 transition-colors"
              >
                전체
              </Link>
              <Link
                href="/brands/titleist"
                className="px-4 py-2 bg-white border border-gray-300 text-sm font-medium rounded-full hover:bg-gray-50 transition-colors"
              >
                타이틀리스트
              </Link>
              <Link
                href="/brands/callaway"
                className="px-4 py-2 bg-white border border-gray-300 text-sm font-medium rounded-full hover:bg-gray-50 transition-colors"
              >
                캘러웨이
              </Link>
              <Link
                href="/brands/malbon-golf"
                className="px-4 py-2 bg-white border border-gray-300 text-sm font-medium rounded-full hover:bg-gray-50 transition-colors"
              >
                말본골프
              </Link>
              <Link
                href="/brands/pxg"
                className="px-4 py-2 bg-white border border-gray-300 text-sm font-medium rounded-full hover:bg-gray-50 transition-colors"
              >
                PXG
              </Link>
              <Link
                href="/brands/taylormade"
                className="px-4 py-2 bg-white border border-gray-300 text-sm font-medium rounded-full hover:bg-gray-50 transition-colors"
              >
                테일러메이드
              </Link>
              <Link
                href="/brands/pearly-gates"
                className="px-4 py-2 bg-white border border-gray-300 text-sm font-medium rounded-full hover:bg-gray-50 transition-colors"
              >
                팔리게이츠
              </Link>
              <Link
                href="/brands/musinsa-standard"
                className="px-4 py-2 bg-white border border-gray-300 text-sm font-medium rounded-full hover:bg-gray-50 transition-colors"
              >
                무신사스탠다드
              </Link>
              <Link
                href="/brands"
                className="px-4 py-2 text-sm text-gray-600 hover:text-black transition-colors"
              >
                더보기 →
              </Link>
            </div>
          </div>
        </div>

        {/* 히어로 배너 */}
        <div className="relative h-[500px] bg-gradient-to-br from-blue-900 to-blue-600 overflow-hidden">
          <div className="absolute inset-0 bg-black/20" />
          <div className="relative z-10 max-w-7xl mx-auto px-6 h-full flex items-center">
            <div className="max-w-2xl">
              <div className="inline-block px-4 py-2 bg-red-500 text-white text-sm font-bold rounded-full mb-4">
                한정 특가
              </div>
              <h1 className="text-5xl font-bold text-white mb-4">
                2025 S/S 신상품<br />
                사전예약 특가
              </h1>
              <p className="text-xl text-white/90 mb-8">
                타이틀리스트, 캘러웨이 등 인기 브랜드<br />
                최대 30% 할인 혜택을 놓치지 마세요
              </p>
              <Link
                href="/products"
                className="inline-block px-8 py-4 bg-white text-blue-900 font-bold rounded-lg hover:bg-gray-100 transition-colors"
              >
                지금 쇼핑하기
              </Link>
            </div>
          </div>
          <div className="absolute right-0 bottom-0 w-1/2 h-full">
            <Image
              src="https://images.unsplash.com/photo-1587174486073-ae5e5cff23aa?w=800"
              alt="Golf Products"
              fill
              className="object-cover"
            />
          </div>
        </div>

        {/* 추천 상품 섹션 */}
        <section className="py-16">
          <div className="max-w-7xl mx-auto px-6">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-3xl font-bold">🔥 추천 상품</h2>
              <Link href="/products" className="text-gray-600 hover:text-black">
                전체보기 →
              </Link>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {recommendedProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </div>
        </section>

        {/* 신상품 섹션 */}
        <section className="py-16 bg-gray-50">
          <div className="max-w-7xl mx-auto px-6">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-3xl font-bold">✨ 신상품</h2>
              <Link href="/products?sort=newest" className="text-gray-600 hover:text-black">
                전체보기 →
              </Link>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {newProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </div>
        </section>

        {/* 베스트셀러 섹션 */}
        <section className="py-16">
          <div className="max-w-7xl mx-auto px-6">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-3xl font-bold">🏆 베스트셀러</h2>
              <Link href="/products?category=best" className="text-gray-600 hover:text-black">
                전체보기 →
              </Link>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {bestProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </div>
        </section>
      </main>

      {/* 플로팅 버튼 */}
      <div className="fixed bottom-8 right-8 flex flex-col gap-3">
        <a
          href="#top"
          className="w-12 h-12 bg-white border border-gray-300 rounded-full flex items-center justify-center shadow-lg hover:bg-gray-50 transition-colors"
        >
          ↑
        </a>
        <Link
          href="/dashboard/quotes"
          className="w-12 h-12 bg-black text-white rounded-full flex items-center justify-center shadow-lg hover:bg-gray-800 transition-colors"
        >
          ⚡
        </Link>
      </div>

      <Footer />
    </>
  );
}

// Product Card Component
function ProductCard({ product }: { product: any }) {
  return (
    <Link href={`/products/${product.id}`} className="group">
      <div className="bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-lg transition-shadow">
        <div className="relative aspect-[4/5] bg-gray-100">
          <Image
            src={product.imageUrl}
            alt={product.nameKo}
            fill
            className="object-cover group-hover:scale-105 transition-transform"
          />
          {product.isNew && (
            <div className="absolute top-2 left-2 px-2 py-1 bg-green-500 text-white text-xs font-bold rounded">
              NEW
            </div>
          )}
          {product.discountRate > 0 && (
            <div className="absolute top-2 right-2 px-2 py-1 bg-red-500 text-white text-xs font-bold rounded">
              {product.discountRate}%
            </div>
          )}
        </div>
        <div className="p-4">
          <p className="text-sm text-gray-600 mb-1">{product.brandName}</p>
          <h3 className="font-medium mb-2 line-clamp-2">{product.nameKo}</h3>
          <div className="flex items-center gap-2">
            {product.discountPrice && (
              <>
                <span className="text-lg font-bold">
                  {product.discountPrice.toLocaleString()}원
                </span>
                <span className="text-sm text-gray-500 line-through">
                  {product.price.toLocaleString()}원
                </span>
              </>
            )}
            {!product.discountPrice && (
              <span className="text-lg font-bold">
                {product.price.toLocaleString()}원
              </span>
            )}
          </div>
          <p className="text-xs text-gray-600 mt-1">
            최소주문: {product.minOrderQty}개
          </p>
        </div>
      </div>
    </Link>
  );
}