'use client'

import { useState, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { X, Upload, Image as ImageIcon, AlertCircle } from 'lucide-react'
import { toast } from 'sonner'

interface ImageUploadProps {
  onUploadComplete?: (url: string, file: File) => void
  onUploadError?: (error: string) => void
  onImageRemove?: (url: string) => void
  maxFiles?: number
  existingImages?: string[]
  productId?: string
  brandId?: string
  imageType?: 'thumbnail' | 'gallery' | 'detail' | 'brand'
  accept?: string
  maxSize?: number // in MB
  disabled?: boolean
}

interface UploadingFile {
  file: File
  progress: number
  url?: string
  error?: string
  id: string
}

export function ImageUpload({
  onUploadComplete,
  onUploadError,
  onImageRemove,
  maxFiles = 5,
  existingImages = [],
  productId,
  brandId,
  imageType = 'gallery',
  accept = 'image/*',
  maxSize = 5,
  disabled = false,
}: ImageUploadProps) {
  const [uploadingFiles, setUploadingFiles] = useState<UploadingFile[]>([])
  const [dragActive, setDragActive] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const totalImages = existingImages.length + uploadingFiles.filter(f => f.url).length
  const canUploadMore = totalImages < maxFiles

  const handleFiles = async (files: FileList | File[]) => {
    const fileArray = Array.from(files)
    
    // Filter valid files
    const validFiles = fileArray.filter(file => {
      if (!file.type.startsWith('image/')) {
        toast.error(`${file.name} is not an image file`)
        return false
      }
      
      if (file.size > maxSize * 1024 * 1024) {
        toast.error(`${file.name} is too large (max ${maxSize}MB)`)
        return false
      }
      
      return true
    })

    if (validFiles.length === 0) return

    // Check if we can upload these files
    if (totalImages + validFiles.length > maxFiles) {
      toast.error(`Cannot upload ${validFiles.length} files. Maximum ${maxFiles} images allowed.`)
      return
    }

    // Initialize uploading files
    const newUploadingFiles: UploadingFile[] = validFiles.map(file => ({
      file,
      progress: 0,
      id: Math.random().toString(36).substring(2),
    }))

    setUploadingFiles(prev => [...prev, ...newUploadingFiles])

    // Upload each file
    for (const uploadingFile of newUploadingFiles) {
      try {
        await uploadFile(uploadingFile)
      } catch (error) {
        console.error('Upload error:', error)
      }
    }
  }

  const uploadFile = async (uploadingFile: UploadingFile) => {
    const { file, id } = uploadingFile

    try {
      // Update progress to show starting
      setUploadingFiles(prev =>
        prev.map(f => f.id === id ? { ...f, progress: 10 } : f)
      )

      // Use traditional server upload instead of presigned URL
      const formData = new FormData()
      formData.append('file', file)
      if (productId) formData.append('productId', productId)
      if (brandId) formData.append('brandId', brandId)
      formData.append('imageType', imageType)

      // Create XMLHttpRequest for progress tracking
      const xhr = new XMLHttpRequest()
      
      // Set up progress tracking
      xhr.upload.addEventListener('progress', (event) => {
        if (event.lengthComputable) {
          const progress = Math.round(10 + (event.loaded / event.total) * 80) // 10% to 90%
          setUploadingFiles(prev =>
            prev.map(f => f.id === id ? { ...f, progress } : f)
          )
        }
      })

      // Upload promise
      const uploadPromise = new Promise<string>((resolve, reject) => {
        xhr.onload = () => {
          if (xhr.status === 200) {
            try {
              const response = JSON.parse(xhr.responseText)
              resolve(response.data.url)
            } catch (error) {
              reject(new Error('Invalid response format'))
            }
          } else {
            try {
              const errorResponse = JSON.parse(xhr.responseText)
              reject(new Error(errorResponse.error?.message || `Upload failed: ${xhr.status} ${xhr.statusText}`))
            } catch (error) {
              reject(new Error(`Upload failed: ${xhr.status} ${xhr.statusText}`))
            }
          }
        }
        
        xhr.onerror = () => reject(new Error('Network error during upload'))
        
        xhr.open('POST', '/api/upload')
        xhr.withCredentials = true // Include cookies for authentication
        xhr.send(formData)
      })

      const finalUrl = await uploadPromise

      // Complete
      setUploadingFiles(prev =>
        prev.map(f => f.id === id ? { ...f, progress: 100, url: finalUrl } : f)
      )

      onUploadComplete?.(finalUrl, file)
      toast.success(`${file.name} 업로드 완료`)

      // Remove from uploading list after a delay
      setTimeout(() => {
        setUploadingFiles(prev => prev.filter(f => f.id !== id))
      }, 2000)

    } catch (error: any) {
      console.error('Upload error:', error)
      
      // Update with error
      setUploadingFiles(prev =>
        prev.map(f =>
          f.id === id
            ? { ...f, error: error.message, progress: 0 }
            : f
        )
      )

      if (onUploadError) {
        onUploadError(error.message)
      }

      toast.error(`Failed to upload ${file.name}: ${error.message}`)
    }
  }

  const removeUploadingFile = (id: string) => {
    setUploadingFiles(prev => prev.filter(f => f.id !== id))
  }

  const retryUpload = (id: string) => {
    const uploadingFile = uploadingFiles.find(f => f.id === id)
    if (uploadingFile) {
      setUploadingFiles(prev =>
        prev.map(f => f.id === id ? { ...f, error: undefined, progress: 0 } : f)
      )
      uploadFile(uploadingFile)
    }
  }

  // Drag and drop handlers
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)
    } else if (e.type === 'dragleave') {
      setDragActive(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)

    if (disabled || !canUploadMore) return

    const files = e.dataTransfer.files
    if (files && files.length > 0) {
      handleFiles(files)
    }
  }

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFiles(e.target.files)
    }
    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const openFileDialog = () => {
    if (fileInputRef.current && !disabled && canUploadMore) {
      fileInputRef.current.click()
    }
  }

  return (
    <div className="space-y-4">
      {/* Upload Area */}
      <div
        className={`
          relative border-2 border-dashed rounded-lg p-6 text-center transition-colors
          ${dragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300'}
          ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:border-gray-400'}
          ${!canUploadMore ? 'opacity-50 cursor-not-allowed' : ''}
        `}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={openFileDialog}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple={maxFiles > 1}
          accept={accept}
          onChange={handleFileInput}
          className="hidden"
          disabled={disabled || !canUploadMore}
        />

        <div className="space-y-2">
          <div className="mx-auto w-12 h-12 text-gray-400">
            <Upload className="w-full h-full" />
          </div>
          
          <div>
            <p className="text-sm font-medium text-gray-900">
              {canUploadMore ? 'Click to upload or drag and drop' : `Maximum ${maxFiles} images reached`}
            </p>
            <p className="text-xs text-gray-500">
              PNG, JPG, GIF up to {maxSize}MB
              {maxFiles > 1 && ` (${totalImages}/${maxFiles} uploaded)`}
            </p>
          </div>

          {!canUploadMore && (
            <p className="text-xs text-red-500">
              Remove some images to upload more
            </p>
          )}
        </div>
      </div>

      {/* Existing Images */}
      {existingImages.length > 0 && (
        <div>
          <h4 className="text-sm font-medium text-gray-900 mb-2">Current Images</h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {existingImages.map((url, index) => (
              <div key={index} className="relative group">
                <img
                  src={url}
                  alt={`Image ${index + 1}`}
                  className="w-full h-24 object-cover rounded border"
                />
                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all rounded" />
                {onImageRemove && (
                  <button
                    onClick={() => onImageRemove(url)}
                    className="absolute top-1 right-1 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                    title="이미지 삭제"
                  >
                    <X className="w-3 h-3" />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Uploading Files */}
      {uploadingFiles.length > 0 && (
        <div>
          <h4 className="text-sm font-medium text-gray-900 mb-2">Uploading</h4>
          <div className="space-y-2">
            {uploadingFiles.map(uploadingFile => (
              <div key={uploadingFile.id} className="border rounded-lg p-3">
                <div className="flex items-center space-x-3">
                  <div className="flex-shrink-0">
                    {uploadingFile.error ? (
                      <AlertCircle className="w-5 h-5 text-red-500" />
                    ) : uploadingFile.url ? (
                      <ImageIcon className="w-5 h-5 text-green-500" />
                    ) : (
                      <Upload className="w-5 h-5 text-blue-500" />
                    )}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {uploadingFile.file.name}
                    </p>
                    <p className="text-xs text-gray-500">
                      {(uploadingFile.file.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                    
                    {uploadingFile.error ? (
                      <p className="text-xs text-red-500 mt-1">{uploadingFile.error}</p>
                    ) : uploadingFile.url ? (
                      <p className="text-xs text-green-500 mt-1">Upload complete</p>
                    ) : (
                      <div className="mt-2">
                        <Progress value={uploadingFile.progress} className="h-1" />
                        <p className="text-xs text-gray-500 mt-1">
                          {uploadingFile.progress}% uploaded
                        </p>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex-shrink-0 space-x-1">
                    {uploadingFile.error && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => retryUpload(uploadingFile.id)}
                        className="h-6 px-2 text-xs"
                      >
                        Retry
                      </Button>
                    )}
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => removeUploadingFile(uploadingFile.id)}
                      className="h-6 w-6 p-0 text-gray-400 hover:text-gray-600"
                    >
                      <X className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}