'use client'

import { notFound } from 'next/navigation'
import { getStoreBySlug } from '@/lib/config/stores'
import StoreSearchBar from '@/components/navigation/store-search-bar'
import StoreNavigation from '@/components/navigation/store-navigation'

export default function StoreLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-gray-50">
      {children}
    </div>
  )
}