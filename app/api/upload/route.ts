import { NextRequest, NextResponse } from 'next/server'
import { uploadToS3, generateS3Key } from '@/lib/s3'
import { createErrorResponse, BusinessError, ErrorCodes, HttpStatus } from '@/lib/errors'

export const runtime = 'nodejs'
export const maxDuration = 60 // 60 seconds timeout for uploads

// Maximum file size: 5MB
const MAX_FILE_SIZE = 5 * 1024 * 1024

// Allowed file types
const ALLOWED_MIME_TYPES = [
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp',
  'image/gif',
]

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const token = request.cookies.get('auth-token')?.value
    if (!token) {
      throw new BusinessError(
        ErrorCodes.AUTHENTICATION_REQUIRED,
        HttpStatus.UNAUTHORIZED
      )
    }

    // Verify token and check role
    const jwt = await import('jsonwebtoken')
    let userInfo
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key') as any
      userInfo = decoded
      
      // Only BRAND_ADMIN and MASTER_ADMIN can upload
      if (userInfo.role !== 'BRAND_ADMIN' && userInfo.role !== 'MASTER_ADMIN') {
        throw new BusinessError(
          ErrorCodes.AUTHORIZATION_ROLE_REQUIRED,
          HttpStatus.FORBIDDEN,
          { requiredRole: 'BRAND_ADMIN or MASTER_ADMIN' }
        )
      }
    } catch (error) {
      throw new BusinessError(
        ErrorCodes.AUTHENTICATION_INVALID,
        HttpStatus.UNAUTHORIZED
      )
    }

    // Parse form data
    const formData = await request.formData()
    const file = formData.get('file') as File
    const productId = formData.get('productId') as string
    const brandId = formData.get('brandId') as string
    const imageType = formData.get('imageType') as string || 'product' // product, thumbnail, detail, brand

    if (!file) {
      throw new BusinessError(
        ErrorCodes.VALIDATION_FAILED,
        HttpStatus.BAD_REQUEST,
        { message: 'No file provided' }
      )
    }

    // Validate file type
    if (!ALLOWED_MIME_TYPES.includes(file.type)) {
      throw new BusinessError(
        ErrorCodes.VALIDATION_FAILED,
        HttpStatus.BAD_REQUEST,
        { 
          message: 'Invalid file type', 
          allowedTypes: ALLOWED_MIME_TYPES 
        }
      )
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      throw new BusinessError(
        ErrorCodes.VALIDATION_FAILED,
        HttpStatus.BAD_REQUEST,
        { 
          message: 'File too large', 
          maxSize: `${MAX_FILE_SIZE / 1024 / 1024}MB` 
        }
      )
    }

    // Log file details for debugging
    console.log('File upload details:', {
      name: file.name,
      size: file.size,
      type: file.type,
      imageType,
      productId,
      brandId
    })

    // Convert file to buffer
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    // Generate S3 key based on type
    let s3KeyPrefix = 'products'
    let entityId = productId
    
    if (imageType === 'brand' || brandId) {
      s3KeyPrefix = 'brands'
      entityId = brandId || 'logo'
    }
    
    const s3Key = generateS3Key(
      `${s3KeyPrefix}/${imageType}`,
      file.name,
      entityId
    )
    
    console.log('Generated S3 key:', s3Key)

    // Upload to S3
    console.log('Attempting S3 upload with config:', {
      bucket: process.env.S3_BUCKET,
      region: process.env.AWS_REGION,
      hasAccessKey: !!process.env.AWS_ACCESS_KEY_ID,
      hasSecretKey: !!process.env.AWS_SECRET_ACCESS_KEY,
      bufferSize: buffer.length,
      s3Key,
      contentType: file.type
    })
    
    try {
      // Upload to S3
      const imageUrl = await uploadToS3(
        buffer,
        s3Key,
        file.type,
        {
          uploadedBy: userInfo.username,
          productId: productId || 'none',
          brandId: brandId || 'none',
          imageType,
        }
      )
      
      console.log('S3 upload successful, URL:', imageUrl)
      
      return NextResponse.json({
        success: true,
        data: {
          url: imageUrl,
          key: s3Key,
          size: file.size,
          type: file.type,
          name: file.name,
        }
      })
    } catch (s3Error) {
      console.error('S3 upload failed:', {
        error: s3Error,
        message: s3Error instanceof Error ? s3Error.message : 'Unknown S3 error',
        stack: s3Error instanceof Error ? s3Error.stack : undefined,
        type: s3Error instanceof Error ? s3Error.constructor.name : typeof s3Error
      })
      
      // Return more user-friendly error message
      throw new BusinessError(
        ErrorCodes.FILE_UPLOAD_FAILED,
        HttpStatus.INTERNAL_SERVER_ERROR,
        { 
          message: 'Image upload failed. Please try again.',
          details: s3Error instanceof Error ? s3Error.message : 'Unknown error'
        }
      )
    }
  } catch (error) {
    console.error('Upload API error:', {
      error: error,
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      type: error instanceof Error ? error.constructor.name : typeof error
    })
    
    // Return more detailed error in development
    if (process.env.NODE_ENV !== 'production') {
      return NextResponse.json({
        error: {
          code: 'UPLOAD_FAILED',
          message: error instanceof Error ? error.message : 'Unknown error',
          details: error instanceof Error ? error.stack : undefined
        },
        timestamp: new Date().toISOString(),
        path: request.url,
      }, { status: 500 })
    }
    
    return createErrorResponse(error as Error, request.url)
  }
}