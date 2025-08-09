'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { formatPrice } from '@/lib/utils';

interface Product {
  id: string;
  sku: string;
  name: string;
  nameKo: string;
  category: string;
  price: number;
  discountPrice?: number;
  discountRate: number;
  imageUrl: string;
  minOrderQty: number;
  isNew: boolean;
  isBestSeller: boolean;
  colors: string[];
  sizes: string[];
  stock: number;
}

interface ProductGridProps {
  products: Product[];
  viewMode: 'grid' | 'list';
  loading: boolean;
}

interface QuickActionState {
  [productId: string]: {
    wishlisted: boolean;
  };
}

export function ProductGrid({ products, viewMode, loading }: ProductGridProps) {
  const [quickActions, setQuickActions] = useState<QuickActionState>({});

  const handleWishlistToggle = (productId: string) => {
    setQuickActions(prev => ({
      ...prev,
      [productId]: {
        ...prev[productId],
        wishlisted: !prev[productId]?.wishlisted
      }
    }));

    const isWishlisted = quickActions[productId]?.wishlisted;
    if (!isWishlisted) {
      alert('관심상품에 추가되었습니다.');
    }
  };

  const handleAddToCart = (product: Product) => {
    alert(`${product.nameKo}이(가) 장바구니에 추가되었습니다.`);
  };

  const handleAddToQuote = (product: Product) => {
    alert(`${product.nameKo}이(가) 견적서에 추가되었습니다.`);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-10 h-10 border-3 border-gray-300 border-t-black rounded-full animate-spin"></div>
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="text-center py-20">
        <div className="text-4xl mb-4">🔍</div>
        <div className="text-lg font-medium text-gray-900 mb-2">검색 결과가 없습니다</div>
        <div className="text-sm text-gray-500">다른 검색 조건을 시도해보세요.</div>
      </div>
    );
  }

  return (
    <div className={`grid gap-5 ${
      viewMode === 'list' 
        ? 'grid-cols-1' 
        : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'
    }`}>
      {products.map((product) => (
        <ProductCard
          key={product.id}
          product={product}
          viewMode={viewMode}
          isWishlisted={quickActions[product.id]?.wishlisted || false}
          onWishlistToggle={() => handleWishlistToggle(product.id)}
          onAddToCart={() => handleAddToCart(product)}
          onAddToQuote={() => handleAddToQuote(product)}
        />
      ))}
    </div>
  );
}

interface ProductCardProps {
  product: Product;
  viewMode: 'grid' | 'list';
  isWishlisted: boolean;
  onWishlistToggle: () => void;
  onAddToCart: () => void;
  onAddToQuote: () => void;
}

function ProductCard({ 
  product, 
  viewMode, 
  isWishlisted, 
  onWishlistToggle, 
  onAddToCart, 
  onAddToQuote 
}: ProductCardProps) {
  if (viewMode === 'list') {
    return (
      <div className="grid grid-cols-[200px_1fr_auto] gap-5 p-5 bg-white border border-gray-200 rounded-lg cursor-pointer transition-transform hover:-translate-y-1">
        {/* Product Image */}
        <Link href={`/products/${product.id}`}>
          <div className="relative h-[150px] bg-gray-100 rounded-lg overflow-hidden">
            <Image
              src={product.imageUrl}
              alt={product.nameKo}
              fill
              className="object-cover"
            />
            {/* Badges */}
            <div className="absolute top-2 left-2 flex flex-col gap-1">
              {product.isNew && (
                <span className="px-2 py-1 bg-green-500 text-white text-xs font-bold rounded">NEW</span>
              )}
              {product.isBestSeller && (
                <span className="px-2 py-1 bg-blue-500 text-white text-xs font-bold rounded">BEST</span>
              )}
              {product.discountRate > 0 && (
                <span className="px-2 py-1 bg-red-500 text-white text-xs font-bold rounded">
                  {product.discountRate}%
                </span>
              )}
            </div>
          </div>
        </Link>

        {/* Product Info */}
        <div className="flex flex-col">
          <div className="text-xs text-gray-500 mb-1">{product.category}</div>
          <Link href={`/products/${product.id}`}>
            <h3 className="text-base font-medium mb-2 hover:underline line-clamp-1">
              {product.nameKo}
            </h3>
          </Link>
          <div className="text-xs text-gray-600 mb-3 line-clamp-2 leading-relaxed">
            프리미엄 소재로 제작된 고품질 제품. 뛰어난 성능과 착용감을 제공합니다.
          </div>
          <div className="flex items-center gap-2 mb-3">
            {product.discountRate > 0 && (
              <span className="text-red-500 font-bold text-base">
                {product.discountRate}%
              </span>
            )}
            <span className="text-base font-bold">
              {formatPrice(product.discountPrice || product.price)}
            </span>
            {product.discountPrice && (
              <span className="text-gray-500 text-sm line-through">
                {formatPrice(product.price)}
              </span>
            )}
          </div>
          <span className="inline-block px-2 py-1 bg-gray-100 rounded text-xs text-gray-600 w-fit">
            최소주문: {product.minOrderQty}개
          </span>
        </div>

        {/* Quick Actions */}
        <div className="flex flex-col gap-2">
          <button
            onClick={(e) => {
              e.preventDefault();
              onWishlistToggle();
            }}
            className={`w-9 h-9 rounded-full border flex items-center justify-center transition-all hover:scale-110 ${
              isWishlisted 
                ? 'bg-red-50 text-red-500 border-red-200' 
                : 'bg-white border-gray-300 hover:bg-gray-50'
            }`}
          >
            {isWishlisted ? '💖' : '❤️'}
          </button>
          <button
            onClick={(e) => {
              e.preventDefault();
              onAddToCart();
            }}
            className="w-9 h-9 rounded-full bg-white border border-gray-300 flex items-center justify-center transition-all hover:bg-black hover:text-white hover:scale-110"
          >
            🛒
          </button>
          <button
            onClick={(e) => {
              e.preventDefault();
              onAddToQuote();
            }}
            className="w-9 h-9 rounded-full bg-white border border-gray-300 flex items-center justify-center transition-all hover:bg-black hover:text-white hover:scale-110"
          >
            📊
          </button>
        </div>
      </div>
    );
  }

  // Grid View
  return (
    <div className="cursor-pointer transition-transform hover:-translate-y-1 relative group">
      <Link href={`/products/${product.id}`}>
        {/* Product Image */}
        <div className="relative pb-[120%] bg-gray-100 rounded-lg overflow-hidden mb-3">
          <Image
            src={product.imageUrl}
            alt={product.nameKo}
            fill
            className="object-cover"
          />
          
          {/* Badges */}
          <div className="absolute top-2 left-2 flex flex-col gap-1">
            {product.isNew && (
              <span className="px-2 py-1 bg-green-500 text-white text-xs font-bold rounded">NEW</span>
            )}
            {product.isBestSeller && (
              <span className="px-2 py-1 bg-blue-500 text-white text-xs font-bold rounded">BEST</span>
            )}
            {product.discountRate > 0 && (
              <span className="px-2 py-1 bg-red-500 text-white text-xs font-bold rounded">
                {product.discountRate}%
              </span>
            )}
          </div>

          {/* Quick Actions */}
          <div className="absolute bottom-2 right-2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              onClick={(e) => {
                e.preventDefault();
                onWishlistToggle();
              }}
              className={`w-9 h-9 rounded-full flex items-center justify-center transition-all hover:scale-110 ${
                isWishlisted 
                  ? 'bg-red-50 text-red-500 border border-red-200' 
                  : 'bg-white/95 border border-gray-300 hover:bg-black hover:text-white'
              }`}
            >
              {isWishlisted ? '💖' : '❤️'}
            </button>
            <button
              onClick={(e) => {
                e.preventDefault();
                onAddToCart();
              }}
              className="w-9 h-9 rounded-full bg-white/95 border border-gray-300 flex items-center justify-center transition-all hover:bg-black hover:text-white hover:scale-110"
            >
              🛒
            </button>
            <button
              onClick={(e) => {
                e.preventDefault();
                onAddToQuote();
              }}
              className="w-9 h-9 rounded-full bg-white/95 border border-gray-300 flex items-center justify-center transition-all hover:bg-black hover:text-white hover:scale-110"
            >
              📊
            </button>
          </div>
        </div>
      </Link>

      {/* Product Info */}
      <div>
        <div className="text-xs text-gray-500 mb-1">{product.category}</div>
        <Link href={`/products/${product.id}`}>
          <h3 className="text-sm font-medium mb-2 hover:underline line-clamp-2 leading-tight">
            {product.nameKo}
          </h3>
        </Link>
        <div className="flex items-center gap-2 mb-2">
          {product.discountRate > 0 && (
            <span className="text-red-500 font-bold text-base">
              {product.discountRate}%
            </span>
          )}
          <span className="text-base font-bold">
            {formatPrice(product.discountPrice || product.price)}
          </span>
          {product.discountPrice && (
            <span className="text-gray-500 text-xs line-through">
              {formatPrice(product.price)}
            </span>
          )}
        </div>
        <span className="inline-block px-2 py-1 bg-gray-100 rounded text-xs text-gray-600">
          최소주문: {product.minOrderQty}개
        </span>
      </div>
    </div>
  );
}