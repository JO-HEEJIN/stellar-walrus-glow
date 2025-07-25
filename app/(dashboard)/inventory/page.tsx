'use client'

import { useState, useEffect, useCallback } from 'react'
import { formatPrice } from '@/lib/utils'
import { Package, AlertTriangle, TrendingUp, TrendingDown } from 'lucide-react'
import { InventoryUpdateModal } from '@/components/products/inventory-update-modal'
import { Badge } from '@/components/ui/badge'

interface Product {
  id: string
  sku: string
  nameKo: string
  nameCn?: string
  basePrice: number
  inventory: number
  status: string
  brand?: {
    id: string
    nameKo: string
  }
  category?: {
    id: string
    name: string
  }
}

export default function InventoryPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [showUpdateModal, setShowUpdateModal] = useState(false)
  const [sortBy, setSortBy] = useState<'inventory' | 'nameKo' | 'sku'>('inventory')
  const [filterStatus, setFilterStatus] = useState<'all' | 'low' | 'out'>('all')

  const loadProducts = useCallback(async () => {
    try {
      setLoading(true)
      
      const response = await fetch(`/api/products?limit=100&sortBy=${sortBy}&order=asc`, {
        credentials: 'include',
      })
      
      if (!response.ok) {
        throw new Error('Failed to fetch products')
      }

      const data = await response.json()
      let products = data.data || []
      
      // Apply client-side filtering
      if (filterStatus === 'low') {
        products = products.filter((p: Product) => p.inventory > 0 && p.inventory <= 10)
      } else if (filterStatus === 'out') {
        products = products.filter((p: Product) => p.inventory === 0)
      }
      
      setProducts(products)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }, [sortBy, filterStatus])

  useEffect(() => {
    loadProducts()
  }, [loadProducts])

  const handleUpdateClick = (product: Product) => {
    setSelectedProduct(product)
    setShowUpdateModal(true)
  }

  const handleUpdateSuccess = () => {
    loadProducts() // Reload the list
  }

  const getStatusBadge = (product: Product) => {
    if (product.inventory === 0) {
      return <Badge variant="destructive">품절</Badge>
    } else if (product.inventory <= 10) {
      return <Badge variant="outline" className="text-orange-600 border-orange-600">재고 부족</Badge>
    } else {
      return <Badge variant="outline" className="text-green-600 border-green-600">정상</Badge>
    }
  }

  const stats = {
    total: products.length,
    outOfStock: products.filter(p => p.inventory === 0).length,
    lowStock: products.filter(p => p.inventory > 0 && p.inventory <= 10).length,
    totalValue: products.reduce((sum, p) => sum + (p.inventory * p.basePrice), 0),
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-lg">재고 정보를 불러오는 중...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-600 mb-4">{error}</div>
          <button 
            onClick={() => window.location.reload()}
            className="text-blue-600 hover:text-blue-800"
          >
            다시 시도
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-gray-900">재고 관리</h1>
        <p className="mt-2 text-sm text-gray-700">
          상품별 재고 현황을 확인하고 관리합니다.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">전체 상품</p>
              <p className="text-2xl font-semibold">{stats.total}</p>
            </div>
            <Package className="h-8 w-8 text-gray-400" />
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">품절 상품</p>
              <p className="text-2xl font-semibold text-red-600">{stats.outOfStock}</p>
            </div>
            <AlertTriangle className="h-8 w-8 text-red-400" />
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">재고 부족</p>
              <p className="text-2xl font-semibold text-orange-600">{stats.lowStock}</p>
            </div>
            <TrendingDown className="h-8 w-8 text-orange-400" />
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">총 재고 가치</p>
              <p className="text-2xl font-semibold">{formatPrice(stats.totalValue)}</p>
            </div>
            <TrendingUp className="h-8 w-8 text-green-400" />
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-4 mb-6">
        <div className="flex flex-wrap gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">상태 필터</label>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as any)}
              className="rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            >
              <option value="all">전체</option>
              <option value="low">재고 부족 (1-10개)</option>
              <option value="out">품절</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">정렬</label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            >
              <option value="inventory">재고 수량</option>
              <option value="nameKo">상품명</option>
              <option value="sku">SKU</option>
            </select>
          </div>
        </div>
      </div>

      {/* Product Table */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                상품 정보
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                SKU
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                브랜드
              </th>
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                재고
              </th>
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                상태
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                재고 가치
              </th>
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                작업
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {products.map((product) => (
              <tr key={product.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div>
                    <div className="text-sm font-medium text-gray-900">
                      {product.nameKo}
                    </div>
                    {product.category && (
                      <div className="text-sm text-gray-500">
                        {product.category.name}
                      </div>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {product.sku}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {product.brand?.nameKo || '-'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-center">
                  <span className={`text-lg font-semibold ${
                    product.inventory === 0 ? 'text-red-600' : 
                    product.inventory <= 10 ? 'text-orange-600' : 
                    'text-gray-900'
                  }`}>
                    {product.inventory}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-center">
                  {getStatusBadge(product)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-900">
                  {formatPrice(product.inventory * product.basePrice)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-center">
                  <button
                    onClick={() => handleUpdateClick(product)}
                    className="text-blue-600 hover:text-blue-900 text-sm font-medium"
                  >
                    재고 업데이트
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        
        {products.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500">조건에 맞는 상품이 없습니다.</p>
          </div>
        )}
      </div>

      {/* Update Modal */}
      {selectedProduct && (
        <InventoryUpdateModal
          product={selectedProduct}
          isOpen={showUpdateModal}
          onClose={() => {
            setShowUpdateModal(false)
            setSelectedProduct(null)
          }}
          onSuccess={handleUpdateSuccess}
        />
      )}
    </div>
  )
}