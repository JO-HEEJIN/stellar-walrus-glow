import { NextRequest, NextResponse } from 'next/server'
import { getDatabase } from '@/lib/db/adapter'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const db = getDatabase()
    
    // Test 1: Simple query without any conditions
    const simpleQuery = await db.rawQuery('SELECT COUNT(*) as count FROM \\`Product\\`', [])
    
    // Test 2: Get first 5 products
    const products = await db.rawQuery('SELECT * FROM \\`Product\\` LIMIT 5', [])
    
    // Test 3: Check table structure
    const columns = await db.rawQuery('SHOW COLUMNS FROM \\`Product\\`', [])
    
    // Test 4: Try with adapter method
    const adapterProducts = await db.getProducts({ limit: 5 })
    
    return NextResponse.json({
      success: true,
      tests: {
        productCount: simpleQuery.rows[0]?.count || 0,
        firstFiveProducts: products.rows,
        tableColumns: columns.rows,
        adapterProducts: adapterProducts,
        rawQueryResult: simpleQuery,
        databaseInfo: {
          cacheStats: db.getCacheStats()
        }
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