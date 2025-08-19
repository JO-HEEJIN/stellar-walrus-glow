'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import Footer from '@/components/layout/footer';
import { useCartStore } from '@/lib/stores/cart';
import { logger } from '@/lib/logger';

export default function HomePage() {
  const router = useRouter();
  const { addItem, getTotalItems } = useCartStore();
  const [activeFilter, setActiveFilter] = useState('전체');
  const [activeNav, setActiveNav] = useState('추천');
  const [activeSort, setActiveSort] = useState('추천순');
  const [products, setProducts] = useState<any[]>([]);
  const [bestBrandProducts, setBestBrandProducts] = useState<any[]>([]);
  const [brands, setBrands] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [language, setLanguage] = useState<'ko' | 'zh'>('ko');
  const [isHydrated, setIsHydrated] = useState(false);
  
  // Prevent hydration mismatch with cart count
  const cartCount = isHydrated ? getTotalItems() : 0;

  // 언어별 텍스트
  const texts = {
    ko: {
      login: '로그인',
      register: '회원가입',
      customerService: '고객센터',
      brandInquiry: '브랜드 입점문의',
      bulkOrder: '대량구매 문의',
      orderShipping: '주문배송',
      search: '브랜드명, 상품명, SKU 검색',
      wishlist: '관심상품',
      cart: '장바구니',
      quote: '견적서',
      myPage: '마이페이지',
      minOrder: '최소 주문',
      expectedShipping: '예상 배송',
      paymentMethod: '결제 수단',
      bulkOrderExcel: '엑셀 대량주문',
      todayRecommend: '오늘의 추천',
      chineseBuyerPreferred: '중국 바이어 선호 상품',
      bestBrand: '베스트 브랜드',
      thisMonthPopular: '이번 달 인기 브랜드',
      viewAll: '전체보기',
      bannerTitle: '2025 S/S 신상품 사전예약',
      bannerSubtitle: '최대 35% 할인 + 추가 5% 대량구매 할인',
      orderNow: '지금 주문하기'
    },
    zh: {
      login: '登录',
      register: '注册',
      customerService: '客服中心',
      brandInquiry: '品牌入驻咨询',
      bulkOrder: '大宗采购咨询',
      orderShipping: '订单配送',
      search: '品牌名、商品名、SKU搜索',
      wishlist: '收藏商品',
      cart: '购物车',
      quote: '报价单',
      myPage: '我的页面',
      minOrder: '最小订单',
      expectedShipping: '预计配送',
      paymentMethod: '支付方式',
      bulkOrderExcel: 'Excel大宗订单',
      todayRecommend: '今日推荐',
      chineseBuyerPreferred: '中国买家首选商品',
      bestBrand: '最佳品牌',
      thisMonthPopular: '本月热门品牌',
      viewAll: '查看全部',
      bannerTitle: '2025 S/S 新品预售',
      bannerSubtitle: '最高35%折扣 + 额外5%批量采购折扣',
      orderNow: '立即订购'
    }
  };

  const t = texts[language];

  const handleLanguageChange = (lang: 'ko' | 'zh') => {
    setLanguage(lang);
    if (typeof window !== 'undefined') {
      localStorage.setItem('language', lang);
    }
  };

  // Mock product data - 실제 브랜드 상품들로 업데이트
  const mockProducts = [
    {
      id: 1,
      brand: 'MALBON GOLF',
      name: '말본 시그니처 폴로셔츠 (네이비)',
      price: 89000,
      originalPrice: 128000,
      discount: 30,
      moq: 10,
      badge: 'NEW',
      image: 'https://images.unsplash.com/photo-1544966503-7cc5ac882d5f?w=300&h=400&fit=crop'
    },
    {
      id: 2,
      brand: 'SOUTHCAPE',
      name: '사우스케이프 프리미엄 팬츠 (베이지)',
      price: 105000,
      originalPrice: 140000,
      discount: 25,
      moq: 5,
      badge: 'BEST',
      image: 'https://images.unsplash.com/photo-1473496169904-658ba7c44d8a?w=300&h=400&fit=crop'
    },
    {
      id: 3,
      brand: 'St.Andrews',
      name: '세인트앤드류스 클래식 자켓 (화이트)',
      price: 168000,
      originalPrice: 210000,
      discount: 20,
      moq: 3,
      badge: null,
      image: 'https://images.unsplash.com/photo-1544966503-7cc5ac882d5f?w=300&h=400&fit=crop'
    },
    {
      id: 4,
      brand: 'G/FORE',
      name: '지포어 투어 캡 모자 (블랙)',
      price: 42500,
      originalPrice: 50000,
      discount: 15,
      moq: 20,
      badge: 'HOT',
      image: 'https://images.unsplash.com/photo-1521369909029-2afed882baee?w=300&h=400&fit=crop'
    },
    {
      id: 5,
      brand: 'MALBON GOLF',
      name: '말본 퀼팅 베스트 (네이비)',
      price: 156000,
      originalPrice: 240000,
      discount: 35,
      moq: 5,
      badge: null,
      image: 'https://images.unsplash.com/photo-1544966503-7cc5ac882d5f?w=300&h=400&fit=crop'
    },
    {
      id: 6,
      brand: 'SOUTHCAPE',
      name: '사우스케이프 여성 스커트 (핑크)',
      price: 79000,
      originalPrice: 110000,
      discount: 28,
      moq: 10,
      badge: 'NEW',
      image: 'https://images.unsplash.com/photo-1473496169904-658ba7c44d8a?w=300&h=400&fit=crop'
    },
    {
      id: 7,
      brand: 'St.Andrews',
      name: '세인트앤드류스 프리미엄 글러브 (화이트)',
      price: 18000,
      originalPrice: 30000,
      discount: 40,
      moq: 30,
      badge: null,
      image: 'https://images.unsplash.com/photo-1544966503-7cc5ac882d5f?w=300&h=400&fit=crop'
    },
    {
      id: 8,
      brand: 'G/FORE',
      name: '지포어 캐디백 프리미엄 (올블랙)',
      price: 390000,
      originalPrice: 500000,
      discount: 22,
      moq: 2,
      badge: 'BEST',
      image: 'https://images.unsplash.com/photo-1521369909029-2afed882baee?w=300&h=400&fit=crop'
    }
  ];

  const mockBestBrandProducts = [
    {
      id: 9,
      brand: 'MALBON GOLF',
      name: '말본 프리미엄 쿨링 폴로셔츠',
      price: 82500,
      originalPrice: 150000,
      discount: 45,
      moq: 8,
      badge: 'SALE',
      image: 'https://images.unsplash.com/photo-1544966503-7cc5ac882d5f?w=300&h=400&fit=crop'
    },
    {
      id: 10,
      brand: 'SOUTHCAPE',
      name: '사우스케이프 프로 골프화 (화이트/네이비)',
      price: 205000,
      originalPrice: 250000,
      discount: 18,
      moq: 5,
      badge: null,
      image: 'https://images.unsplash.com/photo-1473496169904-658ba7c44d8a?w=300&h=400&fit=crop'
    },
    {
      id: 11,
      brand: 'St.Andrews',
      name: '세인트앤드류스 클래식 레더 벨트',
      price: 84000,
      originalPrice: 120000,
      discount: 30,
      moq: 15,
      badge: 'HOT',
      image: 'https://images.unsplash.com/photo-1544966503-7cc5ac882d5f?w=300&h=400&fit=crop'
    },
    {
      id: 12,
      brand: 'G/FORE',
      name: '지포어 퍼포먼스 쇼츠',
      price: 67500,
      originalPrice: 90000,
      discount: 25,
      moq: 12,
      badge: null,
      image: 'https://images.unsplash.com/photo-1521369909029-2afed882baee?w=300&h=400&fit=crop'
    }
  ];

  // 실제 브랜드 데이터로 필터 칩 생성 (말본, 사우스케이프, 세인트앤드류스, 지포어 등)
  const filterChips = [
    { name: language === 'ko' ? '전체' : '全部', count: null },
    // 우선 하드코딩된 주요 브랜드들 표시 (API가 작동할 때까지 임시)
    { name: 'MALBON GOLF', count: 12 },
    { name: 'SOUTHCAPE', count: 8 },
    { name: 'St.Andrews', count: 15 },
    { name: 'G/FORE', count: 10 },
    // API에서 가져온 브랜드들도 추가 (brands가 배열인지 확인)
    ...(Array.isArray(brands) && brands.length > 0 ? brands.slice(0, 4).map(brand => ({
      name: brand.nameKo || brand.name || 'Unknown Brand',
      count: brand.productCount || brand._count?.products || 0
    })) : [])
  ];

  const navItems = ['추천', '브랜드', '신상품', '베스트', '남성', '여성', '아우터', '상의', '하의', '액세서리', '세일'];
  const sortOptions = ['추천순', '신상품순', '판매량순', '낮은가격순', '높은가격순'];

  // Hydration effect
  useEffect(() => {
    setIsHydrated(true);
  }, []);

  // 언어 설정 로드
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedLanguage = localStorage.getItem('language') as 'ko' | 'zh' | null;
      if (savedLanguage) {
        setLanguage(savedLanguage);
      }
    }
  }, []);

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
        logger.error('Failed to fetch homepage data', error instanceof Error ? error : new Error(String(error)));
        // Fallback to mock data
        setProducts(mockProducts.slice(0, 8));
        setBestBrandProducts(mockBestBrandProducts.slice(0, 4));
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // 필터 변경시 상품 다시 가져오기 또는 브랜드 페이지로 이동
  const handleFilterChange = async (filterName: string) => {
    setActiveFilter(filterName);
    
    // 주요 브랜드들의 경우 브랜드 페이지로 이동
    const brandSlugMap: { [key: string]: string } = {
      'MALBON GOLF': 'malbon-golf',
      'SOUTHCAPE': 'southcape',
      'St.Andrews': 'st-andrews',
      'G/FORE': 'g-fore'
    };

    if (brandSlugMap[filterName]) {
      router.push(`/brands/${brandSlugMap[filterName]}`);
      return;
    }
    
    try {
      setLoading(true);
      let url = '/api/products?limit=8';
      
      if (filterName !== '전체' && filterName !== '全部') {
        // 브랜드로 필터링
        const selectedBrand = (Array.isArray(brands) && brands.length > 0) ? brands.find(brand => (brand.nameKo || brand.name) === filterName) : null;
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
      logger.error('Failed to filter products', error instanceof Error ? error : new Error(String(error)), { filter: activeFilter });
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
      
      if (activeFilter !== '전체' && activeFilter !== '全部') {
        const selectedBrand = (Array.isArray(brands) && brands.length > 0) ? brands.find(brand => (brand.nameKo || brand.name) === activeFilter) : null;
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
      logger.error('Failed to sort products', error instanceof Error ? error : new Error(String(error)), { sortOrder: activeSort });
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
      logger.error('Failed to search products', error instanceof Error ? error : new Error(String(error)), { searchTerm });
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
          // 브랜드 페이지로 이동
          router.push('/brands');
          return;
      }
      
      const response = await fetch(url);
      if (response.ok) {
        const data = await response.json();
        setProducts(data.data?.products || []);
        setActiveFilter('전체'); // 네비게이션 변경시 필터 초기화
      }
    } catch (error) {
      logger.error('Failed to load navigation products', error instanceof Error ? error : new Error(String(error)), { nav: activeNav });
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
          if (typeof window !== 'undefined') {
            window.location.href = '/login';
          }
        } else {
          alert('관심상품 추가 중 오류가 발생했습니다.');
        }
      } catch (error) {
        logger.error('Failed to toggle wishlist', error instanceof Error ? error : new Error(String(error)), { productId });
        alert('관심상품 추가 중 오류가 발생했습니다.');
      }
    } else if (action === 'cart') {
      try {
        const product = [...products, ...bestBrandProducts].find(p => p.id === productId);
        if (product) {
          // API 응답과 mock 데이터 모두 처리
          const brandName = product.brandName || product.brand || '';
          const productName = product.nameKo || product.name || '';
          const price = product.discountPrice || product.price || 0;
          const imageUrl = product.imageUrl || product.image || '';
          
          addItem({
            id: `${productId}-default`,
            productId,
            name: productName,
            brandName: brandName,
            price: price,
            imageUrl: imageUrl,
            quantity: 1
          });
          
          alert('장바구니에 추가되었습니다.');
        }
      } catch (error) {
        logger.error('Failed to add to cart', error instanceof Error ? error : new Error(String(error)), { productId });
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
            <Link href="#" className="text-gray-400 hover:text-white transition-colors">{t.customerService}</Link>
            <Link href="#" className="text-gray-400 hover:text-white transition-colors">{t.brandInquiry}</Link>
            <Link href="#" className="text-gray-400 hover:text-white transition-colors">{t.bulkOrder}</Link>
          </div>
          <div className="flex gap-4 items-center">
            <Link href="/login" className="text-gray-400 hover:text-white transition-colors">{t.login}</Link>
            <Link href="/register" className="text-gray-400 hover:text-white transition-colors">{t.register}</Link>
            <Link href="#" className="text-gray-400 hover:text-white transition-colors">{t.orderShipping}</Link>
            <button 
              onClick={() => handleLanguageChange('ko')}
              className={`text-gray-400 hover:text-white transition-colors ${language === 'ko' ? 'text-white font-bold' : ''}`}
            >
              🇰🇷 KOR
            </button>
            <button 
              onClick={() => handleLanguageChange('zh')}
              className={`text-gray-400 hover:text-white transition-colors ${language === 'zh' ? 'text-white font-bold' : ''}`}
            >
              🇨🇳 中文
            </button>
          </div>
        </div>
      </div>

      {/* 메인 헤더 */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-[1280px] mx-auto px-5 flex items-center h-15">
          <div className="flex items-center gap-4">
            <div className="text-2xl font-black cursor-pointer">
              GOLF B2B
            </div>
            <button 
              onClick={() => router.push('/admin-products')}
              className="px-3 py-1 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 transition-colors"
            >
              관리
            </button>
          </div>
          
          <div className="flex-1 max-w-[500px] relative ml-6">
            <input
              type="text"
              placeholder={t.search}
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
              <span className="text-xs">{t.wishlist}</span>
            </div>
            <div onClick={() => router.push('/shopping-cart')} className="flex flex-col items-center gap-1 cursor-pointer relative">
              <div className="relative">
                <span>🛒</span>
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full px-1.5 py-0.5 min-w-[18px] text-center">
                  {cartCount}
                </span>
              </div>
              <span className="text-xs">{t.cart}</span>
            </div>
            <div className="flex flex-col items-center gap-1 cursor-pointer">
              <span>📋</span>
              <span className="text-xs">{t.quote}</span>
            </div>
            <div 
              className="flex flex-col items-center gap-1 cursor-pointer"
              onClick={() => router.push('/my-page')}
            >
              <span>👤</span>
              <span className="text-xs">{t.myPage}</span>
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
            <span className="text-gray-600">{t.minOrder}:</span>
            <span className="font-bold">₩300,000</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <span className="text-gray-600">{t.expectedShipping}:</span>
            <span className="font-bold">3-5일 (EMS)</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <span className="text-gray-600">{t.paymentMethod}:</span>
            <span className="font-bold">{language === 'ko' ? '위챗페이 · 알리페이 · 계좌이체' : '微信支付 · 支付宝 · 银行转账'}</span>
          </div>
          <button 
            onClick={() => router.push('/bulk-order')}
            className="px-4 py-2 bg-blue-600 text-white rounded-full text-sm font-semibold hover:bg-blue-700 transition-colors"
          >
            📊 {t.bulkOrderExcel}
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
              {t.bannerTitle}
            </h2>
            <p className="text-lg opacity-90 mb-6">
              {t.bannerSubtitle}
            </p>
            <button className="inline-block px-8 py-3 bg-white text-black font-bold rounded-full hover:scale-105 transition-transform cursor-pointer">
              {t.orderNow} →
            </button>
          </div>
        </div>
      </div>

      {/* 추천 상품 섹션 */}
      <div className="max-w-[1280px] mx-auto my-10 px-5">
        <div className="flex justify-between items-center mb-5">
          <h2 className="text-2xl font-bold flex items-center gap-3">
            {t.todayRecommend}
            <span className="text-sm font-normal text-gray-600">{t.chineseBuyerPreferred}</span>
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
          ) : (Array.isArray(products) && products.length > 0) ? (
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
            {t.bestBrand}
            <span className="text-sm font-normal text-gray-600">{t.thisMonthPopular}</span>
          </h2>
          <span className="text-sm text-gray-600 hover:text-black cursor-pointer">
            {t.viewAll} →
          </span>
        </div>

        <div className="grid grid-cols-4 gap-5">
          {Array.isArray(bestBrandProducts) && bestBrandProducts.length > 0 ? (
            bestBrandProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onQuickAction={handleQuickAction}
              />
            ))
          ) : (
            <div className="col-span-4 text-center py-10">
              <div className="text-gray-500">베스트 브랜드 상품을 불러오는 중...</div>
            </div>
          )}
        </div>
      </div>

      {/* 플로팅 버튼 */}
      <div className="fixed bottom-8 right-8 flex flex-col gap-3 z-40">
        <button
          onClick={() => typeof window !== 'undefined' && window.scrollTo({ top: 0, behavior: 'smooth' })}
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
  const router = useRouter();
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

  const handleProductClick = () => {
    router.push(`/products/${product.id}`);
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
    <div onClick={handleProductClick} className="cursor-pointer transition-transform hover:-translate-y-1 group">
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