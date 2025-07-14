'use client'

import { useState } from 'react'
import { Building2, Edit2, Globe, Package, Users, Check, X } from 'lucide-react'

interface Brand {
  id: string
  nameKo: string
  nameCn?: string | null
  slug: string
  description?: string | null
  logoUrl?: string | null
  isActive: boolean
  createdAt: Date
  _count?: {
    products: number
    users: number
  }
}

interface BrandProfileProps {
  brand: Brand
  canEdit: boolean
}

export default function BrandProfile({ brand, canEdit }: BrandProfileProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [editForm, setEditForm] = useState({
    nameKo: brand.nameKo,
    nameCn: brand.nameCn || '',
    description: brand.description || '',
  })
  const [saving, setSaving] = useState(false)

  const handleSave = async () => {
    setSaving(true)
    try {
      const response = await fetch(`/api/brands/${brand.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(editForm),
      })

      if (!response.ok) {
        throw new Error('Failed to update brand')
      }

      // Refresh the page to show updated data
      window.location.reload()
    } catch (error) {
      alert('브랜드 정보 수정에 실패했습니다.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="bg-white shadow-sm rounded-lg overflow-hidden">
      <div className="px-6 py-8">
        <div className="flex items-start justify-between">
          <div className="flex items-start space-x-6">
            {/* Brand Logo */}
            <div className="flex-shrink-0">
              <div className="h-24 w-24 rounded-lg bg-primary/10 flex items-center justify-center">
                {brand.logoUrl ? (
                  <img 
                    src={brand.logoUrl} 
                    alt={brand.nameKo} 
                    className="h-20 w-20 object-contain"
                  />
                ) : (
                  <Building2 className="h-12 w-12 text-primary" />
                )}
              </div>
            </div>

            {/* Brand Info */}
            <div className="flex-1">
              {isEditing ? (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      브랜드명 (한국어)
                    </label>
                    <input
                      type="text"
                      value={editForm.nameKo}
                      onChange={(e) => setEditForm({ ...editForm, nameKo: e.target.value })}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      브랜드명 (중국어)
                    </label>
                    <input
                      type="text"
                      value={editForm.nameCn}
                      onChange={(e) => setEditForm({ ...editForm, nameCn: e.target.value })}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      브랜드 설명
                    </label>
                    <textarea
                      rows={3}
                      value={editForm.description}
                      onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
                    />
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={handleSave}
                      disabled={saving}
                      className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md shadow-sm text-white bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50"
                    >
                      <Check className="h-4 w-4 mr-1" />
                      저장
                    </button>
                    <button
                      onClick={() => {
                        setIsEditing(false)
                        setEditForm({
                          nameKo: brand.nameKo,
                          nameCn: brand.nameCn || '',
                          description: brand.description || '',
                        })
                      }}
                      className="inline-flex items-center px-3 py-2 border border-gray-300 text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
                    >
                      <X className="h-4 w-4 mr-1" />
                      취소
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="flex items-center space-x-3">
                    <h1 className="text-2xl font-bold text-gray-900">{brand.nameKo}</h1>
                    {brand.isActive ? (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        활성
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                        비활성
                      </span>
                    )}
                  </div>
                  {brand.nameCn && (
                    <p className="mt-1 text-lg text-gray-600">{brand.nameCn}</p>
                  )}
                  {brand.description && (
                    <p className="mt-3 text-gray-600">{brand.description}</p>
                  )}
                  <div className="mt-4 flex items-center space-x-6 text-sm text-gray-500">
                    <div className="flex items-center">
                      <Package className="h-4 w-4 mr-1" />
                      <span>{brand._count?.products || 0} 상품</span>
                    </div>
                    <div className="flex items-center">
                      <Users className="h-4 w-4 mr-1" />
                      <span>{brand._count?.users || 0} 사용자</span>
                    </div>
                    <div className="flex items-center">
                      <Globe className="h-4 w-4 mr-1" />
                      <span>/{brand.slug}</span>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Edit Button */}
          {canEdit && !isEditing && (
            <button
              onClick={() => setIsEditing(true)}
              className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
            >
              <Edit2 className="h-4 w-4 mr-2" />
              수정
            </button>
          )}
        </div>
      </div>
    </div>
  )
}