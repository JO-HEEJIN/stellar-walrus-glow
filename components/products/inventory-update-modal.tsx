'use client'

import { useState } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { toast } from 'sonner'
import { Package } from 'lucide-react'

interface InventoryUpdateModalProps {
  product: {
    id: string
    sku: string
    nameKo: string
    inventory: number
  }
  isOpen: boolean
  onClose: () => void
  onSuccess?: () => void
}

export function InventoryUpdateModal({ product, isOpen, onClose, onSuccess }: InventoryUpdateModalProps) {
  const [operation, setOperation] = useState<'set' | 'increment' | 'decrement'>('increment')
  const [quantity, setQuantity] = useState('')
  const [reason, setReason] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    const qty = parseInt(quantity)
    if (isNaN(qty) || qty < 0) {
      toast.error('수량은 0 이상의 숫자여야 합니다')
      return
    }

    // Check if decrement would result in negative inventory
    if (operation === 'decrement' && qty > product.inventory) {
      toast.error(`현재 재고(${product.inventory}개)보다 많은 수량을 차감할 수 없습니다`)
      return
    }

    setIsSubmitting(true)

    try {
      const response = await fetch(`/api/products/${product.id}/inventory`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          operation,
          quantity: qty,
          reason: reason.trim() || undefined,
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || '재고 업데이트에 실패했습니다')
      }

      const result = await response.json()
      const { previousInventory, newInventory } = result.data

      toast.success(
        `재고가 ${previousInventory}개에서 ${newInventory}개로 업데이트되었습니다`
      )

      onClose()
      if (onSuccess) {
        onSuccess()
      }
    } catch (error: any) {
      toast.error(error.message || '재고 업데이트 중 오류가 발생했습니다')
    } finally {
      setIsSubmitting(false)
    }
  }

  const getPreviewInventory = () => {
    const qty = parseInt(quantity) || 0
    switch (operation) {
      case 'set':
        return qty
      case 'increment':
        return product.inventory + qty
      case 'decrement':
        return Math.max(0, product.inventory - qty)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              재고 업데이트
            </DialogTitle>
            <DialogDescription>
              {product.nameKo} ({product.sku})
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label>현재 재고</Label>
              <div className="text-2xl font-semibold">{product.inventory}개</div>
            </div>

            <div className="space-y-2">
              <Label>작업 유형</Label>
              <RadioGroup value={operation} onValueChange={(value: any) => setOperation(value)}>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="increment" id="increment" />
                  <Label htmlFor="increment" className="font-normal cursor-pointer">
                    재고 추가
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="decrement" id="decrement" />
                  <Label htmlFor="decrement" className="font-normal cursor-pointer">
                    재고 차감
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="set" id="set" />
                  <Label htmlFor="set" className="font-normal cursor-pointer">
                    재고 설정
                  </Label>
                </div>
              </RadioGroup>
            </div>

            <div className="space-y-2">
              <Label htmlFor="quantity">수량</Label>
              <Input
                id="quantity"
                type="number"
                min="0"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                placeholder={operation === 'set' ? '새로운 재고 수량' : '변경할 수량'}
                required
              />
            </div>

            {quantity && (
              <div className="space-y-2">
                <Label>변경 후 재고</Label>
                <div className="text-xl font-semibold text-blue-600">
                  {getPreviewInventory()}개
                </div>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="reason">사유 (선택사항)</Label>
              <Textarea
                id="reason"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="재고 변경 사유를 입력하세요"
                rows={3}
              />
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
              취소
            </Button>
            <Button type="submit" disabled={isSubmitting || !quantity}>
              {isSubmitting ? '처리 중...' : '업데이트'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}