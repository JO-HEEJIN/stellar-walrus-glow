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
  const [bestBrandProducts, setBestBrandProducts] = useState<any[]>([]);
  const [brands, setBrands] = useState<any[]>([]);
  const [cartCount, setCartCount] = useState(3);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

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

  const mockBestBrandProducts = [
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

  // 브랜드 데이터로 필터 칩 생성
  const filterChips = [
    { name: '전체', count: null },
    ...brands.slice(0, 8).map(brand => ({
      name: brand.nameKo,
      count: brand.productCount
    }))
  ];

  const navItems = ['추천', '브랜드', '신상품', '베스트', '남성', '여성', '아우터', '상의', '하의', '액세서리', '세일'];
  const sortOptions = ['추천순', '신상품순', '판매량순', '낮은가격순', '높은가격순'];

  // 실제 API에서 데이터 가져오기
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // 브랜드 목록 가져오기
        const brandsResponse = await fetch('/api/brands');
        if (brandsResponse.ok) {
          const brandsData = await brandsResponse.json();
          setBrands(brandsData.data || []);
        }

        // 추천 상품 가져오기 (sort=recommended)
        const recommendedResponse = await fetch('/api/products?limit=8&sort=recommended');
        if (recommendedResponse.ok) {
          const recommendedData = await recommendedResponse.json();
          setProducts(recommendedData.data?.products || mockProducts.slice(0, 8));
        } else {
          setProducts(mockProducts.slice(0, 8));
        }

        // 베스트 브랜드 상품 가져오기 (sort=sales)
        const bestResponse = await fetch('/api/products?limit=4&sort=sales');
        if (bestResponse.ok) {
          const bestData = await bestResponse.json();
          setBestBrandProducts(bestData.data?.products || mockBestBrandProducts.slice(0, 4));
        } else {
          setBestBrandProducts(mockBestBrandProducts.slice(0, 4));
        }
      } catch (error) {
        console.error('Error fetching data:', error);
        // Fallback to mock data
        setProducts(mockProducts.slice(0, 8));
        setBestBrandProducts(mockBestBrandProducts.slice(0, 4));
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    
    // 로컬스토리지에서 장바구니 개수 불러오기
    const cartItems = JSON.parse(localStorage.getItem('cart') || '[]');
    setCartCount(cartItems.reduce((total: number, item: any) => total + item.quantity, 0));
  }, []);

  // 필터 변경시 상품 다시 가져오기
  const handleFilterChange = async (filterName: string) => {
    setActiveFilter(filterName);
    
    try {
      setLoading(true);
      let url = '/api/products?limit=8';
      
      if (filterName !== '전체') {
        // 브랜드로 필터링
        const selectedBrand = brands.find(brand => brand.nameKo === filterName);
        if (selectedBrand) {
          url += `&brandId=${selectedBrand.id}`;
        }
      }
      
      // 정렬 옵션 추가
      const sortMap: { [key: string]: string } = {
        '추천순': 'recommended',
        '신상품순': 'newest',
        '판매량순': 'sales',
        '낮은가격순': 'price-low',
        '높은가격순': 'price-high'
      };
      if (sortMap[activeSort]) {
        url += `&sort=${sortMap[activeSort]}`;
      }
      
      const response = await fetch(url);
      if (response.ok) {
        const data = await response.json();
        setProducts(data.data?.products || []);
      }
    } catch (error) {
      console.error('Error filtering products:', error);
    } finally {
      setLoading(false);
    }
  };

  // 정렬 변경시 상품 다시 가져오기
  const handleSortChange = async (sortOption: string) => {
    setActiveSort(sortOption);
    
    try {
      setLoading(true);
      let url = '/api/products?limit=8';
      
      if (activeFilter !== '전체') {
        const selectedBrand = brands.find(brand => brand.nameKo === activeFilter);
        if (selectedBrand) {
          url += `&brandId=${selectedBrand.id}`;
        }
      }
      
      const sortMap: { [key: string]: string } = {
        '추천순': 'recommended',
        '신상품순': 'newest',
        '판매량순': 'sales',
        '낮은가격순': 'price-low',
        '높은가격순': 'price-high'
      };
      if (sortMap[sortOption]) {
        url += `&sort=${sortMap[sortOption]}`;
      }
      
      const response = await fetch(url);
      if (response.ok) {
        const data = await response.json();
        setProducts(data.data?.products || []);
      }
    } catch (error) {
      console.error('Error sorting products:', error);
    } finally {
      setLoading(false);
    }
  };

  // 검색 기능
  const handleSearch = async () => {
    if (!searchTerm.trim()) return;
    
    try {
      setLoading(true);
      const response = await fetch(`/api/products?limit=8&search=${encodeURIComponent(searchTerm)}`);
      if (response.ok) {
        const data = await response.json();
        setProducts(data.data?.products || []);
        setActiveFilter('전체'); // 검색시 필터 초기화
      }
    } catch (error) {
      console.error('Error searching products:', error);
    } finally {
      setLoading(false);
    }
  };

  // Enter 키로 검색
  const handleSearchKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  // 네비게이션 변경시 상품 가져오기
  const handleNavChange = async (navItem: string) => {
    setActiveNav(navItem);
    
    try {
      setLoading(true);
      let url = '/api/products?limit=8';
      
      // 네비게이션에 따른 필터링
      switch (navItem) {
        case '추천':
          url += '&sort=recommended';
          break;
        case '신상품':
          url += '&sort=newest';
          break;
        case '베스트':
          url += '&sort=sales';
          break;
        case '남성':
          url += '&category=men';
          break;
        case '여성':
          url += '&category=women';
          break;
        case '아우터':
          url += '&category=outer';
          break;
        case '상의':
          url += '&category=top';
          break;
        case '하의':
          url += '&category=bottom';
          break;
        case '액세서리':
          url += '&category=accessories';
          break;
        case '세일':
          url += '&category=sale';
          break;
        case '브랜드':
          // 브랜드 페이지로 이동하거나 브랜드 목록 표시
          window.location.href = '/brands';
          return;
      }
      
      const response = await fetch(url);
      if (response.ok) {
        const data = await response.json();
        setProducts(data.data?.products || []);
        setActiveFilter('전체'); // 네비게이션 변경시 필터 초기화
      }
    } catch (error) {
      console.error('Error loading navigation products:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleQuickAction = async (productId: string, action: 'wishlist' | 'cart') => {
    if (action === 'wishlist') {
      try {
        const response = await fetch(`/api/products/${productId}/wishlist`, {
          method: 'POST',
          credentials: 'include'
        });

        if (response.ok) {
          alert('관심상품에 추가되었습니다.');
        } else if (response.status === 401) {
          alert('로그인이 필요합니다.');
          // 로그인 페이지로 리다이렉트
          window.location.href = '/login';
        } else {
          alert('관심상품 추가 중 오류가 발생했습니다.');
        }
      } catch (error) {
        console.error('Wishlist error:', error);
        alert('관심상품 추가 중 오류가 발생했습니다.');
      }
    } else if (action === 'cart') {
      // 임시로 로컬스토리지에 장바구니 추가 (나중에 실제 API로 교체)
      try {
        const product = [...products, ...bestBrandProducts].find(p => p.id === productId);
        if (product) {
          const cartItems = JSON.parse(localStorage.getItem('cart') || '[]');
          const existingItem = cartItems.find((item: any) => item.productId === productId);
          
          if (existingItem) {
            existingItem.quantity += 1;
          } else {
            cartItems.push({
              id: `${productId}-default`,
              productId,
              name: product.name,
              brand: product.brand,
              price: product.price,
              image: product.image,
              quantity: 1,
              moq: product.moq
            });
          }
          
          localStorage.setItem('cart', JSON.stringify(cartItems));
          setCartCount(cartItems.reduce((total: number, item: any) => total + item.quantity, 0));
          alert('장바구니에 추가되었습니다.');
        }
      } catch (error) {
        console.error('Cart error:', error);
        alert('장바구니 추가 중 오류가 발생했습니다.');
      }
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
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyPress={handleSearchKeyPress}
            />
            <button 
              onClick={handleSearch}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-lg hover:scale-110 transition-transform"
            >
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
                onClick={() => handleNavChange(item)}
                className={`text-sm font-medium cursor-pointer py-1 border-b-2 transition-all ${
                  activeNav === item
                    ? 'border-black font-bold'
                    : 'border-transparent hover:border-black'
                } ${loading ? 'opacity-50 pointer-events-none' : ''}`}
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
                onClick={() => handleFilterChange(chip.name)}
                disabled={loading}
                className={`px-4 py-2 rounded-full text-sm border transition-all flex items-center gap-1 ${
                  activeFilter === chip.name
                    ? 'bg-black text-white border-black'
                    : 'bg-white text-black border-gray-300 hover:bg-gray-100'
                } ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
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
                  onClick={() => handleSortChange(option)}
                  className={`text-sm cursor-pointer transition-colors ${
                    activeSort === option
                      ? 'text-black font-bold'
                      : 'text-gray-500 hover:text-black'
                  } ${loading ? 'opacity-50 pointer-events-none' : ''}`}
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
          {loading ? (
            // 로딩 스켈레톤
            Array.from({ length: 8 }).map((_, index) => (
              <div key={index} className="animate-pulse">
                <div className="bg-gray-200 rounded-lg h-80 mb-3"></div>
                <div className="h-4 bg-gray-200 rounded mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              </div>
            ))
          ) : products.length > 0 ? (
            products.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onQuickAction={handleQuickAction}
              />
            ))
          ) : (
            <div className="col-span-4 text-center py-20">
              <div className="text-4xl mb-4">🔍</div>
              <div className="text-lg font-medium text-gray-900 mb-2">상품이 없습니다</div>
              <div className="text-sm text-gray-500">다른 브랜드나 조건을 선택해보세요.</div>
            </div>
          )}
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
  onQuickAction: (productId: string, action: 'wishlist' | 'cart') => void;
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

  // API 응답과 mock 데이터 모두 처리
  const imageUrl = product.imageUrl || product.image || 'https://picsum.photos/300/400?random=' + product.id;
  const brandName = product.brandName || product.brand || '';
  const productName = product.nameKo || product.name || '';
  const price = product.discountPrice || product.price || 0;
  const originalPrice = product.price || product.originalPrice || 0;
  const discountRate = product.discountRate || product.discount || 0;
  const minOrderQty = product.minOrderQty || product.moq || 1;

  // 배지 결정 로직
  let badge = null;
  if (product.badge) {
    badge = product.badge;
  } else if (product.isNew) {
    badge = 'NEW';
  } else if (product.isBestSeller) {
    badge = 'BEST';
  } else if (discountRate >= 30) {
    badge = 'HOT';
  }

  return (
    <div className="cursor-pointer transition-transform hover:-translate-y-1 group">
      <div className="relative pb-[120%] bg-gray-100 rounded-lg overflow-hidden mb-3">
        <Image
          src={imageUrl}
          alt={productName}
          fill
          className="object-cover"
        />
        {badge && (
          <span className={`absolute top-2 left-2 px-2 py-1 text-white text-xs font-bold rounded ${
            badge === 'NEW' ? 'bg-green-500' :
            badge === 'BEST' ? 'bg-blue-500' :
            badge === 'HOT' ? 'bg-red-500' :
            badge === 'SALE' ? 'bg-purple-500' : 'bg-red-500'
          }`}>
            {badge}
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
        <div className="text-sm font-bold mb-1">{brandName}</div>
        <div className="text-sm mb-2 line-clamp-2 leading-snug">{productName}</div>
        <div className="flex items-center gap-2">
          {discountRate > 0 && (
            <span className="text-red-500 font-bold">{discountRate}%</span>
          )}
          <span className="text-base font-bold">₩{price.toLocaleString()}</span>
          {discountRate > 0 && originalPrice > price && (
            <span className="text-sm text-gray-500 line-through">₩{originalPrice.toLocaleString()}</span>
          )}
        </div>
        <span className="inline-block mt-1.5 px-2 py-1 bg-gray-100 rounded text-xs text-gray-600">
          최소주문: {minOrderQty}개
        </span>
      </div>
    </div>
  );
}