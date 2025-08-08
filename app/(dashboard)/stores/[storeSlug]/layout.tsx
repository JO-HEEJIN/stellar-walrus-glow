'use client'

import { notFound } from 'next/navigation'
import { getStoreBySlug } from '@/lib/config/stores'
import StoreSearchBar from '@/components/navigation/store-search-bar'
import StoreNavigation from '@/components/navigation/store-navigation'

interface StoreLayoutProps {
  children: React.ReactNode
  params: { storeSlug: string }
}

export default function StoreLayout({ children, params }: StoreLayoutProps) {
  const store = getStoreBySlug(params.storeSlug)
  
  if (!store) {
    notFound()
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Store Search Bar */}
      <StoreSearchBar store={store} />
      
      {/* Store Navigation */}
      <StoreNavigation store={store} />
      
      {/* Store Content */}
      <main className="pb-10">
        {children}
      </main>
    </div>
  )
}