'use client';

import { useRouter, useSearchParams } from 'next/navigation';

interface ProductSortBarProps {
  totalCount: number;
  currentView: 'grid' | 'list';
  currentSort: string;
  brandSlug: string;
}

const sortOptions = [
  { value: 'recommended', label: '추천순' },
  { value: 'newest', label: '신상품순' },
  { value: 'sales', label: '판매량순' },
  { value: 'price-low', label: '낮은가격순' },
  { value: 'price-high', label: '높은가격순' },
  { value: 'discount', label: '할인율순' },
];

export function ProductSortBar({ 
  totalCount, 
  currentView, 
  currentSort, 
  brandSlug 
}: ProductSortBarProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const updateView = (view: 'grid' | 'list') => {
    const params = new URLSearchParams(searchParams);
    params.set('view', view);
    router.push(`/brands/${brandSlug}?${params.toString()}`);
  };

  const updateSort = (sort: string) => {
    const params = new URLSearchParams(searchParams);
    params.set('sort', sort);
    params.delete('page'); // Reset to first page
    router.push(`/brands/${brandSlug}?${params.toString()}`);
  };

  return (
    <div className="flex justify-between items-center mb-5 py-4 border-b border-gray-200">
      <span className="text-sm text-gray-600">
        총 {totalCount.toLocaleString()}개 상품
      </span>
      
      <div className="flex items-center gap-5">
        {/* Sort Dropdown */}
        <select
          value={currentSort}
          onChange={(e) => updateSort(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded text-xs cursor-pointer focus:outline-none focus:ring-1 focus:ring-indigo-500"
        >
          {sortOptions.map(option => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>

        {/* View Toggle */}
        <div className="flex gap-1">
          <button
            onClick={() => updateView('grid')}
            className={`w-8 h-8 border flex items-center justify-center transition-all ${
              currentView === 'grid'
                ? 'bg-black text-white border-black'
                : 'bg-white border-gray-300 hover:bg-gray-50'
            }`}
            title="그리드 뷰"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
              <rect x="3" y="3" width="7" height="7"/>
              <rect x="14" y="3" width="7" height="7"/>
              <rect x="3" y="14" width="7" height="7"/>
              <rect x="14" y="14" width="7" height="7"/>
            </svg>
          </button>
          <button
            onClick={() => updateView('list')}
            className={`w-8 h-8 border flex items-center justify-center transition-all ${
              currentView === 'list'
                ? 'bg-black text-white border-black'
                : 'bg-white border-gray-300 hover:bg-gray-50'
            }`}
            title="리스트 뷰"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
              <rect x="3" y="6" width="18" height="2"/>
              <rect x="3" y="10" width="18" height="2"/>
              <rect x="3" y="14" width="18" height="2"/>
              <rect x="3" y="18" width="18" height="2"/>
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}