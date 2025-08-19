import { NextRequest, NextResponse } from 'next/server'
import { prismaWrite } from '@/lib/prisma-load-balanced'
import { createErrorResponse, BusinessError, ErrorCodes, HttpStatus } from '@/lib/errors'

/**
 * @swagger
 * /api/products/import:
 *   post:
 *     summary: Import products from CSV data
 *     description: Bulk import products from formatted data
 *     tags: [Products]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               products:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     SKU:
 *                       type: string
 *                     Name_KO:
 *                       type: string
 *                     Name_CN:
 *                       type: string
 *                     Description_KO:
 *                       type: string
 *                     Description_CN:
 *                       type: string
 *                     Base_Price:
 *                       type: string
 *                     Inventory:
 *                       type: string
 *                     Material:
 *                       type: string
 *                     Care_Instructions:
 *                       type: string
 *                     Brand_ID:
 *                       type: string
 *                     Category_ID:
 *                       type: string
 *                     Status:
 *                       type: string
 *                     Weight:
 *                       type: string
 *                     Length:
 *                       type: string
 *                     Width:
 *                       type: string
 *                     Height:
 *                       type: string
 *                     Meta_Title:
 *                       type: string
 *                     Meta_Description:
 *                       type: string
 *                     Meta_Keywords:
 *                       type: string
 *                     Tags:
 *                       type: string
 *                     Features:
 *                       type: string
 *     responses:
 *       200:
 *         description: Products imported successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     imported:
 *                       type: number
 *                     failed:
 *                       type: number
 *                     errors:
 *                       type: array
 *                       items:
 *                         type: string
 *       400:
 *         description: Invalid request data
 *       401:
 *         description: Unauthorized
 */
export async function POST(request: NextRequest) {
  try {
    console.log('🔄 Starting product import...')

    // For development mode, check if auth is skipped
    if (process.env.NODE_ENV === 'development' || process.env.NEXT_PUBLIC_SKIP_AUTH === 'true') {
      console.log('🔧 Development mode: skipping auth check for import')
    } else {
      // TODO: Add proper authentication check
      // const session = await getServerSession(authOptions)
      // if (!session || !['BRAND_ADMIN', 'MASTER_ADMIN'].includes(session.user.role)) {
      //   return createErrorResponse(ErrorCodes.UNAUTHORIZED, HttpStatus.UNAUTHORIZED)
      // }
    }

    const body = await request.json()
    const { products } = body

    if (!products || !Array.isArray(products)) {
      return createErrorResponse(
        new BusinessError(ErrorCodes.VALIDATION_ERROR, HttpStatus.BAD_REQUEST, 'Products array is required'),
        request.url
      )
    }

    console.log(`📦 Processing ${products.length} products for import`)

    const results = {
      imported: 0,
      failed: 0,
      errors: [] as string[]
    }

    // Process each product
    for (const [index, productData] of products.entries()) {
      try {
        // Transform CSV data to database format
        const transformedProduct = {
          sku: productData.SKU?.trim(),
          nameKo: productData.Name_KO?.trim(),
          nameCn: productData.Name_CN?.trim() || null,
          descriptionKo: productData.Description_KO?.trim() || null,
          descriptionCn: productData.Description_CN?.trim() || null,
          basePrice: parseFloat(productData.Base_Price) || 0,
          inventory: parseInt(productData.Inventory) || 0,
          material: productData.Material?.trim() || null,
          careInstructions: productData.Care_Instructions?.trim() || null,
          brandId: productData.Brand_ID?.trim(),
          categoryId: productData.Category_ID?.trim() || null,
          status: productData.Status?.trim() || 'ACTIVE',
          weight: productData.Weight ? parseFloat(productData.Weight) : null,
          length: productData.Length ? parseFloat(productData.Length) : null,
          width: productData.Width ? parseFloat(productData.Width) : null,
          height: productData.Height ? parseFloat(productData.Height) : null,
          metaTitle: productData.Meta_Title?.trim() || null,
          metaDescription: productData.Meta_Description?.trim() || null,
          metaKeywords: productData.Meta_Keywords?.trim() || null,
          tags: productData.Tags ? productData.Tags.split(';').map((t: string) => t.trim()).filter(Boolean) : [],
          features: productData.Features ? productData.Features.split(';').map((f: string) => f.trim()).filter(Boolean) : [],
        }

        // Basic validation
        if (!transformedProduct.sku) {
          results.failed++
          results.errors.push(`Row ${index + 1}: SKU is required`)
          continue
        }

        if (!transformedProduct.nameKo) {
          results.failed++
          results.errors.push(`Row ${index + 1}: Korean name is required`)
          continue
        }

        if (!transformedProduct.brandId) {
          results.failed++
          results.errors.push(`Row ${index + 1}: Brand ID is required`)
          continue
        }

        if (transformedProduct.basePrice < 100) {
          results.failed++
          results.errors.push(`Row ${index + 1}: Price must be at least 100`)
          continue
        }

        // For development mode, use mock creation
        if (process.env.NODE_ENV === 'development') {
          console.log(`✅ Mock: Created product ${transformedProduct.sku}`)
          results.imported++
        } else {
          // Check if SKU already exists
          const existingProduct = await prismaWrite.product.findFirst({
            where: { sku: transformedProduct.sku }
          })

          if (existingProduct) {
            results.failed++
            results.errors.push(`Row ${index + 1}: SKU '${transformedProduct.sku}' already exists`)
            continue
          }

          // Create the product
          await prismaWrite.product.create({
            data: {
              ...transformedProduct,
              createdAt: new Date(),
              updatedAt: new Date()
            }
          })

          console.log(`✅ Created product: ${transformedProduct.sku}`)
          results.imported++
        }

      } catch (productError: any) {
        console.error(`❌ Error creating product at row ${index + 1}:`, productError)
        results.failed++
        results.errors.push(`Row ${index + 1}: ${productError.message || 'Unknown error'}`)
      }
    }

    console.log(`📊 Import results: ${results.imported} imported, ${results.failed} failed`)

    return NextResponse.json({
      success: true,
      data: results
    })

  } catch (error: any) {
    console.error('❌ Product import error:', error)
    return createErrorResponse(
      new BusinessError(ErrorCodes.INTERNAL_ERROR, HttpStatus.INTERNAL_SERVER_ERROR, error.message || 'Import failed'),
      request.url
    )
  }
}