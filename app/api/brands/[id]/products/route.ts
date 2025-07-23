import { NextRequest } from 'next/server'

// Mock products data
const mockProducts = [
  {
    id: 'prod-1',
    name: '클래식 셔츠',
    description: '고급 코튼 소재의 클래식 셔츠',
    price: 89000,
    image: 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=300&h=300&fit=crop',
    category: '상의',
    stock: 50,
    status: 'ACTIVE',
    brandId: 'brand-1'
  },
  {
    id: 'prod-2',
    name: '데님 자켓',
    description: '빈티지 스타일의 데님 자켓',
    price: 129000,
    image: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=300&h=300&fit=crop',
    category: '아우터',
    stock: 30,
    status: 'ACTIVE',
    brandId: 'brand-1'
  },
  {
    id: 'prod-3',
    name: '스키니 진',
    description: '편안한 착용감의 스키니 진',
    price: 79000,
    image: 'https://images.unsplash.com/photo-1542272604-787c3835535d?w=300&h=300&fit=crop',
    category: '하의',
    stock: 25,
    status: 'ACTIVE',
    brandId: 'brand-1'
  },
  {
    id: 'prod-4',
    name: '한복 원피스',
    description: '전통과 현대가 만난 한복 원피스',
    price: 159000,
    image: 'https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?w=300&h=300&fit=crop',
    category: '드레스',
    stock: 20,
    status: 'ACTIVE',
    brandId: 'brand-2'
  },
  {
    id: 'prod-5',
    name: '개량 한복 자켓',
    description: '현대적으로 재해석한 한복 자켓',
    price: 189000,
    image: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=300&h=300&fit=crop',
    category: '아우터',
    stock: 15,
    status: 'ACTIVE',
    brandId: 'brand-2'
  },
  {
    id: 'prod-6',
    name: '어반 후드티',
    description: '도시적 감성의 편안한 후드티',
    price: 69000,
    image: 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=300&h=300&fit=crop',
    category: '상의',
    stock: 45,
    status: 'ACTIVE',
    brandId: 'brand-3'
  },
  {
    id: 'prod-7',
    name: '스트릿 조거팬츠',
    description: '활동적인 스트릿 스타일 조거팬츠',
    price: 79000,
    image: 'https://images.unsplash.com/photo-1473966968600-fa801b869a1a?w=300&h=300&fit=crop',
    category: '하의',
    stock: 35,
    status: 'ACTIVE',
    brandId: 'brand-3'
  }
]

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const brandId = params.id
    
    // Filter products by brand ID
    const brandProducts = mockProducts.filter(product => product.brandId === brandId)

    return Response.json(brandProducts)
  } catch (error) {
    console.error('Brand products fetch error:', error)
    return Response.json(
      { error: { message: 'Failed to fetch brand products' } },
      { status: 500 }
    )
  }
}