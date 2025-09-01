'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { toast } from 'sonner'

interface BrandFormData {
  nameKo: string
  nameEn?: string
  slug: string
  description?: string
  logoUrl?: string
  isActive: boolean
  website?: string
  email?: string
  phone?: string
  address?: string
}

export default function EditBrandPage() {
  const params = useParams()
  const router = useRouter()
  const brandId = params.id as string
  
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [formData, setFormData] = useState<BrandFormData>({
    nameKo: '',
    nameEn: '',
    slug: '',
    description: '',
    logoUrl: '',
    isActive: true,
    website: '',
    email: '',
    phone: '',
    address: '',
  })

  useEffect(() => {
    if (brandId) {
      fetchBrand()
    }
  }, [brandId])

  const fetchBrand = async () => {
    try {
      const response = await fetch(`/api/brands/${brandId}`, {
        credentials: 'include',
      })
      
      if (response.ok) {
        const data = await response.json()
        const brand = data.data || data
        setFormData({
          nameKo: brand.nameKo || '',
          nameEn: brand.nameEn || '',
          slug: brand.slug || '',
          description: brand.description || '',
          logoUrl: brand.logoUrl || '',
          isActive: brand.isActive !== undefined ? brand.isActive : true,
          website: brand.website || '',
          email: brand.email || '',
          phone: brand.phone || '',
          address: brand.address || '',
        })
      } else {
        // Mock data for development
        setFormData({
          nameKo: '샘플 브랜드',
          nameEn: 'Sample Brand',
          slug: 'sample-brand',
          description: '이것은 샘플 브랜드 설명입니다.',
          logoUrl: '/placeholder.svg',
          isActive: true,
          website: 'https://example.com',
          email: 'info@example.com',
          phone: '02-1234-5678',
          address: '서울특별시 강남구',
        })
      }
    } catch (error) {
      console.error('Failed to fetch brand:', error)
      toast.error('브랜드 정보를 불러오는데 실패했습니다')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.nameKo || !formData.slug) {
      toast.error('브랜드명(한글)과 슬러그는 필수입니다')
      return
    }

    setSaving(true)
    try {
      const response = await fetch(`/api/brands/${brandId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        toast.success('브랜드가 성공적으로 수정되었습니다')
        router.push(`/admin-brands/${brandId}`)
      } else {
        const error = await response.json()
        toast.error(error.message || '브랜드 수정에 실패했습니다')
      }
    } catch (error) {
      console.error('Failed to update brand:', error)
      toast.error('브랜드 수정 중 오류가 발생했습니다')
    } finally {
      setSaving(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }))
  }

  const generateSlug = () => {
    const slug = formData.nameEn
      ? formData.nameEn.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
      : formData.nameKo.toLowerCase().replace(/[^a-z0-9가-힣]+/g, '-').replace(/(^-|-$)/g, '')
    setFormData(prev => ({ ...prev, slug }))
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">브랜드 정보를 불러오는 중...</div>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-8">
        <Link
          href={`/admin-brands/${brandId}`}
          className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700 mb-4"
        >
          <ArrowLeft className="w-4 h-4 mr-1" />
          브랜드 상세로 돌아가기
        </Link>
        <h1 className="text-3xl font-bold text-gray-900">브랜드 수정</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Basic Information */}
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">기본 정보</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="nameKo" className="block text-sm font-medium text-gray-700 mb-1">
                브랜드명 (한글) <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="nameKo"
                name="nameKo"
                value={formData.nameKo}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label htmlFor="nameEn" className="block text-sm font-medium text-gray-700 mb-1">
                브랜드명 (영문)
              </label>
              <input
                type="text"
                id="nameEn"
                name="nameEn"
                value={formData.nameEn}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label htmlFor="slug" className="block text-sm font-medium text-gray-700 mb-1">
                슬러그 <span className="text-red-500">*</span>
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  id="slug"
                  name="slug"
                  value={formData.slug}
                  onChange={handleChange}
                  required
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <button
                  type="button"
                  onClick={generateSlug}
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
                >
                  자동 생성
                </button>
              </div>
            </div>

            <div>
              <label htmlFor="logoUrl" className="block text-sm font-medium text-gray-700 mb-1">
                로고 URL
              </label>
              <input
                type="url"
                id="logoUrl"
                name="logoUrl"
                value={formData.logoUrl}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div className="md:col-span-2">
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                설명
              </label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div className="md:col-span-2">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  name="isActive"
                  checked={formData.isActive}
                  onChange={handleChange}
                  className="mr-2 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm font-medium text-gray-700">활성 상태</span>
              </label>
            </div>
          </div>
        </div>

        {/* Contact Information */}
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">연락처 정보</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="website" className="block text-sm font-medium text-gray-700 mb-1">
                웹사이트
              </label>
              <input
                type="url"
                id="website"
                name="website"
                value={formData.website}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                이메일
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                전화번호
              </label>
              <input
                type="tel"
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1">
                주소
              </label>
              <input
                type="text"
                id="address"
                name="address"
                value={formData.address}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end space-x-4">
          <Link
            href={`/admin-brands/${brandId}`}
            className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
          >
            취소
          </Link>
          <button
            type="submit"
            disabled={saving}
            className={`px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 ${
              saving ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            {saving ? '저장 중...' : '저장'}
          </button>
        </div>
      </form>
    </div>
  )
}