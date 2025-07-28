import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    console.log('Test upload endpoint called')
    
    // Check authentication
    const token = request.cookies.get('auth-token')?.value
    console.log('Token exists:', !!token)
    
    if (!token) {
      return NextResponse.json({
        error: 'No auth token found'
      }, { status: 401 })
    }

    // Parse form data
    const formData = await request.formData()
    const file = formData.get('file') as File
    
    console.log('File details:', {
      hasFile: !!file,
      name: file?.name,
      size: file?.size,
      type: file?.type
    })

    if (!file) {
      return NextResponse.json({
        error: 'No file provided'
      }, { status: 400 })
    }

    // Check environment variables
    console.log('Environment check:', {
      hasAwsAccessKey: !!process.env.AWS_ACCESS_KEY_ID,
      hasAwsSecretKey: !!process.env.AWS_SECRET_ACCESS_KEY,
      awsRegion: process.env.AWS_REGION,
      s3Bucket: process.env.S3_BUCKET,
      nodeEnv: process.env.NODE_ENV
    })

    return NextResponse.json({
      success: true,
      message: 'Test upload successful',
      fileInfo: {
        name: file.name,
        size: file.size,
        type: file.type
      },
      environment: {
        hasAwsAccessKey: !!process.env.AWS_ACCESS_KEY_ID,
        hasAwsSecretKey: !!process.env.AWS_SECRET_ACCESS_KEY,
        awsRegion: process.env.AWS_REGION,
        s3Bucket: process.env.S3_BUCKET
      }
    })
  } catch (error) {
    console.error('Test upload error:', error)
    return NextResponse.json({
      error: {
        message: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined
      }
    }, { status: 500 })
  }
}