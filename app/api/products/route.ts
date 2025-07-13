import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
// import { prisma } from '@/lib/prisma' // TODO: uncomment when database is connected
import { rateLimiters, getIdentifier, rateLimitResponse } from '@/lib/rate-limit'

export async function GET(request: NextRequest) {
  try {
    // Check authentication
    const session = await auth()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get query parameters
    const searchParams = request.nextUrl.searchParams
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    // const skip = (page - 1) * limit // TODO: use for pagination when DB is connected

    // For now, return mock data since DB is not connected
    const mockProducts = [
      {
        id: '1',
        name: 'Premium K-Fashion Jacket',
        description: 'High-quality winter jacket',
        price: 89000,
        brandId: 'brand1',
        createdAt: new Date().toISOString(),
      },
      {
        id: '2',
        name: 'Designer Handbag',
        description: 'Luxury leather handbag',
        price: 120000,
        brandId: 'brand1',
        createdAt: new Date().toISOString(),
      },
    ]

    return NextResponse.json({
      products: mockProducts,
      pagination: {
        page,
        limit,
        total: mockProducts.length,
        totalPages: Math.ceil(mockProducts.length / limit),
      },
    })
  } catch (error) {
    console.error('Failed to fetch products:', error)
    return NextResponse.json(
      { error: 'Failed to fetch products' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const session = await auth()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check role - only BRAND_ADMIN and MASTER_ADMIN can create products
    if (!['BRAND_ADMIN', 'MASTER_ADMIN'].includes(session.user.role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Apply rate limiting for product creation
    try {
      const identifier = `${getIdentifier(request)}:${session.user.id}`
      const { success, limit, reset, remaining } = await rateLimiters.productCreate.limit(identifier)
      
      if (!success) {
        return rateLimitResponse(remaining, reset, limit)
      }
    } catch (error) {
      console.warn('Rate limiting not available:', error)
    }

    // Parse request body
    const body = await request.json()
    const { name, description, price, categoryId } = body
    // const { variants } = body // TODO: implement variants

    // Validate required fields
    if (!name || !price || !categoryId) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // For now, return mock created product since DB is not connected
    const mockProduct = {
      id: Date.now().toString(),
      name,
      description: description || '',
      price,
      categoryId,
      brandId: session.user.brandId || 'default',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    return NextResponse.json(mockProduct, { status: 201 })
  } catch (error) {
    console.error('Failed to create product:', error)
    return NextResponse.json(
      { error: 'Failed to create product' },
      { status: 500 }
    )
  }
}