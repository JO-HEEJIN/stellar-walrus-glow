'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { CartItem } from '@/lib/stores/cart';
import { formatPrice } from '@/lib/utils';

interface CartBrandGroupProps {
  brandName: string;
  items: CartItem[];
  selectedItems: string[];
  onItemSelect: (itemId: string, selected: boolean) => void;
  onBrandSelect: (brandName: string, selected: boolean) => void;
  onQuantityChange: (itemId: string, quantity: number) => void;
  onRemoveItem: (itemId: string) => void;
}

export function CartBrandGroup({
  brandName,
  items,
  selectedItems,
  onItemSelect,
  onBrandSelect,
  onQuantityChange,
  onRemoveItem
}: CartBrandGroupProps) {
  const brandSelected = items.every(item => selectedItems.includes(item.id));
  const brandSubtotal = items
    .filter(item => selectedItems.includes(item.id))
    .reduce((sum, item) => sum + (item.price * item.quantity), 0);

  const handleBrandToggle = (e: React.ChangeEvent<HTMLInputElement>) => {
    onBrandSelect(brandName, e.target.checked);
  };

  const getShippingInfo = () => {
    // 무료배송 조건 계산
    if (brandSubtotal >= 300000) {
      return "배송비 무료";
    }
    const needed = 300000 - brandSubtotal;
    return `₩${needed.toLocaleString()} 추가시 무료배송`;
  };

  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden mb-6">
      {/* 브랜드 헤더 */}
      <div className="bg-gray-50 px-4 py-3 border-b border-gray-200 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <input
            type="checkbox"
            className="w-5 h-5"
            checked={brandSelected}
            onChange={handleBrandToggle}
          />
          <span className="font-bold text-sm">{brandName}</span>
        </div>
        <span className="text-xs text-gray-600">{getShippingInfo()}</span>
      </div>

      {/* 상품 목록 */}
      {items.map((item) => (
        <CartItemRow
          key={item.id}
          item={item}
          selected={selectedItems.includes(item.id)}
          onSelect={onItemSelect}
          onQuantityChange={onQuantityChange}
          onRemove={onRemoveItem}
        />
      ))}

      {/* 브랜드 소계 */}
      <div className="bg-gray-50 px-4 py-3 flex justify-between items-center">
        <span className="text-sm">브랜드 소계</span>
        <span className="font-bold">{formatPrice(brandSubtotal)}</span>
      </div>
    </div>
  );
}

interface CartItemRowProps {
  item: CartItem;
  selected: boolean;
  onSelect: (itemId: string, selected: boolean) => void;
  onQuantityChange: (itemId: string, quantity: number) => void;
  onRemove: (itemId: string) => void;
}

function CartItemRow({ item, selected, onSelect, onQuantityChange, onRemove }: CartItemRowProps) {
  const handleQuantityChange = (delta: number) => {
    const newQuantity = Math.max(1, item.quantity + delta);
    onQuantityChange(item.id, newQuantity);
  };

  const handleQuantityInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const quantity = Math.max(1, parseInt(e.target.value) || 1);
    onQuantityChange(item.id, quantity);
  };

  const subtotal = item.price * item.quantity;

  return (
    <div className="p-5 border-b border-gray-100 last:border-b-0 flex gap-5">
      {/* 체크박스 */}
      <div className="pt-10">
        <input
          type="checkbox"
          className="w-5 h-5"
          checked={selected}
          onChange={(e) => onSelect(item.id, e.target.checked)}
        />
      </div>

      {/* 상품 이미지 */}
      <div className="w-25 h-30 bg-gray-100 rounded overflow-hidden flex-shrink-0">
        <Image
          src={item.imageUrl}
          alt={item.name}
          width={100}
          height={120}
          className="w-full h-full object-cover"
        />
      </div>

      {/* 상품 정보 */}
      <div className="flex-1">
        <div className="text-xs text-gray-600 mb-1">{item.brandName}</div>
        <Link href={`/products/${item.productId}`} className="hover:underline">
          <div className="text-sm font-medium mb-2 cursor-pointer">{item.name}</div>
        </Link>
        <div className="text-xs text-gray-600 mb-3">
          {item.color && `색상: ${item.color}`}
          {item.color && item.size && ' / '}
          {item.size && `사이즈: ${item.size}`}
        </div>
        
        {/* 가격 정보 */}
        <div className="flex items-center gap-2 mb-3">
          <span className="text-base font-bold">{formatPrice(item.price)}</span>
        </div>

        {/* 수량 조절 */}
        <div className="flex items-center border border-gray-300 rounded w-fit">
          <button
            onClick={() => handleQuantityChange(-1)}
            className="w-8 h-8 flex items-center justify-center hover:bg-gray-50"
            disabled={item.quantity <= 1}
          >
            -
          </button>
          <input
            type="number"
            value={item.quantity}
            onChange={handleQuantityInput}
            className="w-12 h-8 text-center border-l border-r border-gray-300 text-sm"
            min="1"
          />
          <button
            onClick={() => handleQuantityChange(1)}
            className="w-8 h-8 flex items-center justify-center hover:bg-gray-50"
          >
            +
          </button>
        </div>
      </div>

      {/* 소계 */}
      <div className="text-right pt-10">
        <div className="text-xs text-gray-600 mb-1">소계</div>
        <div className="text-lg font-bold">{formatPrice(subtotal)}</div>
      </div>

      {/* 삭제 버튼 */}
      <div className="pt-10">
        <button
          onClick={() => onRemove(item.id)}
          className="w-6 h-6 border border-gray-300 rounded-full flex items-center justify-center hover:bg-black hover:text-white hover:border-black transition-colors"
        >
          ×
        </button>
      </div>
    </div>
  );
}