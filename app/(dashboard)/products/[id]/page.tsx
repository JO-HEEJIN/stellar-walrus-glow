'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ProductDetail, RelatedProduct } from '@/types/product-detail';
import { useCartStore } from '@/lib/stores/cart';
import ErrorBoundary from '@/components/error-boundary';
import { logger } from '@/lib/logger';
import { useLanguage } from '@/lib/contexts/language-context';

function ProductDetailPageContent({
  params,
}: {
  params: { id: string };
}) {
  const { addItem } = useCartStore();
  const { language } = useLanguage();
  
  // State for API data
  const [product, setProduct] = useState<ProductDetail | null>(null);
  const [relatedProducts, setRelatedProducts] = useState<RelatedProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // UI state
  const [selectedColor, setSelectedColor] = useState<string>('');
  const [selectedSize, setSelectedSize] = useState<string>('');
  const [quantity, setQuantity] = useState<number>(10);
  const [activeTab, setActiveTab] = useState<string>('description');
  const [selectedImageIndex, setSelectedImageIndex] = useState<number>(0);
  const [isWishlisted, setIsWishlisted] = useState<boolean>(false);

  // Fetch product data from API
  useEffect(() => {
    async function fetchProduct() {
      try {
        logger.info('Fetching product details', { productId: params.id });
        
        const response = await fetch(`/api/products/${params.id}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
        });

        logger.debug('Product API response', { status: response.status, productId: params.id });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({ error: { message: 'Failed to fetch product' } }));
          logger.apiError('GET', `/api/products/${params.id}`, new Error(errorData.error?.message || 'API request failed'), { status: response.status, errorData });
          throw new Error(errorData.error?.message || `HTTP ${response.status}: ${response.statusText}`);
        }

        const data = await response.json();
        logger.debug('Product data received', { productId: params.id, hasData: !!data });

        // 더 상세한 데이터 검증
        if (!data || typeof data !== 'object') {
          logger.error('Invalid response format', new Error('Response is not an object'), { data, productId: params.id });
          throw new Error('Invalid response format');
        }

        if (!data.data || typeof data.data !== 'object') {
          logger.error('Invalid data structure', new Error('data.data is missing or invalid'), { data, productId: params.id });
          throw new Error('Invalid data structure');
        }

        if (!data.data.product || typeof data.data.product !== 'object') {
          logger.error('Product data not found', new Error('Product data is missing or invalid'), { dataStructure: data.data, productId: params.id });
          throw new Error('Product data not found');
        }

        const { product: productData, relatedProducts: relatedData } = data.data;
        
        // 데이터 타입 검증 로깅
        logger.debug('Product data types validation', {
          productId: params.id,
          validation: {
            productData_type: typeof productData,
            productData_isArray: Array.isArray(productData),
            images_isArray: Array.isArray(productData.images),
            colors_isArray: Array.isArray(productData.colors),
            sizes_isArray: Array.isArray(productData.sizes),
            bulkPricing_isArray: Array.isArray(productData.bulkPricing),
            features_isArray: Array.isArray(productData.features),
            relatedProducts_isArray: Array.isArray(relatedData),
          }
        });
        
        // 데이터 정규화 - 배열이 아닌 값들을 안전하게 처리
        const normalizedProduct = {
          ...productData,
          images: Array.isArray(productData.images) ? productData.images : [],
          colors: Array.isArray(productData.colors) ? productData.colors : [],
          sizes: Array.isArray(productData.sizes) ? productData.sizes : [],
          features: Array.isArray(productData.features) ? productData.features : [],
          bulkPricing: Array.isArray(productData.bulkPricing) ? productData.bulkPricing : [],
          // 숫자 값들 기본값 설정
          rating: productData.rating || 0,
          reviewCount: productData.reviewCount || 0,
          soldCount: productData.soldCount || 0,
          price: productData.price || 0,
          discountPrice: productData.discountPrice || productData.price || 0,
          discountRate: productData.discountRate || 0,
          minOrderQuantity: productData.minOrderQuantity || 1,
        };
        
        logger.debug('Product data normalized', { 
          productId: params.id, 
          normalizedFields: Object.keys(normalizedProduct),
          hasImages: normalizedProduct.images.length > 0,
          hasColors: normalizedProduct.colors.length > 0,
          hasSizes: normalizedProduct.sizes.length > 0
        });
        
        // 디버깅용 - 브라우저 콘솔에서 확인 가능 (개발 환경에서만)
        if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
          (window as any).DEBUG_PRODUCT = {
            raw: productData,
            normalized: normalizedProduct,
            related: relatedData
          };
          logger.debug('Debug data attached to window.DEBUG_PRODUCT');
        }
        
        setProduct(normalizedProduct);
        setRelatedProducts(Array.isArray(relatedData) ? relatedData : []);
        
        // Initialize UI state with normalized data
        if (normalizedProduct.colors.length > 0) {
          const firstAvailableColor = normalizedProduct.colors.find((c: any) => c.available);
          setSelectedColor(firstAvailableColor?.name || normalizedProduct.colors[0]?.name || '');
        }
        
        if (normalizedProduct.sizes.length > 0) {
          const firstAvailableSize = normalizedProduct.sizes.find((s: any) => s.available);
          setSelectedSize(firstAvailableSize?.name || normalizedProduct.sizes[0]?.name || '');
        }
        
        setQuantity(normalizedProduct.minOrderQuantity);
        setIsWishlisted(normalizedProduct.isWishlisted || false);
        
        logger.info('Product state initialized successfully', { productId: params.id });
      } catch (err: any) {
        const errorMessage = err.message || 'Failed to load product details';
        
        logger.error('Failed to fetch product details', err, {
          productId: params.id,
          errorName: err.name,
          errorMessage
        });
        
        setError(errorMessage);
        
        if (process.env.NODE_ENV === 'development') {
          alert(`상품 로딩 에러: ${errorMessage}`);
        }
      } finally {
        setLoading(false);
      }
    }

    fetchProduct();
  }, [params.id]);

  // 장바구니 담기
  const handleAddToCart = () => {
    if (!product) return;
    
    const itemId = `${product.id}-${selectedColor}-${selectedSize}`;
    const images = product.images || [];
    
    addItem({
      id: itemId,
      productId: product.id,
      name: product.name,
      brandName: product.brandName,
      price: product.discountPrice,
      imageUrl: images[0]?.url || '/placeholder.svg',
      color: selectedColor,
      size: selectedSize,
      quantity: quantity
    });
    
    alert('장바구니에 추가되었습니다.');
  };

  // 색상 선택 핸들러
  const handleColorSelect = (colorName: string, available: boolean) => {
    if (!available) return;
    setSelectedColor(colorName);
  };

  // 사이즈 선택 핸들러
  const handleSizeSelect = (sizeName: string, available: boolean) => {
    if (!available) return;
    setSelectedSize(sizeName);
  };

  // 수량 변경 핸들러
  const handleQuantityChange = (newQuantity: number) => {
    if (!product) return;
    
    const minQty = product.minOrderQuantity || 1;
    if (newQuantity < minQty) {
      setQuantity(minQty);
    } else {
      setQuantity(newQuantity);
    }
  };

  // 탭 변경 핸들러
  const handleTabChange = (tabName: string) => {
    setActiveTab(tabName);
  };

  // 이미지 선택 핸들러
  const handleImageSelect = (index: number) => {
    setSelectedImageIndex(index);
  };

  // 관심상품 토글
  const handleWishlistToggle = () => {
    setIsWishlisted(!isWishlisted);
  };

  // 수량별 가격 계산
  const calculateTotalPrice = (qty: number) => {
    if (!product) return 0;
    
    let finalPrice = product.discountPrice || product.price || 0;
    
    // 대량구매 할인 적용
    const bulkPricing = product.bulkPricing || [];
    if (bulkPricing.length > 0) {
      for (const bp of bulkPricing) {
        if (qty >= bp.minQuantity && (!bp.maxQuantity || qty <= bp.maxQuantity)) {
          finalPrice = bp.pricePerUnit;
          break;
        }
      }
    }
    
    return finalPrice * qty;
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-white">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="flex items-center justify-center h-96">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">상품 정보를 불러오는 중...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-white">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="flex items-center justify-center h-96">
            <div className="text-center">
              <div className="text-6xl mb-4">😵</div>
              <h2 className="text-xl font-bold text-gray-900 mb-2">상품을 불러올 수 없습니다</h2>
              <p className="text-gray-600 mb-4">{error}</p>
              <div className="space-x-4">
                <button 
                  onClick={() => window.location.reload()} 
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  새로고침
                </button>
                <Link 
                  href="/admin-products" 
                  className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-50 inline-block"
                >
                  상품 목록으로
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Product not found
  if (!product) {
    return (
      <div className="min-h-screen bg-white">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="flex items-center justify-center h-96">
            <div className="text-center">
              <div className="text-6xl mb-4">🔍</div>
              <h2 className="text-xl font-bold text-gray-900 mb-2">상품을 찾을 수 없습니다</h2>
              <p className="text-gray-600 mb-4">요청하신 상품이 존재하지 않거나 삭제되었습니다.</p>
              <Link 
                href="/admin-products" 
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 inline-block"
              >
                상품 목록으로 돌아가기
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // 안전한 배열 접근을 위한 헬퍼
  const images = product.images || [];
  const colors = product.colors || [];
  const sizes = product.sizes || [];
  const features = product.features || [];
  const bulkPricing = product.bulkPricing || [];

  return (
    <div className="min-h-screen bg-white">
      {/* 브레드크럼 */}
      <div className="bg-gray-50 border-b">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <nav className="flex items-center space-x-2 text-sm text-gray-600">
            <Link href="/" className="hover:text-gray-900">홈</Link>
            <span>/</span>
            <Link href="/admin-products" className="hover:text-gray-900">상품</Link>
            <span>/</span>
            <span className="text-gray-900 font-medium">{product.name}</span>
          </nav>
        </div>
      </div>

      {/* 메인 상품 영역 */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* 이미지 갤러리 */}
          <div className="space-y-4">
            <div className="aspect-[3/4] bg-gray-100 rounded-lg overflow-hidden">
              <Image
                src={images[selectedImageIndex]?.url || '/placeholder.svg'}
                alt={images[selectedImageIndex]?.alt || product.name}
                width={600}
                height={800}
                className="w-full h-full object-cover"
              />
            </div>
            
            {/* 썸네일 */}
            {images.length > 0 && (
              <div className="grid grid-cols-5 gap-2">
                {images.slice(0, 5).map((image, index) => (
                  <button
                    key={image.id || index}
                    onClick={() => handleImageSelect(index)}
                    className={`aspect-square bg-gray-100 rounded overflow-hidden border-2 transition-colors ${
                      index === selectedImageIndex ? 'border-black' : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <Image
                      src={image.url || '/placeholder.svg'}
                      alt={image.alt || `Product image ${index + 1}`}
                      width={100}
                      height={100}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* 상품 정보 */}
          <div className="space-y-6">
            <div>
              <div className="text-sm font-semibold text-gray-600 mb-2">{product.brandName}</div>
              <h1 className="text-2xl font-bold text-gray-900 mb-4">
                {language === 'zh' && product.nameCn ? product.nameCn : product.name}
              </h1>
              
              {/* 평점 및 메타 정보 */}
              <div className="flex items-center space-x-4 text-sm text-gray-600 mb-4">
                <div className="flex items-center">
                  <div className="flex text-yellow-400 mr-1">
                    {Array.from({ length: 5 }, (_, i) => (
                      <span key={i}>{i < Math.floor(product.rating || 0) ? '★' : '☆'}</span>
                    ))}
                  </div>
                  <span>{(product.rating || 0).toFixed(1)}</span>
                </div>
                <span>리뷰 {(product.reviewCount || 0).toLocaleString()}개</span>
                <span>판매 {(product.soldCount || 0).toLocaleString()}개</span>
              </div>
            </div>

            {/* 가격 정보 */}
            <div className="space-y-2 py-4 border-t">
              {(product.discountRate || 0) > 0 && (
                <div className="flex items-center space-x-2">
                  <span className="text-lg text-gray-400 line-through">
                    ₩{(product.price || 0).toLocaleString()}
                  </span>
                  <span className="text-lg font-bold text-red-600">
                    {product.discountRate}% 할인
                  </span>
                </div>
              )}
              <div className="text-2xl font-bold text-gray-900">
                ₩{(product.discountPrice || product.price || 0).toLocaleString()}
              </div>
            </div>

            {/* 대량구매 가격표 */}
            {bulkPricing.length > 0 && (
              <div className="bg-blue-50 p-4 rounded-lg">
                <h3 className="font-semibold mb-2">🎯 대량구매 할인</h3>
                <div className="space-y-1 text-sm">
                  {bulkPricing.map((bp, index) => (
                    <div key={index} className="flex justify-between">
                      <span>{bp.minQuantity}~{bp.maxQuantity || '∞'}개</span>
                      <span className="font-medium">
                        개당 ₩{(bp.pricePerUnit || 0).toLocaleString()}
                        {(bp.discountRate || 0) > 0 && ` (${bp.discountRate}% 할인)`}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 색상 선택 */}
            {colors.length > 0 && (
              <div>
                <h3 className="font-semibold mb-3">색상</h3>
                <div className="flex space-x-3">
                  {colors.map((color, index) => (
                    <button
                      key={color.id || index}
                      onClick={() => handleColorSelect(color.name, color.available)}
                      disabled={!color.available}
                      className={`w-10 h-10 rounded-full border-2 transition-all ${
                        selectedColor === color.name 
                          ? 'border-black scale-110' 
                          : 'border-gray-300 hover:border-gray-400'
                      } ${!color.available ? 'opacity-30 cursor-not-allowed' : 'cursor-pointer'}`}
                      style={{ backgroundColor: color.code || '#ccc' }}
                      title={color.name}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* 사이즈 선택 */}
            {sizes.length > 0 && (
              <div>
                <h3 className="font-semibold mb-3">사이즈</h3>
                <div className="grid grid-cols-4 gap-2">
                  {sizes.map((size, index) => (
                    <button
                      key={size.id || index}
                      onClick={() => handleSizeSelect(size.name, size.available)}
                      disabled={!size.available}
                      className={`py-2 px-4 border rounded transition-all text-sm ${
                        selectedSize === size.name
                          ? 'bg-black text-white border-black'
                          : 'bg-white text-gray-900 border-gray-300 hover:border-gray-400'
                      } ${!size.available ? 'opacity-30 cursor-not-allowed' : 'cursor-pointer'}`}
                    >
                      {size.name}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* 수량 선택 */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-semibold">수량</h3>
                <div className="flex items-center border rounded">
                  <button
                    onClick={() => handleQuantityChange(quantity - 1)}
                    className="px-3 py-2 hover:bg-gray-100 transition-colors"
                  >
                    -
                  </button>
                  <input
                    type="number"
                    value={quantity}
                    onChange={(e) => handleQuantityChange(parseInt(e.target.value) || product.minOrderQuantity || 1)}
                    min={product.minOrderQuantity || 1}
                    className="w-16 py-2 text-center border-x focus:outline-none"
                  />
                  <button
                    onClick={() => handleQuantityChange(quantity + 1)}
                    className="px-3 py-2 hover:bg-gray-100 transition-colors"
                  >
                    +
                  </button>
                </div>
              </div>
              <div className="text-sm text-gray-600 mb-2">
                최소주문수량: {product.minOrderQuantity || 1}개
              </div>
              <div className="text-lg font-bold">
                총 ₩{calculateTotalPrice(quantity).toLocaleString()}
              </div>
            </div>

            {/* 액션 버튼 */}
            <div className="grid grid-cols-1 gap-3 pt-4">
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={handleWishlistToggle}
                  className="flex items-center justify-center py-3 px-4 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <span className="mr-2">{isWishlisted ? '💖' : '🤍'}</span>
                  관심상품
                </button>
                <button
                  onClick={handleAddToCart}
                  className="flex items-center justify-center py-3 px-4 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors"
                >
                  장바구니 담기
                </button>
              </div>
              <button className="w-full py-3 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium">
                바로 구매하기
              </button>
            </div>

            {/* 빠른 액션 */}
            <div className="grid grid-cols-3 gap-2 pt-4 border-t">
              <button className="py-2 px-3 text-sm bg-gray-100 rounded hover:bg-gray-200 transition-colors">
                📋 견적서 요청
              </button>
              <button className="py-2 px-3 text-sm bg-gray-100 rounded hover:bg-gray-200 transition-colors">
                📞 전화 문의
              </button>
              <button className="py-2 px-3 text-sm bg-gray-100 rounded hover:bg-gray-200 transition-colors">
                💬 카카오톡 상담
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 상세정보 탭 */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="border-t">
          {/* 탭 네비게이션 */}
          <div className="flex border-b">
            {[
              { id: 'description', label: '상품상세' },
              { id: 'size', label: '사이즈 가이드' },
              { id: 'review', label: `상품리뷰 (${product.reviewCount || 0})` },
              { id: 'qna', label: 'Q&A' },
              { id: 'shipping', label: '배송/교환/반품' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => handleTabChange(tab.id)}
                className={`px-6 py-4 font-medium transition-colors ${
                  activeTab === tab.id
                    ? 'border-b-2 border-black text-black'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* 탭 내용 */}
          <div className="py-8">
            {activeTab === 'description' && (
              <div className="prose max-w-none">
                <div className="mb-6">
                  {(() => {
                    // 언어에 따른 설명 선택
                    const description = language === 'zh' && product.descriptionCn 
                      ? product.descriptionCn 
                      : product.description;
                    
                    return description ? (
                      <div dangerouslySetInnerHTML={{ __html: description }} />
                    ) : (
                      <p>{language === 'zh' ? '产品详细信息准备中...' : '상품 상세 정보가 준비 중입니다.'}</p>
                    );
                  })()}
                </div>
                
                {features.length > 0 && (
                  <div className="mb-6">
                    <h3 className="text-lg font-semibold mb-3">주요 특징</h3>
                    <ul className="list-disc list-inside space-y-1">
                      {features.map((feature, index) => (
                        <li key={index}>{feature}</li>
                      ))}
                    </ul>
                  </div>
                )}
                
                {product.material && (
                  <div className="mb-6">
                    <h3 className="text-lg font-semibold mb-3">소재</h3>
                    <p>{product.material}</p>
                  </div>
                )}
                
                {product.careInstructions && (
                  <div>
                    <h3 className="text-lg font-semibold mb-3">관리 방법</h3>
                    <p>{product.careInstructions}</p>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'size' && (
              <div>
                <h3 className="text-lg font-semibold mb-4">사이즈 가이드</h3>
                <p className="text-gray-600">사이즈 가이드가 준비 중입니다.</p>
              </div>
            )}

            {activeTab === 'review' && (
              <div>
                <h3 className="text-lg font-semibold mb-4">구매 리뷰</h3>
                <p className="text-gray-600">리뷰가 준비 중입니다.</p>
              </div>
            )}

            {activeTab === 'qna' && (
              <div>
                <h3 className="text-lg font-semibold mb-4">상품 Q&A</h3>
                <p className="text-gray-600">Q&A가 준비 중입니다.</p>
              </div>
            )}

            {activeTab === 'shipping' && (
              <div>
                <h3 className="text-lg font-semibold mb-4">배송 정보</h3>
                <div className="space-y-4 text-gray-700">
                  <div>
                    <h4 className="font-medium mb-2">배송 안내</h4>
                    <ul className="space-y-1 text-sm">
                      <li>• 배송방법: EMS 국제특송</li>
                      <li>• 배송기간: 결제 후 3~5일</li>
                      <li>• 배송비: 주문금액 ₩300,000 이상 무료배송</li>
                    </ul>
                  </div>
                  
                  <div>
                    <h4 className="font-medium mb-2">교환/반품 안내</h4>
                    <ul className="space-y-1 text-sm">
                      <li>• 상품 수령 후 7일 이내 가능</li>
                      <li>• 상품 불량 및 오배송: 100% 교환/환불</li>
                      <li>• 단순 변심: 왕복 배송비 구매자 부담</li>
                    </ul>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 관련 상품 */}
      {relatedProducts.length > 0 && (
        <div className="max-w-7xl mx-auto px-4 py-8">
          <h2 className="text-2xl font-bold mb-6">함께 구매하면 좋은 상품</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {relatedProducts.map((item, index) => (
              <Link key={item.id || index} href={`/products/${item.id}`} className="group">
                <div className="aspect-[3/4] bg-gray-100 rounded-lg overflow-hidden mb-3">
                  <Image
                    src={item.imageUrl || '/placeholder.svg'}
                    alt={item.name || 'Related product'}
                    width={300}
                    height={400}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                  />
                </div>
                <div className="text-sm text-gray-600 mb-1">{item.brandName || ''}</div>
                <div className="font-medium mb-2">{item.name || ''}</div>
                <div className="font-bold">
                  {item.discountPrice ? (
                    <>₩{item.discountPrice.toLocaleString()}</>
                  ) : (
                    <>₩{(item.price || 0).toLocaleString()}</>
                  )}
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default function ProductDetailPage({
  params,
}: {
  params: { id: string };
}) {
  return (
    <ErrorBoundary>
      <ProductDetailPageContent params={params} />
    </ErrorBoundary>
  );
}