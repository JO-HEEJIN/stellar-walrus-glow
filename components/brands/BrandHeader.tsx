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
    <div className="bg-gradient-to-br from-indigo-900 to-indigo-600 text-white py-16 mb-10">
      <div className="max-w-[1280px] mx-auto px-5">
        <div className="grid grid-cols-[200px_1fr_auto] gap-10 items-center">
          {/* Brand Logo */}
          <div className="w-[200px] h-[100px] bg-white rounded-lg flex items-center justify-center">
            {brand.logoUrl ? (
              <Image
                src={brand.logoUrl}
                alt={brand.nameKo}
                width={180}
                height={80}
                className="object-contain"
              />
            ) : (
              <div className="text-2xl font-black text-black">
                {brand.name.toUpperCase()}
              </div>
            )}
          </div>

          {/* Brand Info */}
          <div>
            <h1 className="text-4xl font-black mb-3">{brand.name}</h1>
            <p className="text-base opacity-90 mb-5">
              {brand.tagline || `${brand.nameKo} - 프리미엄 골프 브랜드`}
            </p>
            
            <div className="flex gap-8">
              <div className="text-center">
                <div className="text-2xl font-bold">
                  {brand.stats.productCount}
                </div>
                <div className="text-xs opacity-80">등록 상품</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">
                  {brand.stats.averageRating}
                </div>
                <div className="text-xs opacity-80">평균 평점</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">
                  {brand.stats.totalOrders.toLocaleString()}
                </div>
                <div className="text-xs opacity-80">누적 주문</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">
                  Since {brand.stats.foundedYear}
                </div>
                <div className="text-xs opacity-80">브랜드 역사</div>
              </div>
            </div>
          </div>

          {/* Brand Actions */}
          <div className="flex flex-col gap-3">
            <button
              onClick={handleFollow}
              className={`px-8 py-3 rounded-full font-semibold transition-all hover:scale-105 ${
                isFollowing
                  ? 'bg-green-500 text-white'
                  : 'bg-white text-indigo-900'
              }`}
            >
              {isFollowing ? '팔로잉 중' : '브랜드 팔로우'}
            </button>
            <button
              onClick={handleCatalogDownload}
              className="px-8 py-3 bg-transparent border-2 border-white text-white rounded-full font-semibold transition-all hover:scale-105"
            >
              카탈로그 다운로드
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}