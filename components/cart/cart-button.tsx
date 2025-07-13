'use client'

import { ShoppingCart } from 'lucide-react'
import { useCartStore } from '@/lib/stores/cart'
import Link from 'next/link'

export default function CartButton() {
  const totalItems = useCartStore((state) => state.getTotalItems())

  return (
    <Link
      href="/cart"
      className="relative inline-flex items-center p-2 text-gray-600 hover:text-gray-900"
    >
      <ShoppingCart className="h-6 w-6" />
      {totalItems > 0 && (
        <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-primary text-xs text-white flex items-center justify-center">
          {totalItems}
        </span>
      )}
      <span className="sr-only">장바구니</span>
    </Link>
  )
}