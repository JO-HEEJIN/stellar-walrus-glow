'use client';

import { useState } from 'react';
import Image from 'next/image';

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
}

interface BrandHeaderProps {
  brand: Brand;
}

export function BrandHeader({ brand }: BrandHeaderProps) {
  const [isFollowing, setIsFollowing] = useState(false);

  const handleFollow = () => {
    setIsFollowing(!isFollowing);
    if (!isFollowing) {
      alert('브랜드를 팔로우했습니다. 신상품 알림을 받으실 수 있습니다.');
    }
  };

  const handleCatalogDownload = () => {
    alert(`${brand.nameKo} 2025 S/S 카탈로그를 다운로드합니다.`);
  };

  return (
    <div className="bg-white border-b border-gray-200 py-10">
      <div className="max-w-[1280px] mx-auto px-5">
        <div className="grid grid-cols-[120px_1fr_auto] gap-8 items-start">
          {/* Brand Logo */}
          <div className="w-[120px] h-[120px] bg-gray-100 rounded-full flex items-center justify-center">
            {brand.logoUrl ? (
              <Image
                src={brand.logoUrl}
                alt={brand.nameKo}
                width={80}
                height={80}
                className="object-contain"
              />
            ) : (
              <div className="text-lg font-black text-black">
                {brand.name.slice(0, 2).toUpperCase()}
              </div>
            )}
          </div>

          {/* Brand Info */}
          <div>
            <h1 className="text-3xl font-black mb-2 text-black">{brand.name}</h1>
            <p className="text-gray-600 mb-6">
              {brand.tagline || `${brand.nameKo} - 프리미엄 골프 브랜드`}
            </p>
            
            {/* Brand Stats */}
            <div className="grid grid-cols-4 gap-8">
              <div className="text-center">
                <div className="text-2xl font-bold text-black">
                  {brand.stats.productCount}
                </div>
                <div className="text-sm text-gray-500">등록 상품</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-black">
                  {brand.stats.averageRating}
                </div>
                <div className="text-sm text-gray-500">평균 평점</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-black">
                  {brand.stats.totalOrders.toLocaleString()}
                </div>
                <div className="text-sm text-gray-500">누적 주문</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-black">
                  Since {brand.stats.foundedYear}
                </div>
                <div className="text-sm text-gray-500">브랜드 역사</div>
              </div>
            </div>
          </div>

          {/* Brand Actions */}
          <div className="flex flex-col gap-3">
            <button
              onClick={handleFollow}
              className={`px-6 py-2 rounded-lg font-medium transition-all ${
                isFollowing
                  ? 'bg-green-500 text-white'
                  : 'bg-black text-white hover:bg-gray-800'
              }`}
            >
              {isFollowing ? '팔로잉 중' : '브랜드 팔로우'}
            </button>
            <button
              onClick={handleCatalogDownload}
              className="px-6 py-2 bg-white border border-gray-300 text-black rounded-lg font-medium transition-all hover:bg-gray-50"
            >
              카탈로그 다운로드
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}