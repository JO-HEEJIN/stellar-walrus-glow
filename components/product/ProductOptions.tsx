'use client';

import { ProductColor, ProductSize } from '@/types/product-detail';
import { cn } from '@/lib/utils';

interface ProductOptionsProps {
  colors: ProductColor[];
  sizes: ProductSize[];
  selectedColor: string | null;
  selectedSize: string | null;
  onColorSelect: (colorId: string) => void;
  onSizeSelect: (sizeId: string) => void;
}

export function ProductOptions({
  colors,
  sizes,
  selectedColor,
  selectedSize,
  onColorSelect,
  onSizeSelect,
}: ProductOptionsProps) {
  return (
    <div className="border-b pb-6">
      {/* Color Options */}
      <div className="mb-6">
        <h3 className="text-sm font-bold mb-3">색상</h3>
        <div className="flex gap-2">
          {colors.map((color) => (
            <button
              key={color.id}
              onClick={() => color.available && onColorSelect(color.id)}
              disabled={!color.available}
              className={cn(
                "w-10 h-10 rounded-full border-2 transition-all relative",
                selectedColor === color.id
                  ? "border-black scale-110"
                  : "border-gray-300 hover:border-gray-500",
                !color.available && "opacity-50 cursor-not-allowed"
              )}
              style={{ backgroundColor: color.code }}
              title={color.name}
            >
              {!color.available && (
                <span className="absolute inset-0 flex items-center justify-center">
                  <span className="w-full h-[1px] bg-gray-500 rotate-45 absolute" />
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Size Options */}
      <div>
        <h3 className="text-sm font-bold mb-3">사이즈</h3>
        <div className="grid grid-cols-6 gap-2">
          {sizes.map((size) => (
            <button
              key={size.id}
              onClick={() => size.available && onSizeSelect(size.id)}
              disabled={!size.available}
              className={cn(
                "py-2.5 px-3 border rounded text-sm font-medium transition-all",
                selectedSize === size.id
                  ? "bg-black text-white border-black"
                  : "bg-white border-gray-300 hover:bg-gray-50",
                !size.available && "opacity-30 cursor-not-allowed"
              )}
            >
              {size.name}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}