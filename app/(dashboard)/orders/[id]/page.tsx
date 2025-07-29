'use client'

import { useParams } from 'next/navigation'
import { useState, useEffect } from 'react'
import EnhancedOrderDetail from '@/components/orders/enhanced-order-detail'

export default function OrderDetailPage() {
  const params = useParams()
  const orderId = params.id as string
  const [userRole, setUserRole] = useState<string>('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const authResponse = await fetch('/api/auth/me')
        if (authResponse.ok) {
          const authData = await authResponse.json()
          setUserRole(authData.user.role)
        }
      } catch (error) {
        console.error('Auth check error:', error)
      } finally {
        setLoading(false)
      }
    }

    checkAuth()
  }, [])

  if (loading) {
    return <div className="text-center py-4">로딩 중...</div>
  }

  return <EnhancedOrderDetail orderId={orderId} userRole={userRole} />
}