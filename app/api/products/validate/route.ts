import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { skus } = await request.json()
    
    if (!skus || !Array.isArray(skus)) {
      return NextResponse.json(
        { success: false, error: 'SKU 목록이 필요합니다' },
        { status: 400 }
      )
    }

    // Mock product validation data
    const mockProductData: Record<string, any> = {
      'TTL-BLT-BK-2025': {
        id: 'cme3ltyne0012myiyu0st08b5',
        name: '스트레치 벨트',
        brandName: 'K-패션',
        basePrice: 68000,
        inventory: 100,
        imageUrl: '/placeholder.svg',
        minOrderQty: 1,
        maxOrderQty: 1000
      },
      'CTN-TS-WH-2025': {
        id: 'prod-2',
        name: '코튼 티셔츠',
        brandName: '프리미엄 브랜드',
        basePrice: 85000,
        inventory: 50,
        imageUrl: '/placeholder.svg',
        minOrderQty: 5,
        maxOrderQty: 500
      },
      'GLF-HAT-NV-2025': {
        id: 'prod-3',
        name: '골프 모자',
        brandName: '골프웨어',
        basePrice: 45000,
        inventory: 25,
        imageUrl: '/placeholder.svg',
        minOrderQty: 2,
        maxOrderQty: 200
      }
    }

    // Filter products that exist
    const products: Record<string, any> = {}
    skus.forEach((sku: string) => {
      if (mockProductData[sku]) {
        products[sku] = mockProductData[sku]
      }
    })

    return NextResponse.json({
      success: true,
      products,
      message: `${Object.keys(products).length}개 상품이 검증되었습니다`
    })
  } catch (error) {
    console.error('Product validation error:', error)
    return NextResponse.json(
      { success: false, error: '상품 검증에 실패했습니다' },
      { status: 500 }
    )
  }
}