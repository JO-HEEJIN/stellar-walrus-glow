import { Metadata } from 'next';

export const metadata: Metadata = {
  title: '관심상품 - GOLF B2B',
  description: '관심상품 목록을 확인하고 관리하세요',
};

export default function WishlistPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-semibold text-gray-900 mb-8">관심상품</h1>
      
      <div className="text-center py-20">
        <div className="text-4xl mb-4">❤️</div>
        <div className="text-lg font-medium text-gray-900 mb-2">관심상품이 없습니다</div>
        <div className="text-sm text-gray-500 mb-6">마음에 드는 상품을 관심상품으로 추가해보세요.</div>
        <a
          href="/products"
          className="inline-block px-6 py-3 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors"
        >
          상품 둘러보기
        </a>
      </div>
    </div>
  );
}