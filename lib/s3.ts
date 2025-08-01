import { 
  S3Client, 
  PutObjectCommand, 
  DeleteObjectCommand,
  GetObjectCommand,
  ListObjectsV2Command 
} from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'

// Initialize S3 client with error handling
let s3Client: S3Client

function initializeS3Client() {
  try {
    // Clean environment variables to remove any whitespace/newlines
    const accessKeyId = process.env.AWS_ACCESS_KEY_ID?.trim()
    const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY?.trim()
    // Force correct region for our S3 bucket
    const region = 'us-east-2' // Hard-coded to match our bucket location
    const bucket = process.env.S3_BUCKET?.trim()

    if (!accessKeyId || !secretAccessKey) {
      console.error('Missing AWS credentials:', {
        hasAccessKey: !!accessKeyId,
        hasSecretKey: !!secretAccessKey,
        region,
        bucket
      })
      throw new Error('AWS credentials not configured')
    }

    console.log('Initializing S3 client with config:', {
      region,
      bucket,
      hasAccessKey: !!accessKeyId,
      hasSecretKey: !!secretAccessKey,
      accessKeyLength: accessKeyId.length,
      secretKeyLength: secretAccessKey.length,
      expectedRegion: 'us-east-2'
    })

    return new S3Client({
      region,
      credentials: {
        accessKeyId,
        secretAccessKey,
      },
    })
  } catch (error) {
    console.error('Failed to initialize S3 client:', error)
    throw error
  }
}

// Lazy initialization to avoid issues with environment variables during build
function getS3Client() {
  if (!s3Client) {
    s3Client = initializeS3Client()
  }
  return s3Client
}

const BUCKET_NAME = process.env.S3_BUCKET?.trim() || 'k-fashion-products-711082721767'

// Upload file to S3
export async function uploadToS3(
  file: Buffer,
  key: string,
  contentType: string,
  metadata?: Record<string, string>
) {
  try {
    console.log('Starting S3 upload with:', {
      bucket: BUCKET_NAME,
      key,
      contentType,
      fileSize: file.length,
      metadata
    })

    const client = getS3Client()
    const command = new PutObjectCommand({
      Bucket: BUCKET_NAME,
      Key: key,
      Body: file,
      ContentType: contentType,
      Metadata: metadata,
    })

    console.log('Sending S3 command...')
    const result = await client.send(command)
    console.log('S3 upload result:', result)
    
    // Return the public URL (using correct region and format)
    const publicUrl = `https://${BUCKET_NAME}.s3.us-east-2.amazonaws.com/${key}`
    console.log('Generated public URL:', publicUrl)
    return publicUrl
  } catch (error) {
    console.error('S3 upload error details:', {
      error: error,
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      bucket: BUCKET_NAME,
      key,
      region: process.env.AWS_REGION
    })
    throw new Error(`S3 upload failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
}

// Delete file from S3
export async function deleteFromS3(key: string) {
  try {
    const command = new DeleteObjectCommand({
      Bucket: BUCKET_NAME,
      Key: key,
    })

    await getS3Client().send(command)
    return true
  } catch (error) {
    console.error('S3 delete error:', error)
    throw error
  }
}

// Generate presigned URL for direct upload
export async function generatePresignedUploadUrl(
  key: string,
  contentType: string,
  expiresIn: number = 3600 // 1 hour default
) {
  try {
    const command = new PutObjectCommand({
      Bucket: BUCKET_NAME,
      Key: key,
      ContentType: contentType,
      ACL: 'public-read' // Make uploaded files publicly readable
    })

    const url = await getSignedUrl(getS3Client(), command, { expiresIn })
    return url
  } catch (error) {
    console.error('S3 presigned URL error:', error)
    throw error
  }
}

// Generate presigned URL for download
export async function generatePresignedDownloadUrl(
  key: string,
  expiresIn: number = 3600 // 1 hour default
) {
  try {
    const command = new GetObjectCommand({
      Bucket: BUCKET_NAME,
      Key: key,
    })

    const url = await getSignedUrl(getS3Client(), command, { expiresIn })
    return url
  } catch (error) {
    console.error('S3 presigned download URL error:', error)
    throw error
  }
}

// List objects with prefix
export async function listS3Objects(prefix: string, maxKeys: number = 100) {
  try {
    const command = new ListObjectsV2Command({
      Bucket: BUCKET_NAME,
      Prefix: prefix,
      MaxKeys: maxKeys,
    })

    const response = await getS3Client().send(command)
    return response.Contents || []
  } catch (error) {
    console.error('S3 list error:', error)
    throw error
  }
}

// Helper to generate unique file name
export function generateS3Key(
  folder: string,
  fileName: string,
  productId?: string
): string {
  const timestamp = Date.now()
  const randomString = Math.random().toString(36).substring(2, 8)
  const extension = fileName.split('.').pop()
  
  // Sanitize filename: remove Korean characters and special chars, keep only alphanumeric, dots, hyphens
  const baseName = fileName.replace(/\.[^/.]+$/, '') // Remove extension
  const safeName = baseName
    .replace(/[^\w\s-]/g, '') // Remove special characters except word chars, spaces, hyphens
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/[^a-zA-Z0-9-]/g, '') // Remove any remaining non-ASCII characters (Korean, etc.)
    .toLowerCase() // Convert to lowercase
    .substring(0, 20) // Limit length
  
  // If safeName is empty (all Korean chars), use generic name
  const finalName = safeName || 'image'
  const fullFileName = `${finalName}-${randomString}.${extension}`
  
  if (productId) {
    return `${folder}/${productId}/${timestamp}-${fullFileName}`
  }
  
  return `${folder}/${timestamp}-${fullFileName}`
}

// Helper to extract key from S3 URL
export function extractS3KeyFromUrl(url: string): string | null {
  try {
    const urlObj = new URL(url)
    const pathname = urlObj.pathname
    // Remove leading slash
    return pathname.startsWith('/') ? pathname.slice(1) : pathname
  } catch (error) {
    return null
  }
}