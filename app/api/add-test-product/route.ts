import { NextRequest, NextResponse } from 'next/server'
import { getDatabase } from '@/lib/db/adapter'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    const db = getDatabase()
    
    // Add a simple test product
    const testProduct = await db.createProduct({
      name: '테스트 상품 ' + Date.now(),
      description: '테스트용 상품 설명입니다.',
      price: 29900,
      sku: 'TEST-' + Date.now(),
      brandId: 'BRAND_001',
      categoryId: 'CAT_001',
      imageUrl: 'https://via.placeholder.com/300x300',
      stock: 100
    })

    // Check if it was added
    const count = await db.rawQuery('SELECT COUNT(*) as count FROM Product', [])
    const allProducts = await db.rawQuery('SELECT * FROM Product ORDER BY createdAt DESC LIMIT 3', [])

    return NextResponse.json({
      success: true,
      message: '테스트 상품이 추가되었습니다.',
      testProduct,
      verification: {
        totalProducts: count.rows[0]?.count || 0,
        recentProducts: allProducts.rows
      }
    })
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined
    }, { status: 500 })
  }
}