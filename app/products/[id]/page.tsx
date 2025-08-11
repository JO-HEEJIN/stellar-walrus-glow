'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { ProductDetail, RelatedProduct } from '@/types/product-detail';
import { useCartStore } from '@/lib/stores/cart';

// Mock 데이터를 직접 사용 (클라이언트 컴포넌트에서는 Prisma 직접 호출 불가)
function getMockProduct(id: string): { product: ProductDetail; relatedProducts: RelatedProduct[] } {
  const mockProduct: ProductDetail = {
    id,
    sku: `DEMO-${id}`,
    brandId: 'demo-brand',
    brandName: 'DEMO BRAND',
    name: '데모 상품 - 골프 폴로셔츠',
    description: '이 상품은 데모용 샘플 상품입니다. 실제 데이터베이스 연결 후 정확한 정보가 표시됩니다.',
    price: 120000,
    discountPrice: 89000,
    discountRate: 26,
    rating: 4.5,
    reviewCount: 42,
    soldCount: 156,
    colors: [
      { id: 'navy', name: '네이비', code: '#1a237e', available: true },
      { id: 'white', name: '화이트', code: '#ffffff', available: true },
      { id: 'black', name: '블랙', code: '#000000', available: false }
    ],
    sizes: [
      { id: '90', name: '90', available: true },
      { id: '95', name: '95', available: true },
      { id: '100', name: '100', available: true },
      { id: '105', name: '105', available: false }
    ],
    images: [
      {
        id: '1',
        url: 'https://images.unsplash.com/photo-1544966503-7cc5ac882d5f?w=600&h=800&fit=crop',
        alt: '메인 이미지',
        order: 1
      },
      {
        id: '2', 
        url: 'https://images.unsplash.com/photo-1473496169904-658ba7c44d8a?w=600&h=800&fit=crop',
        alt: '상세 이미지 1',
        order: 2
      }
    ],
    bulkPricing: [
      { minQuantity: 10, maxQuantity: 29, pricePerUnit: 89000, discountRate: 0 },
      { minQuantity: 30, maxQuantity: 99, pricePerUnit: 84550, discountRate: 5 },
      { minQuantity: 100, maxQuantity: null, pricePerUnit: 80100, discountRate: 10 }
    ],
    minOrderQuantity: 10,
    features: ['흡한속건', '자외선 차단', '4-way 스트레치'],
    material: '폴리에스터 88%, 스판덱스 12%',
    careInstructions: '찬물 세탁, 건조기 사용 금지',
    category: ['남성', '상의', '폴로셔츠'],
    tags: ['골프웨어', '폴로셔츠', '스포츠'],
    isNew: true,
    isBestSeller: false,
    stock: 50,
    isWishlisted: false
  };

  const mockRelatedProducts: RelatedProduct[] = [
    {
      id: 'demo-related-1',
      brandName: 'DEMO BRAND',
      name: '관련 상품 1',
      price: 95000,
      imageUrl: 'https://images.unsplash.com/photo-1544966503-7cc5ac882d5f?w=200&h=267&fit=crop'
    },
    {
      id: 'demo-related-2', 
      brandName: 'DEMO BRAND',
      name: '관련 상품 2',
      price: 78000,
      discountPrice: 65000,
      imageUrl: 'https://images.unsplash.com/photo-1473496169904-658ba7c44d8a?w=200&h=267&fit=crop'
    }
  ];

  return {
    product: mockProduct,
    relatedProducts: mockRelatedProducts
  };
}

export default function ProductDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const router = useRouter();
  const { addItem } = useCartStore();
  
  // Get mock product data first
  const { product, relatedProducts } = getMockProduct(params.id);
  
  // Initialize state with product data
  const [selectedColor, setSelectedColor] = useState<string>('네이비');
  const [selectedSize, setSelectedSize] = useState<string>('100');
  const [quantity, setQuantity] = useState<number>(product.minOrderQuantity);
  const [activeTab, setActiveTab] = useState<string>('description');
  const [selectedImageIndex, setSelectedImageIndex] = useState<number>(0);
  const [isWishlisted, setIsWishlisted] = useState<boolean>(product.isWishlisted || false);

  // 장바구니 담기
  const handleAddToCart = () => {
    const itemId = `${product.id}-${selectedColor}-${selectedSize}`;
    
    addItem({
      id: itemId,
      productId: product.id,
      name: product.name,
      brandName: product.brandName,
      price: product.discountPrice,
      imageUrl: product.images[0]?.url || '/placeholder.svg',
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
    if (newQuantity < product.minOrderQuantity) {
      setQuantity(product.minOrderQuantity);
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
    let finalPrice = product.discountPrice;
    
    // 대량구매 할인 적용
    for (const bp of product.bulkPricing) {
      if (qty >= bp.minQuantity && (!bp.maxQuantity || qty <= bp.maxQuantity)) {
        finalPrice = bp.pricePerUnit;
        break;
      }
    }
    
    return finalPrice * qty;
  };

  return (
    <div className="min-h-screen bg-white">
      {/* 브레드크럼 */}
      <div className="bg-gray-50 border-b">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <nav className="flex items-center space-x-2 text-sm text-gray-600">
            <Link href="/" className="hover:text-gray-900">홈</Link>
            <span>/</span>
            <Link href="/products" className="hover:text-gray-900">상품</Link>
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
                src={product.images[selectedImageIndex]?.url || '/placeholder.svg'}
                alt={product.images[selectedImageIndex]?.alt || product.name}
                width={600}
                height={800}
                className="w-full h-full object-cover"
              />
            </div>
            
            {/* 썸네일 */}
            <div className="grid grid-cols-5 gap-2">
              {product.images.slice(0, 5).map((image, index) => (
                <button
                  key={image.id}
                  onClick={() => handleImageSelect(index)}
                  className={`aspect-square bg-gray-100 rounded overflow-hidden border-2 transition-colors ${
                    index === selectedImageIndex ? 'border-black' : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <Image
                    src={image.url}
                    alt={image.alt}
                    width={100}
                    height={100}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          </div>

          {/* 상품 정보 */}
          <div className="space-y-6">
            <div>
              <div className="text-sm font-semibold text-gray-600 mb-2">{product.brandName}</div>
              <h1 className="text-2xl font-bold text-gray-900 mb-4">{product.name}</h1>
              
              {/* 평점 및 메타 정보 */}
              <div className="flex items-center space-x-4 text-sm text-gray-600 mb-4">
                <div className="flex items-center">
                  <div className="flex text-yellow-400 mr-1">
                    {Array.from({ length: 5 }, (_, i) => (
                      <span key={i}>{i < Math.floor(product.rating) ? '★' : '☆'}</span>
                    ))}
                  </div>
                  <span>{product.rating.toFixed(1)}</span>
                </div>
                <span>리뷰 {product.reviewCount}개</span>
                <span>판매 {product.soldCount.toLocaleString()}개</span>
              </div>
            </div>

            {/* 가격 정보 */}
            <div className="space-y-2 py-4 border-t">
              {product.discountRate > 0 && (
                <div className="flex items-center space-x-2">
                  <span className="text-lg text-gray-400 line-through">₩{product.price.toLocaleString()}</span>
                  <span className="text-lg font-bold text-red-600">{product.discountRate}% 할인</span>
                </div>
              )}
              <div className="text-2xl font-bold text-gray-900">
                ₩{product.discountPrice.toLocaleString()}
              </div>
            </div>

            {/* 대량구매 가격표 */}
            {product.bulkPricing.length > 0 && (
              <div className="bg-blue-50 p-4 rounded-lg">
                <h3 className="font-semibold mb-2">🎯 대량구매 할인</h3>
                <div className="space-y-1 text-sm">
                  {product.bulkPricing.map((bp, index) => (
                    <div key={index} className="flex justify-between">
                      <span>{bp.minQuantity}~{bp.maxQuantity || '∞'}개</span>
                      <span className="font-medium">
                        개당 ₩{bp.pricePerUnit.toLocaleString()}
                        {bp.discountRate > 0 && ` (${bp.discountRate}% 할인)`}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 색상 선택 */}
            {product.colors.length > 0 && (
              <div>
                <h3 className="font-semibold mb-3">색상</h3>
                <div className="flex space-x-3">
                  {product.colors.map((color) => (
                    <button
                      key={color.id}
                      onClick={() => handleColorSelect(color.name, color.available)}
                      disabled={!color.available}
                      className={`w-10 h-10 rounded-full border-2 transition-all ${
                        selectedColor === color.name 
                          ? 'border-black scale-110' 
                          : 'border-gray-300 hover:border-gray-400'
                      } ${!color.available ? 'opacity-30 cursor-not-allowed' : 'cursor-pointer'}`}
                      style={{ backgroundColor: color.code }}
                      title={color.name}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* 사이즈 선택 */}
            {product.sizes.length > 0 && (
              <div>
                <h3 className="font-semibold mb-3">사이즈</h3>
                <div className="grid grid-cols-4 gap-2">
                  {product.sizes.map((size) => (
                    <button
                      key={size.id}
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
                    onChange={(e) => handleQuantityChange(parseInt(e.target.value) || product.minOrderQuantity)}
                    min={product.minOrderQuantity}
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
                최소주문수량: {product.minOrderQuantity}개
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
              { id: 'review', label: `상품리뷰 (${product.reviewCount})` },
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
                  {product.description ? (
                    <div dangerouslySetInnerHTML={{ __html: product.description }} />
                  ) : (
                    <p>상품 상세 정보가 준비 중입니다.</p>
                  )}
                </div>
                
                {product.features.length > 0 && (
                  <div className="mb-6">
                    <h3 className="text-lg font-semibold mb-3">주요 특징</h3>
                    <ul className="list-disc list-inside space-y-1">
                      {product.features.map((feature, index) => (
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
            {relatedProducts.map((item) => (
              <Link key={item.id} href={`/products/${item.id}`} className="group">
                <div className="aspect-[3/4] bg-gray-100 rounded-lg overflow-hidden mb-3">
                  <Image
                    src={item.imageUrl}
                    alt={item.name}
                    width={300}
                    height={400}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                  />
                </div>
                <div className="text-sm text-gray-600 mb-1">{item.brandName}</div>
                <div className="font-medium mb-2">{item.name}</div>
                <div className="font-bold">
                  {item.discountPrice ? (
                    <>₩{item.discountPrice.toLocaleString()}</>
                  ) : (
                    <>₩{item.price.toLocaleString()}</>
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