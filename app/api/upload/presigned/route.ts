import { NextRequest, NextResponse } from 'next/server'
import { generatePresignedUploadUrl, generateS3Key } from '@/lib/s3'
import { createErrorResponse, BusinessError, ErrorCodes, HttpStatus } from '@/lib/errors'

export const runtime = 'nodejs'

// Allowed file types
const ALLOWED_MIME_TYPES = [
  'image/jpeg',
  'image/jpg', 
  'image/png',
  'image/webp',
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

    // Parse request body
    const body = await request.json()
    const { fileName, fileType, fileSize, productId, imageType = 'product' } = body

    // Validate inputs
    if (!fileName || !fileType) {
      throw new BusinessError(
        ErrorCodes.VALIDATION_FAILED,
        HttpStatus.BAD_REQUEST,
        { message: 'fileName and fileType are required' }
      )
    }

    // Validate file type
    if (!ALLOWED_MIME_TYPES.includes(fileType)) {
      throw new BusinessError(
        ErrorCodes.VALIDATION_FAILED,
        HttpStatus.BAD_REQUEST,
        { 
          message: 'Invalid file type', 
          allowedTypes: ALLOWED_MIME_TYPES 
        }
      )
    }

    // Validate file size (5MB limit)
    const maxSize = 5 * 1024 * 1024
    if (fileSize && fileSize > maxSize) {
      throw new BusinessError(
        ErrorCodes.VALIDATION_FAILED,
        HttpStatus.BAD_REQUEST,
        { 
          message: 'File too large', 
          maxSize: '5MB' 
        }
      )
    }

    // Generate S3 key
    const s3Key = generateS3Key(
      `products/${imageType}`,
      fileName,
      productId
    )

    console.log('Generating presigned URL for:', {
      s3Key,
      fileType,
      fileSize,
      imageType,
      productId
    })

    // Generate presigned URL (expires in 15 minutes)
    const presignedUrl = await generatePresignedUploadUrl(s3Key, fileType, 900)
    
    // Calculate final image URL
    const imageUrl = `https://${process.env.S3_BUCKET}.s3.us-east-2.amazonaws.com/${s3Key}`

    return NextResponse.json({
      success: true,
      data: {
        presignedUrl,
        imageUrl,
        s3Key,
        fileName,
        fileType,
        expiresIn: 900 // 15 minutes
      }
    })

  } catch (error) {
    console.error('Presigned URL generation error:', error)
    return createErrorResponse(error as Error, request.url)
  }
}