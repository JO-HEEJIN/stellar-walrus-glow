'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ProductDetail, RelatedProduct } from '@/types/product-detail';
import { ProductImageGallery } from './ProductImageGallery';
import { ProductOptions } from './ProductOptions';
import { QuantitySelector } from './QuantitySelector';
import { ProductDetailTabs } from './ProductDetailTabs';
import { ProductFloatingBar } from './ProductFloatingBar';
import { RelatedProducts } from './RelatedProducts';
import { useCartStore } from '@/lib/stores/cart';

interface ProductDetailViewProps {
  product: ProductDetail;
  relatedProducts: RelatedProduct[];
}

export function ProductDetailView({ product, relatedProducts }: ProductDetailViewProps) {
  const router = useRouter();
  const { addItem } = useCartStore();
  
  const [selectedColor, setSelectedColor] = useState<string | null>(
    product.colors.find(c => c.available)?.id || null
  );
  const [selectedSize, setSelectedSize] = useState<string | null>(
    product.sizes.find(s => s.available)?.id || null
  );
  const [quantity, setQuantity] = useState(product.minOrderQuantity);
  const [isWishlisted, setIsWishlisted] = useState(product.isWishlisted || false);

  const handleAddToCart = () => {
    if (!selectedColor || !selectedSize) {
      alert('색상과 사이즈를 선택해주세요.');
      return;
    }

    const selectedColorData = product.colors.find(c => c.id === selectedColor);
    const selectedSizeData = product.sizes.find(s => s.id === selectedSize);

    addItem({
      id: `${product.id}-${selectedColor}-${selectedSize}`,
      productId: product.id,
      name: product.name,
      brandName: product.brandName,
      price: product.discountPrice || product.price,
      quantity,
      imageUrl: product.images[0]?.url || '/placeholder.svg',
      color: selectedColorData?.name,
      size: selectedSizeData?.name,
    });

    alert('장바구니에 상품이 담겼습니다.');
  };

  const handleBuyNow = () => {
    handleAddToCart();
    router.push('/cart');
  };

  const handleQuickAction = (action: string) => {
    switch (action) {
      case 'quote':
        alert('견적서 요청 기능은 준비 중입니다.');
        break;
      case 'phone':
        alert('전화 문의: 02-1234-5678');
        break;
      case 'kakao':
        alert('카카오톡 상담 기능은 준비 중입니다.');
        break;
    }
  };

  const handleWishlistToggle = async () => {
    try {
      const method = isWishlisted ? 'DELETE' : 'POST';
      const response = await fetch(`/api/products/${product.id}/wishlist`, {
        method,
        credentials: 'include'
      });

      if (response.ok) {
        setIsWishlisted(!isWishlisted);
      } else if (response.status === 401) {
        alert('로그인이 필요한 서비스입니다.');
        router.push('/login');
      } else {
        alert('위시리스트 처리 중 오류가 발생했습니다.');
      }
    } catch (error) {
      console.error('Wishlist error:', error);
      alert('위시리스트 처리 중 오류가 발생했습니다.');
    }
  };

  return (
    <>
      {/* Breadcrumb */}
      <div className="bg-gray-50 border-b">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <nav className="flex items-center gap-2 text-sm text-gray-600">
            <span className="cursor-pointer hover:text-black">홈</span>
            <span>&gt;</span>
            <span className="cursor-pointer hover:text-black">남성</span>
            <span>&gt;</span>
            <span className="cursor-pointer hover:text-black">상의</span>
            <span>&gt;</span>
            <span className="cursor-pointer hover:text-black">폴로/카라티</span>
            <span>&gt;</span>
            <span className="font-semibold text-black">{product.brandName}</span>
          </nav>
        </div>
      </div>

      {/* Product Detail */}
      <div className="max-w-7xl mx-auto px-4 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Image Gallery */}
          <ProductImageGallery
            images={product.images}
            productName={product.name}
          />

          {/* Product Info */}
          <div id="product-info" className="space-y-6">
            {/* Brand & Name */}
            <div>
              <h2 className="text-sm font-bold mb-2 cursor-pointer hover:underline">
                {product.brandName}
              </h2>
              <h1 className="text-2xl font-light leading-tight">
                {product.name}
              </h1>
            </div>

            {/* Meta Info */}
            <div className="flex items-center gap-6 text-sm text-gray-600 pb-6 border-b">
              <div className="flex items-center gap-1">
                {[...Array(5)].map((_, i) => (
                  <span
                    key={i}
                    className={i < Math.floor(product.rating) ? 'text-yellow-400' : 'text-gray-300'}
                  >
                    ★
                  </span>
                ))}
                <span className="ml-1">{product.rating}</span>
              </div>
              <span>리뷰 {product.reviewCount}개</span>
              <span>누적판매 {product.soldCount.toLocaleString()}개</span>
              <span>SKU: {product.sku}</span>
            </div>

            {/* Price */}
            <div className="pb-6 border-b">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-600">정상가</span>
                <span className="text-lg text-gray-400 line-through">
                  ₩{product.price.toLocaleString()}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">판매가</span>
                <div className="flex items-center gap-3">
                  <span className="text-2xl font-bold text-red-500">
                    {product.discountRate}%
                  </span>
                  <span className="text-3xl font-bold">
                    ₩{product.discountPrice.toLocaleString()}
                  </span>
                </div>
              </div>
            </div>

            {/* Options */}
            <ProductOptions
              colors={product.colors}
              sizes={product.sizes}
              selectedColor={selectedColor}
              selectedSize={selectedSize}
              onColorSelect={setSelectedColor}
              onSizeSelect={setSelectedSize}
            />

            {/* Quantity */}
            <QuantitySelector
              quantity={quantity}
              minQuantity={product.minOrderQuantity}
              onQuantityChange={setQuantity}
              unitPrice={product.discountPrice}
              bulkPricing={product.bulkPricing}
            />

            {/* Action Buttons */}
            <div className="space-y-3 pt-6">
              <div className="grid grid-cols-3 gap-3">
                <button
                  onClick={handleWishlistToggle}
                  className={`py-4 border rounded font-medium transition-colors ${
                    isWishlisted
                      ? 'bg-pink-50 border-pink-200 text-pink-600'
                      : 'bg-white border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  {isWishlisted ? '💖 관심상품' : '❤️ 관심상품'}
                </button>
                <button
                  onClick={handleAddToCart}
                  className="col-span-2 py-4 bg-black text-white rounded font-medium hover:bg-gray-800 transition-colors"
                >
                  장바구니 담기
                </button>
              </div>
              <button
                onClick={handleBuyNow}
                className="w-full py-4 bg-red-500 text-white rounded font-medium hover:bg-red-600 transition-colors"
              >
                바로 구매하기
              </button>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-3 gap-3">
              <button
                onClick={() => handleQuickAction('quote')}
                className="py-3 bg-gray-50 rounded text-sm font-medium hover:bg-gray-100 transition-colors"
              >
                📋 견적서 요청
              </button>
              <button
                onClick={() => handleQuickAction('phone')}
                className="py-3 bg-gray-50 rounded text-sm font-medium hover:bg-gray-100 transition-colors"
              >
                📞 전화 문의
              </button>
              <button
                onClick={() => handleQuickAction('kakao')}
                className="py-3 bg-gray-50 rounded text-sm font-medium hover:bg-gray-100 transition-colors"
              >
                💬 카카오톡 상담
              </button>
            </div>

            {/* Shipping Info */}
            <div className="bg-gray-50 rounded-lg p-5 space-y-3">
              <div className="flex">
                <span className="w-28 text-sm font-semibold">배송방법</span>
                <span className="text-sm text-gray-600">
                  EMS 국제특송 (중국 직배송 가능)
                </span>
              </div>
              <div className="flex">
                <span className="w-28 text-sm font-semibold">배송기간</span>
                <span className="text-sm text-gray-600">
                  결제 후 3~5일 (중국 기준)
                </span>
              </div>
              <div className="flex">
                <span className="w-28 text-sm font-semibold">배송비</span>
                <span className="text-sm text-gray-600">
                  ₩300,000 이상 무료배송
                </span>
              </div>
              <div className="flex">
                <span className="w-28 text-sm font-semibold">통관</span>
                <span className="text-sm text-gray-600">
                  간편통관 지원 (세금계산서 발행 가능)
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Product Detail Tabs */}
        <ProductDetailTabs product={product} />

        {/* Related Products */}
        <RelatedProducts products={relatedProducts} />
      </div>

      {/* Floating Bar */}
      <ProductFloatingBar
        productName={product.name}
        price={product.discountPrice}
        onAddToCart={handleAddToCart}
        onBuyNow={handleBuyNow}
      />
    </>
  );
}