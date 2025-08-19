"use client"

import { useState, useEffect } from 'react'
import { Edit } from 'lucide-react'
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
import { ColorSizeManager } from '@/components/products/color-size-manager'
import { BulkPricingManager } from '@/components/products/bulk-pricing-manager'
import { ImageEditor } from '@/components/upload/image-editor'

const productSchema = z.object({
  brandId: z.string().min(1, '브랜드를 선택해주세요'),
  categoryId: z.string().optional(),
  sku: z.string()
    .min(2, 'SKU는 최소 2자 이상이어야 합니다')
    .max(50, 'SKU는 50자 이하여야 합니다')
    .regex(/^[A-Z0-9\-_]+$/i, 'SKU는 영문, 숫자, 하이픈(-), 언더바(_)만 사용 가능합니다'),
  nameKo: z.string()
    .min(2, '상품명은 최소 2자 이상이어야 합니다')
    .max(200, '상품명은 200자 이하여야 합니다')
    .refine(val => val.trim().length > 0, { message: '상품명을 입력해주세요' }),
  nameCn: z.string()
    .max(200, '중국어 상품명은 200자 이하여야 합니다')
    .optional()
    .or(z.literal('')),
  descriptionKo: z.string()
    .max(5000, '한글 설명은 5000자 이하여야 합니다')
    .optional()
    .or(z.literal('')),
  descriptionCn: z.string()
    .max(5000, '중국어 설명은 5000자 이하여야 합니다')
    .optional()
    .or(z.literal('')),
  basePrice: z.number()
    .min(100, '가격은 최소 100원 이상이어야 합니다')
    .max(10000000, '가격은 1천만원 이하여야 합니다')
    .int('가격은 정수로 입력해주세요'),
  inventory: z.number()
    .int('재고는 정수로 입력해주세요')
    .min(0, '재고는 0개 이상이어야 합니다')
    .max(999999, '재고는 999,999개 이하여야 합니다'),
  material: z.string()
    .max(200, '소재는 200자 이하여야 합니다')
    .optional()
    .or(z.literal(''))
    .refine(val => !val || val.trim().length === 0 || val.trim().length >= 2, {
      message: '소재는 최소 2자 이상 입력해주세요'
    }),
  careInstructions: z.string()
    .max(500, '관리방법은 500자 이하여야 합니다')
    .optional()
    .or(z.literal('')),
  features: z.array(z.string().min(1, '특징은 1자 이상이어야 합니다')).optional(),
  tags: z.array(z.string().min(1, '태그는 1자 이상이어야 합니다')).optional(),
  metaTitle: z.string().max(60, 'SEO 제목은 60자 이하여야 합니다').optional().or(z.literal('')),
  metaDescription: z.string().max(160, 'SEO 설명은 160자 이하여야 합니다').optional().or(z.literal('')),
  metaKeywords: z.string().max(255, 'SEO 키워드는 255자 이하여야 합니다').optional().or(z.literal('')),
  weight: z.number().min(0, '무게는 0g 이상이어야 합니다').max(50000, '무게는 50kg(50,000g) 이하여야 합니다').optional(),
  length: z.number().min(0, '길이는 0cm 이상이어야 합니다').max(1000, '길이는 1000cm 이하여야 합니다').optional(),
  width: z.number().min(0, '가로는 0cm 이상이어야 합니다').max(1000, '가로는 1000cm 이하여야 합니다').optional(),
  height: z.number().min(0, '높이는 0cm 이상이어야 합니다').max(1000, '높이는 1000cm 이하여야 합니다').optional(),
  status: z.enum(['ACTIVE', 'INACTIVE', 'OUT_OF_STOCK']).default('ACTIVE'),
}).refine(data => {
  // Cross-field validation: If inventory is 0, status should be OUT_OF_STOCK
  if (data.inventory === 0 && data.status === 'ACTIVE') {
    return false
  }
  return true
}, {
  message: '재고가 0개일 때는 상품 상태를 "품절"로 설정해야 합니다',
  path: ['status']
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
  isDuplicating?: boolean
}

export function ProductFormWithImages({
  initialData,
  onSubmit,
  onCancel,
  isEditing = false,
  isDuplicating = false,
}: ProductFormWithImagesProps) {
  const [brands, setBrands] = useState<Brand[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [productImages, setProductImages] = useState<string[]>(initialData?.images || [])
  const [thumbnailImage, setThumbnailImage] = useState<string>(initialData?.thumbnailImage || initialData?.imageUrl || '')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [productColors, setProductColors] = useState<any[]>(initialData?.colors || [])
  const [productSizes, setProductSizes] = useState<any[]>(initialData?.sizes || [])
  const [productFeatures, setProductFeatures] = useState<string[]>(initialData?.features || [])
  const [newFeature, setNewFeature] = useState('')
  const [productTags, setProductTags] = useState<string[]>(initialData?.tags || [])
  const [newTag, setNewTag] = useState('')
  const [bulkPricing, setBulkPricing] = useState<any[]>(initialData?.bulkPricing || [])
  const [skuValidation, setSkuValidation] = useState<{ isChecking: boolean; isValid: boolean | null; message: string }>({
    isChecking: false,
    isValid: null,
    message: ''
  })
  const [autoSaveStatus, setAutoSaveStatus] = useState<{ isAutoSaving: boolean; lastSaved: string | null }>({
    isAutoSaving: false,
    lastSaved: null
  })
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)
  const [fieldValidationErrors, setFieldValidationErrors] = useState<Record<string, string>>({})
  const [isValidatingForm, setIsValidatingForm] = useState(false)
  const [apiError, setApiError] = useState<{ message: string; details?: string; retryable?: boolean } | null>(null)
  const [retryCount, setRetryCount] = useState(0)
  const [showTemplateDialog, setShowTemplateDialog] = useState(false)
  const [templateName, setTemplateName] = useState('')
  const [savedTemplates, setSavedTemplates] = useState<any[]>([])
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState('basic')
  const [showKeyboardHelp, setShowKeyboardHelp] = useState(false)
  const [showImageEditor, setShowImageEditor] = useState(false)
  const [editingImageUrl, setEditingImageUrl] = useState<string | null>(null)

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
      material: '',
      careInstructions: '',
      features: [],
      tags: [],
      metaTitle: '',
      metaDescription: '',
      metaKeywords: '',
      weight: undefined,
      length: undefined,
      width: undefined,
      height: undefined,
      status: 'ACTIVE',
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
      setValue('material', initialData.material || '')
      setValue('careInstructions', initialData.careInstructions || '')
      setValue('features', initialData.features || [])
      setValue('tags', initialData.tags || [])
      setValue('metaTitle', initialData.metaTitle || '')
      setValue('metaDescription', initialData.metaDescription || '')
      setValue('metaKeywords', initialData.metaKeywords || '')
      setValue('weight', initialData.weight)
      setValue('length', initialData.length)
      setValue('width', initialData.width)
      setValue('height', initialData.height)
      setValue('status', initialData.status || 'ACTIVE')
      
      // Also update watched values and image states
      setWatchedBrandId(initialData.brandId || '')
      setWatchedCategoryId(initialData.categoryId || '')
      
      // Update image states for edit mode
      if (initialData.images) setProductImages(initialData.images)
      if (initialData.thumbnailImage || initialData.imageUrl) {
        setThumbnailImage(initialData.thumbnailImage || initialData.imageUrl || '')
      }
      if (initialData.colors) setProductColors(initialData.colors)
      if (initialData.sizes) setProductSizes(initialData.sizes)
      if (initialData.features) setProductFeatures(initialData.features)
      if (initialData.tags) setProductTags(initialData.tags)
      if (initialData.bulkPricing) setBulkPricing(initialData.bulkPricing)
    }
  }, [initialData, setValue])

  // Load brands and categories
  useEffect(() => {
    const loadData = async () => {
      try {
        console.log('🔍 Loading brands and categories...')
        
        const [brandsRes, categoriesRes] = await Promise.all([
          fetch('/api/brands'),
          fetch('/api/categories'),
        ])

        console.log('🔍 Brands response status:', brandsRes.status)
        console.log('🔍 Categories response status:', categoriesRes.status)

        if (brandsRes.ok) {
          const brandsData = await brandsRes.json()
          console.log('🔍 Brands data received:', brandsData)
          
          // Ensure we have an array
          const brandsArray = Array.isArray(brandsData) 
            ? brandsData 
            : Array.isArray(brandsData.data) 
              ? brandsData.data 
              : []
          
          console.log('🔍 Setting brands array:', brandsArray)
          setBrands(brandsArray)
        } else {
          console.error('❌ Brands API failed:', brandsRes.status)
          setBrands([]) // Set empty array as fallback
        }

        // Categories endpoint might not exist yet, so handle gracefully
        if (categoriesRes.ok) {
          const categoriesData = await categoriesRes.json()
          console.log('🔍 Categories data received:', categoriesData)
          
          // Ensure we have an array
          const categoriesArray = Array.isArray(categoriesData) 
            ? categoriesData 
            : Array.isArray(categoriesData.data) 
              ? categoriesData.data 
              : []
          
          console.log('🔍 Setting categories array:', categoriesArray)
          setCategories(categoriesArray)
        } else {
          console.error('❌ Categories API failed or not available:', categoriesRes.status)
          setCategories([]) // Set empty array as fallback
        }
      } catch (error) {
        console.error('❌ Failed to load form data:', error)
        // Set empty arrays as fallback to prevent map errors
        setBrands([])
        setCategories([])
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
    if (confirm('대표 이미지를 삭제하시겠습니까?')) {
      setThumbnailImage('')
    }
  }

  const removeThumbnailByUrl = (url: string) => {
    if (confirm('대표 이미지를 삭제하시겠습니까?')) {
      setThumbnailImage('')
    }
  }

  const removeGalleryImage = (index: number) => {
    if (confirm('이 이미지를 삭제하시겠습니까?')) {
      setProductImages(prev => prev.filter((_, i) => i !== index))
    }
  }

  // 특징 추가
  const addFeature = () => {
    if (newFeature.trim()) {
      setProductFeatures([...productFeatures, newFeature.trim()])
      setNewFeature('')
    }
  }

  // 특징 제거
  const removeFeature = (index: number) => {
    if (confirm('이 특징을 삭제하시겠습니까?')) {
      setProductFeatures(productFeatures.filter((_, i) => i !== index))
    }
  }

  // 태그 추가
  const addTag = () => {
    if (!newTag.trim()) return
    
    const trimmedTag = newTag.trim()
    
    // 태그 개수 제한
    if (productTags.length >= 10) {
      toast.error('최대 10개까지만 태그를 추가할 수 있습니다')
      return
    }
    
    // 태그 길이 제한
    if (trimmedTag.length < 2) {
      toast.error('태그는 최소 2자 이상이어야 합니다')
      return
    }
    
    if (trimmedTag.length > 20) {
      toast.error('태그는 최대 20자까지만 가능합니다')
      return
    }
    
    // 중복 태그 방지 (대소문자 구분 없이)
    if (productTags.map(t => t.toLowerCase()).includes(trimmedTag.toLowerCase())) {
      toast.error('이미 존재하는 태그입니다')
      return
    }
    
    // 특수문자 제한 (한글, 영문, 숫자만 허용)
    if (!/^[가-힣a-zA-Z0-9\s]+$/.test(trimmedTag)) {
      toast.error('태그는 한글, 영문, 숫자만 사용 가능합니다')
      return
    }
    
    setProductTags([...productTags, trimmedTag])
    setNewTag('')
  }

  // 태그 제거
  const removeTag = (index: number) => {
    setProductTags(productTags.filter((_, i) => i !== index))
  }

  // 이미지 순서 변경
  const moveImage = (fromIndex: number, toIndex: number) => {
    const newImages = [...productImages]
    const [removed] = newImages.splice(fromIndex, 1)
    newImages.splice(toIndex, 0, removed)
    setProductImages(newImages)
  }

  // SKU 중복 체크
  const checkSkuUniqueness = async (sku: string) => {
    if (!sku || sku.length < 2) {
      setSkuValidation({ isChecking: false, isValid: null, message: '' })
      return
    }

    setSkuValidation({ isChecking: true, isValid: null, message: '중복 확인 중...' })

    try {
      const response = await fetch(`/api/products/check-sku?sku=${encodeURIComponent(sku)}${isEditing && initialData?.id ? `&excludeId=${initialData.id}` : ''}`)
      const result = await response.json()

      if (result.available) {
        setSkuValidation({ isChecking: false, isValid: true, message: '✓ 사용 가능한 SKU입니다' })
      } else {
        setSkuValidation({ isChecking: false, isValid: false, message: '✗ 이미 사용 중인 SKU입니다' })
      }
    } catch (error) {
      setSkuValidation({ isChecking: false, isValid: null, message: 'SKU 확인 중 오류가 발생했습니다' })
    }
  }

  // SKU 입력 디바운스
  useEffect(() => {
    const watchedSku = watch('sku')
    if (!watchedSku) return

    const timeoutId = setTimeout(() => {
      checkSkuUniqueness(watchedSku)
    }, 500) // 500ms 디바운스

    return () => clearTimeout(timeoutId)
  }, [watch('sku')])

  // 실시간 가격 유효성 검사
  useEffect(() => {
    const watchedPrice = watch('basePrice')
    if (typeof watchedPrice !== 'number' || watchedPrice <= 0) return

    // 대량구매 가격과 비교 검증
    if (bulkPricing.length > 0) {
      const expensiveBulkPrices = bulkPricing.filter(bp => bp.pricePerUnit >= watchedPrice)
      if (expensiveBulkPrices.length > 0) {
        setFieldValidationErrors(prev => ({
          ...prev,
          basePrice: '기본 가격은 대량구매 가격보다 높아야 합니다'
        }))
      } else {
        setFieldValidationErrors(prev => {
          const newErrors = { ...prev }
          delete newErrors.basePrice
          return newErrors
        })
      }
    }
  }, [watch('basePrice'), bulkPricing])

  // 재고 상태 실시간 검증
  useEffect(() => {
    const watchedInventory = watch('inventory')
    const watchedStatus = watch('status')
    
    if (typeof watchedInventory === 'number' && watchedInventory === 0 && watchedStatus === 'ACTIVE') {
      setFieldValidationErrors(prev => ({
        ...prev,
        status: '재고가 0개일 때는 상품 상태를 "품절"로 설정해주세요'
      }))
    } else {
      setFieldValidationErrors(prev => {
        const newErrors = { ...prev }
        delete newErrors.status
        return newErrors
      })
    }
  }, [watch('inventory'), watch('status')])

  // 자동 저장 기능
  const autoSaveDraft = async () => {
    if (!hasUnsavedChanges || isSubmitting) return

    const formData = watch()
    if (!formData.nameKo || !formData.sku) return // 필수 필드가 없으면 저장하지 않음

    setAutoSaveStatus(prev => ({ ...prev, isAutoSaving: true }))

    try {
      const draftData = {
        ...formData,
        thumbnailImage,
        images: productImages,
        colors: productColors,
        sizes: productSizes,
        features: productFeatures,
        tags: productTags,
        bulkPricing: bulkPricing,
        isDraft: true
      }

      // 로컬 스토리지에 임시 저장
      localStorage.setItem(`product-draft-${initialData?.id || 'new'}`, JSON.stringify({
        ...draftData,
        savedAt: new Date().toISOString()
      }))

      const now = new Date().toLocaleTimeString('ko-KR')
      setAutoSaveStatus({ isAutoSaving: false, lastSaved: now })
      setHasUnsavedChanges(false)
      
      console.log('📝 Draft auto-saved at:', now)
    } catch (error) {
      console.error('Auto-save failed:', error)
      setAutoSaveStatus(prev => ({ ...prev, isAutoSaving: false }))
    }
  }

  // 폼 데이터 변경 감지
  useEffect(() => {
    const subscription = watch(() => {
      setHasUnsavedChanges(true)
    })
    return () => subscription.unsubscribe()
  }, [watch])

  // 자동 저장 타이머
  useEffect(() => {
    if (!hasUnsavedChanges) return

    const autoSaveTimer = setTimeout(autoSaveDraft, 10000) // 10초 후 자동 저장
    return () => clearTimeout(autoSaveTimer)
  }, [hasUnsavedChanges])

  // 페이지 이탈 시 경고
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasUnsavedChanges) {
        e.preventDefault()
        e.returnValue = '저장되지 않은 변경사항이 있습니다. 페이지를 떠나시겠습니까?'
      }
    }

    window.addEventListener('beforeunload', handleBeforeUnload)
    return () => window.removeEventListener('beforeunload', handleBeforeUnload)
  }, [hasUnsavedChanges])

  // 컴포넌트 마운트 시 임시 저장 데이터 복원
  useEffect(() => {
    const draftKey = `product-draft-${initialData?.id || 'new'}`
    const savedDraft = localStorage.getItem(draftKey)
    
    if (savedDraft && !isEditing) { // 새 상품 생성 시에만 복원
      try {
        const draftData = JSON.parse(savedDraft)
        const savedTime = new Date(draftData.savedAt).toLocaleTimeString('ko-KR')
        
        if (confirm(`${savedTime}에 저장된 임시 데이터를 불러오시겠습니까?`)) {
          Object.keys(draftData).forEach(key => {
            if (key !== 'savedAt' && key !== 'isDraft') {
              setValue(key as keyof ProductFormData, draftData[key])
            }
          })
          
          if (draftData.thumbnailImage) setThumbnailImage(draftData.thumbnailImage)
          if (draftData.images) setProductImages(draftData.images)
          if (draftData.colors) setProductColors(draftData.colors)
          if (draftData.sizes) setProductSizes(draftData.sizes)
          if (draftData.features) setProductFeatures(draftData.features)
          if (draftData.tags) setProductTags(draftData.tags)
          if (draftData.bulkPricing) setBulkPricing(draftData.bulkPricing)
          
          setAutoSaveStatus({ isAutoSaving: false, lastSaved: savedTime })
        }
      } catch (error) {
        console.error('Failed to restore draft:', error)
        localStorage.removeItem(draftKey)
      }
    }
  }, [])

  // Load saved templates
  useEffect(() => {
    const loadTemplates = () => {
      try {
        const templates = localStorage.getItem('product-templates')
        if (templates) {
          setSavedTemplates(JSON.parse(templates))
        }
      } catch (error) {
        console.error('Failed to load templates:', error)
      }
    }
    loadTemplates()
  }, [])

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Skip if user is typing in an input/textarea/select
      const activeElement = document.activeElement
      if (activeElement && ['INPUT', 'TEXTAREA', 'SELECT'].includes(activeElement.tagName)) {
        return
      }

      // Skip if any modals are open
      if (showTemplateDialog || showKeyboardHelp) {
        if (event.key === 'Escape') {
          setShowTemplateDialog(false)
          setShowKeyboardHelp(false)
        }
        return
      }

      const isCtrl = event.ctrlKey || event.metaKey

      switch (true) {
        // Save: Ctrl+S
        case isCtrl && event.key === 's':
          event.preventDefault()
          if (!isSubmitting) {
            handleSubmit(onFormSubmit)()
          }
          break

        // Cancel: Escape
        case event.key === 'Escape':
          event.preventDefault()
          if (onCancel) {
            onCancel()
          }
          break

        // Tab navigation: Numbers 1-6
        case event.key >= '1' && event.key <= '6':
          event.preventDefault()
          const tabIndex = parseInt(event.key) - 1
          const tabs = ['basic', 'variants', 'pricing', 'images', 'details', 'seo']
          if (tabs[tabIndex]) {
            setActiveTab(tabs[tabIndex])
          }
          break

        // Help: ? or h
        case event.key === '?' || event.key === 'h':
          event.preventDefault()
          setShowKeyboardHelp(true)
          break

        // Template save: Ctrl+T
        case isCtrl && event.key === 't':
          event.preventDefault()
          setShowTemplateDialog(true)
          break

        // Auto-save: Ctrl+Shift+S
        case isCtrl && event.shiftKey && event.key === 'S':
          event.preventDefault()
          // Trigger auto-save manually
          const currentData = watch()
          localStorage.setItem('product-form-autosave', JSON.stringify({
            ...currentData,
            colors: productColors,
            sizes: productSizes,
            features: productFeatures,
            tags: productTags,
            bulkPricing: bulkPricing,
            timestamp: Date.now()
          }))
          toast.success('수동 저장 완료')
          break

        default:
          break
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [isSubmitting, onCancel, handleSubmit, watch, productColors, productSizes, productFeatures, productTags, bulkPricing, showTemplateDialog, showKeyboardHelp])

  // Template management functions
  const saveTemplate = () => {
    if (!templateName.trim()) {
      toast.error('템플릿 이름을 입력해주세요')
      return
    }

    const formData = watch()
    const templateData = {
      id: Date.now().toString(),
      name: templateName.trim(),
      createdAt: new Date().toISOString(),
      data: {
        ...formData,
        colors: productColors,
        sizes: productSizes,
        features: productFeatures,
        tags: productTags,
        bulkPricing: bulkPricing,
        // Don't save images in templates (they're specific to each product)
        thumbnailImage: '',
        images: []
      }
    }

    try {
      const updatedTemplates = [...savedTemplates, templateData]
      localStorage.setItem('product-templates', JSON.stringify(updatedTemplates))
      setSavedTemplates(updatedTemplates)
      setTemplateName('')
      setShowTemplateDialog(false)
      toast.success('템플릿이 저장되었습니다')
    } catch (error) {
      toast.error('템플릿 저장에 실패했습니다')
    }
  }

  const loadTemplate = (templateId: string) => {
    const template = savedTemplates.find(t => t.id === templateId)
    if (!template) return

    try {
      const { data } = template
      
      // Set form values
      Object.entries(data).forEach(([key, value]) => {
        if (key in watch() && typeof value !== 'undefined') {
          setValue(key as keyof ProductFormData, value as any)
        }
      })

      // Set component states
      if (data.colors) setProductColors(data.colors)
      if (data.sizes) setProductSizes(data.sizes)
      if (data.features) setProductFeatures(data.features)
      if (data.tags) setProductTags(data.tags)
      if (data.bulkPricing) setBulkPricing(data.bulkPricing)

      // Clear images since they shouldn't be templated
      setThumbnailImage('')
      setProductImages([])

      toast.success(`템플릿 "${template.name}"을 불러왔습니다`)
      setSelectedTemplate(null)
    } catch (error) {
      toast.error('템플릿 로드에 실패했습니다')
    }
  }

  const deleteTemplate = (templateId: string) => {
    const template = savedTemplates.find(t => t.id === templateId)
    if (!template) return

    if (confirm(`템플릿 "${template.name}"을 삭제하시겠습니까?`)) {
      try {
        const updatedTemplates = savedTemplates.filter(t => t.id !== templateId)
        localStorage.setItem('product-templates', JSON.stringify(updatedTemplates))
        setSavedTemplates(updatedTemplates)
        toast.success('템플릿이 삭제되었습니다')
      } catch (error) {
        toast.error('템플릿 삭제에 실패했습니다')
      }
    }
  }

  // Image editing functions
  const handleImageEdit = (imageUrl: string) => {
    setEditingImageUrl(imageUrl)
    setShowImageEditor(true)
  }

  const handleImageEditSave = async (editedImageBlob: Blob, filename: string) => {
    try {
      // Create a new File from the blob
      const editedFile = new File([editedImageBlob], filename, { type: editedImageBlob.type })
      
      // Upload the edited image
      const formData = new FormData()
      formData.append('file', editedFile)
      formData.append('imageType', 'gallery')
      
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
        credentials: 'include'
      })
      
      if (response.ok) {
        const result = await response.json()
        const newImageUrl = result.data.url
        
        // Replace the old image with the edited one
        if (editingImageUrl) {
          // Update in product images array
          const oldImageIndex = productImages.indexOf(editingImageUrl)
          if (oldImageIndex !== -1) {
            const newImages = [...productImages]
            newImages[oldImageIndex] = newImageUrl
            setProductImages(newImages)
          }
          
          // Update thumbnail if it's the same image
          if (thumbnailImage === editingImageUrl) {
            setThumbnailImage(newImageUrl)
          }
        }
        
        toast.success('편집된 이미지가 저장되었습니다')
        setShowImageEditor(false)
        setEditingImageUrl(null)
      } else {
        throw new Error('이미지 업로드에 실패했습니다')
      }
    } catch (error) {
      console.error('Image edit save error:', error)
      toast.error('편집된 이미지 저장에 실패했습니다')
    }
  }

  const handleImageEditCancel = () => {
    setShowImageEditor(false)
    setEditingImageUrl(null)
  }

  // Enhanced form validation
  const validateFormData = (data: ProductFormData): { isValid: boolean; errors: string[] } => {
    const errors: string[] = []
    
    // Image validation
    if (!thumbnailImage) {
      errors.push('대표 이미지를 업로드해주세요')
    }
    
    // SKU uniqueness validation (if not already valid)
    if (skuValidation.isValid === false) {
      errors.push('중복되지 않는 SKU를 입력해주세요')
    }
    
    // Colors validation
    if (productColors.length > 0) {
      const invalidColors = productColors.filter(color => {
        const hexRegex = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/
        return !color.name?.trim() || !hexRegex.test(color.code)
      })
      if (invalidColors.length > 0) {
        errors.push('모든 색상의 이름과 올바른 색상 코드를 입력해주세요')
      }
    }
    
    // Sizes validation
    if (productSizes.length > 0) {
      const invalidSizes = productSizes.filter(size => !size.name?.trim())
      if (invalidSizes.length > 0) {
        errors.push('모든 사이즈의 이름을 입력해주세요')
      }
    }
    
    // Bulk pricing validation
    if (bulkPricing.length > 0) {
      const invalidPricing = bulkPricing.filter(bp => 
        bp.pricePerUnit <= 0 || bp.minQuantity <= 0 || 
        (bp.maxQuantity && bp.maxQuantity <= bp.minQuantity)
      )
      if (invalidPricing.length > 0) {
        errors.push('대량구매 가격 설정이 올바르지 않습니다')
      }
      
      // Check if bulk prices are lower than base price
      const expensivePricing = bulkPricing.filter(bp => bp.pricePerUnit >= data.basePrice)
      if (expensivePricing.length > 0) {
        errors.push('대량구매 가격은 기본 가격보다 낮아야 합니다')
      }
    }
    
    // Features validation
    if (productFeatures.length > 0) {
      const invalidFeatures = productFeatures.filter(feature => !feature.trim())
      if (invalidFeatures.length > 0) {
        errors.push('모든 특징을 올바르게 입력해주세요')
      }
    }
    
    // Tags validation
    if (productTags.length > 0) {
      const invalidTags = productTags.filter(tag => !tag.trim() || tag.trim().length < 2)
      if (invalidTags.length > 0) {
        errors.push('모든 태그는 최소 2자 이상이어야 합니다')
      }
    }
    
    return { isValid: errors.length === 0, errors }
  }

  // Enhanced error classification and handling
  const classifyError = (error: any, response?: Response) => {
    let message = 'Unknown error occurred'
    let details = ''
    let retryable = false

    if (response) {
      switch (response.status) {
        case 400:
          message = '입력 데이터가 올바르지 않습니다'
          details = '필수 필드를 확인하고 올바른 형식으로 입력했는지 확인해주세요'
          retryable = false
          break
        case 401:
          message = '로그인이 필요합니다'
          details = '세션이 만료되었을 수 있습니다. 다시 로그인해주세요'
          retryable = false
          break
        case 403:
          message = '권한이 없습니다'
          details = '이 작업을 수행할 권한이 없습니다'
          retryable = false
          break
        case 409:
          message = 'SKU가 이미 존재합니다'
          details = '다른 상품에서 이미 사용 중인 SKU입니다'
          retryable = false
          break
        case 413:
          message = '업로드 파일이 너무 큽니다'
          details = '이미지 크기를 줄이거나 파일 수를 줄여주세요'
          retryable = false
          break
        case 429:
          message = '요청이 너무 많습니다'
          details = '잠시 후 다시 시도해주세요'
          retryable = true
          break
        case 500:
          message = '서버 오류가 발생했습니다'
          details = '잠시 후 다시 시도해주세요'
          retryable = true
          break
        case 502:
        case 503:
        case 504:
          message = '서버에 일시적인 문제가 있습니다'
          details = '네트워크 연결을 확인하고 잠시 후 다시 시도해주세요'
          retryable = true
          break
        default:
          message = '요청 처리 중 오류가 발생했습니다'
          retryable = response.status >= 500
      }
    } else if (error?.name === 'TypeError' && error?.message?.includes('fetch')) {
      message = '네트워크 연결 오류'
      details = '인터넷 연결을 확인하고 다시 시도해주세요'
      retryable = true
    } else if (error?.message) {
      message = error.message
      retryable = error?.retryable || false
    }

    return { message, details, retryable }
  }

  const onFormSubmit = async (data: ProductFormData) => {
    setIsValidatingForm(true)
    setFieldValidationErrors({})
    setApiError(null)
    
    // Comprehensive validation
    const validation = validateFormData(data)
    
    if (!validation.isValid) {
      validation.errors.forEach(error => toast.error(error))
      setIsValidatingForm(false)
      return
    }

    console.log('🚀 Starting product submission...', { isSubmitting, retryCount })
    setIsSubmitting(true)

    try {
      const productData = {
        ...data,
        thumbnailImage,
        images: productImages,
        colors: productColors,
        sizes: productSizes,
        features: productFeatures,
        tags: productTags,
        bulkPricing: bulkPricing,
      }

      console.log('📦 Product data prepared:', productData)

      if (onSubmit) {
        console.log('🔄 Using custom onSubmit handler...')
        try {
          await onSubmit(productData)
          console.log('✅ Custom onSubmit completed successfully')
          toast.success(isEditing ? '상품이 성공적으로 수정되었습니다' : '상품이 성공적으로 등록되었습니다')
          setRetryCount(0)
          
          // Clear auto-saved draft on successful submission
          const draftKey = `product-draft-${initialData?.id || 'new'}`
          localStorage.removeItem(draftKey)
        } catch (error) {
          console.error('❌ Custom onSubmit failed:', error)
          const errorInfo = classifyError(error)
          setApiError(errorInfo)
          toast.error(errorInfo.message)
          throw error
        }
      } else {
        console.log('🔄 Using default API submission...')
        // Default submission to API with timeout
        const controller = new AbortController()
        const timeoutId = setTimeout(() => controller.abort(), 30000) // 30 second timeout
        
        try {
          const response = await fetch('/api/products', {
            method: isEditing ? 'PUT' : 'POST',
            headers: { 
              'Content-Type': 'application/json',
              'X-Request-ID': `product-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
            },
            body: JSON.stringify(productData),
            signal: controller.signal
          })
          
          clearTimeout(timeoutId)

          if (!response.ok) {
            let errorData
            try {
              errorData = await response.json()
            } catch {
              errorData = { message: `HTTP ${response.status}` }
            }
            
            console.error('❌ API submission failed:', errorData)
            const errorInfo = classifyError(errorData, response)
            setApiError(errorInfo)
            toast.error(errorInfo.message)
            throw new Error(errorData.message || 'Failed to save product')
          }

          const result = await response.json()
          console.log('✅ Default API submission completed successfully', result)
          toast.success(isEditing ? '상품이 성공적으로 수정되었습니다' : '상품이 성공적으로 등록되었습니다')
          setRetryCount(0)
          
          // Clear auto-saved draft on successful submission
          const draftKey = `product-draft-${initialData?.id || 'new'}`
          localStorage.removeItem(draftKey)
          
          if (onCancel) {
            onCancel()
          }
        } catch (error: any) {
          clearTimeout(timeoutId)
          
          if (error.name === 'AbortError') {
            const timeoutError = {
              message: '요청 시간이 초과되었습니다',
              details: '네트워크 연결을 확인하고 다시 시도해주세요',
              retryable: true
            }
            setApiError(timeoutError)
            toast.error(timeoutError.message)
          } else {
            const errorInfo = classifyError(error)
            setApiError(errorInfo)
            toast.error(errorInfo.message)
          }
          throw error
        }
      }
    } catch (error: any) {
      console.error('❌ Product submission error:', error)
      
      // Don't show toast again if we already set API error (to avoid duplicate messages)
      if (!apiError) {
        const errorInfo = classifyError(error)
        setApiError(errorInfo)
        toast.error(errorInfo.message)
      }
    } finally {
      console.log('🏁 Product submission finished, resetting states...')
      setIsSubmitting(false)
      setIsValidatingForm(false)
    }
  }

  // Retry function
  const retrySubmission = async () => {
    if (retryCount >= 3) {
      toast.error('최대 재시도 횟수에 도달했습니다')
      return
    }
    
    setRetryCount(prev => prev + 1)
    const currentFormData = watch()
    await onFormSubmit(currentFormData)
  }

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6">
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">
            <div>
              <CardTitle className="text-xl sm:text-2xl">
                {isEditing ? '상품 수정' : isDuplicating ? '상품 복사' : '새 상품 등록'}
              </CardTitle>
              <CardDescription className="text-sm sm:text-base">
                {isEditing 
                  ? '상품 정보와 이미지를 업데이트합니다' 
                  : isDuplicating 
                  ? '기존 상품을 복사하여 새 상품을 만듭니다' 
                  : '카탈로그에 새 상품을 추가합니다'
                }
              </CardDescription>
            </div>
            <div className="text-left sm:text-right flex-shrink-0">
              {/* Template Controls */}
              <div className="flex flex-col sm:flex-row gap-2 mb-4">
                {savedTemplates.length > 0 && (
                  <div className="flex items-center gap-2">
                    <Label className="text-sm font-medium text-gray-700">템플릿:</Label>
                    <Select value={selectedTemplate || ''} onValueChange={(value) => value && loadTemplate(value)}>
                      <SelectTrigger className="w-40">
                        <SelectValue placeholder="템플릿 선택" />
                      </SelectTrigger>
                      <SelectContent>
                        {savedTemplates.map((template) => (
                          <SelectItem key={template.id} value={template.id}>
                            <div className="flex items-center justify-between w-full">
                              <span>{template.name}</span>
                              <Button
                                type="button"
                                size="sm"
                                variant="ghost"
                                onClick={(e) => {
                                  e.preventDefault()
                                  e.stopPropagation()
                                  deleteTemplate(template.id)
                                }}
                                className="w-4 h-4 p-0 text-red-500 hover:text-red-700 ml-2"
                              >
                                ×
                              </Button>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={() => setShowTemplateDialog(true)}
                  className="whitespace-nowrap"
                >
                  템플릿 저장
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant="ghost"
                  onClick={() => setShowKeyboardHelp(true)}
                  className="whitespace-nowrap"
                  title="키보드 단축키 도움말 (? 또는 H)"
                >
                  ⌨️
                </Button>
              </div>

              {/* Status Messages */}
              {autoSaveStatus.isAutoSaving && (
                <div className="flex items-center text-blue-600 text-sm">
                  <div className="animate-spin h-4 w-4 border-2 border-blue-500 rounded-full border-t-transparent mr-2"></div>
                  자동 저장 중...
                </div>
              )}
              {autoSaveStatus.lastSaved && !autoSaveStatus.isAutoSaving && (
                <div className="text-green-600 text-sm">
                  ✓ {autoSaveStatus.lastSaved} 저장됨
                </div>
              )}
              {hasUnsavedChanges && !autoSaveStatus.isAutoSaving && (
                <div className="text-orange-600 text-sm">
                  • 저장되지 않은 변경사항
                </div>
              )}
            </div>
          </div>
        </CardHeader>
        
        {/* Duplication Info Banner */}
        {isDuplicating && (
          <div className="bg-blue-50 border-l-4 border-blue-400 p-4 mx-6 mb-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-blue-700">
                  <strong>상품 복사 정보:</strong> 기존 상품의 정보를 복사했습니다. 
                  SKU에 "-COPY"가 추가되었고, 상품명에 "(복사본)"이 추가되었습니다. 
                  이미지는 복사되지 않으므로 새로 업로드해주세요. 
                  상품 상태는 "비활성"으로 설정되었습니다.
                </p>
              </div>
            </div>
          </div>
        )}
        
        <CardContent>
          <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-6">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-2 sm:grid-cols-6 gap-1">
                <TabsTrigger value="basic" className="text-xs sm:text-sm">기본 정보</TabsTrigger>
                <TabsTrigger value="variants" className="text-xs sm:text-sm">색상/사이즈</TabsTrigger>
                <TabsTrigger value="pricing" className="text-xs sm:text-sm">가격 설정</TabsTrigger>
                <TabsTrigger value="images" className="text-xs sm:text-sm">이미지</TabsTrigger>
                <TabsTrigger value="details" className="text-xs sm:text-sm">상세 정보</TabsTrigger>
                <TabsTrigger value="seo" className="text-xs sm:text-sm">SEO</TabsTrigger>
              </TabsList>

              <TabsContent value="basic" className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                        {Array.isArray(brands) && brands.map((brand) => (
                          <SelectItem key={brand.id} value={brand.id}>
                            {brand.nameKo} {brand.nameCn && `(${brand.nameCn})`}
                          </SelectItem>
                        ))}
                        {!Array.isArray(brands) || brands.length === 0 && (
                          <SelectItem value="no-brands" disabled>
                            브랜드 로딩 중...
                          </SelectItem>
                        )}
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
                        {Array.isArray(categories) && categories.map((category) => (
                          <SelectItem key={category.id} value={category.id}>
                            {category.name}
                          </SelectItem>
                        ))}
                        {!Array.isArray(categories) || categories.length === 0 && (
                          <SelectItem value="no-categories" disabled>
                            카테고리 로딩 중...
                          </SelectItem>
                        )}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <Label htmlFor="sku">SKU <span className="text-red-500">*</span></Label>
                  <div className="relative">
                    <Input
                      id="sku"
                      {...register('sku')}
                      placeholder="e.g., TST-001"
                      className={`pr-10 ${
                        skuValidation.isValid === false ? 'border-red-500' : 
                        skuValidation.isValid === true ? 'border-green-500' : ''
                      }`}
                    />
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                      {skuValidation.isChecking && (
                        <div className="animate-spin h-4 w-4 border-2 border-blue-500 rounded-full border-t-transparent"></div>
                      )}
                      {skuValidation.isValid === true && <span className="text-green-500">✓</span>}
                      {skuValidation.isValid === false && <span className="text-red-500">✗</span>}
                    </div>
                  </div>
                  {errors.sku && (
                    <p className="text-sm text-red-500">{errors.sku.message}</p>
                  )}
                  {skuValidation.message && (
                    <p className={`text-sm mt-1 ${
                      skuValidation.isValid === true ? 'text-green-600' : 
                      skuValidation.isValid === false ? 'text-red-600' : 'text-gray-600'
                    }`}>
                      {skuValidation.message}
                    </p>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="nameKo">상품명 (한글) <span className="text-red-500">*</span></Label>
                    <Input
                      id="nameKo"
                      {...register('nameKo')}
                      placeholder="상품명"
                      className={errors.nameKo ? 'border-red-500 focus:border-red-500' : ''}
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
                  {(errors.basePrice || fieldValidationErrors.basePrice) && (
                    <p className="text-sm text-red-500">
                      {errors.basePrice?.message || fieldValidationErrors.basePrice}
                    </p>
                  )}
                </div>

                <div>
                  <Label htmlFor="inventory">재고 수량 <span className="text-red-500">*</span></Label>
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
                  <p className="text-sm text-gray-500 mt-1">현재 보유하고 있는 실제 재고 수량</p>
                </div>

                <div>
                  <Label htmlFor="status">상품 상태 <span className="text-red-500">*</span></Label>
                  <Select value={watch('status') || 'ACTIVE'} onValueChange={(value) => setValue('status', value as any)}>
                    <SelectTrigger>
                      <SelectValue placeholder="상품 상태를 선택하세요" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ACTIVE">
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 rounded-full bg-green-500"></div>
                          <span>판매중 (ACTIVE)</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="INACTIVE">
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 rounded-full bg-gray-500"></div>
                          <span>비활성 (INACTIVE)</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="OUT_OF_STOCK">
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 rounded-full bg-red-500"></div>
                          <span>품절 (OUT_OF_STOCK)</span>
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  {(errors.status || fieldValidationErrors.status) && (
                    <p className="text-sm text-red-500 mt-1">
                      {errors.status?.message || fieldValidationErrors.status}
                    </p>
                  )}
                  <p className="text-sm text-gray-500 mt-1">
                    판매중: 고객에게 표시되어 주문 가능 | 비활성: 숨김 처리 | 품절: 표시되지만 주문 불가
                  </p>
                </div>

                {/* 배송 정보 섹션 */}
                <div className="border-t pt-6">
                  <h3 className="text-lg font-semibold mb-4">배송 정보</h3>
                  <p className="text-sm text-gray-500 mb-4">
                    정확한 배송비 계산을 위해 상품의 무게와 크기를 입력하세요.
                  </p>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div>
                      <Label htmlFor="weight">무게 (g)</Label>
                      <Input
                        id="weight"
                        type="number"
                        min="0"
                        max="50000"
                        {...register('weight', { valueAsNumber: true })}
                        placeholder="500"
                        onKeyDown={(e) => {
                          if (e.key === '-' || e.key === 'e' || e.key === 'E') {
                            e.preventDefault()
                          }
                        }}
                      />
                      {errors.weight && (
                        <p className="text-sm text-red-500">{errors.weight.message}</p>
                      )}
                      <p className="text-xs text-gray-500 mt-1">예: 500g</p>
                    </div>

                    <div>
                      <Label htmlFor="length">길이 (cm)</Label>
                      <Input
                        id="length"
                        type="number"
                        min="0"
                        max="1000"
                        {...register('length', { valueAsNumber: true })}
                        placeholder="30"
                        onKeyDown={(e) => {
                          if (e.key === '-' || e.key === 'e' || e.key === 'E') {
                            e.preventDefault()
                          }
                        }}
                      />
                      {errors.length && (
                        <p className="text-sm text-red-500">{errors.length.message}</p>
                      )}
                      <p className="text-xs text-gray-500 mt-1">세로 길이</p>
                    </div>

                    <div>
                      <Label htmlFor="width">가로 (cm)</Label>
                      <Input
                        id="width"
                        type="number"
                        min="0"
                        max="1000"
                        {...register('width', { valueAsNumber: true })}
                        placeholder="20"
                        onKeyDown={(e) => {
                          if (e.key === '-' || e.key === 'e' || e.key === 'E') {
                            e.preventDefault()
                          }
                        }}
                      />
                      {errors.width && (
                        <p className="text-sm text-red-500">{errors.width.message}</p>
                      )}
                      <p className="text-xs text-gray-500 mt-1">가로 폭</p>
                    </div>

                    <div>
                      <Label htmlFor="height">높이 (cm)</Label>
                      <Input
                        id="height"
                        type="number"
                        min="0"
                        max="1000"
                        {...register('height', { valueAsNumber: true })}
                        placeholder="10"
                        onKeyDown={(e) => {
                          if (e.key === '-' || e.key === 'e' || e.key === 'E') {
                            e.preventDefault()
                          }
                        }}
                      />
                      {errors.height && (
                        <p className="text-sm text-red-500">{errors.height.message}</p>
                      )}
                      <p className="text-xs text-gray-500 mt-1">두께/높이</p>
                    </div>
                  </div>

                  {/* 배송비 예상 계산기 */}
                  {(watch('weight') || watch('length') || watch('width') || watch('height')) && (
                    <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                      <h4 className="font-medium text-blue-900 mb-2">배송 정보 요약</h4>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-blue-700">무게:</span>{' '}
                          <span className="font-medium">
                            {watch('weight') ? `${watch('weight')}g` : '-'}
                          </span>
                        </div>
                        <div>
                          <span className="text-blue-700">부피:</span>{' '}
                          <span className="font-medium">
                            {(watch('length') && watch('width') && watch('height'))
                              ? `${watch('length')} × ${watch('width')} × ${watch('height')} cm`
                              : '-'
                            }
                          </span>
                        </div>
                        {(watch('length') && watch('width') && watch('height')) && (
                          <div className="col-span-2">
                            <span className="text-blue-700">부피 무게:</span>{' '}
                            <span className="font-medium">
                              {Math.round((watch('length') || 0) * (watch('width') || 0) * (watch('height') || 0) / 5000)}g
                            </span>
                            <span className="text-xs text-blue-600 ml-2">
                              (부피 ÷ 5000 = 부피 무게)
                            </span>
                          </div>
                        )}
                      </div>
                      <p className="text-xs text-blue-600 mt-2">
                        💡 실제 배송비는 무게와 부피 무게 중 큰 값으로 계산됩니다.
                      </p>
                    </div>
                  )}

                  <div className="mt-4 bg-gray-50 border border-gray-200 rounded-lg p-4">
                    <h4 className="font-medium text-gray-900 mb-2">배송 정보 가이드</h4>
                    <ul className="text-sm text-gray-600 space-y-1">
                      <li>• 정확한 무게와 크기를 입력하면 고객에게 정확한 배송비가 안내됩니다</li>
                      <li>• 부피 무게 = 길이 × 가로 × 높이 ÷ 5000 (일반적인 택배 기준)</li>
                      <li>• 실제 무게와 부피 무게 중 큰 값으로 배송비가 계산됩니다</li>
                      <li>• 무게는 그램(g) 단위, 크기는 센티미터(cm) 단위로 입력하세요</li>
                    </ul>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="variants" className="space-y-6">
                <ColorSizeManager
                  colors={productColors}
                  sizes={productSizes}
                  onColorsChange={setProductColors}
                  onSizesChange={setProductSizes}
                />
              </TabsContent>

              <TabsContent value="pricing" className="space-y-6">
                <BulkPricingManager
                  basePrice={watch('basePrice') || 0}
                  bulkPricing={bulkPricing}
                  onBulkPricingChange={setBulkPricing}
                />
              </TabsContent>

              <TabsContent value="images" className="space-y-6">
                <div>
                  <Label className="text-base font-medium">대표 이미지 <span className="text-red-500">*</span></Label>
                  <p className="text-sm text-gray-500 mb-3">
                    상품 목록에 표시되는 메인 이미지 (1개 필수)
                  </p>
                  
                  {thumbnailImage ? (
                    <div className="space-y-3">
                      <div className="relative inline-block group">
                        <div className="w-32 h-32 rounded border overflow-hidden bg-gray-50 flex items-center justify-center">
                          <img
                            src={thumbnailImage}
                            alt="Thumbnail"
                            className="max-w-full max-h-full object-contain"
                          />
                        </div>
                        <div className="absolute -top-2 -right-2 flex gap-1">
                          <Button
                            type="button"
                            size="sm"
                            variant="outline"
                            className="h-6 w-6 p-0 bg-blue-500 text-white hover:bg-blue-600"
                            onClick={() => handleImageEdit(thumbnailImage)}
                            title="이미지 편집"
                          >
                            <Edit className="w-3 h-3" />
                          </Button>
                          <Button
                            type="button"
                            size="sm"
                            variant="destructive"
                            className="h-6 w-6 p-0"
                            onClick={removeThumbnail}
                          >
                            ×
                          </Button>
                        </div>
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
                        existingImages={thumbnailImage ? [thumbnailImage] : []}
                        onImageRemove={removeThumbnailByUrl}
                        onImageEdit={handleImageEdit}
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
                      onImageRemove={(url) => {
                        const index = productImages.indexOf(url)
                        if (index > -1) removeGalleryImage(index)
                      }}
                      onImageEdit={handleImageEdit}
                      imageType="gallery"
                      productId={initialData?.id}
                    />
                  </ErrorBoundary>

                  {productImages.length > 0 && (
                    <div className="mt-4">
                      <h4 className="text-sm font-medium mb-2">갤러리 이미지 ({productImages.length})</h4>
                      <p className="text-xs text-gray-500 mb-2">이미지를 드래그하여 순서를 변경할 수 있습니다.</p>
                      <div className="grid grid-cols-3 md:grid-cols-5 gap-2">
                        {productImages.map((url, index) => (
                          <div 
                            key={index} 
                            className="relative group cursor-move"
                            draggable
                            onDragStart={(e) => e.dataTransfer.setData("text/plain", index.toString())}
                            onDragOver={(e) => e.preventDefault()}
                            onDrop={(e) => {
                              e.preventDefault()
                              const fromIndex = parseInt(e.dataTransfer.getData("text/plain"))
                              moveImage(fromIndex, index)
                            }}
                          >
                            <div className="w-full h-24 rounded border overflow-hidden bg-gray-50 flex items-center justify-center">
                              <img
                                src={url}
                                alt={`Gallery ${index + 1}`}
                                className="max-w-full max-h-full object-contain"
                              />
                            </div>
                            <div className="absolute top-1 left-1 bg-blue-600 text-white text-xs rounded px-1">
                              {index + 1}
                            </div>
                            <div className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                              {index > 0 && (
                                <Button
                                  type="button"
                                  size="sm"
                                  variant="ghost"
                                  className="h-5 w-5 p-0 bg-black/50 text-white hover:bg-black/70"
                                  onClick={() => moveImage(index, index - 1)}
                                >
                                  ←
                                </Button>
                              )}
                              {index < productImages.length - 1 && (
                                <Button
                                  type="button"
                                  size="sm"
                                  variant="ghost"
                                  className="h-5 w-5 p-0 bg-black/50 text-white hover:bg-black/70"
                                  onClick={() => moveImage(index, index + 1)}
                                >
                                  →
                                </Button>
                              )}
                            </div>
                            <div className="absolute -top-2 -right-2 flex gap-1">
                              <Button
                                type="button"
                                size="sm"
                                variant="outline"
                                className="h-5 w-5 p-0 bg-blue-500 text-white hover:bg-blue-600 opacity-0 group-hover:opacity-100 transition-opacity"
                                onClick={() => handleImageEdit(url)}
                                title="이미지 편집"
                              >
                                <Edit className="w-2 h-2" />
                              </Button>
                              <Button
                                type="button"
                                size="sm"
                                variant="destructive"
                                className="h-5 w-5 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                                onClick={() => removeGalleryImage(index)}
                              >
                                ×
                              </Button>
                            </div>
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

                <div>
                  <Label htmlFor="material">소재</Label>
                  <Input
                    id="material"
                    {...register('material')}
                    placeholder="예: 면 100%, 폴리에스터 80% 나일론 20%"
                  />
                  {errors.material && (
                    <p className="text-sm text-red-500">{errors.material.message}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="careInstructions">관리 방법</Label>
                  <Textarea
                    id="careInstructions"
                    {...register('careInstructions')}
                    placeholder="예: 드라이클리닝 권장, 찬물 손세탁, 그늘에서 건조"
                    rows={3}
                  />
                  {errors.careInstructions && (
                    <p className="text-sm text-red-500">{errors.careInstructions.message}</p>
                  )}
                </div>

                <div>
                  <Label>제품 특징</Label>
                  <div className="space-y-2">
                    <div className="flex gap-2">
                      <Input
                        placeholder="제품의 주요 특징을 입력하세요"
                        value={newFeature}
                        onChange={(e) => setNewFeature(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addFeature())}
                      />
                      <Button type="button" onClick={addFeature} size="sm">
                        추가
                      </Button>
                    </div>
                    {productFeatures.length > 0 && (
                      <div className="space-y-1">
                        {productFeatures.map((feature, index) => (
                          <div key={index} className="flex items-center gap-2 p-2 bg-gray-50 rounded">
                            <span className="flex-1">• {feature}</span>
                            <Button
                              type="button"
                              onClick={() => removeFeature(index)}
                              size="sm"
                              variant="ghost"
                              className="text-red-600 hover:text-red-700"
                            >
                              삭제
                            </Button>
                          </div>
                        ))}
                      </div>
                    )}
                    <p className="text-sm text-gray-500">예: 신축성 있는 소재, 통기성 우수, 자외선 차단 기능</p>
                  </div>
                </div>

                <div>
                  <Label>태그</Label>
                  <p className="text-sm text-gray-500 mb-2">
                    상품 검색과 분류에 사용될 태그를 추가하세요 (예: 캐주얼, 여름, 면소재)
                  </p>
                  <div className="space-y-2">
                    <div className="flex gap-2">
                      <Input
                        placeholder="태그를 입력하세요"
                        value={newTag}
                        onChange={(e) => setNewTag(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                        maxLength={20}
                      />
                      <Button 
                        type="button" 
                        onClick={addTag} 
                        size="sm"
                        disabled={productTags.length >= 10}
                      >
                        추가
                      </Button>
                    </div>
                    {productTags.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {productTags.map((tag, index) => (
                          <div key={index} className="flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                            <span>#{tag}</span>
                            <Button
                              type="button"
                              onClick={() => removeTag(index)}
                              size="sm"
                              variant="ghost"
                              className="w-5 h-5 p-0 text-blue-600 hover:text-blue-800 hover:bg-blue-200 rounded-full"
                            >
                              ×
                            </Button>
                          </div>
                        ))}
                      </div>
                    )}
                    <p className="text-xs text-gray-500">
                      {productTags.length}/10 태그 (각 태그는 최대 20자)
                    </p>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="seo" className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold mb-4">검색엔진 최적화 (SEO)</h3>
                  <p className="text-sm text-gray-600 mb-6">
                    검색엔진에서 상품을 더 잘 찾을 수 있도록 메타 정보를 설정하세요.
                  </p>
                  
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="metaTitle">SEO 제목</Label>
                      <p className="text-sm text-gray-500 mb-2">
                        검색결과에 표시될 제목입니다. 비어있으면 상품명이 사용됩니다.
                      </p>
                      <Input
                        id="metaTitle"
                        {...register('metaTitle')}
                        placeholder={`예: ${watch('nameKo') || '상품명'} | 브랜드명`}
                        maxLength={60}
                      />
                      <div className="flex justify-between items-center mt-1">
                        {errors.metaTitle && (
                          <p className="text-sm text-red-500">{errors.metaTitle.message}</p>
                        )}
                        <p className="text-xs text-gray-500 ml-auto">
                          {(watch('metaTitle') || '').length}/60자
                        </p>
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="metaDescription">SEO 설명</Label>
                      <p className="text-sm text-gray-500 mb-2">
                        검색결과에 표시될 설명입니다. 상품의 주요 특징을 요약하세요.
                      </p>
                      <Textarea
                        id="metaDescription"
                        {...register('metaDescription')}
                        placeholder="이 상품의 주요 특징, 용도, 타겟 고객 등을 간결하게 설명하세요..."
                        rows={3}
                        maxLength={160}
                      />
                      <div className="flex justify-between items-center mt-1">
                        {errors.metaDescription && (
                          <p className="text-sm text-red-500">{errors.metaDescription.message}</p>
                        )}
                        <p className="text-xs text-gray-500 ml-auto">
                          {(watch('metaDescription') || '').length}/160자
                        </p>
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="metaKeywords">SEO 키워드</Label>
                      <p className="text-sm text-gray-500 mb-2">
                        검색에 사용될 키워드들을 쉼표로 구분하여 입력하세요.
                      </p>
                      <Input
                        id="metaKeywords"
                        {...register('metaKeywords')}
                        placeholder="패션, 의류, 캐주얼, 여성복, 면소재"
                        maxLength={255}
                      />
                      <div className="flex justify-between items-center mt-1">
                        {errors.metaKeywords && (
                          <p className="text-sm text-red-500">{errors.metaKeywords.message}</p>
                        )}
                        <p className="text-xs text-gray-500 ml-auto">
                          {(watch('metaKeywords') || '').length}/255자
                        </p>
                      </div>
                    </div>

                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <h4 className="font-medium text-blue-900 mb-2">SEO 미리보기</h4>
                      <div className="space-y-2">
                        <div className="text-blue-600 text-lg font-medium">
                          {watch('metaTitle') || watch('nameKo') || '상품 제목'}
                        </div>
                        <div className="text-green-600 text-sm">
                          https://k-fashions.com/products/{watch('sku') || 'product-sku'}
                        </div>
                        <div className="text-gray-600 text-sm">
                          {watch('metaDescription') || '상품 설명이 여기에 표시됩니다...'}
                        </div>
                      </div>
                    </div>

                    <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                      <h4 className="font-medium text-gray-900 mb-2">SEO 팁</h4>
                      <ul className="text-sm text-gray-600 space-y-1">
                        <li>• 제목은 50-60자 이내로 작성하고 주요 키워드를 앞쪽에 배치하세요</li>
                        <li>• 설명은 150-160자 이내로 상품의 핵심 특징과 혜택을 포함하세요</li>
                        <li>• 키워드는 검색량이 높고 상품과 관련성이 높은 것들을 선택하세요</li>
                        <li>• 태그와 키워드를 일치시켜 일관성을 유지하세요</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </TabsContent>
            </Tabs>

            <div className="flex flex-col sm:flex-row justify-end gap-2 sm:space-x-4 pt-6 border-t">
              {onCancel && (
                <Button type="button" variant="outline" onClick={onCancel} className="order-2 sm:order-1">
                  취소
                </Button>
              )}
              <Button 
                type="submit" 
                disabled={isSubmitting || isValidatingForm || skuValidation.isValid === false || Object.keys(fieldValidationErrors).length > 0} 
                className="order-1 sm:order-2"
              >
                {(isSubmitting || isValidatingForm) && (
                  <svg className="animate-spin -ml-1 mr-3 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                )}
                {isValidatingForm
                  ? '유효성 검사 중...'
                  : isSubmitting
                    ? isEditing
                      ? '수정 중...'
                      : '등록 중...'
                    : isEditing
                    ? '상품 수정'
                    : '상품 등록'}
              </Button>
              
              {Object.keys(fieldValidationErrors).length > 0 && (
                <div className="col-span-2 mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-sm text-red-600 font-medium">
                    ⚠️ {Object.keys(fieldValidationErrors).length}개의 유효성 검사 오류가 있습니다:
                  </p>
                  <ul className="mt-2 text-sm text-red-600 list-disc list-inside space-y-1">
                    {Object.entries(fieldValidationErrors).map(([field, message]) => (
                      <li key={field}>{message}</li>
                    ))}
                  </ul>
                </div>
              )}

              {apiError && (
                <div className="col-span-2 mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-5 h-5 text-red-600">
                          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z" clipRule="evenodd" />
                          </svg>
                        </div>
                        <p className="text-sm text-red-600 font-medium">
                          저장 실패
                        </p>
                      </div>
                      <p className="text-sm text-red-600 mb-1">
                        {apiError.message}
                      </p>
                      {apiError.details && (
                        <p className="text-xs text-red-500">
                          {apiError.details}
                        </p>
                      )}
                      {retryCount > 0 && (
                        <p className="text-xs text-red-500 mt-2">
                          재시도 횟수: {retryCount}/3
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-2 ml-4">
                      {apiError.retryable && retryCount < 3 && (
                        <Button
                          type="button"
                          size="sm"
                          variant="outline"
                          onClick={retrySubmission}
                          disabled={isSubmitting || isValidatingForm}
                          className="text-red-600 border-red-300 hover:bg-red-50"
                        >
                          다시 시도
                        </Button>
                      )}
                      <Button
                        type="button"
                        size="sm"
                        variant="ghost"
                        onClick={() => setApiError(null)}
                        className="text-red-600 hover:bg-red-50"
                      >
                        닫기
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Keyboard Help Dialog */}
      {showKeyboardHelp && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">키보드 단축키</h3>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setShowKeyboardHelp(false)}
                className="h-6 w-6 p-0"
              >
                ×
              </Button>
            </div>

            <div className="space-y-4">
              <div>
                <h4 className="font-medium text-sm mb-2">폼 조작</h4>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span>저장</span>
                    <Badge variant="outline" className="text-xs">Ctrl + S</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span>취소</span>
                    <Badge variant="outline" className="text-xs">ESC</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span>수동 저장</span>
                    <Badge variant="outline" className="text-xs">Ctrl + Shift + S</Badge>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="font-medium text-sm mb-2">탭 이동</h4>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span>기본 정보</span>
                    <Badge variant="outline" className="text-xs">1</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span>색상/사이즈</span>
                    <Badge variant="outline" className="text-xs">2</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span>가격 설정</span>
                    <Badge variant="outline" className="text-xs">3</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span>이미지</span>
                    <Badge variant="outline" className="text-xs">4</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span>상세 정보</span>
                    <Badge variant="outline" className="text-xs">5</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span>SEO</span>
                    <Badge variant="outline" className="text-xs">6</Badge>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="font-medium text-sm mb-2">템플릿</h4>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span>템플릿 저장</span>
                    <Badge variant="outline" className="text-xs">Ctrl + T</Badge>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="font-medium text-sm mb-2">도움말</h4>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span>이 도움말</span>
                    <Badge variant="outline" className="text-xs">? 또는 H</Badge>
                  </div>
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <p className="text-xs text-blue-700">
                  💡 단축키는 입력 필드에서 타이핑할 때는 작동하지 않습니다. 
                  입력을 마친 후 다른 곳을 클릭하거나 Tab 키를 눌러 포커스를 이동한 다음 사용하세요.
                </p>
              </div>
            </div>

            <div className="flex justify-end mt-6">
              <Button
                type="button"
                onClick={() => setShowKeyboardHelp(false)}
              >
                확인
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Template Save Dialog */}
      {showTemplateDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-lg max-w-md w-full">
            <div className="p-6">
              <h3 className="text-lg font-semibold mb-4">템플릿 저장</h3>
              <p className="text-sm text-gray-600 mb-4">
                현재 상품 정보를 템플릿으로 저장하여 나중에 빠르게 재사용할 수 있습니다.
              </p>
              
              <div className="space-y-4">
                <div>
                  <Label htmlFor="templateName">템플릿 이름</Label>
                  <Input
                    id="templateName"
                    value={templateName}
                    onChange={(e) => setTemplateName(e.target.value)}
                    placeholder="예: 여성 상의 템플릿"
                    maxLength={50}
                    onKeyPress={(e) => e.key === 'Enter' && saveTemplate()}
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    {templateName.length}/50자
                  </p>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                  <h4 className="text-sm font-medium text-blue-900 mb-2">저장될 정보:</h4>
                  <ul className="text-xs text-blue-700 space-y-1">
                    <li>• 브랜드, 카테고리, 상품명</li>
                    <li>• 가격, 재고, 상태 정보</li>
                    <li>• 색상, 사이즈, 대량구매 설정</li>
                    <li>• 소재, 관리방법, 특징, 태그</li>
                    <li>• SEO 정보 (제목, 설명, 키워드)</li>
                    <li>• 배송 정보 (무게, 크기)</li>
                  </ul>
                  <p className="text-xs text-blue-600 mt-2">
                    💡 이미지는 각 상품마다 고유하므로 템플릿에 포함되지 않습니다.
                  </p>
                </div>

                {savedTemplates.length > 0 && (
                  <div>
                    <h4 className="text-sm font-medium text-gray-900 mb-2">
                      기존 템플릿 ({savedTemplates.length}개)
                    </h4>
                    <div className="max-h-32 overflow-y-auto space-y-1">
                      {savedTemplates.map((template) => (
                        <div key={template.id} className="flex items-center justify-between p-2 bg-gray-50 rounded text-sm">
                          <span>{template.name}</span>
                          <span className="text-xs text-gray-500">
                            {new Date(template.createdAt).toLocaleDateString('ko-KR')}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="flex justify-end gap-2 mt-6">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setShowTemplateDialog(false)
                    setTemplateName('')
                  }}
                >
                  취소
                </Button>
                <Button
                  type="button"
                  onClick={saveTemplate}
                  disabled={!templateName.trim()}
                >
                  저장
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Image Editor */}
      {showImageEditor && editingImageUrl && (
        <div className="fixed inset-0 bg-white z-50 overflow-y-auto">
          <ImageEditor
            imageUrl={editingImageUrl}
            onSave={handleImageEditSave}
            onCancel={handleImageEditCancel}
          />
        </div>
      )}
    </div>
  )
}