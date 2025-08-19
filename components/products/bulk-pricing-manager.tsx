'use client'

import { useState } from 'react'
import { Plus, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

interface BulkPricing {
  id?: string
  minQuantity: number
  maxQuantity: number | null
  pricePerUnit: number
  discountRate?: number
}

interface BulkPricingManagerProps {
  basePrice: number
  bulkPricing: BulkPricing[]
  onBulkPricingChange: (pricing: BulkPricing[]) => void
}

export function BulkPricingManager({
  basePrice,
  bulkPricing = [],
  onBulkPricingChange,
}: BulkPricingManagerProps) {
  const [newMinQty, setNewMinQty] = useState('')
  const [newMaxQty, setNewMaxQty] = useState('')
  const [newPrice, setNewPrice] = useState('')

  // 대량구매 가격 추가
  const addBulkPricing = () => {
    const minQty = parseInt(newMinQty)
    const maxQty = newMaxQty ? parseInt(newMaxQty) : null
    const price = parseFloat(newPrice)

    if (!minQty || !price || minQty < 1 || price < 0) {
      return
    }

    // 수량 범위 겹침 체크
    const hasOverlap = bulkPricing.some(bp => {
      const bpMax = bp.maxQuantity || Infinity
      const newMax = maxQty || Infinity
      
      return (minQty >= bp.minQuantity && minQty <= bpMax) ||
             (newMax >= bp.minQuantity && newMax <= bpMax) ||
             (minQty <= bp.minQuantity && newMax >= bpMax)
    })

    if (hasOverlap) {
      alert('수량 범위가 기존 설정과 겹칩니다.')
      return
    }

    const discountRate = basePrice > 0 ? Math.round((1 - price / basePrice) * 100) : 0

    const newBulkPrice: BulkPricing = {
      minQuantity: minQty,
      maxQuantity: maxQty,
      pricePerUnit: price,
      discountRate: discountRate > 0 ? discountRate : undefined,
    }

    onBulkPricingChange([...bulkPricing, newBulkPrice].sort((a, b) => a.minQuantity - b.minQuantity))
    
    // 입력 필드 초기화
    setNewMinQty('')
    setNewMaxQty('')
    setNewPrice('')
  }

  // 대량구매 가격 제거
  const removeBulkPricing = (index: number) => {
    const bp = bulkPricing[index]
    if (confirm(`${bp.minQuantity}~${bp.maxQuantity || '∞'}개 구간의 가격 설정을 삭제하시겠습니까?`)) {
      onBulkPricingChange(bulkPricing.filter((_, i) => i !== index))
    }
  }

  // 가격 업데이트
  const updatePrice = (index: number, price: number) => {
    const updated = [...bulkPricing]
    updated[index].pricePerUnit = price
    updated[index].discountRate = basePrice > 0 ? Math.round((1 - price / basePrice) * 100) : undefined
    onBulkPricingChange(updated)
  }

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-semibold mb-4">대량구매 가격 설정</h3>
        <p className="text-sm text-gray-600 mb-4">
          수량별 할인 가격을 설정하세요. 기본 가격: {basePrice > 0 ? `₩${basePrice.toLocaleString()}` : '미설정'}
        </p>
      </div>

      {/* 대량구매 가격 추가 폼 */}
      <div className="grid grid-cols-4 gap-2 p-4 bg-gray-50 rounded-lg">
        <div>
          <Label className="text-sm">최소 수량</Label>
          <Input
            type="number"
            placeholder="10"
            value={newMinQty}
            onChange={(e) => setNewMinQty(e.target.value)}
            min="1"
          />
        </div>
        <div>
          <Label className="text-sm">최대 수량 (선택)</Label>
          <Input
            type="number"
            placeholder="100"
            value={newMaxQty}
            onChange={(e) => setNewMaxQty(e.target.value)}
            min="1"
          />
        </div>
        <div>
          <Label className="text-sm">개당 가격</Label>
          <Input
            type="number"
            placeholder="50000"
            value={newPrice}
            onChange={(e) => setNewPrice(e.target.value)}
            min="0"
          />
        </div>
        <div className="flex items-end">
          <Button onClick={addBulkPricing} size="sm" className="w-full">
            <Plus className="h-4 w-4 mr-1" />
            추가
          </Button>
        </div>
      </div>

      {/* 대량구매 가격 목록 */}
      <div className="space-y-2">
        {bulkPricing.map((bp, index) => (
          <div
            key={bp.id || index}
            className="flex items-center gap-4 p-3 bg-white border rounded-lg"
          >
            <div className="flex-1 grid grid-cols-3 gap-4">
              <div>
                <span className="text-sm text-gray-600">수량 범위</span>
                <p className="font-medium">
                  {bp.minQuantity}개 ~ {bp.maxQuantity || '∞'}개
                </p>
              </div>
              <div>
                <span className="text-sm text-gray-600">개당 가격</span>
                <div className="flex items-center gap-2">
                  <Input
                    type="number"
                    value={bp.pricePerUnit}
                    onChange={(e) => updatePrice(index, parseFloat(e.target.value) || 0)}
                    className="w-24"
                    min="0"
                  />
                  <span className="text-sm">원</span>
                </div>
              </div>
              <div>
                <span className="text-sm text-gray-600">할인율</span>
                <p className="font-medium">
                  {bp.discountRate ? (
                    <span className="text-red-600">{bp.discountRate}% 할인</span>
                  ) : (
                    <span className="text-gray-400">-</span>
                  )}
                </p>
              </div>
            </div>
            <Button
              onClick={() => removeBulkPricing(index)}
              size="sm"
              variant="ghost"
              className="text-red-600 hover:text-red-700"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        ))}
        
        {bulkPricing.length === 0 && (
          <p className="text-center text-gray-500 py-8">
            대량구매 가격이 설정되지 않았습니다.
          </p>
        )}
      </div>

      {/* 예시 표시 */}
      {bulkPricing.length > 0 && basePrice > 0 && (
        <div className="mt-4 p-4 bg-blue-50 rounded-lg">
          <h4 className="font-medium mb-2">가격 예시</h4>
          <div className="space-y-1 text-sm">
            <div className="flex justify-between">
              <span>1개 구매시:</span>
              <span className="font-medium">₩{basePrice.toLocaleString()}</span>
            </div>
            {bulkPricing.map((bp, index) => (
              <div key={index} className="flex justify-between">
                <span>{bp.minQuantity}개 구매시:</span>
                <span className="font-medium">
                  개당 ₩{bp.pricePerUnit.toLocaleString()}
                  {bp.discountRate && <span className="text-red-600 ml-1">({bp.discountRate}% 할인)</span>}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}