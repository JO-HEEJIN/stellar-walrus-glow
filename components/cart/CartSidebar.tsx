'use client';

import { useState } from 'react';
import { formatPrice } from '@/lib/utils';

interface CartSidebarProps {
  selectedTotal: number;
  selectedCount: number;
  onCheckout: () => void;
}

export function CartSidebar({ selectedTotal, selectedCount, onCheckout }: CartSidebarProps) {
  const [couponCode, setCouponCode] = useState('');
  
  // 할인 계산
  const productDiscount = selectedTotal * 0.15; // 15% 상품할인 예시
  const bulkDiscount = selectedTotal >= 1000000 ? selectedTotal * 0.05 : 0; // 100만원 이상 5% 추가할인
  const finalTotal = selectedTotal - productDiscount - bulkDiscount;
  
  const handleCouponApply = () => {
    if (!couponCode.trim()) return;
    alert('쿠폰이 적용되었습니다.');
    setCouponCode('');
  };

  const handleCheckout = () => {
    if (selectedCount === 0) {
      alert('주문할 상품을 선택해주세요.');
      return;
    }
    
    if (finalTotal < 300000) {
      alert('최소 주문금액은 ₩300,000입니다.');
      return;
    }
    
    onCheckout();
  };

  return (
    <div className="sticky top-20">
      {/* B2B 혜택 안내 */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-5">
        <div className="flex items-center gap-2 font-bold text-sm mb-3">
          <span>🎯</span>
          <span>B2B 회원 특별 혜택</span>
        </div>
        <ul className="text-xs leading-relaxed space-y-1">
          <li>• 대량구매 자동 할인 적용</li>
          <li>• 세금계산서 발행 가능</li>
          <li>• EMS 해외배송 지원</li>
          <li>• 전담 고객 매니저 배정</li>
        </ul>
      </div>

      {/* 주문 요약 */}
      <div className="bg-white rounded-lg p-5 mb-5 shadow-sm border">
        <h2 className="text-base font-bold mb-5 pb-4 border-b-2 border-black">주문 요약</h2>
        
        <div className="space-y-3 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-600">상품금액</span>
            <span>{formatPrice(selectedTotal)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">상품할인</span>
            <span className="text-red-500">-{formatPrice(productDiscount)}</span>
          </div>
          {bulkDiscount > 0 && (
            <div className="flex justify-between">
              <span className="text-gray-600">대량구매 추가할인</span>
              <span className="text-red-500">-{formatPrice(bulkDiscount)}</span>
            </div>
          )}
          
          <div className="border-t pt-3">
            <div className="flex justify-between">
              <span className="text-gray-600">배송비</span>
              <span>₩0</span>
            </div>
          </div>
          
          {/* 쿠폰 입력 */}
          <div className="pt-4">
            <div className="flex gap-2">
              <input
                type="text"
                value={couponCode}
                onChange={(e) => setCouponCode(e.target.value)}
                placeholder="쿠폰 코드 입력"
                className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded"
              />
              <button
                onClick={handleCouponApply}
                className="px-4 py-2 bg-black text-white text-sm rounded hover:bg-gray-800 transition-colors"
              >
                적용
              </button>
            </div>
          </div>

          <div className="flex justify-between text-lg font-bold pt-5 border-t-2 border-black">
            <span>총 결제금액</span>
            <span>{formatPrice(finalTotal)}</span>
          </div>
        </div>
      </div>

      {/* 결제 버튼 */}
      <div className="space-y-4">
        <button
          onClick={handleCheckout}
          className="w-full py-4 bg-red-500 text-white font-bold rounded hover:bg-red-600 transition-colors"
        >
          주문하기 ({selectedCount}개)
        </button>
        
        <div className="bg-gray-50 rounded p-3 text-xs leading-relaxed text-gray-600">
          • 위챗페이/알리페이 결제 가능<br />
          • 최소 주문금액: ₩300,000<br />
          • 해외배송: EMS 3-5일 소요<br />
          • 세금계산서 발행 가능
        </div>
      </div>

      {/* 최근 본 상품 */}
      <RecentlyViewed />
    </div>
  );
}

function RecentlyViewed() {
  // 최근 본 상품 mock data
  const recentProducts = [
    { id: '1', name: '골프 모자', price: 45000, imageUrl: '/placeholder.svg' },
    { id: '2', name: '골프 벨트', price: 68000, imageUrl: '/placeholder.svg' },
    { id: '3', name: '골프 백팩', price: 156000, imageUrl: '/placeholder.svg' },
    { id: '4', name: '골프 장갑', price: 82000, imageUrl: '/placeholder.svg' },
  ];

  return (
    <div className="bg-white rounded-lg p-5 mt-5 shadow-sm border">
      <h3 className="text-sm font-bold mb-4">최근 본 상품</h3>
      <div className="grid grid-cols-2 gap-2">
        {recentProducts.map((product) => (
          <div key={product.id} className="cursor-pointer">
            <div className="aspect-[3/4] bg-gray-100 rounded mb-2 overflow-hidden">
              <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">
                상품 이미지
              </div>
            </div>
            <div className="text-xs font-semibold">{formatPrice(product.price)}</div>
          </div>
        ))}
      </div>
    </div>
  );
}