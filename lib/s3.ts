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

try {
  if (!process.env.AWS_ACCESS_KEY_ID || !process.env.AWS_SECRET_ACCESS_KEY) {
    console.error('Missing AWS credentials:', {
      hasAccessKey: !!process.env.AWS_ACCESS_KEY_ID,
      hasSecretKey: !!process.env.AWS_SECRET_ACCESS_KEY,
      region: process.env.AWS_REGION
    })
    throw new Error('AWS credentials not configured')
  }

  s3Client = new S3Client({
    region: process.env.AWS_REGION || 'us-east-2',
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    },
  })
} catch (error) {
  console.error('Failed to initialize S3 client:', error)
  throw error
}

const BUCKET_NAME = process.env.S3_BUCKET || 'k-fashion-products'

// Upload file to S3
export async function uploadToS3(
  file: Buffer,
  key: string,
  contentType: string,
  metadata?: Record<string, string>
) {
  try {
    const command = new PutObjectCommand({
      Bucket: BUCKET_NAME,
      Key: key,
      Body: file,
      ContentType: contentType,
      Metadata: metadata,
    })

    await s3Client.send(command)
    
    // Return the public URL (assuming bucket is configured for public read)
    return `https://${BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`
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

    await s3Client.send(command)
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
    })

    const url = await getSignedUrl(s3Client, command, { expiresIn })
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

    const url = await getSignedUrl(s3Client, command, { expiresIn })
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

    const response = await s3Client.send(command)
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