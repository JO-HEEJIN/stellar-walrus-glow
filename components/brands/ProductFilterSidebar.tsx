'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

interface FilterState {
  categories: string[];
  priceMin: number;
  priceMax: number;
  colors: string[];
  sizes: string[];
  moqRanges: string[];
}

interface ProductFilterSidebarProps {
  filters: FilterState;
  currentFilters: any;
  onFilterChange: (filters: Partial<FilterState>) => void;
  brandSlug: string;
}

const categoryOptions = [
  { id: 'all', label: '전체', count: 128 },
  { id: 'men', label: '남성 의류', count: 52 },
  { id: 'women', label: '여성 의류', count: 38 },
  { id: 'accessories', label: '액세서리', count: 24 },
  { id: 'bags', label: '가방/용품', count: 14 },
];

const priceRanges = [
  { id: 'under-50k', label: '5만원 이하', count: 12 },
  { id: '50k-100k', label: '5-10만원', count: 45 },
  { id: '100k-200k', label: '10-20만원', count: 48 },
  { id: 'over-200k', label: '20만원 이상', count: 23 },
];

const colorOptions = [
  { id: 'black', name: '블랙', color: '#000' },
  { id: 'white', name: '화이트', color: '#fff', border: true },
  { id: 'navy', name: '네이비', color: '#1a237e' },
  { id: 'gray', name: '그레이', color: '#757575' },
  { id: 'red', name: '레드', color: '#ef5350' },
  { id: 'blue', name: '블루', color: '#2196f3' },
  { id: 'green', name: '그린', color: '#4caf50' },
  { id: 'yellow', name: '옐로우', color: '#ffc107' },
  { id: 'orange', name: '오렌지', color: '#ff6b35' },
  { id: 'pink', name: '핑크', color: '#e91e63' },
  { id: 'purple', name: '퍼플', color: '#9c27b0' },
  { id: 'brown', name: '브라운', color: '#8d6e63' },
];

const sizeOptions = [
  { id: 'S', label: 'S (90)', count: 42 },
  { id: 'M', label: 'M (95)', count: 68 },
  { id: 'L', label: 'L (100)', count: 72 },
  { id: 'XL', label: 'XL (105)', count: 58 },
  { id: '2XL', label: '2XL (110)', count: 35 },
];

const moqOptions = [
  { id: 'under-5', label: '5개 이하', count: 23 },
  { id: 'under-10', label: '10개 이하', count: 64 },
  { id: 'under-20', label: '20개 이하', count: 32 },
  { id: 'over-20', label: '20개 초과', count: 9 },
];

export function ProductFilterSidebar({ 
  filters, 
  currentFilters, 
  onFilterChange, 
  brandSlug 
}: ProductFilterSidebarProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [collapsedSections, setCollapsedSections] = useState<Set<string>>(new Set());

  const toggleSection = (section: string) => {
    const newCollapsed = new Set(collapsedSections);
    if (newCollapsed.has(section)) {
      newCollapsed.delete(section);
    } else {
      newCollapsed.add(section);
    }
    setCollapsedSections(newCollapsed);
  };

  const updateFilter = (filterType: string, value: string, checked: boolean) => {
    const params = new URLSearchParams(searchParams);
    
    if (filterType === 'category') {
      if (value === 'all') {
        params.delete('category');
      } else {
        params.set('category', value);
      }
    } else if (filterType === 'colors') {
      const currentColors = params.get('colors')?.split(',') || [];
      let newColors = [...currentColors];
      
      if (checked) {
        if (!newColors.includes(value)) newColors.push(value);
      } else {
        newColors = newColors.filter(color => color !== value);
      }
      
      if (newColors.length > 0) {
        params.set('colors', newColors.join(','));
      } else {
        params.delete('colors');
      }
    } else if (filterType === 'sizes') {
      const currentSizes = params.get('sizes')?.split(',') || [];
      let newSizes = [...currentSizes];
      
      if (checked) {
        if (!newSizes.includes(value)) newSizes.push(value);
      } else {
        newSizes = newSizes.filter(size => size !== value);
      }
      
      if (newSizes.length > 0) {
        params.set('sizes', newSizes.join(','));
      } else {
        params.delete('sizes');
      }
    } else if (filterType === 'moq') {
      if (checked) {
        params.set('moq', value);
      } else {
        params.delete('moq');
      }
    }

    // Reset to first page when filters change
    params.delete('page');
    
    router.push(`/brands/${brandSlug}?${params.toString()}`);
  };

  const FilterSection = ({ 
    title, 
    sectionKey, 
    children 
  }: { 
    title: string; 
    sectionKey: string; 
    children: React.ReactNode; 
  }) => {
    const isCollapsed = collapsedSections.has(sectionKey);
    
    return (
      <div className="mb-8 pb-5 border-b border-gray-200 last:border-b-0">
        <div 
          className="text-sm font-bold mb-4 flex justify-between items-center cursor-pointer"
          onClick={() => toggleSection(sectionKey)}
        >
          {title}
          <span className={`text-xs transition-transform ${isCollapsed ? 'rotate-180' : ''}`}>
            ▼
          </span>
        </div>
        <div className={`transition-all duration-300 overflow-hidden ${
          isCollapsed ? 'max-h-0' : 'max-h-[500px]'
        }`}>
          {children}
        </div>
      </div>
    );
  };

  return (
    <aside className="sticky top-[130px] h-fit">
      {/* Categories */}
      <FilterSection title="카테고리" sectionKey="categories">
        <div className="space-y-3">
          {categoryOptions.map(option => (
            <div key={option.id} className="flex items-center gap-2 text-xs cursor-pointer hover:text-indigo-900">
              <input
                type="checkbox"
                className="w-4 h-4"
                checked={option.id === 'all' ? !currentFilters.category : currentFilters.category === option.id}
                onChange={(e) => updateFilter('category', option.id, e.target.checked)}
              />
              <label className="flex-1 cursor-pointer">{option.label}</label>
              <span className="text-gray-500 text-xs">{option.count}</span>
            </div>
          ))}
        </div>
      </FilterSection>

      {/* Price Range */}
      <FilterSection title="가격" sectionKey="price">
        <div className="mb-5">
          <div className="grid grid-cols-[1fr_auto_1fr] gap-3 items-center mb-4">
            <input
              type="number"
              placeholder="최소"
              value={currentFilters.priceMin}
              className="px-2 py-2 border border-gray-300 rounded text-xs"
            />
            <span className="text-xs">~</span>
            <input
              type="number"
              placeholder="최대"
              value={currentFilters.priceMax}
              className="px-2 py-2 border border-gray-300 rounded text-xs"
            />
          </div>
          <input
            type="range"
            min="0"
            max="500000"
            value={currentFilters.priceMax}
            className="w-full my-3"
          />
        </div>
        <div className="space-y-3">
          {priceRanges.map(range => (
            <div key={range.id} className="flex items-center gap-2 text-xs cursor-pointer hover:text-indigo-900">
              <input type="checkbox" className="w-4 h-4" />
              <label className="flex-1 cursor-pointer">{range.label}</label>
              <span className="text-gray-500 text-xs">{range.count}</span>
            </div>
          ))}
        </div>
      </FilterSection>

      {/* Colors */}
      <FilterSection title="색상" sectionKey="colors">
        <div className="grid grid-cols-6 gap-2">
          {colorOptions.map(color => (
            <div
              key={color.id}
              className={`w-7 h-7 rounded-full cursor-pointer transition-all hover:scale-110 ${
                currentFilters.colors.includes(color.id)
                  ? 'ring-2 ring-black ring-offset-2'
                  : 'border-2 border-gray-300'
              }`}
              style={{
                backgroundColor: color.color,
                borderColor: color.border ? '#ddd' : color.color
              }}
              title={color.name}
              onClick={() => updateFilter('colors', color.id, !currentFilters.colors.includes(color.id))}
            />
          ))}
        </div>
      </FilterSection>

      {/* Sizes */}
      <FilterSection title="사이즈" sectionKey="sizes">
        <div className="space-y-3">
          {sizeOptions.map(size => (
            <div key={size.id} className="flex items-center gap-2 text-xs cursor-pointer hover:text-indigo-900">
              <input
                type="checkbox"
                className="w-4 h-4"
                checked={currentFilters.sizes.includes(size.id)}
                onChange={(e) => updateFilter('sizes', size.id, e.target.checked)}
              />
              <label className="flex-1 cursor-pointer">{size.label}</label>
              <span className="text-gray-500 text-xs">{size.count}</span>
            </div>
          ))}
        </div>
      </FilterSection>

      {/* MOQ */}
      <FilterSection title="최소주문수량" sectionKey="moq">
        <div className="space-y-3">
          {moqOptions.map(moq => (
            <div key={moq.id} className="flex items-center gap-2 text-xs cursor-pointer hover:text-indigo-900">
              <input
                type="checkbox"
                className="w-4 h-4"
                checked={currentFilters.moq === moq.id}
                onChange={(e) => updateFilter('moq', moq.id, e.target.checked)}
              />
              <label className="flex-1 cursor-pointer">{moq.label}</label>
              <span className="text-gray-500 text-xs">{moq.count}</span>
            </div>
          ))}
        </div>
      </FilterSection>
    </aside>
  );
}