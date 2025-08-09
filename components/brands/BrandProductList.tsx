'use client';

import { useState, useEffect } from 'react';
import { ProductFilterSidebar } from './ProductFilterSidebar';
import { ProductGrid } from './ProductGrid';
import { ProductSortBar } from './ProductSortBar';

interface BrandProductListProps {
  brandId: string;
  brandSlug: string;
  searchParams: {
    category?: string;
    view?: 'grid' | 'list';
    sort?: string;
    page?: string;
    priceMin?: string;
    priceMax?: string;
    colors?: string;
    sizes?: string;
    moq?: string;
  };
}

interface Product {
  id: string;
  sku: string;
  name: string;
  nameKo: string;
  category: string;
  price: number;
  discountPrice?: number;
  discountRate: number;
  imageUrl: string;
  minOrderQty: number;
  isNew: boolean;
  isBestSeller: boolean;
  colors: string[];
  sizes: string[];
  stock: number;
}

interface FilterState {
  categories: string[];
  priceMin: number;
  priceMax: number;
  colors: string[];
  sizes: string[];
  moqRanges: string[];
}

export function BrandProductList({ brandId, brandSlug, searchParams }: BrandProductListProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalCount, setTotalCount] = useState(0);
  const [filters, setFilters] = useState<FilterState>({
    categories: [],
    priceMin: 0,
    priceMax: 500000,
    colors: [],
    sizes: [],
    moqRanges: [],
  });

  // Get filter values from URL params
  const currentFilters = {
    category: searchParams.category,
    view: searchParams.view || 'grid',
    sort: searchParams.sort || 'recommended',
    page: parseInt(searchParams.page || '1'),
    priceMin: parseInt(searchParams.priceMin || '0'),
    priceMax: parseInt(searchParams.priceMax || '500000'),
    colors: searchParams.colors?.split(',') || [],
    sizes: searchParams.sizes?.split(',') || [],
    moq: searchParams.moq,
  };

  useEffect(() => {
    fetchProducts();
  }, [brandId, searchParams]);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const queryParams = new URLSearchParams();
      queryParams.append('brandId', brandId);
      
      // Apply filters from searchParams
      if (searchParams.category) queryParams.append('category', searchParams.category);
      if (searchParams.sort) queryParams.append('sort', searchParams.sort);
      if (searchParams.page) queryParams.append('page', searchParams.page);
      if (searchParams.priceMin) queryParams.append('priceMin', searchParams.priceMin);
      if (searchParams.priceMax) queryParams.append('priceMax', searchParams.priceMax);
      if (searchParams.colors) queryParams.append('colors', searchParams.colors);
      if (searchParams.sizes) queryParams.append('sizes', searchParams.sizes);
      if (searchParams.moq) queryParams.append('moq', searchParams.moq);

      const response = await fetch(`/api/products?${queryParams.toString()}`);
      if (response.ok) {
        const data = await response.json();
        setProducts(data.data.products || []);
        setTotalCount(data.data.totalCount || 0);
      }
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (newFilters: Partial<FilterState>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-10 h-10 border-3 border-gray-300 border-t-black rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-[240px_1fr] gap-8 mt-8">
      {/* Filter Sidebar */}
      <ProductFilterSidebar
        filters={filters}
        currentFilters={currentFilters}
        onFilterChange={handleFilterChange}
        brandSlug={brandSlug}
      />

      {/* Main Content */}
      <div className="min-h-[800px]">
        {/* Sort Bar */}
        <ProductSortBar
          totalCount={totalCount}
          currentView={currentFilters.view}
          currentSort={currentFilters.sort}
          brandSlug={brandSlug}
        />

        {/* Product Grid */}
        <ProductGrid
          products={products}
          viewMode={currentFilters.view}
          loading={loading}
        />

        {/* Pagination */}
        {totalCount > 0 && (
          <div className="flex justify-center items-center gap-1 mt-10 py-5">
            <button
              disabled={currentFilters.page <= 1}
              className="min-w-[36px] h-9 px-3 border border-gray-300 bg-white rounded font-sm flex items-center justify-center transition-all hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              ←
            </button>
            
            {/* Page numbers */}
            {Array.from({ length: Math.min(5, Math.ceil(totalCount / 20)) }, (_, i) => i + 1).map(page => (
              <button
                key={page}
                className={`min-w-[36px] h-9 px-3 border rounded font-sm flex items-center justify-center transition-all ${
                  page === currentFilters.page
                    ? 'bg-black text-white border-black'
                    : 'border-gray-300 bg-white hover:bg-gray-50'
                }`}
              >
                {page}
              </button>
            ))}

            <span className="mx-3">...</span>
            
            <button className="min-w-[36px] h-9 px-3 border border-gray-300 bg-white rounded font-sm flex items-center justify-center">
              {Math.ceil(totalCount / 20)}
            </button>
            
            <button
              disabled={currentFilters.page >= Math.ceil(totalCount / 20)}
              className="min-w-[36px] h-9 px-3 border border-gray-300 bg-white rounded font-sm flex items-center justify-center transition-all hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              →
            </button>
          </div>
        )}
      </div>
    </div>
  );
}