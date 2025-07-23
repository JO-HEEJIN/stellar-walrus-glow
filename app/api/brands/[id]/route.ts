import { NextRequest } from 'next/server'
// import { z } from 'zod'
// import { prisma } from '@/lib/prisma'

// Mock data for brands
const mockBrands = [
  {
    id: 'brand-1',
    name: 'test-brand',
    description: '테스트 브랜드입니다. 고품질의 의류를 제공합니다.',
    logo: 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=100&h=100&fit=crop',
    website: 'https://test-brand.com',
    contact: {
      email: 'contact@test-brand.com',
      phone: '02-123-4567',
      address: '서울시 강남구 테스트로 123'
    },
    stats: {
      totalProducts: 15,
      totalOrders: 123,
      monthlyRevenue: 2500000
    }
  },
  {
    id: 'brand-2',
    name: 'K-Fashion',
    description: '한국 전통 패션을 현대적으로 재해석한 브랜드',
    logo: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=100&h=100&fit=crop',
    website: 'https://k-fashion.com',
    contact: {
      email: 'info@k-fashion.com',
      phone: '02-987-6543',
      address: '서울시 종로구 패션로 456'
    },
    stats: {
      totalProducts: 28,
      totalOrders: 256,
      monthlyRevenue: 4200000
    }
  },
  {
    id: 'brand-3',
    name: 'Urban Style',
    description: '도시적이고 세련된 스타일의 캐주얼 브랜드',
    logo: 'https://images.unsplash.com/photo-1555529669-e69e7aa0ba9a?w=100&h=100&fit=crop',
    website: 'https://urban-style.com',
    contact: {
      email: 'hello@urban-style.com',
      phone: '02-555-7890',
      address: '서울시 마포구 어반로 789'
    },
    stats: {
      totalProducts: 42,
      totalOrders: 389,
      monthlyRevenue: 6800000
    }
  }
]


export async function GET(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const brandId = params.id
    const brand = mockBrands.find(b => b.id === brandId)

    if (!brand) {
      return Response.json(
        { error: { message: 'Brand not found' } },
        { status: 404 }
      )
    }

    return Response.json(brand)
  } catch (error) {
    console.error('Brand fetch error:', error)
    return Response.json(
      { error: { message: 'Failed to fetch brand' } },
      { status: 500 }
    )
  }
}