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
import { toast } from 'sonner'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'

const productSchema = z.object({
  brandId: z.string().min(1, 'Brand is required'),
  categoryId: z.string().optional(),
  sku: z.string().min(1, 'SKU is required').max(50, 'SKU must be 50 characters or less'),
  nameKo: z.string().min(1, 'Korean name is required').max(200, 'Name must be 200 characters or less'),
  nameCn: z.string().max(200, 'Chinese name must be 200 characters or less').optional(),
  descriptionKo: z.string().max(5000, 'Korean description must be 5000 characters or less').optional(),
  descriptionCn: z.string().max(5000, 'Chinese description must be 5000 characters or less').optional(),
  basePrice: z.number().positive('Price must be positive'),
  inventory: z.number().int().min(0, 'Inventory cannot be negative'),
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

    setIsSubmitting(true)

    try {
      const productData = {
        ...data,
        thumbnailImage,
        images: productImages,
      }

      if (onSubmit) {
        await onSubmit(productData)
      } else {
        // Default submission to API
        const response = await fetch('/api/products', {
          method: isEditing ? 'PUT' : 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(productData),
        })

        if (!response.ok) {
          const error = await response.json()
          throw new Error(error.message || 'Failed to save product')
        }

        toast.success(isEditing ? 'Product updated successfully' : 'Product created successfully')
        
        if (onCancel) {
          onCancel()
        }
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to save product')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <Card>
        <CardHeader>
          <CardTitle>{isEditing ? 'Edit Product' : 'Create New Product'}</CardTitle>
          <CardDescription>
            {isEditing ? 'Update product information and images' : 'Add a new product with images to your catalog'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-6">
            <Tabs defaultValue="basic" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="basic">Basic Info</TabsTrigger>
                <TabsTrigger value="images">Images</TabsTrigger>
                <TabsTrigger value="details">Details</TabsTrigger>
              </TabsList>

              <TabsContent value="basic" className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="brandId">Brand *</Label>
                    <Select onValueChange={(value) => setValue('brandId', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select brand" />
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
                    <Label htmlFor="categoryId">Category</Label>
                    <Select onValueChange={(value) => setValue('categoryId', value || undefined)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select category (optional)" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">No category</SelectItem>
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
                  <Label htmlFor="sku">SKU *</Label>
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
                    <Label htmlFor="nameKo">Korean Name *</Label>
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
                    <Label htmlFor="nameCn">Chinese Name</Label>
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
                    <Label htmlFor="basePrice">Price (KRW) *</Label>
                    <Input
                      id="basePrice"
                      type="number"
                      {...register('basePrice', { valueAsNumber: true })}
                      placeholder="0"
                    />
                    {errors.basePrice && (
                      <p className="text-sm text-red-500">{errors.basePrice.message}</p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="inventory">Inventory *</Label>
                    <Input
                      id="inventory"
                      type="number"
                      {...register('inventory', { valueAsNumber: true })}
                      placeholder="0"
                    />
                    {errors.inventory && (
                      <p className="text-sm text-red-500">{errors.inventory.message}</p>
                    )}
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="images" className="space-y-6">
                <div>
                  <Label className="text-base font-medium">Thumbnail Image *</Label>
                  <p className="text-sm text-gray-500 mb-3">
                    Main product image displayed in listings (1 image required)
                  </p>
                  
                  {thumbnailImage ? (
                    <div className="space-y-3">
                      <div className="relative inline-block">
                        <img
                          src={thumbnailImage}
                          alt="Thumbnail"
                          className="w-32 h-32 object-cover rounded border"
                        />
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
                        Thumbnail set
                      </Badge>
                    </div>
                  ) : (
                    <ImageUpload
                      onUploadComplete={handleThumbnailUpload}
                      maxFiles={1}
                      imageType="thumbnail"
                      productId={initialData?.id}
                    />
                  )}
                </div>

                <div>
                  <Label className="text-base font-medium">Gallery Images</Label>
                  <p className="text-sm text-gray-500 mb-3">
                    Additional product images (up to 5 images)
                  </p>
                  
                  <ImageUpload
                    onUploadComplete={handleGalleryUpload}
                    maxFiles={5}
                    existingImages={productImages}
                    imageType="gallery"
                    productId={initialData?.id}
                  />

                  {productImages.length > 0 && (
                    <div className="mt-4">
                      <h4 className="text-sm font-medium mb-2">Gallery Images ({productImages.length})</h4>
                      <div className="grid grid-cols-3 md:grid-cols-5 gap-2">
                        {productImages.map((url, index) => (
                          <div key={index} className="relative group">
                            <img
                              src={url}
                              alt={`Gallery ${index + 1}`}
                              className="w-full h-24 object-cover rounded border"
                            />
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
                  <Label htmlFor="descriptionKo">Korean Description</Label>
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
                  <Label htmlFor="descriptionCn">Chinese Description</Label>
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
                  Cancel
                </Button>
              )}
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting
                  ? isEditing
                    ? 'Updating...'
                    : 'Creating...'
                  : isEditing
                  ? 'Update Product'
                  : 'Create Product'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}