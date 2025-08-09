'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useCartStore } from '@/lib/stores/cart'
import { CartHeader } from '@/components/cart/CartHeader'
import { CartSelectionBar } from '@/components/cart/CartSelectionBar'
import { CartBrandGroup } from '@/components/cart/CartBrandGroup'
import { CartSidebar } from '@/components/cart/CartSidebar'
import { CartEmpty } from '@/components/cart/CartEmpty'

export default function CartPage() {
  const router = useRouter()
  const { items, updateQuantity, removeItem, clearCart } = useCartStore()
  const [selectedItems, setSelectedItems] = useState<string[]>([])
  
  // 컴포넌트 마운트시 모든 아이템을 선택 상태로 초기화
  useState(() => {
    if (items.length > 0) {
      setSelectedItems(items.map(item => item.id))
    }
  })

  // 브랜드별로 아이템 그룹화
  const groupedByBrand = items.reduce((groups, item) => {
    const brand = item.brandName || '기타';
    if (!groups[brand]) {
      groups[brand] = [];
    }
    groups[brand].push(item);
    return groups;
  }, {} as Record<string, typeof items>)

  // 선택된 아이템들의 총액과 개수 계산
  const selectedTotal = items
    .filter(item => selectedItems.includes(item.id))
    .reduce((sum, item) => sum + (item.price * item.quantity), 0)
  
  const selectedCount = selectedItems.length
  const totalItems = items.length
  const allSelected = totalItems > 0 && selectedItems.length === totalItems

  // 전체 선택/해제
  const handleSelectAll = (selected: boolean) => {
    if (selected) {
      setSelectedItems(items.map(item => item.id))
    } else {
      setSelectedItems([])
    }
  }

  // 개별 아이템 선택/해제
  const handleItemSelect = (itemId: string, selected: boolean) => {
    if (selected) {
      setSelectedItems(prev => [...prev, itemId])
    } else {
      setSelectedItems(prev => prev.filter(id => id !== itemId))
    }
  }

  // 브랜드 전체 선택/해제
  const handleBrandSelect = (brandName: string, selected: boolean) => {
    const brandItems = groupedByBrand[brandName] || []
    const brandItemIds = brandItems.map(item => item.id)
    
    if (selected) {
      setSelectedItems(prev => [...new Set([...prev, ...brandItemIds])])
    } else {
      setSelectedItems(prev => prev.filter(id => !brandItemIds.includes(id)))
    }
  }

  // 선택 삭제
  const handleDeleteSelected = () => {
    if (selectedItems.length === 0) {
      alert('삭제할 상품을 선택해주세요.')
      return
    }
    
    if (confirm(`선택한 ${selectedItems.length}개 상품을 삭제하시겠습니까?`)) {
      selectedItems.forEach(itemId => removeItem(itemId))
      setSelectedItems([])
    }
  }

  // 품절 삭제 (현재는 기본 구현)
  const handleDeleteOutOfStock = () => {
    alert('품절 상품이 없습니다.')
  }

  // 수량 변경
  const handleQuantityChange = (itemId: string, quantity: number) => {
    updateQuantity(itemId, quantity)
  }

  // 아이템 제거
  const handleRemoveItem = (itemId: string) => {
    if (confirm('해당 상품을 삭제하시겠습니까?')) {
      removeItem(itemId)
      setSelectedItems(prev => prev.filter(id => id !== itemId))
    }
  }

  // 결제 페이지로 이동
  const handleCheckout = () => {
    router.push('/checkout')
  }

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50">
        <CartHeader currentStep={1} />
        <div className="max-w-7xl mx-auto px-4">
          <CartEmpty />
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <CartHeader currentStep={1} />
      
      <div className="max-w-7xl mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {/* 장바구니 콘텐츠 */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg p-5">
              {/* 선택 바 */}
              <CartSelectionBar
                totalItems={totalItems}
                selectedItems={selectedCount}
                allSelected={allSelected}
                onSelectAll={handleSelectAll}
                onDeleteSelected={handleDeleteSelected}
                onDeleteOutOfStock={handleDeleteOutOfStock}
              />

              {/* 브랜드별 그룹 */}
              {Object.entries(groupedByBrand).map(([brandName, brandItems]) => (
                <CartBrandGroup
                  key={brandName}
                  brandName={brandName}
                  items={brandItems}
                  selectedItems={selectedItems}
                  onItemSelect={handleItemSelect}
                  onBrandSelect={handleBrandSelect}
                  onQuantityChange={handleQuantityChange}
                  onRemoveItem={handleRemoveItem}
                />
              ))}
            </div>
          </div>

          {/* 사이드바 */}
          <div className="lg:col-span-1">
            <CartSidebar
              selectedTotal={selectedTotal}
              selectedCount={selectedCount}
              onCheckout={handleCheckout}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
