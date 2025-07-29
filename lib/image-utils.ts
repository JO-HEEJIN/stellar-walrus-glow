/**
 * Image optimization utilities for client-side image processing
 */

export interface ImageCompressionOptions {
  maxWidth?: number
  maxHeight?: number
  quality?: number
  maxSizeKB?: number
}

/**
 * Compress and resize image on client side
 */
export function compressImage(
  file: File,
  options: ImageCompressionOptions = {}
): Promise<File> {
  return new Promise((resolve, reject) => {
    const {
      maxWidth = 1200,
      maxHeight = 1200,
      quality = 0.8,
      maxSizeKB = 500
    } = options

    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    const img = new Image()

    img.onload = () => {
      // Calculate new dimensions
      let { width, height } = img
      
      if (width > maxWidth || height > maxHeight) {
        const ratio = Math.min(maxWidth / width, maxHeight / height)
        width = Math.floor(width * ratio)
        height = Math.floor(height * ratio)
      }

      canvas.width = width
      canvas.height = height

      // Draw and compress
      ctx?.drawImage(img, 0, 0, width, height)
      
      canvas.toBlob(
        (blob) => {
          if (!blob) {
            reject(new Error('Canvas conversion failed'))
            return
          }

          // Check if further compression is needed
          if (blob.size > maxSizeKB * 1024 && quality > 0.1) {
            // Recursive compression with lower quality
            const newOptions = { ...options, quality: quality * 0.8 }
            compressImage(file, newOptions).then(resolve).catch(reject)
            return
          }

          // Create new file with compressed data
          const compressedFile = new File([blob], file.name, {
            type: file.type,
            lastModified: Date.now(),
          })

          resolve(compressedFile)
        },
        file.type,
        quality
      )
    }

    img.onerror = () => reject(new Error('Image load failed'))
    img.src = URL.createObjectURL(file)
  })
}

/**
 * Generate thumbnail from image file
 */
export function generateThumbnail(
  file: File,
  size: number = 300
): Promise<File> {
  return compressImage(file, {
    maxWidth: size,
    maxHeight: size,
    quality: 0.7,
    maxSizeKB: 100
  })
}

/**
 * Validate image file
 */
export function validateImageFile(file: File): { valid: boolean; error?: string } {
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
  const maxSizeMB = 10

  if (!allowedTypes.includes(file.type)) {
    return {
      valid: false,
      error: `지원되지 않는 파일 형식입니다. 허용된 형식: ${allowedTypes.join(', ')}`
    }
  }

  if (file.size > maxSizeMB * 1024 * 1024) {
    return {
      valid: false,
      error: `파일 크기가 너무 큽니다. 최대 ${maxSizeMB}MB까지 허용됩니다.`
    }
  }

  return { valid: true }
}

/**
 * Create image preview URL
 */
export function createImagePreview(file: File): string {
  return URL.createObjectURL(file)
}

/**
 * Cleanup image preview URL
 */
export function cleanupImagePreview(url: string): void {
  URL.revokeObjectURL(url)
}