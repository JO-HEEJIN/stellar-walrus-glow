import { NextRequest, NextResponse } from 'next/server'
import { prismaRead } from '@/lib/prisma-load-balanced'
import { createErrorResponse, BusinessError, ErrorCodes, HttpStatus } from '@/lib/errors'
import * as XLSX from 'xlsx'

/**
 * @swagger
 * /api/products/export:
 *   get:
 *     summary: Export products to CSV or Excel
 *     description: Export all products matching criteria to downloadable file
 *     tags: [Products]
 *     parameters:
 *       - in: query
 *         name: format
 *         schema:
 *           type: string
 *           enum: [csv, excel]
 *         description: Export format
 *       - in: query
 *         name: includeImages
 *         schema:
 *           type: boolean
 *         description: Include image URLs in export
 *       - in: query
 *         name: includeInactive
 *         schema:
 *           type: boolean
 *         description: Include inactive products
 *       - in: query
 *         name: brand
 *         schema:
 *           type: string
 *         description: Filter by brand ID
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *         description: Filter by category ID
 *     responses:
 *       200:
 *         description: Export file
 *         content:
 *           text/csv:
 *             schema:
 *               type: string
 *           application/vnd.openxmlformats-officedocument.spreadsheetml.sheet:
 *             schema:
 *               type: string
 *               format: binary
 *       400:
 *         description: Invalid request parameters
 *       401:
 *         description: Unauthorized
 */
export async function GET(request: NextRequest) {
  try {
    console.log('🔄 Starting product export...')

    // Parse query parameters
    const { searchParams } = new URL(request.url)
    const format = searchParams.get('format') || 'csv'
    const includeImages = searchParams.get('includeImages') === 'true'
    const includeInactive = searchParams.get('includeInactive') === 'true'
    const brandFilter = searchParams.get('brand')
    const categoryFilter = searchParams.get('category')

    // For development mode, check if auth is skipped
    if (process.env.NODE_ENV === 'development' || process.env.NEXT_PUBLIC_SKIP_AUTH === 'true') {
      console.log('🔧 Development mode: skipping auth check for export')
    } else {
      // TODO: Add proper authentication check
      // const session = await getServerSession(authOptions)
      // if (!session || !['BRAND_ADMIN', 'MASTER_ADMIN'].includes(session.user.role)) {
      //   return createErrorResponse(ErrorCodes.UNAUTHORIZED, HttpStatus.UNAUTHORIZED)
      // }
    }

    console.log(`📊 Export parameters: format=${format}, includeImages=${includeImages}, includeInactive=${includeInactive}`)

    let products: any[] = []

    if (process.env.NODE_ENV === 'development') {
      // Mock data for development
      products = [
        {
          id: '1',
          sku: 'SAMPLE-001',
          nameKo: '샘플 상품 1',
          nameCn: '样品商品 1',
          descriptionKo: '이것은 샘플 상품입니다',
          descriptionCn: '这是一个样品商品',
          basePrice: 50000,
          inventory: 100,
          material: '면 100%',
          careInstructions: '세탁기 사용 가능',
          brandId: 'brand-1',
          categoryId: 'category-1',
          status: 'ACTIVE',
          weight: 500,
          length: 30,
          width: 25,
          height: 2,
          metaTitle: '샘플 상품 - 고품질',
          metaDescription: '고품질 샘플 상품입니다',
          metaKeywords: '샘플,상품,고품질',
          tags: ['편안함', '내구성'],
          features: ['고품질 소재', '세련된 디자인'],
          imageUrl: includeImages ? 'https://example.com/image1.jpg' : null,
          images: includeImages ? ['https://example.com/image1.jpg', 'https://example.com/image2.jpg'] : [],
          brand: { nameKo: '샘플 브랜드' },
          category: { name: '샘플 카테고리' },
          createdAt: new Date('2024-01-01'),
          updatedAt: new Date('2024-01-01')
        },
        {
          id: '2',
          sku: 'SAMPLE-002',
          nameKo: '샘플 상품 2',
          nameCn: '样品商品 2',
          descriptionKo: '또 다른 샘플 상품입니다',
          descriptionCn: '另一个样品商品',
          basePrice: 75000,
          inventory: 50,
          material: '폴리에스터 100%',
          careInstructions: '드라이클리닝',
          brandId: 'brand-1',
          categoryId: 'category-2',
          status: 'ACTIVE',
          weight: 300,
          length: 20,
          width: 15,
          height: 1,
          metaTitle: '샘플 상품 2 - 실용적',
          metaDescription: '실용적인 샘플 상품',
          metaKeywords: '샘플,제품,실용적',
          tags: ['실용성', '경량'],
          features: ['가벼운 무게', '실용적 디자인'],
          imageUrl: includeImages ? 'https://example.com/image3.jpg' : null,
          images: includeImages ? ['https://example.com/image3.jpg'] : [],
          brand: { nameKo: '샘플 브랜드' },
          category: { name: '다른 카테고리' },
          createdAt: new Date('2024-01-02'),
          updatedAt: new Date('2024-01-02')
        }
      ]
      console.log('📦 Using mock data for export')
    } else {
      // Build where clause for filtering
      const whereClause: any = {}
      
      if (!includeInactive) {
        whereClause.status = { not: 'INACTIVE' }
      }
      
      if (brandFilter) {
        whereClause.brandId = brandFilter
      }
      
      if (categoryFilter) {
        whereClause.categoryId = categoryFilter
      }

      // Fetch products from database
      products = await prismaRead.product.findMany({
        where: whereClause,
        include: {
          brand: {
            select: { nameKo: true, nameCn: true }
          },
          category: {
            select: { name: true }
          }
        },
        orderBy: { createdAt: 'desc' }
      })
    }

    console.log(`📦 Found ${products.length} products to export`)

    if (products.length === 0) {
      return createErrorResponse(
        new BusinessError(ErrorCodes.NOT_FOUND, HttpStatus.NOT_FOUND, 'No products found matching criteria'),
        request.url
      )
    }

    // Prepare CSV headers
    const headers = [
      'SKU',
      'Name_KO',
      'Name_CN',
      'Description_KO',
      'Description_CN',
      'Base_Price',
      'Inventory',
      'Material',
      'Care_Instructions',
      'Brand_ID',
      'Brand_Name',
      'Category_ID',
      'Category_Name',
      'Status',
      'Weight',
      'Length',
      'Width',
      'Height',
      'Meta_Title',
      'Meta_Description',
      'Meta_Keywords',
      'Tags',
      'Features',
      'Created_At',
      'Updated_At'
    ]

    if (includeImages) {
      headers.push('Thumbnail_Image', 'Gallery_Images')
    }

    // Convert products to CSV rows
    const csvRows = products.map(product => {
      const row = [
        product.sku || '',
        product.nameKo || '',
        product.nameCn || '',
        product.descriptionKo || '',
        product.descriptionCn || '',
        product.basePrice || 0,
        product.inventory || 0,
        product.material || '',
        product.careInstructions || '',
        product.brandId || '',
        product.brand?.nameKo || '',
        product.categoryId || '',
        product.category?.name || '',
        product.status || 'ACTIVE',
        product.weight || '',
        product.length || '',
        product.width || '',
        product.height || '',
        product.metaTitle || '',
        product.metaDescription || '',
        product.metaKeywords || '',
        Array.isArray(product.tags) ? product.tags.join(';') : '',
        Array.isArray(product.features) ? product.features.join(';') : '',
        product.createdAt ? new Date(product.createdAt).toISOString().split('T')[0] : '',
        product.updatedAt ? new Date(product.updatedAt).toISOString().split('T')[0] : ''
      ]

      if (includeImages) {
        row.push(
          product.imageUrl || product.thumbnailImage || '',
          Array.isArray(product.images) ? product.images.join(';') : ''
        )
      }

      return row
    })

    // Generate CSV content
    const csvContent = [
      headers.join(','),
      ...csvRows.map(row => row.map(cell => {
        // Escape commas and quotes in CSV
        const cellStr = String(cell)
        if (cellStr.includes(',') || cellStr.includes('"') || cellStr.includes('\n')) {
          return `"${cellStr.replace(/"/g, '""')}"`
        }
        return cellStr
      }).join(','))
    ].join('\n')

    if (format === 'excel') {
      // Create Excel workbook
      const ws = XLSX.utils.aoa_to_sheet([headers, ...csvRows])
      const wb = XLSX.utils.book_new()
      XLSX.utils.book_append_sheet(wb, ws, 'Products')
      
      // Generate Excel buffer
      const excelBuffer = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' })
      
      return new NextResponse(excelBuffer, {
        status: 200,
        headers: {
          'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
          'Content-Disposition': `attachment; filename="products-export-${new Date().toISOString().split('T')[0]}.xlsx"`,
        }
      })
    } else {
      // Return CSV
      return new NextResponse(csvContent, {
        status: 200,
        headers: {
          'Content-Type': 'text/csv; charset=utf-8',
          'Content-Disposition': `attachment; filename="products-export-${new Date().toISOString().split('T')[0]}.csv"`,
        }
      })
    }

  } catch (error: any) {
    console.error('❌ Product export error:', error)
    return createErrorResponse(
      new BusinessError(ErrorCodes.INTERNAL_ERROR, HttpStatus.INTERNAL_SERVER_ERROR, error.message || 'Export failed'),
      request.url
    )
  }
}