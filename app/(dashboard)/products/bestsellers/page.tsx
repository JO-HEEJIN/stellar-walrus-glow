'use client'

import { useState } from 'react'
import Link from 'next/link'
import { BestsellerProducts } from '@/components/products/bestseller-products'
import { ArrowLeft, Calendar, DollarSign } from 'lucide-react'

export default function BestsellersPage() {
  const [period, setPeriod] = useState<'7days' | '30days' | '90days' | 'all'>('30days')
  const [showRevenue, setShowRevenue] = useState(false)

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <Link 
            href="/dashboard" 
            className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-1" />
            대시보드로 돌아가기
          </Link>
          
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">베스트셀러 상품 🏆</h1>
              <p className="mt-2 text-gray-600">가장 많이 판매된 인기 상품들을 확인하세요</p>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow p-4 mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            {/* Period Selector */}
            <div className="flex items-center space-x-2">
              <Calendar className="w-5 h-5 text-gray-500" />
              <span className="text-sm font-medium text-gray-700">기간:</span>
              <div className="flex space-x-2">
                <button
                  onClick={() => setPeriod('7days')}
                  className={`px-3 py-1 text-sm rounded-md transition-colors ${
                    period === '7days'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  최근 7일
                </button>
                <button
                  onClick={() => setPeriod('30days')}
                  className={`px-3 py-1 text-sm rounded-md transition-colors ${
                    period === '30days'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  최근 30일
                </button>
                <button
                  onClick={() => setPeriod('90days')}
                  className={`px-3 py-1 text-sm rounded-md transition-colors ${
                    period === '90days'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  최근 90일
                </button>
                <button
                  onClick={() => setPeriod('all')}
                  className={`px-3 py-1 text-sm rounded-md transition-colors ${
                    period === 'all'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  전체 기간
                </button>
              </div>
            </div>

            {/* Revenue Toggle */}
            <div className="flex items-center space-x-2">
              <DollarSign className="w-5 h-5 text-gray-500" />
              <label className="flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={showRevenue}
                  onChange={(e) => setShowRevenue(e.target.checked)}
                  className="sr-only"
                />
                <div className="relative">
                  <div className={`block w-10 h-6 rounded-full ${showRevenue ? 'bg-blue-600' : 'bg-gray-300'}`}></div>
                  <div className={`absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform ${showRevenue ? 'translate-x-4' : ''}`}></div>
                </div>
                <span className="ml-2 text-sm font-medium text-gray-700">매출 표시</span>
              </label>
            </div>
          </div>
        </div>

        {/* Bestseller Products Grid */}
        <BestsellerProducts 
          period={period} 
          limit={20} 
          showRevenue={showRevenue}
          compact={false}
        />
      </div>
    </div>
  )
}