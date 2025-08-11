'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

const simpleProductSchema = z.object({
  nameKo: z.string().min(1, '상품명을 입력해주세요'),
  basePrice: z.number().min(0, '가격은 0원 이상이어야 합니다'),
})

type SimpleProductFormData = z.infer<typeof simpleProductSchema>

interface SimpleProductFormProps {
  onSubmit?: (data: SimpleProductFormData) => void
  onCancel?: () => void
}

export function SimpleProductForm({ onSubmit, onCancel }: SimpleProductFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SimpleProductFormData>({
    resolver: zodResolver(simpleProductSchema),
    defaultValues: {
      nameKo: '',
      basePrice: 0,
    },
  })

  const onFormSubmit = async (data: SimpleProductFormData) => {
    console.log('Simple form submit:', data)
    setIsSubmitting(true)

    try {
      if (onSubmit) {
        await onSubmit(data)
      }
    } catch (error) {
      console.error('Simple form error:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Simple Product Form</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-4">
          <div>
            <Label htmlFor="nameKo">상품명</Label>
            <Input
              id="nameKo"
              {...register('nameKo')}
              placeholder="상품명을 입력하세요"
            />
            {errors.nameKo && (
              <p className="text-sm text-red-500">{errors.nameKo.message}</p>
            )}
          </div>

          <div>
            <Label htmlFor="basePrice">가격</Label>
            <Input
              id="basePrice"
              type="number"
              min="0"
              {...register('basePrice', { valueAsNumber: true })}
              placeholder="0"
            />
            {errors.basePrice && (
              <p className="text-sm text-red-500">{errors.basePrice.message}</p>
            )}
          </div>

          <div className="flex justify-end space-x-4">
            {onCancel && (
              <Button type="button" variant="outline" onClick={onCancel}>
                취소
              </Button>
            )}
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? '처리 중...' : '저장'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}