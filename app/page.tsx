'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import Footer from '@/components/layout/footer';

export default function HomePage() {
  const [activeFilter, setActiveFilter] = useState('전체');
  const [activeNav, setActiveNav] = useState('추천');
  const [activeSort, setActiveSort] = useState('추천순');
  const [products, setProducts] = useState<any[]>([]);
  const [cartCount, setCartCount] = useState(3);

  // Mock product data - 실제로는 API에서 가져옴
  const mockProducts = [
    {
      id: 1,
      brand: 'TITLEIST',
      name: '남성 투어 퍼포먼스 폴로 셔츠 (네이비)',
      price: 89000,
      originalPrice: 128000,
      discount: 30,
      moq: 10,
      badge: 'NEW',
      image: 'https://picsum.photos/300/400?random=1'
    },
    {
      id: 2,
      brand: 'CALLAWAY',
      name: '프리미엄 스트레치 팬츠 (베이지)',
      price: 105000,
      originalPrice: 140000,
      discount: 25,
      moq: 5,
      badge: 'BEST',
      image: 'https://picsum.photos/300/400?random=2'
    },
    {
      id: 3,
      brand: 'MALBON GOLF',
      name: '윈드브레이커 자켓 (화이트)',
      price: 168000,
      originalPrice: 210000,
      discount: 20,
      moq: 3,
      badge: null,
      image: 'https://picsum.photos/300/400?random=3'
    },
    {
      id: 4,
      brand: 'PXG',
      name: '투어 캡 모자 (블랙)',
      price: 42500,
      originalPrice: 50000,
      discount: 15,
      moq: 20,
      badge: 'HOT',
      image: 'https://picsum.photos/300/400?random=4'
    },
    {
      id: 5,
      brand: 'G/FORE',
      name: '퀼팅 베스트 (네이비)',
      price: 156000,
      originalPrice: 240000,
      discount: 35,
      moq: 5,
      badge: null,
      image: 'https://picsum.photos/300/400?random=5'
    },
    {
      id: 6,
      brand: '와이드앵글',
      name: '여성 플리츠 스커트 (핑크)',
      price: 79000,
      originalPrice: 110000,
      discount: 28,
      moq: 10,
      badge: 'NEW',
      image: 'https://picsum.photos/300/400?random=6'
    },
    {
      id: 7,
      brand: '빈폴골프',
      name: '프리미엄 양피 장갑 (화이트)',
      price: 18000,
      originalPrice: 30000,
      discount: 40,
      moq: 30,
      badge: null,
      image: 'https://picsum.photos/300/400?random=7'
    },
    {
      id: 8,
      brand: '먼싱웨어',
      name: '캐디백 스탠드형 (올블랙)',
      price: 390000,
      originalPrice: 500000,
      discount: 22,
      moq: 2,
      badge: 'BEST',
      image: 'https://picsum.photos/300/400?random=8'
    }
  ];

  const bestBrandProducts = [
    {
      id: 9,
      brand: 'DESCENTE GOLF',
      name: '프리미엄 쿨링 폴로셔츠',
      price: 82500,
      originalPrice: 150000,
      discount: 45,
      moq: 8,
      badge: 'SALE',
      image: 'https://picsum.photos/300/400?random=9'
    },
    {
      id: 10,
      brand: 'FOOTJOY',
      name: '프로 SL 골프화 (화이트/네이비)',
      price: 205000,
      originalPrice: 250000,
      discount: 18,
      moq: 5,
      badge: null,
      image: 'https://picsum.photos/300/400?random=10'
    },
    {
      id: 11,
      brand: 'J.LINDEBERG',
      name: '브릿지 레더 벨트',
      price: 84000,
      originalPrice: 120000,
      discount: 30,
      moq: 15,
      badge: 'HOT',
      image: 'https://picsum.photos/300/400?random=11'
    },
    {
      id: 12,
      brand: 'NIKE GOLF',
      name: '드라이핏 플렉스 쇼츠',
      price: 67500,
      originalPrice: 90000,
      discount: 25,
      moq: 12,
      badge: null,
      image: 'https://picsum.photos/300/400?random=12'
    }
  ];

  const filterChips = [
    { name: '전체', count: null },
    { name: '타이틀리스트', count: 128 },
    { name: '캘러웨이', count: 95 },
    { name: '말본골프', count: 87 },
    { name: 'PXG', count: 64 },
    { name: 'G/FORE', count: 52 },
    { name: '와이드앵글', count: 73 },
    { name: '빈폴골프', count: 81 },
    { name: '먼싱웨어', count: 69 }
  ];

  const navItems = ['추천', '브랜드', '신상품', '베스트', '남성', '여성', '아우터', '상의', '하의', '액세서리', '세일'];
  const sortOptions = ['추천순', '신상품순', '판매량순', '낮은가격순', '높은가격순'];

  useEffect(() => {
    setProducts(mockProducts);
  }, []);

  const handleQuickAction = (productId: number, action: 'wishlist' | 'cart') => {
    if (action === 'wishlist') {
      alert('관심상품에 추가되었습니다.');
    } else if (action === 'cart') {
      alert('장바구니에 추가되었습니다.');
      setCartCount(prev => prev + 1);
    }
  };

  return (
    <>
      {/* 상단 헤더 */}
      <div className="bg-black text-white py-2 text-xs">
        <div className="max-w-[1280px] mx-auto px-5 flex justify-between items-center">
          <div className="flex gap-5">
            <Link href="#" className="text-gray-400 hover:text-white transition-colors">고객센터</Link>
            <Link href="#" className="text-gray-400 hover:text-white transition-colors">브랜드 입점문의</Link>
            <Link href="#" className="text-gray-400 hover:text-white transition-colors">대량구매 문의</Link>
          </div>
          <div className="flex gap-4 items-center">
            <Link href="#" className="text-gray-400 hover:text-white transition-colors">로그인</Link>
            <Link href="#" className="text-gray-400 hover:text-white transition-colors">회원가입</Link>
            <Link href="#" className="text-gray-400 hover:text-white transition-colors">주문배송</Link>
            <Link href="#" className="text-gray-400 hover:text-white transition-colors">🇰🇷 KOR</Link>
            <Link href="#" className="text-gray-400 hover:text-white transition-colors">🇨🇳 中文</Link>
          </div>
        </div>
      </div>

      {/* 메인 헤더 */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-[1280px] mx-auto px-5 flex items-center h-15">
          <div className="text-2xl font-black mr-10 cursor-pointer">
            GOLF B2B
          </div>
          
          <div className="flex-1 max-w-[500px] relative">
            <input
              type="text"
              placeholder="브랜드명, 상품명, SKU 검색"
              className="w-full h-10 px-4 pr-10 border-2 border-black rounded-full text-sm outline-none"
            />
            <button className="absolute right-3 top-1/2 transform -translate-y-1/2 text-lg">
              🔍
            </button>
          </div>
          
          <div className="flex gap-6 ml-auto items-center">
            <div className="flex flex-col items-center gap-1 cursor-pointer">
              <span>❤️</span>
              <span className="text-xs">관심상품</span>
            </div>
            <div className="flex flex-col items-center gap-1 cursor-pointer relative">
              <div className="relative">
                <span>🛒</span>
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full px-1.5 py-0.5 min-w-[18px] text-center">
                  {cartCount}
                </span>
              </div>
              <span className="text-xs">장바구니</span>
            </div>
            <div className="flex flex-col items-center gap-1 cursor-pointer">
              <span>📋</span>
              <span className="text-xs">견적서</span>
            </div>
            <div className="flex flex-col items-center gap-1 cursor-pointer">
              <span>👤</span>
              <span className="text-xs">마이페이지</span>
            </div>
          </div>
        </div>
      </div>

      {/* 네비게이션 */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-[1280px] mx-auto px-5 flex items-center h-12">
          <div className="flex gap-8">
            {navItems.map((item) => (
              <div
                key={item}
                onClick={() => setActiveNav(item)}
                className={`text-sm font-medium cursor-pointer py-1 border-b-2 transition-all ${
                  activeNav === item
                    ? 'border-black font-bold'
                    : 'border-transparent hover:border-black'
                }`}
              >
                {item}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* B2B 정보 바 */}
      <div className="bg-blue-50 border-b border-blue-200 py-3">
        <div className="max-w-[1280px] mx-auto px-5 flex justify-between items-center">
          <div className="flex items-center gap-2 text-sm">
            <span className="text-gray-600">최소 주문:</span>
            <span className="font-bold">₩300,000</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <span className="text-gray-600">예상 배송:</span>
            <span className="font-bold">3-5일 (EMS)</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <span className="text-gray-600">결제 수단:</span>
            <span className="font-bold">위챗페이 · 알리페이 · 계좌이체</span>
          </div>
          <button className="px-4 py-2 bg-blue-600 text-white rounded-full text-sm font-semibold hover:bg-blue-700 transition-colors">
            📊 엑셀 대량주문
          </button>
        </div>
      </div>

      {/* 필터 바 */}
      <div className="bg-gray-50 border-b border-gray-200 py-4">
        <div className="max-w-[1280px] mx-auto px-5">
          <div className="flex gap-3 flex-wrap">
            {filterChips.map((chip) => (
              <button
                key={chip.name}
                onClick={() => setActiveFilter(chip.name)}
                className={`px-4 py-2 rounded-full text-sm border transition-all flex items-center gap-1 ${
                  activeFilter === chip.name
                    ? 'bg-black text-white border-black'
                    : 'bg-white text-black border-gray-300 hover:bg-gray-100'
                }`}
              >
                {chip.name}
                {chip.count && (
                  <span className={`text-xs ${
                    activeFilter === chip.name ? 'text-gray-300' : 'text-gray-500'
                  }`}>
                    {chip.count}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 배너 섹션 */}
      <div className="max-w-[1280px] mx-auto my-10 px-5">
        <div className="relative h-[300px] rounded-xl overflow-hidden bg-gradient-to-r from-purple-600 to-purple-800 flex items-center px-15">
          <div className="text-white max-w-[500px]">
            <span className="inline-block px-3 py-1 bg-white/20 rounded-full text-xs mb-4">
              🔥 HOT DEAL
            </span>
            <h2 className="text-4xl font-black leading-tight mb-4">
              2025 S/S<br />신상품 사전예약
            </h2>
            <p className="text-lg opacity-90 mb-6">
              최대 35% 할인 + 추가 5% 대량구매 할인
            </p>
            <button className="inline-block px-8 py-3 bg-white text-black font-bold rounded-full hover:scale-105 transition-transform cursor-pointer">
              지금 주문하기 →
            </button>
          </div>
        </div>
      </div>

      {/* 추천 상품 섹션 */}
      <div className="max-w-[1280px] mx-auto my-10 px-5">
        <div className="flex justify-between items-center mb-5">
          <h2 className="text-2xl font-bold flex items-center gap-3">
            오늘의 추천
            <span className="text-sm font-normal text-gray-600">중국 바이어 선호 상품</span>
          </h2>
          <div className="flex gap-4">
            {sortOptions.map((option, index) => (
              <React.Fragment key={option}>
                <span
                  onClick={() => setActiveSort(option)}
                  className={`text-sm cursor-pointer ${
                    activeSort === option
                      ? 'text-black font-bold'
                      : 'text-gray-500 hover:text-black'
                  }`}
                >
                  {option}
                </span>
                {index < sortOptions.length - 1 && (
                  <span className="text-gray-300">|</span>
                )}
              </React.Fragment>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-4 gap-5 mb-10">
          {products.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              onQuickAction={handleQuickAction}
            />
          ))}
        </div>
      </div>

      {/* 베스트 브랜드 섹션 */}
      <div className="max-w-[1280px] mx-auto my-10 px-5">
        <div className="flex justify-between items-center mb-5">
          <h2 className="text-2xl font-bold flex items-center gap-3">
            베스트 브랜드
            <span className="text-sm font-normal text-gray-600">이번 달 인기 브랜드</span>
          </h2>
          <span className="text-sm text-gray-600 hover:text-black cursor-pointer">
            전체보기 →
          </span>
        </div>

        <div className="grid grid-cols-4 gap-5">
          {bestBrandProducts.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              onQuickAction={handleQuickAction}
            />
          ))}
        </div>
      </div>

      {/* 플로팅 버튼 */}
      <div className="fixed bottom-8 right-8 flex flex-col gap-3 z-40">
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          className="w-12 h-12 bg-white border border-gray-300 rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition-transform"
        >
          ↑
        </button>
        <button className="w-12 h-12 bg-white border border-gray-300 rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition-transform">
          💬
        </button>
        <button className="w-12 h-12 bg-black text-white rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition-transform">
          📱
        </button>
      </div>

      <Footer />
    </>
  );
}

// Product Card Component
function ProductCard({ product, onQuickAction }: { 
  product: any;
  onQuickAction: (productId: number, action: 'wishlist' | 'cart') => void;
}) {
  const [isWishlisted, setIsWishlisted] = useState(false);

  const handleWishlistClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsWishlisted(!isWishlisted);
    onQuickAction(product.id, 'wishlist');
  };

  const handleCartClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onQuickAction(product.id, 'cart');
  };

  return (
    <div className="cursor-pointer transition-transform hover:-translate-y-1 group">
      <div className="relative pb-[120%] bg-gray-100 rounded-lg overflow-hidden mb-3">
        <Image
          src={product.image}
          alt={product.name}
          fill
          className="object-cover"
        />
        {product.badge && (
          <span className={`absolute top-2 left-2 px-2 py-1 text-white text-xs font-bold rounded ${
            product.badge === 'NEW' ? 'bg-green-500' :
            product.badge === 'BEST' ? 'bg-blue-500' :
            product.badge === 'HOT' ? 'bg-red-500' :
            product.badge === 'SALE' ? 'bg-purple-500' : 'bg-red-500'
          }`}>
            {product.badge}
          </span>
        )}
        
        {/* Quick Actions */}
        <div className="absolute bottom-2 right-2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={handleWishlistClick}
            className={`w-9 h-9 rounded-full border flex items-center justify-center transition-all hover:scale-110 ${
              isWishlisted 
                ? 'bg-red-100 text-red-500 border-red-200' 
                : 'bg-white/95 border-gray-300 hover:bg-black hover:text-white'
            }`}
          >
            {isWishlisted ? '💖' : '❤️'}
          </button>
          <button
            onClick={handleCartClick}
            className="w-9 h-9 rounded-full bg-white/95 border border-gray-300 flex items-center justify-center transition-all hover:bg-black hover:text-white hover:scale-110"
          >
            🛒
          </button>
        </div>
      </div>
      
      <div>
        <div className="text-sm font-bold mb-1">{product.brand}</div>
        <div className="text-sm mb-2 line-clamp-2 leading-snug">{product.name}</div>
        <div className="flex items-center gap-2">
          <span className="text-red-500 font-bold">{product.discount}%</span>
          <span className="text-base font-bold">₩{product.price.toLocaleString()}</span>
          <span className="text-sm text-gray-500 line-through">₩{product.originalPrice.toLocaleString()}</span>
        </div>
        <span className="inline-block mt-1.5 px-2 py-1 bg-gray-100 rounded text-xs text-gray-600">
          최소주문: {product.moq}개
        </span>
      </div>
    </div>
  );
}