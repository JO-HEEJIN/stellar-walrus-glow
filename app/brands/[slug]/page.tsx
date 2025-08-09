import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { BrandHeader } from '@/components/brands/BrandHeader';
import { BrandNavigation } from '@/components/brands/BrandNavigation';
import { BrandProductList } from '@/components/brands/BrandProductList';
import { BrandStory } from '@/components/brands/BrandStory';

interface Brand {
  id: string;
  slug: string;
  name: string;
  nameKo: string;
  description?: string;
  logoUrl?: string;
  tagline?: string;
  stats: {
    productCount: number;
    averageRating: number;
    totalOrders: number;
    foundedYear: number;
  };
  story?: {
    title: string;
    content: string;
    highlights: Array<{
      icon: string;
      label: string;
      value: string;
    }>;
  };
}

async function getBrand(slug: string): Promise<Brand | null> {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/brands/${slug}`,
      { cache: 'no-store' }
    );

    if (!response.ok) {
      return null;
    }

    const data = await response.json();
    return data.data;
  } catch (error) {
    console.error('Error fetching brand:', error);
    return null;
  }
}

export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Promise<Metadata> {
  const brand = await getBrand(params.slug);

  if (!brand) {
    return {
      title: 'Brand Not Found',
    };
  }

  return {
    title: `${brand.nameKo} - GOLF B2B`,
    description: brand.description || `${brand.nameKo} 브랜드 상품 목록`,
    openGraph: {
      title: brand.nameKo,
      description: brand.description || brand.tagline,
      images: [brand.logoUrl || ''],
    },
  };
}

interface BrandPageProps {
  params: { slug: string };
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
    section?: 'products' | 'story';
  };
}

export default async function BrandPage({ params, searchParams }: BrandPageProps) {
  const brand = await getBrand(params.slug);

  if (!brand) {
    notFound();
  }

  const currentSection = searchParams.section || 'products';

  return (
    <div className="min-h-screen bg-white">
      {/* Brand Header */}
      <BrandHeader brand={brand} />
      
      {/* Brand Navigation */}
      <BrandNavigation 
        currentSection={currentSection}
        brandSlug={params.slug}
      />

      <div className="max-w-[1280px] mx-auto px-5 pb-16">
        {/* Brand Story Section */}
        {currentSection === 'story' && brand.story && (
          <BrandStory story={brand.story} />
        )}

        {/* Products Section */}
        {currentSection === 'products' && (
          <BrandProductList
            brandId={brand.id}
            brandSlug={params.slug}
            searchParams={searchParams}
          />
        )}
      </div>
    </div>
  );
}