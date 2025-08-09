'use client';

import Link from 'next/link';

export function CartEmpty() {
  return (
    <div className="bg-white rounded-lg p-20 text-center">
      <div className="text-5xl mb-5">🛒</div>
      <div className="text-base text-gray-600 mb-8">
        장바구니에 담긴 상품이 없습니다.
      </div>
      <Link
        href="/products"
        className="inline-block px-10 py-3 bg-black text-white font-semibold rounded hover:bg-gray-800 transition-colors"
      >
        쇼핑 계속하기
      </Link>
    </div>
  );
}