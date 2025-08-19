'use client'

import { useState, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { Upload, Download, FileText, AlertCircle, CheckCircle, X, FileSpreadsheet } from 'lucide-react'
import { toast } from 'sonner'
import * as XLSX from 'xlsx'

interface ImportResult {
  success: number
  failed: number
  errors: string[]
  skipped: number
  total: number
}

interface ExportOptions {
  format: 'csv' | 'excel'
  includeImages: boolean
  includeInactive: boolean
  brand?: string
  category?: string
}

export function ProductImportExport() {
  const [isImporting, setIsImporting] = useState(false)
  const [isExporting, setIsExporting] = useState(false)
  const [importProgress, setImportProgress] = useState(0)
  const [exportProgress, setExportProgress] = useState(0)
  const [importResult, setImportResult] = useState<ImportResult | null>(null)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [exportOptions, setExportOptions] = useState<ExportOptions>({
    format: 'csv',
    includeImages: true,
    includeInactive: false
  })
  const [previewData, setPreviewData] = useState<any[]>([])
  const [showPreview, setShowPreview] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Sample CSV template data
  const csvTemplate = [
    'SKU,Name_KO,Name_CN,Description_KO,Description_CN,Base_Price,Inventory,Material,Care_Instructions,Brand_ID,Category_ID,Status,Weight,Length,Width,Height,Meta_Title,Meta_Description,Meta_Keywords,Tags,Features',
    'SAMPLE-001,샘플 상품,样品商品,샘플 상품 설명,样品商品说明,50000,100,면 100%,세탁기 사용 가능,brand-1,category-1,ACTIVE,500,30,25,2,샘플 상품 - 고품질,고품질 샘플 상품입니다,샘플;상품;고품질,편안함;내구성,고품질 소재;세련된 디자인',
    'SAMPLE-002,테스트 제품,测试产品,테스트 제품 설명,测试产品说明,75000,50,폴리에스터 100%,드라이클리닝,brand-1,category-2,ACTIVE,300,20,15,1,테스트 제품 - 실용적,실용적인 테스트 제품,테스트;제품;실용적,실용성;경량,가벼운 무게;실용적 디자인'
  ].join('\n')

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      setSelectedFile(file)
      if (file.type === 'text/csv' || file.name.endsWith('.csv')) {
        parseCSVFile(file)
      } else if (file.type.includes('sheet') || file.name.endsWith('.xlsx') || file.name.endsWith('.xls')) {
        parseExcelFile(file)
      } else {
        toast.error('CSV 또는 Excel 파일만 지원됩니다')
        setSelectedFile(null)
      }
    }
  }

  const parseCSVFile = async (file: File) => {
    try {
      const text = await file.text()
      const lines = text.split('\n').filter(line => line.trim())
      const headers = lines[0].split(',').map(h => h.trim())
      
      const data = lines.slice(1).map((line, index) => {
        const values = line.split(',').map(v => v.trim())
        const row: any = { _rowNumber: index + 2 } // +2 because index starts at 0 and we skip header
        
        headers.forEach((header, i) => {
          row[header] = values[i] || ''
        })
        
        return row
      })

      setPreviewData(data)
      setShowPreview(true)
      toast.success(`${data.length}개 상품 데이터를 미리보기에서 확인하세요`)
    } catch (error) {
      console.error('CSV parsing error:', error)
      toast.error('CSV 파일 파싱에 실패했습니다')
    }
  }

  const parseExcelFile = async (file: File) => {
    try {
      const arrayBuffer = await file.arrayBuffer()
      const workbook = XLSX.read(arrayBuffer, { type: 'array' })
      
      // Get the first worksheet
      const sheetName = workbook.SheetNames[0]
      const worksheet = workbook.Sheets[sheetName]
      
      // Convert to JSON format
      const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 })
      
      if (jsonData.length < 2) {
        toast.error('Excel 파일에 충분한 데이터가 없습니다')
        return
      }
      
      const headers = (jsonData[0] as any[]).map(h => String(h).trim())
      const data = jsonData.slice(1).map((row: any, index) => {
        const rowData: any = { _rowNumber: index + 2 }
        
        headers.forEach((header, i) => {
          rowData[header] = row[i] ? String(row[i]).trim() : ''
        })
        
        return rowData
      }).filter(row => Object.values(row).some(val => val !== '' && val !== undefined))

      setPreviewData(data)
      setShowPreview(true)
      toast.success(`${data.length}개 상품 데이터를 미리보기에서 확인하세요`)
    } catch (error) {
      console.error('Excel parsing error:', error)
      toast.error('Excel 파일 파싱에 실패했습니다')
    }
  }

  const validateImportData = (data: any[]): { valid: any[], invalid: any[], errors: string[] } => {
    const valid: any[] = []
    const invalid: any[] = []
    const errors: string[] = []

    data.forEach((row, index) => {
      const rowErrors: string[] = []
      
      // Required field validation
      if (!row.SKU) rowErrors.push('SKU 필수')
      if (!row.Name_KO) rowErrors.push('한글 상품명 필수')
      if (!row.Base_Price || isNaN(Number(row.Base_Price))) rowErrors.push('올바른 가격 필요')
      if (!row.Brand_ID) rowErrors.push('브랜드 ID 필수')
      
      // Price validation
      const price = Number(row.Base_Price)
      if (price < 100) rowErrors.push('가격은 100원 이상이어야 합니다')
      if (price > 10000000) rowErrors.push('가격은 1천만원 이하여야 합니다')
      
      // Inventory validation
      const inventory = Number(row.Inventory || 0)
      if (inventory < 0) rowErrors.push('재고는 0개 이상이어야 합니다')
      
      // Status validation
      if (row.Status && !['ACTIVE', 'INACTIVE', 'OUT_OF_STOCK'].includes(row.Status)) {
        rowErrors.push('상태는 ACTIVE, INACTIVE, OUT_OF_STOCK 중 하나여야 합니다')
      }

      if (rowErrors.length > 0) {
        invalid.push({ ...row, _errors: rowErrors })
        errors.push(`행 ${row._rowNumber}: ${rowErrors.join(', ')}`)
      } else {
        valid.push(row)
      }
    })

    return { valid, invalid, errors }
  }

  const handleImport = async () => {
    if (!selectedFile || previewData.length === 0) {
      toast.error('파일을 선택하고 미리보기를 확인해주세요')
      return
    }

    setIsImporting(true)
    setImportProgress(0)
    setImportResult(null)

    try {
      const { valid, invalid, errors } = validateImportData(previewData)
      
      if (valid.length === 0) {
        toast.error('가져올 수 있는 유효한 데이터가 없습니다')
        setImportResult({
          success: 0,
          failed: invalid.length,
          errors: errors,
          skipped: 0,
          total: previewData.length
        })
        return
      }

      // Import in batches
      const batchSize = 10
      let successCount = 0
      let failedCount = 0
      const importErrors: string[] = [...errors]

      for (let i = 0; i < valid.length; i += batchSize) {
        const batch = valid.slice(i, i + batchSize)
        
        try {
          const response = await fetch('/api/products/import', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            credentials: 'include',
            body: JSON.stringify({ products: batch })
          })

          if (response.ok) {
            const result = await response.json()
            successCount += result.imported || batch.length
          } else {
            const error = await response.json()
            failedCount += batch.length
            importErrors.push(`배치 ${Math.floor(i/batchSize) + 1}: ${error.error?.message || '알 수 없는 오류'}`)
          }
        } catch (error) {
          failedCount += batch.length
          importErrors.push(`배치 ${Math.floor(i/batchSize) + 1}: 네트워크 오류`)
        }

        // Update progress
        const progress = Math.round(((i + batchSize) / valid.length) * 100)
        setImportProgress(Math.min(progress, 100))
      }

      setImportResult({
        success: successCount,
        failed: failedCount + invalid.length,
        errors: importErrors,
        skipped: invalid.length,
        total: previewData.length
      })

      if (successCount > 0) {
        toast.success(`${successCount}개 상품이 성공적으로 가져와졌습니다`)
      }
      
    } catch (error) {
      console.error('Import error:', error)
      toast.error('가져오기 중 오류가 발생했습니다')
    } finally {
      setIsImporting(false)
    }
  }

  const handleExport = async () => {
    setIsExporting(true)
    setExportProgress(0)

    try {
      const params = new URLSearchParams()
      params.append('format', exportOptions.format)
      params.append('includeImages', exportOptions.includeImages.toString())
      params.append('includeInactive', exportOptions.includeInactive.toString())
      if (exportOptions.brand) params.append('brand', exportOptions.brand)
      if (exportOptions.category) params.append('category', exportOptions.category)

      const response = await fetch(`/api/products/export?${params.toString()}`, {
        method: 'GET',
        credentials: 'include'
      })

      if (response.ok) {
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const link = document.createElement('a')
        link.href = url
        link.download = `products-export-${new Date().toISOString().split('T')[0]}.${exportOptions.format}`
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        window.URL.revokeObjectURL(url)
        
        toast.success('상품 데이터가 성공적으로 내보내졌습니다')
      } else {
        throw new Error('Export failed')
      }
    } catch (error) {
      console.error('Export error:', error)
      toast.error('내보내기 중 오류가 발생했습니다')
    } finally {
      setIsExporting(false)
      setExportProgress(100)
    }
  }

  const downloadTemplate = () => {
    const blob = new Blob([csvTemplate], { type: 'text/csv;charset=utf-8;' })
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = 'product-import-template.csv'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    window.URL.revokeObjectURL(url)
    toast.success('템플릿 파일이 다운로드되었습니다')
  }

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold mb-2">상품 가져오기/내보내기</h1>
        <p className="text-gray-600">
          CSV 파일을 통해 상품을 대량으로 가져오거나 기존 상품 데이터를 내보낼 수 있습니다.
        </p>
      </div>

      <Tabs defaultValue="import" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="import">가져오기</TabsTrigger>
          <TabsTrigger value="export">내보내기</TabsTrigger>
        </TabsList>

        <TabsContent value="import" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Upload className="h-5 w-5" />
                상품 가져오기
              </CardTitle>
              <CardDescription>
                CSV 파일을 통해 여러 상품을 한번에 등록할 수 있습니다.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Template Download */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <FileText className="h-5 w-5 text-blue-600 mt-0.5" />
                  <div className="flex-1">
                    <h4 className="font-medium text-blue-900">템플릿 다운로드</h4>
                    <p className="text-sm text-blue-700 mt-1">
                      올바른 형식의 CSV 파일을 만들기 위해 먼저 템플릿을 다운로드하세요.
                    </p>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={downloadTemplate}
                      className="mt-2"
                    >
                      <FileSpreadsheet className="h-4 w-4 mr-1" />
                      템플릿 다운로드
                    </Button>
                  </div>
                </div>
              </div>

              {/* File Upload */}
              <div>
                <Label className="text-base font-medium">파일 선택 (CSV 또는 Excel)</Label>
                <div className="mt-2">
                  <Input
                    ref={fileInputRef}
                    type="file"
                    accept=".csv,.xlsx,.xls"
                    onChange={handleFileSelect}
                    className="file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                  />
                </div>
                {selectedFile && (
                  <div className="mt-2 flex items-center gap-2">
                    <FileText className="h-4 w-4 text-green-600" />
                    <span className="text-sm text-green-700">{selectedFile.name}</span>
                    <Badge variant="outline" className="text-green-600">
                      {(selectedFile.size / 1024).toFixed(1)} KB
                    </Badge>
                  </div>
                )}
              </div>

              {/* Preview */}
              {showPreview && previewData.length > 0 && (
                <div>
                  <div className="flex items-center justify-between">
                    <Label className="text-base font-medium">미리보기 ({previewData.length}개 행)</Label>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowPreview(false)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="mt-2 border rounded-lg overflow-auto max-h-60">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase">행</th>
                          <th className="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase">SKU</th>
                          <th className="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase">상품명</th>
                          <th className="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase">가격</th>
                          <th className="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase">재고</th>
                          <th className="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase">상태</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {previewData.slice(0, 10).map((row, index) => (
                          <tr key={index} className={row._errors ? 'bg-red-50' : ''}>
                            <td className="px-2 py-2 text-xs">{row._rowNumber}</td>
                            <td className="px-2 py-2 text-xs">{row.SKU}</td>
                            <td className="px-2 py-2 text-xs">{row.Name_KO}</td>
                            <td className="px-2 py-2 text-xs">{row.Base_Price}</td>
                            <td className="px-2 py-2 text-xs">{row.Inventory}</td>
                            <td className="px-2 py-2 text-xs">{row.Status || 'ACTIVE'}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    {previewData.length > 10 && (
                      <div className="p-2 text-center text-sm text-gray-500 bg-gray-50">
                        ... 그 외 {previewData.length - 10}개 행
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Import Progress */}
              {isImporting && (
                <div>
                  <Label className="text-base font-medium">가져오기 진행중...</Label>
                  <Progress value={importProgress} className="mt-2" />
                  <p className="text-sm text-gray-600 mt-1">{importProgress}% 완료</p>
                </div>
              )}

              {/* Import Results */}
              {importResult && (
                <div className="space-y-3">
                  <Label className="text-base font-medium">가져오기 결과</Label>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="bg-green-50 border border-green-200 rounded p-3 text-center">
                      <CheckCircle className="h-8 w-8 text-green-600 mx-auto mb-1" />
                      <div className="text-lg font-bold text-green-900">{importResult.success}</div>
                      <div className="text-sm text-green-700">성공</div>
                    </div>
                    <div className="bg-red-50 border border-red-200 rounded p-3 text-center">
                      <AlertCircle className="h-8 w-8 text-red-600 mx-auto mb-1" />
                      <div className="text-lg font-bold text-red-900">{importResult.failed}</div>
                      <div className="text-sm text-red-700">실패</div>
                    </div>
                    <div className="bg-yellow-50 border border-yellow-200 rounded p-3 text-center">
                      <AlertCircle className="h-8 w-8 text-yellow-600 mx-auto mb-1" />
                      <div className="text-lg font-bold text-yellow-900">{importResult.skipped}</div>
                      <div className="text-sm text-yellow-700">건너뜀</div>
                    </div>
                    <div className="bg-blue-50 border border-blue-200 rounded p-3 text-center">
                      <FileText className="h-8 w-8 text-blue-600 mx-auto mb-1" />
                      <div className="text-lg font-bold text-blue-900">{importResult.total}</div>
                      <div className="text-sm text-blue-700">전체</div>
                    </div>
                  </div>
                  
                  {importResult.errors.length > 0 && (
                    <div className="bg-red-50 border border-red-200 rounded p-3">
                      <h4 className="font-medium text-red-900 mb-2">오류 내역:</h4>
                      <div className="max-h-32 overflow-y-auto">
                        {importResult.errors.map((error, index) => (
                          <div key={index} className="text-sm text-red-700 mb-1">{error}</div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Import Button */}
              <div className="flex gap-2">
                <Button
                  onClick={handleImport}
                  disabled={!selectedFile || !showPreview || isImporting || previewData.length === 0}
                  className="flex-1"
                >
                  {isImporting ? '가져오는 중...' : `${previewData.length}개 상품 가져오기`}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setSelectedFile(null)
                    setPreviewData([])
                    setShowPreview(false)
                    setImportResult(null)
                    if (fileInputRef.current) fileInputRef.current.value = ''
                  }}
                >
                  초기화
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="export" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Download className="h-5 w-5" />
                상품 내보내기
              </CardTitle>
              <CardDescription>
                등록된 상품 데이터를 CSV 또는 Excel 파일로 내보낼 수 있습니다.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Export Options */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label className="text-base font-medium">파일 형식</Label>
                  <div className="mt-2 space-y-2">
                    <label className="flex items-center gap-2">
                      <input
                        type="radio"
                        value="csv"
                        checked={exportOptions.format === 'csv'}
                        onChange={(e) => setExportOptions(prev => ({ ...prev, format: e.target.value as 'csv' }))}
                      />
                      <span className="text-sm">CSV (.csv)</span>
                    </label>
                    <label className="flex items-center gap-2">
                      <input
                        type="radio"
                        value="excel"
                        checked={exportOptions.format === 'excel'}
                        onChange={(e) => setExportOptions(prev => ({ ...prev, format: e.target.value as 'excel' }))}
                      />
                      <span className="text-sm">Excel (.xlsx)</span>
                    </label>
                  </div>
                </div>

                <div>
                  <Label className="text-base font-medium">포함 옵션</Label>
                  <div className="mt-2 space-y-2">
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={exportOptions.includeImages}
                        onChange={(e) => setExportOptions(prev => ({ ...prev, includeImages: e.target.checked }))}
                      />
                      <span className="text-sm">이미지 URL 포함</span>
                    </label>
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={exportOptions.includeInactive}
                        onChange={(e) => setExportOptions(prev => ({ ...prev, includeInactive: e.target.checked }))}
                      />
                      <span className="text-sm">비활성 상품 포함</span>
                    </label>
                  </div>
                </div>
              </div>

              {/* Export Progress */}
              {isExporting && (
                <div>
                  <Label className="text-base font-medium">내보내기 진행중...</Label>
                  <Progress value={exportProgress} className="mt-2" />
                  <p className="text-sm text-gray-600 mt-1">데이터를 준비하고 있습니다...</p>
                </div>
              )}

              {/* Export Button */}
              <Button
                onClick={handleExport}
                disabled={isExporting}
                className="w-full"
              >
                {isExporting ? '내보내는 중...' : '상품 데이터 내보내기'}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}