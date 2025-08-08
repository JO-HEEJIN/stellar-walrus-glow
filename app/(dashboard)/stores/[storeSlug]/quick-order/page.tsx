'use client'

import { useState } from 'react'
import { notFound } from 'next/navigation'
import { getStoreBySlug } from '@/lib/config/stores'
import { 
  ShoppingCart, 
  Upload, 
  Download, 
  Plus, 
  Trash2, 
  Package,
  Calculator,
  FileSpreadsheet,
  Zap
} from 'lucide-react'
import { formatPrice } from '@/lib/utils'

interface QuickOrderPageProps {
  params: { storeSlug: string }
}

interface OrderItem {
  id: string
  sku: string
  productName: string
  size: string
  color: string
  quantity: number
  unitPrice: number
  totalPrice: number
  available: boolean
  error?: string
}

export default function QuickOrderPage({ params }: QuickOrderPageProps) {
  const store = getStoreBySlug(params.storeSlug)
  const [orderItems, setOrderItems] = useState<OrderItem[]>([])
  const [loading, setLoading] = useState(false)
  const [skuInput, setSkuInput] = useState('')
  
  if (!store) {
    notFound()
  }

  const addOrderItem = () => {
    const newItem: OrderItem = {
      id: Date.now().toString(),
      sku: '',
      productName: '',
      size: '',
      color: '',
      quantity: 1,
      unitPrice: 0,
      totalPrice: 0,
      available: true
    }
    setOrderItems([...orderItems, newItem])
  }

  const updateOrderItem = (id: string, field: keyof OrderItem, value: any) => {
    setOrderItems(items => 
      items.map(item => {
        if (item.id === id) {
          const updated = { ...item, [field]: value }
          
          // 수량 변경 시 총 가격 자동 계산
          if (field === 'quantity' || field === 'unitPrice') {
            updated.totalPrice = updated.quantity * updated.unitPrice
          }
          
          return updated
        }
        return item
      })
    )
  }

  const removeOrderItem = (id: string) => {
    setOrderItems(items => items.filter(item => item.id !== id))
  }

  const bulkAddBySku = async () => {
    if (!skuInput.trim()) return
    
    const skus = skuInput.split('\n').filter(sku => sku.trim())
    setLoading(true)
    
    try {
      // Mock API call to get product info by SKU
      const newItems = await Promise.all(
        skus.map(async (sku, index) => {
          // Simulate API delay
          await new Promise(resolve => setTimeout(resolve, 100))
          
          return {
            id: (Date.now() + index).toString(),
            sku: sku.trim(),
            productName: `골프웨어 상품 ${sku.trim()}`,
            size: 'M',
            color: '화이트',
            quantity: 1,
            unitPrice: Math.floor(Math.random() * 100000) + 50000,
            totalPrice: 0,
            available: Math.random() > 0.1 // 90% 확률로 재고 있음
          }
        })
      )
      
      // 총 가격 계산
      const itemsWithTotal = newItems.map(item => ({
        ...item,
        totalPrice: item.quantity * item.unitPrice
      }))
      
      setOrderItems([...orderItems, ...itemsWithTotal])
      setSkuInput('')
    } catch (error) {
      console.error('SKU 조회 실패:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return
    
    // Mock Excel parsing
    const reader = new FileReader()
    reader.onload = (e) => {
      // 실제로는 xlsx 라이브러리 사용
      alert('엑셀 파일 업로드 기능은 구현 예정입니다.')
    }
    reader.readAsArrayBuffer(file)
  }

  const downloadTemplate = () => {
    // Mock template download
    alert('엑셀 템플릿 다운로드 기능은 구현 예정입니다.')
  }

  const getTotalAmount = () => {
    return orderItems.reduce((sum, item) => sum + item.totalPrice, 0)
  }

  const getMinimumOrderAlert = () => {
    const total = getTotalAmount()
    const minimum = 1000000 // 100만원 최소 주문
    
    if (total < minimum) {
      return {
        show: true,
        message: `최소 주문 금액은 ${formatPrice(minimum)}입니다. ${formatPrice(minimum - total)} 더 주문해주세요.`,
        type: 'warning'
      }
    }
    
    return { show: false, message: '', type: 'success' }
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              빠른 주문 (Quick Order)
            </h1>
            <p className="text-gray-600 mt-2">
              SKU 직접 입력 또는 엑셀 파일 업로드로 대량 주문을 빠르게 처리하세요
            </p>
          </div>
          <div className="flex space-x-4">
            <button
              onClick={downloadTemplate}
              className="flex items-center px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
            >
              <Download className="w-4 h-4 mr-2" />
              템플릿 다운로드
            </button>
            <label className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 cursor-pointer">
              <Upload className="w-4 h-4 mr-2" />
              엑셀 업로드
              <input
                type="file"
                accept=".xlsx,.xls"
                onChange={handleFileUpload}
                className="hidden"
              />
            </label>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-3">
          {/* SKU 일괄 입력 */}
          <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
              <Zap className="w-5 h-5 mr-2 text-yellow-500" />
              SKU 일괄 입력
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="md:col-span-2">
                <textarea
                  value={skuInput}
                  onChange={(e) => setSkuInput(e.target.value)}
                  placeholder="SKU를 한 줄에 하나씩 입력하세요&#10;예시:&#10;GLF-001-M-WH&#10;GLF-002-L-BK&#10;GLF-003-S-GR"
                  className="w-full h-32 px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                  rows={6}
                />
              </div>
              <div className="flex flex-col justify-between">
                <div className="text-sm text-gray-600 mb-4">
                  <div className="flex items-center mb-2">
                    <FileSpreadsheet className="w-4 h-4 mr-2" />
                    입력 형식 안내
                  </div>
                  <ul className="text-xs space-y-1">
                    <li>• 한 줄에 하나의 SKU</li>
                    <li>• 최대 100개까지 일괄 입력</li>
                    <li>• 자동으로 상품 정보 조회</li>
                  </ul>
                </div>
                <button
                  onClick={bulkAddBySku}
                  disabled={!skuInput.trim() || loading}
                  className="w-full bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 disabled:opacity-50 flex items-center justify-center"
                >
                  {loading ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  ) : (
                    <>
                      <Plus className="w-4 h-4 mr-2" />
                      일괄 추가
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* 주문 목록 */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900 flex items-center">
                <Package className="w-5 h-5 mr-2 text-blue-500" />
                주문 목록 ({orderItems.length}개)
              </h3>
              <button
                onClick={addOrderItem}
                className="flex items-center px-3 py-2 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
              >
                <Plus className="w-4 h-4 mr-1" />
                항목 추가
              </button>
            </div>

            {orderItems.length === 0 ? (
              <div className="text-center py-12 border-2 border-dashed border-gray-300 rounded-lg">
                <Package className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <p className="text-gray-600 mb-2">주문할 상품이 없습니다</p>
                <p className="text-sm text-gray-500">
                  SKU 입력, 엑셀 업로드 또는 수동으로 항목을 추가하세요
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">SKU</th>
                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">상품명</th>
                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">사이즈</th>
                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">색상</th>
                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">수량</th>
                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">단가</th>
                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">총액</th>
                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {orderItems.map((item) => (
                      <tr key={item.id} className={!item.available ? 'bg-red-50' : ''}>
                        <td className="px-3 py-2">
                          <input
                            type="text"
                            value={item.sku}
                            onChange={(e) => updateOrderItem(item.id, 'sku', e.target.value)}
                            className="w-24 px-2 py-1 text-sm border border-gray-300 rounded"
                            placeholder="SKU"
                          />
                        </td>
                        <td className="px-3 py-2">
                          <input
                            type="text"
                            value={item.productName}
                            onChange={(e) => updateOrderItem(item.id, 'productName', e.target.value)}
                            className="w-32 px-2 py-1 text-sm border border-gray-300 rounded"
                            placeholder="상품명"
                          />
                        </td>
                        <td className="px-3 py-2">
                          <select
                            value={item.size}
                            onChange={(e) => updateOrderItem(item.id, 'size', e.target.value)}
                            className="w-16 px-2 py-1 text-sm border border-gray-300 rounded"
                          >
                            <option value="">-</option>
                            <option value="XS">XS</option>
                            <option value="S">S</option>
                            <option value="M">M</option>
                            <option value="L">L</option>
                            <option value="XL">XL</option>
                            <option value="XXL">XXL</option>
                          </select>
                        </td>
                        <td className="px-3 py-2">
                          <input
                            type="text"
                            value={item.color}
                            onChange={(e) => updateOrderItem(item.id, 'color', e.target.value)}
                            className="w-20 px-2 py-1 text-sm border border-gray-300 rounded"
                            placeholder="색상"
                          />
                        </td>
                        <td className="px-3 py-2">
                          <input
                            type="number"
                            value={item.quantity}
                            onChange={(e) => updateOrderItem(item.id, 'quantity', parseInt(e.target.value) || 0)}
                            className="w-16 px-2 py-1 text-sm border border-gray-300 rounded"
                            min="1"
                          />
                        </td>
                        <td className="px-3 py-2">
                          <input
                            type="number"
                            value={item.unitPrice}
                            onChange={(e) => updateOrderItem(item.id, 'unitPrice', parseInt(e.target.value) || 0)}
                            className="w-24 px-2 py-1 text-sm border border-gray-300 rounded"
                            placeholder="단가"
                          />
                        </td>
                        <td className="px-3 py-2 text-sm font-medium">
                          {formatPrice(item.totalPrice)}
                        </td>
                        <td className="px-3 py-2">
                          <button
                            onClick={() => removeOrderItem(item.id)}
                            className="text-red-600 hover:text-red-800"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* 주문 요약 */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
              <Calculator className="w-5 h-5 mr-2 text-green-500" />
              주문 요약
            </h3>
            
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">총 상품 수</span>
                <span className="font-medium">{orderItems.length}개</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">총 수량</span>
                <span className="font-medium">
                  {orderItems.reduce((sum, item) => sum + item.quantity, 0)}개
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">상품 금액</span>
                <span className="font-medium">{formatPrice(getTotalAmount())}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">배송비</span>
                <span className="font-medium text-green-600">무료</span>
              </div>
              <div className="border-t pt-3">
                <div className="flex justify-between">
                  <span className="text-lg font-medium text-gray-900">총 결제 금액</span>
                  <span className="text-lg font-bold text-gray-900">
                    {formatPrice(getTotalAmount())}
                  </span>
                </div>
              </div>
            </div>

            {/* 최소 주문 금액 알림 */}
            {getMinimumOrderAlert().show && (
              <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
                <p className="text-sm text-yellow-800">
                  {getMinimumOrderAlert().message}
                </p>
              </div>
            )}

            <button
              disabled={orderItems.length === 0 || getTotalAmount() < 1000000}
              className="w-full mt-6 bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
            >
              <ShoppingCart className="w-5 h-5 mr-2" />
              주문하기
            </button>
          </div>

          {/* 도매 가격 안내 */}
          <div className="bg-blue-50 rounded-lg border border-blue-200 p-6">
            <h3 className="text-lg font-medium text-blue-900 mb-3">
              도매 가격 혜택
            </h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-blue-700">50개 이상</span>
                <span className="font-medium text-blue-900">5% 할인</span>
              </div>
              <div className="flex justify-between">
                <span className="text-blue-700">100개 이상</span>
                <span className="font-medium text-blue-900">10% 할인</span>
              </div>
              <div className="flex justify-between">
                <span className="text-blue-700">200개 이상</span>
                <span className="font-medium text-blue-900">15% 할인</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}