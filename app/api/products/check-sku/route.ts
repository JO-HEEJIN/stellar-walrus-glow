import { NextRequest, NextResponse } from 'next/server'
import { prismaRead } from '@/lib/prisma-load-balanced'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const sku = searchParams.get('sku')
    const excludeId = searchParams.get('excludeId')

    if (!sku || sku.trim().length < 2) {
      return NextResponse.json({ 
        available: false, 
        message: 'SKU는 최소 2글자 이상이어야 합니다.' 
      })
    }

    // For development mode, use mock check
    if (process.env.NODE_ENV === 'development') {
      // Mock some unavailable SKUs for testing
      const unavailableSkus = ['TEST-001', 'DEMO-001', 'SAMPLE-001']
      const isAvailable = !unavailableSkus.includes(sku.toUpperCase())
      
      return NextResponse.json({
        available: isAvailable,
        message: isAvailable 
          ? '사용 가능한 SKU입니다' 
          : '이미 사용 중인 SKU입니다'
      })
    }

    // Check SKU uniqueness in database
    const whereClause: any = {
      sku: {
        equals: sku,
        mode: 'insensitive'
      }
    }

    // Exclude current product if editing
    if (excludeId) {
      whereClause.id = {
        not: excludeId
      }
    }

    const existingProduct = await prismaRead.product.findFirst({
      where: whereClause,
      select: { id: true, sku: true }
    })

    const isAvailable = !existingProduct

    return NextResponse.json({
      available: isAvailable,
      message: isAvailable 
        ? '사용 가능한 SKU입니다' 
        : '이미 사용 중인 SKU입니다'
    })

  } catch (error) {
    console.error('SKU 중복 체크 오류:', error)
    return NextResponse.json(
      { 
        available: null, 
        message: 'SKU 확인 중 오류가 발생했습니다' 
      },
      { status: 500 }
    )
  }
}