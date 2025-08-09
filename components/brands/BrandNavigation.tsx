'use client';

import { useRouter, useSearchParams } from 'next/navigation';

interface BrandNavigationProps {
  currentSection: string;
  brandSlug: string;
}

const navItems = [
  { key: 'products', label: '전체상품', category: null },
  { key: 'products', label: '신상품', category: 'new' },
  { key: 'products', label: '베스트셀러', category: 'best' },
  { key: 'products', label: '남성', category: 'men' },
  { key: 'products', label: '여성', category: 'women' },
  { key: 'products', label: '용품', category: 'accessories' },
  { key: 'products', label: '세일', category: 'sale' },
  { key: 'story', label: '브랜드 스토리', category: null },
];

export function BrandNavigation({ currentSection, brandSlug }: BrandNavigationProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const handleNavClick = (item: typeof navItems[0]) => {
    const params = new URLSearchParams(searchParams);
    
    // Clear previous filters when changing sections
    if (item.key !== currentSection) {
      // Keep only view preferences when switching sections
      const view = params.get('view');
      // Clear params more safely
      const keysToDelete = Array.from(params.keys()).filter(key => key !== 'view');
      keysToDelete.forEach(key => params.delete(key));
      
      if (view) {
        params.set('view', view);
      }
    }

    // Set section
    if (item.key !== 'products') {
      params.set('section', item.key);
    } else {
      params.delete('section');
    }

    // Set category filter for products
    if (item.category) {
      params.set('category', item.category);
    } else if (item.key === 'products') {
      params.delete('category');
    }

    const newUrl = `/brands/${brandSlug}${params.toString() ? `?${params.toString()}` : ''}`;
    router.push(newUrl);
  };

  const isActive = (item: typeof navItems[0]) => {
    const section = item.key === 'products' ? 'products' : item.key;
    const currentCategory = searchParams.get('category');
    
    if (section !== currentSection) return false;
    
    if (item.category) {
      return currentCategory === item.category;
    } else {
      return !currentCategory || currentCategory === null;
    }
  };

  return (
    <div className="bg-gray-50 border-b border-gray-200 sticky top-[60px] z-[99]">
      <div className="max-w-[1280px] mx-auto px-5">
        <div className="flex gap-8 h-[50px] items-center">
          {navItems.map((item) => (
            <button
              key={`${item.key}-${item.category || 'all'}`}
              onClick={() => handleNavClick(item)}
              className={`text-sm font-medium py-1 border-b-2 transition-all ${
                isActive(item)
                  ? 'font-bold border-black text-black'
                  : 'border-transparent text-gray-600 hover:border-gray-400 hover:text-gray-800'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}