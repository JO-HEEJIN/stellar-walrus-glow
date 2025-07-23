'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { ArrowLeft, Download, FileText, Table } from 'lucide-react'

interface ExportConfig {
  format: 'csv' | 'excel'
  dateRange: {
    startDate: string
    endDate: string
  }
  status: string[]
  includeFields: string[]
  brandId?: string
}

const statusOptions = [
  { value: 'PENDING', label: '결제 대기' },
  { value: 'PAID', label: '결제 완료' },
  { value: 'PREPARING', label: '상품 준비중' },
  { value: 'SHIPPED', label: '배송중' },
  { value: 'DELIVERED', label: '배송 완료' },
  { value: 'CANCELLED', label: '취소됨' },
]

const fieldOptions = [
  { value: 'orderNumber', label: '주문번호', required: true },
  { value: 'createdAt', label: '주문일시', required: true },
  { value: 'customerInfo', label: '고객정보', required: false },
  { value: 'productInfo', label: '상품정보', required: false },
  { value: 'pricing', label: '가격정보', required: true },
  { value: 'status', label: '주문상태', required: true },
  { value: 'shippingInfo', label: '배송정보', required: false },
  { value: 'paymentInfo', label: '결제정보', required: false },
]

export default function OrderExportPage() {
  const [userRole, setUserRole] = useState<string>('')
  const [loading, setLoading] = useState(true)
  const [exporting, setExporting] = useState(false)
  const [brands, setBrands] = useState<Array<{ id: string; nameKo: string }>>([])
  
  const [config, setConfig] = useState<ExportConfig>({
    format: 'excel',
    dateRange: {
      startDate: '',
      endDate: '',
    },
    status: [],
    includeFields: ['orderNumber', 'createdAt', 'pricing', 'status'],
    brandId: '',
  })

  useEffect(() => {
    const initializePage = async () => {
      try {
        // Check authentication
        const authResponse = await fetch('/api/auth/me')
        if (authResponse.ok) {
          const authData = await authResponse.json()
          setUserRole(authData.user.role)
          
          // Load brands for MASTER_ADMIN
          if (authData.user.role === 'MASTER_ADMIN') {
            const brandsResponse = await fetch('/api/brands', {
              credentials: 'include',
            })
            if (brandsResponse.ok) {
              const brandsData = await brandsResponse.json()
              setBrands(brandsData.data || [])
            }
          }
        }

        // Set default date range (last 30 days)
        const endDate = new Date()
        const startDate = new Date()
        startDate.setDate(startDate.getDate() - 30)
        
        setConfig(prev => ({
          ...prev,
          dateRange: {
            startDate: startDate.toISOString().split('T')[0],
            endDate: endDate.toISOString().split('T')[0],
          }
        }))
      } catch (error) {
        console.error('Failed to initialize export page:', error)
      } finally {
        setLoading(false)
      }
    }

    initializePage()
  }, [])

  const handleFieldToggle = (fieldValue: string) => {
    const field = fieldOptions.find(f => f.value === fieldValue)
    if (field?.required) return // Can't toggle required fields

    setConfig(prev => ({
      ...prev,
      includeFields: prev.includeFields.includes(fieldValue)
        ? prev.includeFields.filter(f => f !== fieldValue)
        : [...prev.includeFields, fieldValue]
    }))
  }

  const handleStatusToggle = (statusValue: string) => {
    setConfig(prev => ({
      ...prev,
      status: prev.status.includes(statusValue)
        ? prev.status.filter(s => s !== statusValue)
        : [...prev.status, statusValue]
    }))
  }

  const handleExport = async () => {
    setExporting(true)
    try {
      const exportData = {
        ...config,
        status: config.status.length > 0 ? config.status : undefined,
        brandId: config.brandId || undefined,
      }

      const response = await fetch('/api/orders/export', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(exportData),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error?.message || '내보내기에 실패했습니다.')
      }

      // Get the blob data
      const blob = await response.blob()
      const filename = `주문내역_${config.dateRange.startDate}_${config.dateRange.endDate}.${config.format === 'excel' ? 'xlsx' : 'csv'}`

      // Create download link
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = filename
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)

      alert('주문 내역이 성공적으로 내보내졌습니다.')
    } catch (error) {
      alert(error instanceof Error ? error.message : '내보내기에 실패했습니다.')
    } finally {
      setExporting(false)
    }
  }


  if (loading) {
    return <div className="text-center py-4">로딩 중...</div>
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-8">
        <Link
          href="/orders"
          className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          주문 관리로 돌아가기
        </Link>
      </div>

      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
          <h1 className="text-2xl font-semibold text-gray-900">주문 내역 내보내기</h1>
          <p className="mt-1 text-sm text-gray-500">
            원하는 조건으로 주문 내역을 Excel 또는 CSV 파일로 내보낼 수 있습니다.
          </p>
        </div>

        <div className="px-4 py-5 sm:p-6 space-y-6">
          {/* Export Format */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              파일 형식
            </label>
            <div className="flex space-x-4">
              <label className="flex items-center">
                <input
                  type="radio"
                  value="excel"
                  checked={config.format === 'excel'}
                  onChange={(e) => setConfig(prev => ({ ...prev, format: e.target.value as 'excel' }))}
                  className="text-primary focus:ring-primary border-gray-300"
                />
                <Table className="ml-2 h-4 w-4 text-gray-400" />
                <span className="ml-1 text-sm text-gray-700">Excel (.xlsx)</span>
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  value="csv"
                  checked={config.format === 'csv'}
                  onChange={(e) => setConfig(prev => ({ ...prev, format: e.target.value as 'csv' }))}
                  className="text-primary focus:ring-primary border-gray-300"
                />
                <FileText className="ml-2 h-4 w-4 text-gray-400" />
                <span className="ml-1 text-sm text-gray-700">CSV (.csv)</span>
              </label>
            </div>
          </div>

          {/* Date Range */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              기간 선택
            </label>
            <div className="flex space-x-4">
              <div>
                <label className="block text-xs text-gray-500">시작일</label>
                <input
                  type="date"
                  value={config.dateRange.startDate}
                  onChange={(e) => setConfig(prev => ({
                    ...prev,
                    dateRange: { ...prev.dateRange, startDate: e.target.value }
                  }))}
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500">종료일</label>
                <input
                  type="date"
                  value={config.dateRange.endDate}
                  onChange={(e) => setConfig(prev => ({
                    ...prev,
                    dateRange: { ...prev.dateRange, endDate: e.target.value }
                  }))}
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
                />
              </div>
            </div>
          </div>

          {/* Brand Filter (for MASTER_ADMIN) */}
          {userRole === 'MASTER_ADMIN' && brands.length > 0 && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                브랜드 필터
              </label>
              <select
                value={config.brandId}
                onChange={(e) => setConfig(prev => ({ ...prev, brandId: e.target.value }))}
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
              >
                <option value="">모든 브랜드</option>
                {brands.map((brand) => (
                  <option key={brand.id} value={brand.id}>
                    {brand.nameKo}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Status Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              주문 상태 (전체 선택 시 모든 상태 포함)
            </label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {statusOptions.map((status) => (
                <label key={status.value} className="flex items-center">
                  <input
                    type="checkbox"
                    checked={config.status.includes(status.value)}
                    onChange={() => handleStatusToggle(status.value)}
                    className="text-primary focus:ring-primary border-gray-300 rounded"
                  />
                  <span className="ml-2 text-sm text-gray-700">{status.label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Include Fields */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              포함할 정보
            </label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {fieldOptions.map((field) => (
                <label key={field.value} className="flex items-center">
                  <input
                    type="checkbox"
                    checked={config.includeFields.includes(field.value)}
                    onChange={() => handleFieldToggle(field.value)}
                    disabled={field.required}
                    className="text-primary focus:ring-primary border-gray-300 rounded disabled:opacity-50"
                  />
                  <span className={`ml-2 text-sm ${field.required ? 'text-gray-500' : 'text-gray-700'}`}>
                    {field.label}
                    {field.required && <span className="text-red-500 ml-1">*</span>}
                  </span>
                </label>
              ))}
            </div>
            <p className="mt-2 text-xs text-gray-500">* 필수 포함 항목</p>
          </div>

          {/* Preview */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="text-sm font-medium text-gray-900 mb-2">내보내기 요약</h3>
            <dl className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-2 text-sm">
              <div>
                <dt className="text-gray-500">파일 형식:</dt>
                <dd className="text-gray-900 font-medium">
                  {config.format === 'excel' ? 'Excel (.xlsx)' : 'CSV (.csv)'}
                </dd>
              </div>
              <div>
                <dt className="text-gray-500">기간:</dt>
                <dd className="text-gray-900 font-medium">
                  {config.dateRange.startDate} ~ {config.dateRange.endDate}
                </dd>
              </div>
              <div>
                <dt className="text-gray-500">상태 필터:</dt>
                <dd className="text-gray-900 font-medium">
                  {config.status.length === 0 ? '모든 상태' : `${config.status.length}개 상태 선택`}
                </dd>
              </div>
              <div>
                <dt className="text-gray-500">포함 필드:</dt>
                <dd className="text-gray-900 font-medium">
                  {config.includeFields.length}개 필드
                </dd>
              </div>
            </dl>
          </div>

          {/* Export Button */}
          <div className="flex justify-end space-x-3">
            <Link
              href="/orders"
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
            >
              취소
            </Link>
            <button
              onClick={handleExport}
              disabled={exporting || !config.dateRange.startDate || !config.dateRange.endDate}
              className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-primary border border-transparent rounded-md hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {exporting ? (
                <>
                  <div className="animate-spin -ml-1 mr-3 h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
                  내보내는 중...
                </>
              ) : (
                <>
                  <Download className="-ml-1 mr-2 h-4 w-4" />
                  내보내기
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}