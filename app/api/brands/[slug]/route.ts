import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { createErrorResponse } from '@/lib/errors';

export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const brand = await prisma.brand.findFirst({
      where: { 
        OR: [
          { slug: params.slug },
          { nameKo: { contains: params.slug } }
        ]
      }
    });

    if (!brand) {
      return NextResponse.json(
        { error: 'Brand not found' },
        { status: 404 }
      );
    }

    // Get brand statistics
    const products = await prisma.product.findMany({
      where: { 
        brandId: brand.id,
        status: 'ACTIVE'
      },
      select: {
        rating: true,
        soldCount: true
      }
    });

    const averageRating = products.length > 0 
      ? products.reduce((sum, p) => sum + Number(p.rating), 0) / products.length 
      : 0;

    const totalOrders = products.reduce((sum, p) => sum + p.soldCount, 0);

    // Get product count
    const productCount = await prisma.product.count({
      where: { 
        brandId: brand.id,
        status: 'ACTIVE'
      }
    });

    const brandData = {
      id: brand.id,
      slug: brand.slug || brand.nameKo.toLowerCase(),
      name: brand.nameKo, // Use Korean name as primary name
      nameKo: brand.nameKo,
      description: brand.description,
      logoUrl: brand.logoUrl,
      tagline: brand.description || `${brand.nameKo} - 프리미엄 골프 브랜드`,
      stats: {
        productCount,
        averageRating: Math.round(averageRating * 10) / 10,
        totalOrders,
        foundedYear: 1932 // Default founded year
      },
      story: brand.description ? {
        title: '브랜드 스토리',
        content: brand.description,
        highlights: [
          { icon: '🏆', label: '브랜드 평점', value: `${Math.round(averageRating * 10) / 10}점` },
          { icon: '🌍', label: '등록 상품', value: `${productCount}개` },
          { icon: '⭐', label: '누적 판매', value: `${totalOrders.toLocaleString()}개` }
        ]
      } : null
    };

    return NextResponse.json({ data: brandData });
  } catch (error) {
    return createErrorResponse(error as Error, request.url);
  }
}