import { NextRequest, NextResponse } from 'next/server'

// Mock 데이터 - 데이터베이스 연결 실패 시 사용
export const mockProducts = [
  {
    id: "mock-1",
    sku: "TTL-PLO-NV-2025",
    nameKo: "투어라인 폴로셔츠",
    nameCn: "巡回赛POLO衫",
    brandName: "K-패션",
    category: "남성/상의/폴로",
    basePrice: 89000,
    discountPrice: 75000,
    discountRate: 15,
    imageUrl: "/placeholder.svg",
    minOrderQty: 5,
    isNew: true,
    isBestSeller: false,
    colors: ["네이비", "화이트", "블랙"],
    sizes: ["M", "L", "XL"],
    stock: 150,
    inventory: 150
  },
  {
    id: "mock-2",
    sku: "TTL-JKT-BK-2025",
    nameKo: "윈드브레이커 자켓",
    nameCn: "防风夹克",
    brandName: "K-패션",
    category: "남성/아우터/자켓",
    basePrice: 158000,
    discountPrice: 135000,
    discountRate: 15,
    imageUrl: "/placeholder.svg",
    minOrderQty: 3,
    isNew: false,
    isBestSeller: true,
    colors: ["블랙", "네이비"],
    sizes: ["M", "L", "XL", "XXL"],
    stock: 80,
    inventory: 80
  },
  {
    id: "mock-3",
    sku: "TTL-PNT-GR-2025",
    nameKo: "스트레치 팬츠",
    nameCn: "弹力裤",
    brandName: "K-패션",
    category: "남성/하의/팬츠",
    basePrice: 98000,
    discountPrice: 83000,
    discountRate: 15,
    imageUrl: "/placeholder.svg",
    minOrderQty: 5,
    isNew: false,
    isBestSeller: false,
    colors: ["그레이", "블랙", "베이지"],
    sizes: ["30", "32", "34", "36"],
    stock: 120,
    inventory: 120
  }
]

export function getMockProductsResponse(page: number = 1, limit: number = 10) {
  const startIndex = (page - 1) * limit
  const endIndex = startIndex + limit
  const paginatedProducts = mockProducts.slice(startIndex, endIndex)

  return {
    data: {
      products: paginatedProducts,
      totalCount: mockProducts.length
    },
    meta: {
      page,
      limit,
      totalItems: mockProducts.length,
      totalPages: Math.ceil(mockProducts.length / limit)
    }
  }
}