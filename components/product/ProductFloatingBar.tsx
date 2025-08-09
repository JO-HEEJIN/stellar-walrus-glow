'use client';

import { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';

interface ProductFloatingBarProps {
  productName: string;
  price: number;
  onAddToCart: () => void;
  onBuyNow: () => void;
}

export function ProductFloatingBar({
  productName,
  price,
  onAddToCart,
  onBuyNow,
}: ProductFloatingBarProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const productInfo = document.getElementById('product-info');
      if (productInfo) {
        const rect = productInfo.getBoundingClientRect();
        setIsVisible(rect.bottom < 0);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div
      className={cn(
        "fixed bottom-0 left-0 right-0 bg-white border-t shadow-lg transition-transform duration-300 z-50",
        isVisible ? "translate-y-0" : "translate-y-full"
      )}
    >
      <div className="max-w-7xl mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <span className="text-sm font-medium truncate max-w-xs">
              {productName}
            </span>
            <span className="text-xl font-bold">
              ₩{price.toLocaleString()}
            </span>
          </div>
          <div className="flex gap-3">
            <button
              onClick={onAddToCart}
              className="px-6 py-2.5 border border-gray-300 rounded hover:bg-gray-50 transition-colors font-medium"
            >
              장바구니
            </button>
            <button
              onClick={onBuyNow}
              className="px-6 py-2.5 bg-black text-white rounded hover:bg-gray-800 transition-colors font-medium"
            >
              바로구매
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}