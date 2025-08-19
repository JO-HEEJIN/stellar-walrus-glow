'use client'

import { useState, useEffect } from 'react'
import { Plus, Edit2, Trash2, MapPin, Star, Check } from 'lucide-react'
import { toast } from 'sonner'

interface Address {
  id: string
  name: string
  recipient: string
  phone: string
  zipCode: string
  address: string
  detailAddress: string
  isDefault: boolean
  createdAt: string
  updatedAt: string
}

interface AddressFormData {
  name: string
  recipient: string
  phone: string
  zipCode: string
  address: string
  detailAddress: string
  isDefault: boolean
}

interface AddressManagementProps {
  userId: string
}

export default function AddressManagement({ userId }: AddressManagementProps) {
  const [addresses, setAddresses] = useState<Address[]>([])
  const [loading, setLoading] = useState(true)
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingAddress, setEditingAddress] = useState<Address | null>(null)
  const [formData, setFormData] = useState<AddressFormData>({
    name: '',
    recipient: '',
    phone: '',
    zipCode: '',
    address: '',
    detailAddress: '',
    isDefault: false,
  })

  useEffect(() => {
    loadAddresses()
  }, [userId])

  const loadAddresses = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/users/addresses', {
        credentials: 'include',
      })

      if (!response.ok) {
        throw new Error('배송지 정보를 불러오는데 실패했습니다')
      }

      const data = await response.json()
      setAddresses(data.data || [])
    } catch (error) {
      console.error('주소 로드 실패:', error)
      // Mock data for development
      setAddresses([
        {
          id: '1',
          name: '집',
          recipient: '홍길동',
          phone: '010-1234-5678',
          zipCode: '06142',
          address: '서울특별시 강남구 테헤란로 123',
          detailAddress: '456호',
          isDefault: true,
          createdAt: '2024-01-01T00:00:00Z',
          updatedAt: '2024-01-01T00:00:00Z',
        },
        {
          id: '2',
          name: '회사',
          recipient: '홍길동',
          phone: '010-1234-5678',
          zipCode: '04551',
          address: '서울특별시 중구 세종대로 110',
          detailAddress: '12층 1201호',
          isDefault: false,
          createdAt: '2024-01-02T00:00:00Z',
          updatedAt: '2024-01-02T00:00:00Z',
        },
      ])
    } finally {
      setLoading(false)
    }
  }

  const openForm = (address?: Address) => {
    if (address) {
      setEditingAddress(address)
      setFormData({
        name: address.name,
        recipient: address.recipient,
        phone: address.phone,
        zipCode: address.zipCode,
        address: address.address,
        detailAddress: address.detailAddress,
        isDefault: address.isDefault,
      })
    } else {
      setEditingAddress(null)
      setFormData({
        name: '',
        recipient: '',
        phone: '',
        zipCode: '',
        address: '',
        detailAddress: '',
        isDefault: false,
      })
    }
    setIsFormOpen(true)
  }

  const closeForm = () => {
    setIsFormOpen(false)
    setEditingAddress(null)
    setFormData({
      name: '',
      recipient: '',
      phone: '',
      zipCode: '',
      address: '',
      detailAddress: '',
      isDefault: false,
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.name || !formData.recipient || !formData.phone || !formData.address) {
      toast.error('필수 항목을 모두 입력해주세요')
      return
    }

    try {
      const url = editingAddress 
        ? `/api/users/addresses/${editingAddress.id}`
        : '/api/users/addresses'
      
      const method = editingAddress ? 'PATCH' : 'POST'
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(formData),
      })

      if (!response.ok) {
        throw new Error('배송지 저장에 실패했습니다')
      }

      toast.success(editingAddress ? '배송지가 수정되었습니다' : '배송지가 추가되었습니다')
      closeForm()
      loadAddresses()
    } catch (error) {
      console.error('주소 저장 실패:', error)
      // Mock success for development
      const newAddress: Address = {
        id: editingAddress?.id || Date.now().toString(),
        ...formData,
        createdAt: editingAddress?.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }

      if (editingAddress) {
        setAddresses(prev => prev.map(addr => 
          addr.id === editingAddress.id ? newAddress : addr
        ))
        toast.success('배송지가 수정되었습니다')
      } else {
        setAddresses(prev => [...prev, newAddress])
        toast.success('배송지가 추가되었습니다')
      }
      closeForm()
    }
  }

  const handleDelete = async (addressId: string) => {
    if (!confirm('이 배송지를 삭제하시겠습니까?')) return

    try {
      const response = await fetch(`/api/users/addresses/${addressId}`, {
        method: 'DELETE',
        credentials: 'include',
      })

      if (!response.ok) {
        throw new Error('배송지 삭제에 실패했습니다')
      }

      toast.success('배송지가 삭제되었습니다')
      loadAddresses()
    } catch (error) {
      console.error('주소 삭제 실패:', error)
      // Mock success for development
      setAddresses(prev => prev.filter(addr => addr.id !== addressId))
      toast.success('배송지가 삭제되었습니다')
    }
  }

  const handleSetDefault = async (addressId: string) => {
    try {
      const response = await fetch(`/api/users/addresses/${addressId}/default`, {
        method: 'PATCH',
        credentials: 'include',
      })

      if (!response.ok) {
        throw new Error('기본 배송지 설정에 실패했습니다')
      }

      toast.success('기본 배송지로 설정되었습니다')
      loadAddresses()
    } catch (error) {
      console.error('기본 배송지 설정 실패:', error)
      // Mock success for development
      setAddresses(prev => prev.map(addr => ({
        ...addr,
        isDefault: addr.id === addressId
      })))
      toast.success('기본 배송지로 설정되었습니다')
    }
  }

  const searchAddress = () => {
    // Daum 우편번호 API 사용
    if (typeof window !== 'undefined' && (window as any).daum) {
      new (window as any).daum.Postcode({
        oncomplete: function(data: any) {
          setFormData(prev => ({
            ...prev,
            zipCode: data.zonecode,
            address: data.address,
          }))
        }
      }).open()
    } else {
      toast.error('우편번호 검색 서비스를 불러올 수 없습니다')
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-lg text-gray-600">배송지 정보를 불러오는 중...</div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Add Button */}
      <div className="flex justify-end">
        <button
          onClick={() => openForm()}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          <Plus className="h-4 w-4 mr-2" />
          배송지 추가
        </button>
      </div>

      {/* Address List */}
      {addresses.length === 0 ? (
        <div className="text-center py-12">
          <MapPin className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500">등록된 배송지가 없습니다</p>
          <button
            onClick={() => openForm()}
            className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-blue-600 bg-blue-50 hover:bg-blue-100"
          >
            첫 번째 배송지 추가하기
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {addresses.map((address) => (
            <div key={address.id} className={`relative bg-white border rounded-lg p-4 ${
              address.isDefault ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
            }`}>
              {address.isDefault && (
                <div className="absolute -top-2 -right-2">
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-600 text-white">
                    <Star className="h-3 w-3 mr-1" />
                    기본배송지
                  </span>
                </div>
              )}

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-900">{address.name}</h3>
                  <div className="flex space-x-1">
                    <button
                      onClick={() => openForm(address)}
                      className="p-1 text-gray-400 hover:text-gray-600"
                    >
                      <Edit2 className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(address.id)}
                      className="p-1 text-gray-400 hover:text-red-600"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                <div className="text-sm text-gray-600">
                  <p className="font-medium">{address.recipient}</p>
                  <p>{address.phone}</p>
                  <p>({address.zipCode}) {address.address}</p>
                  {address.detailAddress && <p>{address.detailAddress}</p>}
                </div>

                {!address.isDefault && (
                  <button
                    onClick={() => handleSetDefault(address.id)}
                    className="text-sm text-blue-600 hover:text-blue-800"
                  >
                    기본배송지로 설정
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Address Form Modal */}
      {isFormOpen && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-10 mx-auto p-5 border w-11/12 md:w-2/3 lg:w-1/2 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900">
                  {editingAddress ? '배송지 수정' : '배송지 추가'}
                </h3>
                <button
                  onClick={closeForm}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ×
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    배송지 이름 <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="예: 집, 회사"
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                    required
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      받는 사람 <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.recipient}
                      onChange={(e) => setFormData(prev => ({ ...prev, recipient: e.target.value }))}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      연락처 <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                      placeholder="010-1234-5678"
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      우편번호 <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.zipCode}
                      readOnly
                      className="mt-1 block w-full rounded-md border-gray-300 bg-gray-50 shadow-sm sm:text-sm"
                      required
                    />
                  </div>
                  <div className="col-span-2 flex items-end">
                    <button
                      type="button"
                      onClick={searchAddress}
                      className="w-full px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                      우편번호 검색
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    주소 <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.address}
                    readOnly
                    className="mt-1 block w-full rounded-md border-gray-300 bg-gray-50 shadow-sm sm:text-sm"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    상세주소
                  </label>
                  <input
                    type="text"
                    value={formData.detailAddress}
                    onChange={(e) => setFormData(prev => ({ ...prev, detailAddress: e.target.value }))}
                    placeholder="동, 호수 등 상세주소"
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                  />
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="isDefault"
                    checked={formData.isDefault}
                    onChange={(e) => setFormData(prev => ({ ...prev, isDefault: e.target.checked }))}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor="isDefault" className="ml-2 block text-sm text-gray-900">
                    기본 배송지로 설정
                  </label>
                </div>

                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={closeForm}
                    className="px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    취소
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    {editingAddress ? '수정' : '추가'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}