'use client'

import { useState } from 'react'

export default function TestProductPage() {
  const [message, setMessage] = useState('테스트 페이지가 로드되었습니다!')
  
  const testUpload = async () => {
    // 테스트 이미지 생성
    const canvas = document.createElement('canvas')
    canvas.width = 100
    canvas.height = 100
    const ctx = canvas.getContext('2d')!
    ctx.fillStyle = '#FF0000'
    ctx.fillRect(0, 0, 100, 100)
    
    const blob = await new Promise<Blob>(resolve => canvas.toBlob(resolve as any, 'image/png'))
    const file = new File([blob], 'test.png', { type: 'image/png' })
    
    const formData = new FormData()
    formData.append('file', file)
    formData.append('imageType', 'thumbnail')
    
    try {
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
        credentials: 'include'
      })
      
      const result = await response.json()
      setMessage(`업로드 ${response.ok ? '성공' : '실패'}: ${JSON.stringify(result, null, 2)}`)
    } catch (error) {
      setMessage(`업로드 에러: ${error}`)
    }
  }

  const testBrands = async () => {
    try {
      const response = await fetch('/api/brands')
      const result = await response.json()
      setMessage(`브랜드 로드 ${response.ok ? '성공' : '실패'}: ${result.data?.length || 0}개 브랜드`)
    } catch (error) {
      setMessage(`브랜드 로드 에러: ${error}`)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">상품등록 시스템 테스트</h1>
        
        <div className="bg-white p-6 rounded-lg shadow mb-6">
          <h2 className="text-xl font-semibold mb-4">상태</h2>
          <div className="bg-gray-100 p-4 rounded font-mono text-sm whitespace-pre-wrap">
            {message}
          </div>
        </div>

        <div className="space-y-4">
          <button
            onClick={testBrands}
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mr-4"
          >
            브랜드 API 테스트
          </button>
          
          <button
            onClick={testUpload}
            className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded mr-4"
          >
            이미지 업로드 테스트
          </button>
        </div>

        <div className="mt-8 bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">간단한 상품 등록 폼</h2>
          
          <form onSubmit={(e) => {
            e.preventDefault()
            const formData = new FormData(e.target as HTMLFormElement)
            const data = Object.fromEntries(formData)
            setMessage(`폼 데이터: ${JSON.stringify(data, null, 2)}`)
          }} className="space-y-4">
            
            <div>
              <label className="block text-sm font-medium text-gray-700">
                브랜드
              </label>
              <select name="brandId" required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm">
                <option value="">브랜드 선택</option>
                <option value="test-brand-1">테스트 브랜드 1</option>
                <option value="test-brand-2">테스트 브랜드 2</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                SKU
              </label>
              <input
                type="text"
                name="sku"
                required
                placeholder="TEST-001"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                상품명
              </label>
              <input
                type="text"
                name="nameKo"
                required
                placeholder="테스트 상품"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                가격
              </label>
              <input
                type="number"
                name="basePrice"
                required
                placeholder="10000"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                재고
              </label>
              <input
                type="number"
                name="inventory"
                required
                placeholder="100"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
              />
            </div>

            <button
              type="submit"
              className="bg-purple-500 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded"
            >
              폼 데이터 확인
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}