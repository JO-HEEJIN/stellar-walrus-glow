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
      story: {
        title: '브랜드 스토리',
        content: `${brand.nameKo}는 골프 역사와 함께해온 프리미엄 브랜드입니다.\n프로 골퍼들이 선택하는 최고급 골프 용품과 의류를 제공하며, 뛰어난 품질과 성능으로 골퍼들의 사랑을 받고 있습니다.\n\n혁신적인 기술과 전통적인 장인정신의 결합으로 골프의 진정한 가치를 전달합니다.`,
        highlights: [
          { icon: '🏆', label: 'PGA 투어 사용률', value: '#1 골프 브랜드' },
          { icon: '🌍', label: '글로벌 진출', value: '120개국 이상' },
          { icon: '⭐', label: '품질 인증', value: 'ISO 9001 인증' }
        ]
      }
    };

    return NextResponse.json({ data: brandData });
  } catch (error) {
    return createErrorResponse(error as Error, request.url);
  }
}