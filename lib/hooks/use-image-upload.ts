'use client'

import { useState, useCallback } from 'react'
import { compressImage, validateImageFile, generateThumbnail } from '@/lib/image-utils'

export interface UploadProgress {
  loaded: number
  total: number
  percentage: number
}

export interface UploadResult {
  url: string
  thumbnailUrl?: string
  originalSize: number
  compressedSize: number
  s3Key: string
}

export interface UseImageUploadOptions {
  compress?: boolean
  generateThumbnails?: boolean
  maxWidth?: number
  maxHeight?: number
  quality?: number
}

export function useImageUpload(options: UseImageUploadOptions = {}) {
  const [isUploading, setIsUploading] = useState(false)
  const [progress, setProgress] = useState<UploadProgress | null>(null)
  const [error, setError] = useState<string | null>(null)

  const uploadImage = useCallback(async (
    file: File,
    productId?: string,
    imageType: string = 'product'
  ): Promise<UploadResult> => {
    setIsUploading(true)
    setError(null)
    setProgress({ loaded: 0, total: 100, percentage: 0 })

    try {
      // Validate file
      const validation = validateImageFile(file)
      if (!validation.valid) {
        throw new Error(validation.error)
      }

      setProgress({ loaded: 10, total: 100, percentage: 10 })

      // Compress image if enabled
      let finalFile = file
      if (options.compress !== false) {
        console.log('Compressing image...', { originalSize: file.size })
        finalFile = await compressImage(file, {
          maxWidth: options.maxWidth || 1200,
          maxHeight: options.maxHeight || 1200,
          quality: options.quality || 0.8
        })
        console.log('Image compressed:', { 
          originalSize: file.size, 
          compressedSize: finalFile.size,
          reduction: `${Math.round((1 - finalFile.size / file.size) * 100)}%`
        })
      }

      setProgress({ loaded: 30, total: 100, percentage: 30 })

      // Get presigned URL
      console.log('Getting presigned URL...')
      const presignedResponse = await fetch('/api/upload/presigned', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          fileName: finalFile.name,
          fileType: finalFile.type,
          fileSize: finalFile.size,
          productId,
          imageType
        })
      })

      if (!presignedResponse.ok) {
        const errorData = await presignedResponse.json()
        throw new Error(errorData.error?.message || 'Failed to get upload URL')
      }

      const { data } = await presignedResponse.json()
      const { presignedUrl, imageUrl, s3Key } = data

      setProgress({ loaded: 50, total: 100, percentage: 50 })

      // Upload directly to S3 using presigned URL
      console.log('Uploading to S3...')
      const uploadResponse = await fetch(presignedUrl, {
        method: 'PUT',
        body: finalFile,
        headers: {
          'Content-Type': finalFile.type,
        }
      })

      if (!uploadResponse.ok) {
        throw new Error(`S3 upload failed: ${uploadResponse.status} ${uploadResponse.statusText}`)
      }

      setProgress({ loaded: 90, total: 100, percentage: 90 })

      // Generate thumbnail if enabled
      let thumbnailUrl: string | undefined
      if (options.generateThumbnails) {
        try {
          console.log('Generating thumbnail...')
          const thumbnailFile = await generateThumbnail(finalFile)
          
          // Upload thumbnail (simplified for now)
          const thumbnailPresignedResponse = await fetch('/api/upload/presigned', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({
              fileName: `thumb_${thumbnailFile.name}`,
              fileType: thumbnailFile.type,
              fileSize: thumbnailFile.size,
              productId,
              imageType: 'thumbnail'
            })
          })

          if (thumbnailPresignedResponse.ok) {
            const thumbnailData = await thumbnailPresignedResponse.json()
            await fetch(thumbnailData.data.presignedUrl, {
              method: 'PUT',
              body: thumbnailFile,
              headers: { 'Content-Type': thumbnailFile.type }
            })
            thumbnailUrl = thumbnailData.data.imageUrl
          }
        } catch (thumbError) {
          console.warn('Thumbnail generation failed:', thumbError)
          // Don't fail the entire upload for thumbnail issues
        }
      }

      setProgress({ loaded: 100, total: 100, percentage: 100 })

      const result: UploadResult = {
        url: imageUrl,
        thumbnailUrl,
        originalSize: file.size,
        compressedSize: finalFile.size,
        s3Key
      }

      console.log('Upload completed successfully:', result)
      return result

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Upload failed'
      console.error('Upload error:', err)
      setError(errorMessage)
      throw new Error(errorMessage)
    } finally {
      setIsUploading(false)
      // Clear progress after a short delay
      setTimeout(() => setProgress(null), 1000)
    }
  }, [options])

  const uploadMultiple = useCallback(async (
    files: File[],
    productId?: string,
    imageType: string = 'product'
  ): Promise<UploadResult[]> => {
    const results: UploadResult[] = []
    
    for (let i = 0; i < files.length; i++) {
      const file = files[i]
      try {
        const result = await uploadImage(file, productId, imageType)
        results.push(result)
      } catch (error) {
        console.error(`Failed to upload file ${file.name}:`, error)
        // Continue with other files
      }
    }
    
    return results
  }, [uploadImage])

  return {
    uploadImage,
    uploadMultiple,
    isUploading,
    progress,
    error,
    clearError: () => setError(null)
  }
}