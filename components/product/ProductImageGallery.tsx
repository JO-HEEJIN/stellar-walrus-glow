'use client';

import { useState } from 'react';
import Image from 'next/image';
import { ProductImage } from '@/types/product-detail';
import { cn } from '@/lib/utils';

interface ProductImageGalleryProps {
  images: ProductImage[];
  productName: string;
}

export function ProductImageGallery({ images, productName }: ProductImageGalleryProps) {
  const [selectedImage, setSelectedImage] = useState(0);

  return (
    <div className="sticky top-24">
      {/* Main Image */}
      <div className="relative aspect-[3/4] bg-gray-100 rounded-lg overflow-hidden mb-4">
        <Image
          src={images[selectedImage]?.url || '/placeholder.svg'}
          alt={images[selectedImage]?.alt || productName}
          fill
          className="object-cover"
          priority
        />
        <button className="absolute top-4 right-4 bg-white/90 p-2 rounded-full hover:bg-white transition-colors">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </button>
      </div>

      {/* Thumbnails */}
      <div className="grid grid-cols-5 gap-2">
        {images.map((image, index) => (
          <button
            key={image.id}
            onClick={() => setSelectedImage(index)}
            className={cn(
              "relative aspect-square bg-gray-100 rounded border-2 overflow-hidden transition-all",
              selectedImage === index
                ? "border-black"
                : "border-transparent hover:border-gray-400"
            )}
          >
            <Image
              src={image.url}
              alt={image.alt}
              fill
              className="object-cover"
            />
          </button>
        ))}
      </div>
    </div>
  );
}