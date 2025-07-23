'use client'

import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import UserEditForm from '@/components/users/user-edit-form'

export default function EditUserPage() {
  const params = useParams()
  const router = useRouter()
  const userId = params.id as string

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-8">
        <Link
          href="/users"
          className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          사용자 목록으로 돌아가기
        </Link>
      </div>

      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h1 className="text-2xl font-semibold text-gray-900 mb-6">사용자 편집</h1>
          <UserEditForm 
            userId={userId}
            onSuccess={() => {
              router.push('/users')
              router.refresh()
            }} 
          />
        </div>
      </div>
    </div>
  )
}