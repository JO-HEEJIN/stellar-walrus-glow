'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { Download, Upload, FileSpreadsheet, AlertCircle, CheckCircle, X, Eye } from 'lucide-react'
import { formatPrice } from '@/lib/utils'
import { toast } from 'sonner'
import { useCartStore } from '@/lib/stores/cart'

interface BulkOrderItem {
  row: number
  productSku: string
  productName?: string
  brandName?: string
  unitPrice?: number
  quantity: number
  totalPrice?: number
  status: 'valid' | 'error' | 'warning'
  errors: string[]
  imageUrl?: string
}

interface ValidationResult {
  validItems: BulkOrderItem[]
  errorItems: BulkOrderItem[]
  warningItems: BulkOrderItem[]
  totalItems: number
  totalAmount: number
}

export default function BulkOrderPage() {
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { addItem } = useCartStore()
  
  const [uploadedFile, setUploadedFile] = useState<File | null>(null)
  const [, setParsedItems] = useState<BulkOrderItem[]>([])
  const [validationResult, setValidationResult] = useState<ValidationResult | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [showPreview, setShowPreview] = useState(false)

  const handleDownloadTemplate = () => {
    // 템플릿 엑셀 파일 다운로드
    const csvContent = [
      'SKU,수량,비고', // 헤더
      'TTL-BLT-BK-2025,10,기본 주문', // 예시 데이터
      'CTN-TS-WH-2025,20,',
      'GLF-HAT-NV-2025,5,운송 주의'
    ].join('\n')
    
    const blob = new Blob(["\uFEFF" + csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute('download', '대량주문_템플릿.csv')
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    
    toast.success('템플릿 파일이 다운로드되었습니다')
  }

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    // 파일 형식 검증
    const allowedTypes = ['.csv', '.xlsx', '.xls']
    const fileExtension = file.name.toLowerCase().substring(file.name.lastIndexOf('.'))
    
    if (!allowedTypes.includes(fileExtension)) {
      toast.error('CSV 또는 Excel 파일만 업로드 가능합니다')
      return
    }

    setUploadedFile(file)
    parseFile(file)
  }

  const parseFile = async (file: File) => {
    setIsProcessing(true)
    
    try {
      const text = await file.text()
      const lines = text.split('\n').filter(line => line.trim())
      
      if (lines.length < 2) {
        throw new Error('데이터가 없는 파일입니다')
      }

      // 헤더 건너뛰고 데이터 파싱
      const items: BulkOrderItem[] = []
      
      for (let i = 1; i < lines.length; i++) {
        const line = lines[i].trim()
        if (!line) continue
        
        const columns = line.split(',')
        const sku = columns[0]?.trim()
        const quantity = parseInt(columns[1]?.trim() || '0')
        
        const item: BulkOrderItem = {
          row: i + 1,
          productSku: sku || '',
          quantity: quantity || 0,
          status: 'valid',
          errors: []
        }

        // 기본 유효성 검증
        if (!sku) {
          item.errors.push('SKU가 비어있습니다')
          item.status = 'error'
        }
        
        if (!quantity || quantity <= 0) {
          item.errors.push('수량이 유효하지 않습니다')
          item.status = 'error'
        }

        items.push(item)
      }

      setParsedItems(items)
      await validateItems(items)
      
    } catch (error) {
      console.error('파일 파싱 오류:', error)
      toast.error('파일을 읽는중 오류가 발생했습니다')
    } finally {
      setIsProcessing(false)
    }
  }

  const validateItems = async (items: BulkOrderItem[]) => {
    try {
      // 상품 정보 조회 및 검증
      const skus = items.map(item => item.productSku).filter(Boolean)
      
      const response = await fetch('/api/products/validate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ skus })
      })

      let productData: Record<string, any> = {}
      
      if (response.ok) {
        const data = await response.json()
        productData = data.products || {}
      } else {
        // Mock data for development
        productData = {
          'TTL-BLT-BK-2025': {
            id: 'cme3ltyne0012myiyu0st08b5',
            name: '스트레치 벨트',
            brandName: 'K-패션',
            basePrice: 68000,
            inventory: 100,
            imageUrl: '/placeholder.svg',
            minOrderQty: 1,
            maxOrderQty: 1000
          },
          'CTN-TS-WH-2025': {
            id: 'prod-2',
            name: '코튼 티셔츠',
            brandName: '프리미엄 브랜드',
            basePrice: 85000,
            inventory: 50,
            imageUrl: '/placeholder.svg',
            minOrderQty: 5,
            maxOrderQty: 500
          }
        }
      }

      // 아이템 검증 및 업데이트
      const validItems: BulkOrderItem[] = []
      const errorItems: BulkOrderItem[] = []
      const warningItems: BulkOrderItem[] = []
      let totalAmount = 0

      for (const item of items) {
        const product = productData[item.productSku]
        
        if (product) {
          item.productName = product.name
          item.brandName = product.brandName
          item.unitPrice = product.basePrice
          item.totalPrice = product.basePrice * item.quantity
          item.imageUrl = product.imageUrl
          
          // 재고 및 주문 수량 검증
          if (item.quantity > product.inventory) {
            item.errors.push(`재고 부족 (재고: ${product.inventory}개)`)
            item.status = 'error'
          } else if (item.quantity < product.minOrderQty) {
            item.errors.push(`최소 주문수량 미달 (최소: ${product.minOrderQty}개)`)
            item.status = 'error'
          } else if (item.quantity > product.maxOrderQty) {
            item.errors.push(`최대 주문수량 초과 (최대: ${product.maxOrderQty}개)`)
            item.status = 'error'
          } else if (item.quantity > product.inventory * 0.8) {
            item.errors.push('대량 주문 - 확인 필요')
            item.status = 'warning'
          }
          
          if (item.status !== 'error') {
            totalAmount += item.totalPrice || 0
          }
        } else {
          item.errors.push('존재하지 않는 SKU입니다')
          item.status = 'error'
        }

        // 상태별 분류
        if (item.status === 'error') {
          errorItems.push(item)
        } else if (item.status === 'warning') {
          warningItems.push(item)
        } else {
          validItems.push(item)
        }
      }

      const result: ValidationResult = {
        validItems,
        errorItems,
        warningItems,
        totalItems: items.length,
        totalAmount
      }

      setValidationResult(result)
      setShowPreview(true)
      
    } catch (error) {
      console.error('아이템 검증 오류:', error)
      toast.error('상품 정보를 검증하는중 오류가 발생했습니다')
    }
  }

  const handleAddToCart = () => {
    if (!validationResult) return
    
    const itemsToAdd = [...validationResult.validItems, ...validationResult.warningItems]
    
    itemsToAdd.forEach(item => {
      addItem({
        id: `bulk-${item.productSku}-${Date.now()}`,
        productId: item.productSku, // 실제로는 product ID를 사용
        name: item.productName || item.productSku,
        brandName: item.brandName || '',
        price: item.unitPrice || 0,
        quantity: item.quantity,
        imageUrl: item.imageUrl || '/placeholder.svg'
      })
    })
    
    toast.success(`${itemsToAdd.length}개 상품이 장바구니에 추가되었습니다`)
    
    // 장바구니로 이동
    router.push('/cart')
  }

  const resetUpload = () => {
    setUploadedFile(null)
    setParsedItems([])
    setValidationResult(null)
    setShowPreview(false)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">엑셀 대량주문</h1>
        <p className="text-gray-600">엑셀 파일로 다량의 상품을 한 번에 주문하세요.</p>
      </div>

      {!showPreview ? (
        <div className="space-y-6">
          {/* Step 1: 템플릿 다운로드 */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center mb-4">
              <div className="flex items-center justify-center w-8 h-8 bg-blue-600 text-white rounded-full text-sm font-medium mr-3">
                1
              </div>
              <h2 className="text-lg font-semibold text-gray-900">템플릿 다운로드</h2>
            </div>
            
            <p className="text-gray-600 mb-4">대량주문용 엑셀 템플릿을 다운로드하여 상품 정보를 입력하세요.</p>
            
            <div className="bg-blue-50 rounded-lg p-4 mb-4">
              <h4 className="font-medium text-blue-900 mb-2">템플릿 사용 방법:</h4>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• SKU: 상품 고유 코드를 정확히 입력하세요</li>
                <li>• 수량: 주문할 수량을 숫자로 입력하세요</li>
                <li>• 비고: 추가 요청사항이 있으면 입력하세요 (선택사항)</li>
              </ul>
            </div>
            
            <button
              onClick={handleDownloadTemplate}
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Download className="h-4 w-4 mr-2" />
              템플릿 다운로드
            </button>
          </div>

          {/* Step 2: 파일 업로드 */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center mb-4">
              <div className="flex items-center justify-center w-8 h-8 bg-blue-600 text-white rounded-full text-sm font-medium mr-3">
                2
              </div>
              <h2 className="text-lg font-semibold text-gray-900">파일 업로드</h2>
            </div>
            
            <p className="text-gray-600 mb-4">작성한 엑셀 파일을 업로드하세요. CSV 또는 Excel 파일을 지원합니다.</p>
            
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-blue-400 transition-colors">
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv,.xlsx,.xls"
                onChange={handleFileUpload}
                className="hidden"
              />
              
              {isProcessing ? (
                <div>
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                  <p className="text-gray-600">파일을 처리하고 있습니다...</p>
                </div>
              ) : uploadedFile ? (
                <div>
                  <FileSpreadsheet className="h-12 w-12 text-green-600 mx-auto mb-4" />
                  <p className="text-gray-900 font-medium mb-2">{uploadedFile.name}</p>
                  <p className="text-sm text-gray-600 mb-4">파일이 업로드되었습니다</p>
                  <button
                    onClick={resetUpload}
                    className="text-sm text-red-600 hover:text-red-800"
                  >
                    다른 파일 선택
                  </button>
                </div>
              ) : (
                <div>
                  <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600 mb-4">엑셀 파일을 드래그&드롭 하거나 클릭하여 업로드하세요</p>
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="inline-flex items-center px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    파일 선택
                  </button>
                  <p className="text-xs text-gray-500 mt-2">지원 형식: CSV, XLSX, XLS</p>
                </div>
              )}
            </div>
          </div>

          {/* 주의사항 */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex items-start">
              <AlertCircle className="h-5 w-5 text-yellow-600 mr-2 mt-0.5 flex-shrink-0" />
              <div>
                <h4 className="font-medium text-yellow-800 mb-1">주의사항</h4>
                <ul className="text-sm text-yellow-700 space-y-1">
                  <li>• 최대 1,000개 아이템까지 한 번에 업로드 가능합니다</li>
                  <li>• SKU는 정확하게 입력해야 합니다 (대소문자 구분)</li>
                  <li>• 재고 수량을 초과하는 주문은 자동으로 거부됩니다</li>
                  <li>• 대량 주문의 경우 추가 확인이 필요할 수 있습니다</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <BulkOrderPreview
          validationResult={validationResult!}
          onAddToCart={handleAddToCart}
          onReset={resetUpload}
          fileName={uploadedFile?.name || ''}
        />
      )}
    </div>
  )
}

interface BulkOrderPreviewProps {
  validationResult: ValidationResult
  onAddToCart: () => void
  onReset: () => void
  fileName: string
}

function BulkOrderPreview({ validationResult, onAddToCart, onReset, fileName }: BulkOrderPreviewProps) {
  const [activeTab, setActiveTab] = useState<'all' | 'valid' | 'warning' | 'error'>('all')
  
  const allItems = [
    ...validationResult.validItems,
    ...validationResult.warningItems,
    ...validationResult.errorItems
  ]
  
  const getCurrentItems = () => {
    switch (activeTab) {
      case 'valid': return validationResult.validItems
      case 'warning': return validationResult.warningItems
      case 'error': return validationResult.errorItems
      default: return allItems
    }
  }
  
  const getStatusIcon = (status: BulkOrderItem['status']) => {
    switch (status) {
      case 'valid': return <CheckCircle className="h-5 w-5 text-green-600" />
      case 'warning': return <AlertCircle className="h-5 w-5 text-yellow-600" />
      case 'error': return <X className="h-5 w-5 text-red-600" />
    }
  }

  const canAddToCart = validationResult.validItems.length > 0 || validationResult.warningItems.length > 0

  return (
    <div className="space-y-6">
      {/* 결과 요약 */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center">
            <Eye className="h-5 w-5 text-blue-600 mr-2" />
            <h2 className="text-lg font-semibold text-gray-900">업로드 결과</h2>
          </div>
          <div className="text-sm text-gray-500">
            파일: {fileName}
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <div className="text-2xl font-bold text-blue-600">{validationResult.totalItems}</div>
            <div className="text-sm text-blue-800">전체 아이템</div>
          </div>
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <div className="text-2xl font-bold text-green-600">{validationResult.validItems.length}</div>
            <div className="text-sm text-green-800">정상 아이템</div>
          </div>
          <div className="text-center p-4 bg-yellow-50 rounded-lg">
            <div className="text-2xl font-bold text-yellow-600">{validationResult.warningItems.length}</div>
            <div className="text-sm text-yellow-800">주의 아이템</div>
          </div>
          <div className="text-center p-4 bg-red-50 rounded-lg">
            <div className="text-2xl font-bold text-red-600">{validationResult.errorItems.length}</div>
            <div className="text-sm text-red-800">오류 아이템</div>
          </div>
        </div>
        
        {validationResult.totalAmount > 0 && (
          <div className="mt-4 p-4 bg-gray-50 rounded-lg">
            <div className="text-center">
              <div className="text-xl font-bold text-gray-900">{formatPrice(validationResult.totalAmount)}</div>
              <div className="text-sm text-gray-600">예상 주문 금액 (오류 아이템 제외)</div>
            </div>
          </div>
        )}
      </div>

      {/* 상세 리스트 */}
      <div className="bg-white rounded-lg shadow">
        {/* 탭 */}
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6" aria-label="Tabs">
            <button
              onClick={() => setActiveTab('all')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'all'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              전체 ({allItems.length})
            </button>
            <button
              onClick={() => setActiveTab('valid')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'valid'
                  ? 'border-green-500 text-green-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              정상 ({validationResult.validItems.length})
            </button>
            <button
              onClick={() => setActiveTab('warning')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'warning'
                  ? 'border-yellow-500 text-yellow-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              주의 ({validationResult.warningItems.length})
            </button>
            <button
              onClick={() => setActiveTab('error')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'error'
                  ? 'border-red-500 text-red-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              오류 ({validationResult.errorItems.length})
            </button>
          </nav>
        </div>

        {/* 콘텐츠 */}
        <div className="p-6">
          {getCurrentItems().length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500">해당 상태의 아이템이 없습니다.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {getCurrentItems().map((item, index) => (
                <div key={index} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50">
                  <div className="flex items-center space-x-4">
                    <div className="flex-shrink-0">
                      {getStatusIcon(item.status)}
                    </div>
                    
                    {item.imageUrl && (
                      <img
                        src={item.imageUrl}
                        alt={item.productName || item.productSku}
                        className="w-12 h-12 object-cover rounded"
                      />
                    )}
                    
                    <div className="flex-1">
                      <div className="flex items-center space-x-3">
                        <h4 className="font-medium text-gray-900">
                          {item.productName || item.productSku}
                        </h4>
                        <span className="text-sm text-gray-500">SKU: {item.productSku}</span>
                      </div>
                      
                      {item.brandName && (
                        <p className="text-sm text-gray-600">{item.brandName}</p>
                      )}
                      
                      <div className="flex items-center space-x-3 mt-1">
                        <span className="text-sm text-gray-600">수량: {item.quantity}개</span>
                        {item.unitPrice && (
                          <>
                            <span className="text-sm text-gray-600">단가: {formatPrice(item.unitPrice)}</span>
                            <span className="text-sm font-medium text-gray-900">
                              총액: {formatPrice(item.totalPrice || 0)}
                            </span>
                          </>
                        )}
                      </div>
                      
                      {item.errors.length > 0 && (
                        <div className="mt-2">
                          {item.errors.map((error, errorIndex) => (
                            <p key={errorIndex} className="text-xs text-red-600">• {error}</p>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <span className="text-xs text-gray-500">행 {item.row}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* 액션 버튼 */}
      <div className="flex items-center justify-between">
        <button
          onClick={onReset}
          className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
        >
          다시 업로드
        </button>
        
        <div className="flex items-center space-x-4">
          {!canAddToCart && (
            <p className="text-sm text-red-600">장바구니에 추가할 수 있는 상품이 없습니다.</p>
          )}
          
          <button
            onClick={onAddToCart}
            disabled={!canAddToCart}
            className={`px-6 py-2 rounded-lg font-medium transition-colors ${
              canAddToCart
                ? 'bg-blue-600 text-white hover:bg-blue-700'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            장바구니에 추가 
            {canAddToCart && (
              <span className="ml-1">
                ({validationResult.validItems.length + validationResult.warningItems.length}개)
              </span>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
