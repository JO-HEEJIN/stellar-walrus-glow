'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { NAVIGATION_ITEMS, type Store } from '@/lib/config/stores'

interface StoreNavigationProps {
  store: Store
}

export default function StoreNavigation({ store }: StoreNavigationProps) {
  const pathname = usePathname()
  
  const isActive = (slug: string) => {
    return pathname.includes(`/${slug}`)
  }

  return (
    <nav className="border-t border-gray-200 bg-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 space-x-8 overflow-x-auto">
          {NAVIGATION_ITEMS.map((item) => {
            const href = `${store.path}/${item.slug}`
            const active = isActive(item.slug)
            
            return (
              <Link
                key={item.id}
                href={href}
                className={`inline-flex items-center border-b-2 px-1 pt-1 text-sm font-medium whitespace-nowrap transition-colors duration-200 ${
                  active
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                }`}
              >
                {item.nameKo}
              </Link>
            )
          })}
        </div>
      </div>
    </nav>
  )
}