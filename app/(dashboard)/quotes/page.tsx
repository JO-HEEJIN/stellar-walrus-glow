import { Metadata } from 'next';

export const metadata: Metadata = {
  title: '견적서 - GOLF B2B',
  description: '견적서를 확인하고 관리하세요',
};

export default function QuotesPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-semibold text-gray-900 mb-8">견적서</h1>
      
      <div className="text-center py-20">
        <div className="text-4xl mb-4">📊</div>
        <div className="text-lg font-medium text-gray-900 mb-2">견적서가 없습니다</div>
        <div className="text-sm text-gray-500 mb-6">상품을 견적서에 추가하여 대량구매 견적을 받아보세요.</div>
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