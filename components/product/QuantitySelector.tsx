'use client';

import { BulkPricing } from '@/types/product-detail';
import { cn } from '@/lib/utils';

interface QuantitySelectorProps {
  quantity: number;
  minQuantity: number;
  onQuantityChange: (quantity: number) => void;
  unitPrice: number;
  bulkPricing: BulkPricing[];
}

export function QuantitySelector({
  quantity,
  minQuantity,
  onQuantityChange,
  unitPrice,
  bulkPricing,
}: QuantitySelectorProps) {
  const handleDecrement = () => {
    if (quantity > minQuantity) {
      onQuantityChange(quantity - 1);
    }
  };

  const handleIncrement = () => {
    onQuantityChange(quantity + 1);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value) || minQuantity;
    if (value >= minQuantity) {
      onQuantityChange(value);
    }
  };

  // Calculate the current price based on quantity
  const getCurrentPrice = () => {
    const applicablePricing = bulkPricing.find(
      (pricing) =>
        quantity >= pricing.minQuantity &&
        (!pricing.maxQuantity || quantity <= pricing.maxQuantity)
    );
    return applicablePricing?.pricePerUnit || unitPrice;
  };

  const currentPrice = getCurrentPrice();
  const totalPrice = currentPrice * quantity;

  return (
    <div className="border-b pb-6">
      {/* Bulk Pricing Table */}
      {bulkPricing.length > 0 && (
        <div className="bg-gray-50 rounded-lg p-4 mb-6">
          <h3 className="text-sm font-bold mb-3 flex items-center gap-2">
            🎯 대량구매 할인
          </h3>
          <div className="space-y-2">
            {bulkPricing.map((pricing, index) => {
              const isActive =
                quantity >= pricing.minQuantity &&
                (!pricing.maxQuantity || quantity <= pricing.maxQuantity);
              return (
                <div
                  key={index}
                  className={cn(
                    "flex justify-between text-sm py-2 px-3 rounded",
                    isActive && "bg-white font-semibold"
                  )}
                >
                  <span>
                    {pricing.minQuantity}
                    {pricing.maxQuantity ? `~${pricing.maxQuantity}` : '+'}개
                  </span>
                  <span>
                    개당 ₩{pricing.pricePerUnit.toLocaleString()}{' '}
                    {pricing.discountRate > 0 && (
                      <span className="text-red-500">
                        ({pricing.discountRate}% 할인)
                      </span>
                    )}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Quantity Control */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold">수량</h3>
          <div className="flex items-center border border-gray-300 rounded">
            <button
              onClick={handleDecrement}
              disabled={quantity <= minQuantity}
              className="w-9 h-9 flex items-center justify-center hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              -
            </button>
            <input
              type="number"
              value={quantity}
              onChange={handleInputChange}
              min={minQuantity}
              className="w-16 h-9 text-center border-x border-gray-300 focus:outline-none"
            />
            <button
              onClick={handleIncrement}
              className="w-9 h-9 flex items-center justify-center hover:bg-gray-50"
            >
              +
            </button>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-sm text-red-500">
            * 최소주문수량: {minQuantity}개
          </span>
          <span className="text-base font-bold">
            총 ₩{totalPrice.toLocaleString()}
          </span>
        </div>
      </div>
    </div>
  );
}