"use client"

import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { ImageUpload } from '@/components/upload/image-upload'
import ErrorBoundary from '@/components/error-boundary'
import { toast } from 'sonner'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'

const productSchema = z.object({
  brandId: z.string().min(1, '브랜드를 선택해주세요'),
  categoryId: z.string().optional(),
  sku: z.string().min(1, 'SKU를 입력해주세요').max(50, 'SKU는 50자 이하여야 합니다'),
  nameKo: z.string().min(1, '상품명(한글)을 입력해주세요').max(200, '상품명은 200자 이하여야 합니다'),
  nameCn: z.string().max(200, '중국어 상품명은 200자 이하여야 합니다').optional(),
  descriptionKo: z.string().max(5000, '한글 설명은 5000자 이하여야 합니다').optional(),
  descriptionCn: z.string().max(5000, '중국어 설명은 5000자 이하여야 합니다').optional(),
  basePrice: z.number().min(0, '가격은 0원 이상이어야 합니다'),
  inventory: z.number().int().min(0, '재고는 0개 이상이어야 합니다'),
})

type ProductFormData = z.infer<typeof productSchema>

interface Brand {
  id: string
  nameKo: string
  nameCn?: string
}

interface Category {
  id: string
  name: string
}

interface ProductFormWithImagesProps {
  initialData?: any
  onSubmit?: (data: ProductFormData & { images: string[] }) => void
  onCancel?: () => void
  isEditing?: boolean
}

export function ProductFormWithImages({
  initialData,
  onSubmit,
  onCancel,
  isEditing = false,
}: ProductFormWithImagesProps) {
  const [brands, setBrands] = useState<Brand[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [productImages, setProductImages] = useState<string[]>(initialData?.images || [])
  const [thumbnailImage, setThumbnailImage] = useState<string>(initialData?.thumbnailImage || '')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<ProductFormData>({
    resolver: zodResolver(productSchema),
    defaultValues: initialData || {
      brandId: '',
      categoryId: '',
      sku: '',
      nameKo: '',
      nameCn: '',
      descriptionKo: '',
      descriptionCn: '',
      basePrice: 0,
      inventory: 0,
    },
  })

  // Set form values when initialData changes (for edit mode)
  useEffect(() => {
    if (initialData) {
      setValue('brandId', initialData.brandId || '')
      setValue('categoryId', initialData.categoryId || '')
      setValue('sku', initialData.sku || '')
      setValue('nameKo', initialData.nameKo || '')
      setValue('nameCn', initialData.nameCn || '')
      setValue('descriptionKo', initialData.descriptionKo || '')
      setValue('descriptionCn', initialData.descriptionCn || '')
      setValue('basePrice', initialData.basePrice || 0)
      setValue('inventory', initialData.inventory || 0)
      
      // Also update watched values
      setWatchedBrandId(initialData.brandId || '')
      setWatchedCategoryId(initialData.categoryId || '')
    }
  }, [initialData, setValue])

  // Load brands and categories
  useEffect(() => {
    const loadData = async () => {
      try {
        const [brandsRes, categoriesRes] = await Promise.all([
          fetch('/api/brands'),
          fetch('/api/categories'),
        ])

        if (brandsRes.ok) {
          const brandsData = await brandsRes.json()
          setBrands(brandsData.data || brandsData)
        }

        // Categories endpoint might not exist yet, so handle gracefully
        if (categoriesRes.ok) {
          const categoriesData = await categoriesRes.json()
          setCategories(categoriesData.data || categoriesData)
        }
      } catch (error) {
        console.error('Failed to load form data:', error)
      }
    }

    loadData()
  }, [])

  // Watch form values for controlled components (with error handling)
  const [watchedBrandId, setWatchedBrandId] = useState('')
  const [watchedCategoryId, setWatchedCategoryId] = useState('')

  // Use useEffect to safely watch form values
  useEffect(() => {
    try {
      const subscription = watch((value, { name }) => {
        if (name === 'brandId' && value.brandId !== undefined) {
          setWatchedBrandId(value.brandId)
        }
        if (name === 'categoryId' && value.categoryId !== undefined) {
          setWatchedCategoryId(value.categoryId || '')
        }
      })
      return () => subscription.unsubscribe()
    } catch (error) {
      console.error('Form watch error:', error)
    }
  }, [watch])

  const handleThumbnailUpload = (url: string) => {
    setThumbnailImage(url)
    toast.success('Thumbnail uploaded successfully')
  }

  const handleGalleryUpload = (url: string) => {
    setProductImages(prev => [...prev, url])
    toast.success('Gallery image uploaded successfully')
  }

  const removeThumbnail = () => {
    setThumbnailImage('')
  }

  const removeGalleryImage = (index: number) => {
    setProductImages(prev => prev.filter((_, i) => i !== index))
  }

  const onFormSubmit = async (data: ProductFormData) => {
    if (!thumbnailImage) {
      toast.error('Please upload a thumbnail image')
      return
    }

    console.log('🚀 Starting product submission...', { isSubmitting })
    setIsSubmitting(true)

    try {
      const productData = {
        ...data,
        thumbnailImage,
        images: productImages,
      }

      console.log('📦 Product data prepared:', productData)

      if (onSubmit) {
        console.log('🔄 Using custom onSubmit handler...')
        try {
          await onSubmit(productData)
          console.log('✅ Custom onSubmit completed successfully')
          // onSubmit이 성공하면 onCancel 호출하지 않음 (handleSubmit에서 이미 처리)
        } catch (error) {
          console.error('❌ Custom onSubmit failed:', error)
          // onSubmit에서 에러 발생 시 re-throw
          throw error
        }
      } else {
        console.log('🔄 Using default API submission...')
        // Default submission to API
        const response = await fetch('/api/products', {
          method: isEditing ? 'PUT' : 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(productData),
        })

        if (!response.ok) {
          const error = await response.json()
          console.error('❌ API submission failed:', error)
          throw new Error(error.message || 'Failed to save product')
        }

        console.log('✅ Default API submission completed successfully')
        toast.success(isEditing ? 'Product updated successfully' : 'Product created successfully')
        
        if (onCancel) {
          onCancel()
        }
      }
    } catch (error: any) {
      console.error('❌ Product submission error:', error)
      toast.error(error.message || 'Failed to save product')
    } finally {
      console.log('🏁 Product submission finished, resetting isSubmitting...')
      setIsSubmitting(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <Card>
        <CardHeader>
          <CardTitle>{isEditing ? '상품 수정' : '새 상품 등록'}</CardTitle>
          <CardDescription>
            {isEditing ? '상품 정보와 이미지를 업데이트합니다' : '카탈로그에 새 상품을 추가합니다'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-6">
            <Tabs defaultValue="basic" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="basic">기본 정보</TabsTrigger>
                <TabsTrigger value="images">이미지</TabsTrigger>
                <TabsTrigger value="details">상세 정보</TabsTrigger>
              </TabsList>

              <TabsContent value="basic" className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="brandId">브랜드 <span className="text-red-500">*</span></Label>
                    <Select value={watchedBrandId} onValueChange={(value) => {
                      setValue('brandId', value)
                      setWatchedBrandId(value)
                    }}>
                      <SelectTrigger>
                        <SelectValue placeholder="브랜드를 선택하세요" />
                      </SelectTrigger>
                      <SelectContent>
                        {brands.map((brand) => (
                          <SelectItem key={brand.id} value={brand.id}>
                            {brand.nameKo} {brand.nameCn && `(${brand.nameCn})`}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors.brandId && (
                      <p className="text-sm text-red-500">{errors.brandId.message}</p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="categoryId">카테고리</Label>
                    <Select value={watchedCategoryId || "none"} onValueChange={(value) => {
                      const newValue = value === "none" ? undefined : value
                      setValue('categoryId', newValue)
                      setWatchedCategoryId(newValue || '')
                    }}>
                      <SelectTrigger>
                        <SelectValue placeholder="카테고리 선택 (선택사항)" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">없음</SelectItem>
                        {categories.map((category) => (
                          <SelectItem key={category.id} value={category.id}>
                            {category.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <Label htmlFor="sku">SKU <span className="text-red-500">*</span></Label>
                  <Input
                    id="sku"
                    {...register('sku')}
                    placeholder="e.g., TST-001"
                  />
                  {errors.sku && (
                    <p className="text-sm text-red-500">{errors.sku.message}</p>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="nameKo">상품명 (한글) <span className="text-red-500">*</span></Label>
                    <Input
                      id="nameKo"
                      {...register('nameKo')}
                      placeholder="상품명"
                    />
                    {errors.nameKo && (
                      <p className="text-sm text-red-500">{errors.nameKo.message}</p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="nameCn">상품명 (중국어)</Label>
                    <Input
                      id="nameCn"
                      {...register('nameCn')}
                      placeholder="产品名称"
                    />
                    {errors.nameCn && (
                      <p className="text-sm text-red-500">{errors.nameCn.message}</p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="basePrice">가격 (원) <span className="text-red-500">*</span></Label>
                    <Input
                      id="basePrice"
                      type="number"
                      min="0"
                      {...register('basePrice', { valueAsNumber: true })}
                      placeholder="0"
                      onKeyDown={(e) => {
                        if (e.key === '-' || e.key === 'e' || e.key === 'E') {
                          e.preventDefault()
                        }
                      }}
                    />
                    {errors.basePrice && (
                      <p className="text-sm text-red-500">{errors.basePrice.message}</p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="inventory">재고 <span className="text-red-500">*</span></Label>
                    <Input
                      id="inventory"
                      type="number"
                      min="0"
                      {...register('inventory', { valueAsNumber: true })}
                      placeholder="0"
                      onKeyDown={(e) => {
                        if (e.key === '-' || e.key === 'e' || e.key === 'E') {
                          e.preventDefault()
                        }
                      }}
                    />
                    {errors.inventory && (
                      <p className="text-sm text-red-500">{errors.inventory.message}</p>
                    )}
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="images" className="space-y-6">
                <div>
                  <Label className="text-base font-medium">대표 이미지 <span className="text-red-500">*</span></Label>
                  <p className="text-sm text-gray-500 mb-3">
                    상품 목록에 표시되는 메인 이미지 (1개 필수)
                  </p>
                  
                  {thumbnailImage ? (
                    <div className="space-y-3">
                      <div className="relative inline-block">
                        <div className="w-32 h-32 rounded border overflow-hidden bg-gray-50 flex items-center justify-center">
                          <img
                            src={thumbnailImage}
                            alt="Thumbnail"
                            className="max-w-full max-h-full object-contain"
                          />
                        </div>
                        <Button
                          type="button"
                          size="sm"
                          variant="destructive"
                          className="absolute -top-2 -right-2 h-6 w-6 p-0"
                          onClick={removeThumbnail}
                        >
                          ×
                        </Button>
                      </div>
                      <Badge variant="outline" className="text-green-600">
                        대표 이미지 설정됨
                      </Badge>
                    </div>
                  ) : (
                    <ErrorBoundary fallback={<div className="p-4 text-center text-red-500 text-sm">이미지 업로드를 불러올 수 없습니다</div>}>
                      <ImageUpload
                        onUploadComplete={handleThumbnailUpload}
                        maxFiles={1}
                        imageType="thumbnail"
                        productId={initialData?.id}
                      />
                    </ErrorBoundary>
                  )}
                </div>

                <div>
                  <Label className="text-base font-medium">추가 이미지</Label>
                  <p className="text-sm text-gray-500 mb-3">
                    추가 상품 이미지 (최대 5개)
                  </p>
                  
                  <ErrorBoundary fallback={<div className="p-4 text-center text-red-500 text-sm">이미지 업로드를 불러올 수 없습니다</div>}>
                    <ImageUpload
                      onUploadComplete={handleGalleryUpload}
                      maxFiles={5}
                      existingImages={productImages}
                      imageType="gallery"
                      productId={initialData?.id}
                    />
                  </ErrorBoundary>

                  {productImages.length > 0 && (
                    <div className="mt-4">
                      <h4 className="text-sm font-medium mb-2">갤러리 이미지 ({productImages.length})</h4>
                      <div className="grid grid-cols-3 md:grid-cols-5 gap-2">
                        {productImages.map((url, index) => (
                          <div key={index} className="relative group">
                            <div className="w-full h-24 rounded border overflow-hidden bg-gray-50 flex items-center justify-center">
                              <img
                                src={url}
                                alt={`Gallery ${index + 1}`}
                                className="max-w-full max-h-full object-contain"
                              />
                            </div>
                            <Button
                              type="button"
                              size="sm"
                              variant="destructive"
                              className="absolute -top-2 -right-2 h-5 w-5 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                              onClick={() => removeGalleryImage(index)}
                            >
                              ×
                            </Button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="details" className="space-y-4">
                <div>
                  <Label htmlFor="descriptionKo">상품 설명 (한글)</Label>
                  <Textarea
                    id="descriptionKo"
                    {...register('descriptionKo')}
                    placeholder="상품 설명을 입력하세요..."
                    rows={4}
                  />
                  {errors.descriptionKo && (
                    <p className="text-sm text-red-500">{errors.descriptionKo.message}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="descriptionCn">상품 설명 (중국어)</Label>
                  <Textarea
                    id="descriptionCn"
                    {...register('descriptionCn')}
                    placeholder="请输入产品描述..."
                    rows={4}
                  />
                  {errors.descriptionCn && (
                    <p className="text-sm text-red-500">{errors.descriptionCn.message}</p>
                  )}
                </div>
              </TabsContent>
            </Tabs>

            <div className="flex justify-end space-x-4 pt-6 border-t">
              {onCancel && (
                <Button type="button" variant="outline" onClick={onCancel}>
                  취소
                </Button>
              )}
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting && (
                  <svg className="animate-spin -ml-1 mr-3 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                )}
                {isSubmitting
                  ? isEditing
                    ? '수정 중...'
                    : '등록 중...'
                  : isEditing
                  ? '상품 수정'
                  : '상품 등록'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}