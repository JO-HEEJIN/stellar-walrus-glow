'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { formatDate } from '@/lib/utils'

interface User {
  id: string
  name: string | null
  email: string | null
  role: 'MASTER_ADMIN' | 'BRAND_ADMIN' | 'BUYER'
  status: 'ACTIVE' | 'SUSPENDED' | 'DELETED'
  brandId: string | null
  brand?: {
    id: string
    nameKo: string
    nameCn?: string
  }
  createdAt: string
  updatedAt: string
}

interface UserListProps {
  userRole: string
}

export default function UserList({ userRole }: UserListProps) {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadUsers()
  }, [])

  const loadUsers = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/users', {
        credentials: 'include',
      })

      if (!response.ok) {
        throw new Error('Failed to load users')
      }

      const data = await response.json()
      setUsers(data.data || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load users')
    } finally {
      setLoading(false)
    }
  }

  const handleStatusChange = async (userId: string, newStatus: 'ACTIVE' | 'SUSPENDED') => {
    try {
      const response = await fetch(`/api/users/${userId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ status: newStatus }),
      })

      if (!response.ok) {
        throw new Error('Failed to update user status')
      }

      // Refresh the list
      loadUsers()
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to update user status')
    }
  }

  const getRoleDisplayName = (role: string) => {
    switch (role) {
      case 'MASTER_ADMIN': return '최고 관리자'
      case 'BRAND_ADMIN': return '브랜드 관리자'
      case 'BUYER': return '구매자'
      default: return role
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return (
          <span className="inline-flex rounded-full bg-green-100 px-2 text-xs font-semibold leading-5 text-green-800">
            활성
          </span>
        )
      case 'SUSPENDED':
        return (
          <span className="inline-flex rounded-full bg-yellow-100 px-2 text-xs font-semibold leading-5 text-yellow-800">
            정지
          </span>
        )
      case 'DELETED':
        return (
          <span className="inline-flex rounded-full bg-red-100 px-2 text-xs font-semibold leading-5 text-red-800">
            삭제됨
          </span>
        )
      default:
        return status
    }
  }

  if (loading) {
    return (
      <div className="animate-pulse">
        <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-16 bg-gray-200 rounded"></div>
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="rounded-md bg-red-50 p-4">
        <p className="text-sm text-red-800">사용자를 불러오는데 실패했습니다: {error}</p>
      </div>
    )
  }

  return (
    <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 sm:rounded-lg">
      <table className="min-w-full divide-y divide-gray-300">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
              이름
            </th>
            <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
              이메일
            </th>
            <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
              역할
            </th>
            <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
              소속
            </th>
            <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
              가입일
            </th>
            <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
              상태
            </th>
            <th className="relative py-3.5 pl-3 pr-4 sm:pr-6">
              <span className="sr-only">관리</span>
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200 bg-white">
          {users.length === 0 ? (
            <tr>
              <td colSpan={7} className="px-6 py-4 text-center text-sm text-gray-500">
                등록된 사용자가 없습니다.
              </td>
            </tr>
          ) : (
            users.map((user) => (
              <tr key={user.id}>
                <td className="whitespace-nowrap px-3 py-4 text-sm font-medium text-gray-900">
                  {user.name || '이름 없음'}
                </td>
                <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                  {user.email || '이메일 없음'}
                </td>
                <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                  {getRoleDisplayName(user.role)}
                </td>
                <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                  {user.brand ? user.brand.nameKo : '소속 없음'}
                </td>
                <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                  {formatDate(new Date(user.createdAt))}
                </td>
                <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                  {getStatusBadge(user.status)}
                </td>
                <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                  <div className="flex space-x-2">
                    <Link
                      href={`/users/${user.id}/edit`}
                      className="text-primary hover:text-primary/90"
                    >
                      편집
                    </Link>
                    {userRole === 'MASTER_ADMIN' && user.status === 'ACTIVE' && (
                      <button
                        onClick={() => handleStatusChange(user.id, 'SUSPENDED')}
                        className="text-yellow-600 hover:text-yellow-900"
                      >
                        정지
                      </button>
                    )}
                    {userRole === 'MASTER_ADMIN' && user.status === 'SUSPENDED' && (
                      <button
                        onClick={() => handleStatusChange(user.id, 'ACTIVE')}
                        className="text-green-600 hover:text-green-900"
                      >
                        활성화
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  )
}