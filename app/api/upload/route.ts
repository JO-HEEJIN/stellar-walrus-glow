import { NextRequest, NextResponse } from 'next/server'
import { createErrorResponse, BusinessError, ErrorCodes, HttpStatus } from '@/lib/errors'

export const runtime = 'nodejs'
export const maxDuration = 60 // 60 seconds timeout for uploads

// Mock 모드 확인 (S3 설정이 없거나 강제 Mock 모드인 경우)
const IS_MOCK_MODE = !process.env.AWS_ACCESS_KEY_ID || process.env.USE_MOCK_UPLOAD === 'true'

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

    // Generate S3 key based on type (간단한 버전)
    let s3KeyPrefix = 'products'
    let entityId = productId
    
    if (imageType === 'brand' || brandId) {
      s3KeyPrefix = 'brands'
      entityId = brandId || 'logo'
    }
    
    // 간단한 S3 키 생성 (generateS3Key 함수 대신)
    const timestamp = Date.now()
    const randomString = Math.random().toString(36).substring(2, 15)
    const extension = file.name.split('.').pop() || 'jpg'
    const s3Key = `${s3KeyPrefix}/${imageType}/${timestamp}-${randomString}.${extension}`
    
    console.log('Generated S3 key:', s3Key)

    // Upload to S3
    // Mock 모드 처리
    if (IS_MOCK_MODE) {
      console.log('🎭 Using MOCK upload mode')
      
      // Base64로 변환하여 Data URL 생성 (작은 파일인 경우)
      const base64 = buffer.toString('base64')
      const dataUrl = `data:${file.type};base64,${base64}`
      
      // 큰 파일은 placeholder 이미지 사용
      const mockUrl = dataUrl.length < 100000 
        ? dataUrl 
        : `https://via.placeholder.com/400x400.png?text=${encodeURIComponent(file.name)}`
      
      // 업로드 시뮬레이션 (300ms 대기)
      await new Promise(resolve => setTimeout(resolve, 300))
      
      console.log('✅ Mock upload successful')
      
      return NextResponse.json({
        success: true,
        data: {
          url: mockUrl,
          key: s3Key,
          size: file.size,
          type: file.type,
          name: file.name,
        },
        isMock: true
      })
    }

    // 실제 S3 업로드 시도
    console.log('☁️ Attempting S3 upload with config:', {
      bucket: process.env.S3_BUCKET,
      region: process.env.AWS_REGION,
      hasAccessKey: !!process.env.AWS_ACCESS_KEY_ID,
      hasSecretKey: !!process.env.AWS_SECRET_ACCESS_KEY,
      bufferSize: buffer.length,
      s3Key,
      contentType: file.type
    })
    
    try {
      // S3 라이브러리 동적 임포트 및 업로드
      const { uploadToS3 } = await import('@/lib/s3')
      
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
      
      console.log('✅ S3 upload successful, URL:', imageUrl)
      
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
      console.error('❌ S3 upload failed:', {
        error: s3Error,
        message: s3Error instanceof Error ? s3Error.message : 'Unknown S3 error',
        stack: s3Error instanceof Error ? s3Error.stack : undefined,
        type: s3Error instanceof Error ? s3Error.constructor.name : typeof s3Error
      })
      
      // S3 실패 시 Mock 모드로 폴백
      console.log('🔄 Falling back to mock mode due to S3 failure')
      const mockUrl = `https://via.placeholder.com/400x400.png?text=${encodeURIComponent(file.name)}`
      
      return NextResponse.json({
        success: true,
        data: {
          url: mockUrl,
          key: s3Key,
          size: file.size,
          type: file.type,
          name: file.name,
        },
        warning: 'S3 upload failed, using mock URL',
        fallback: true
      })
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