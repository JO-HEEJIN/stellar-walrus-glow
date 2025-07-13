'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function SignOutWrapper({ children }: { children: React.ReactNode }) {
  const router = useRouter()

  useEffect(() => {
    // Listen for sign out events
    const handleBeforeUnload = () => {
      // Clear client-side state when navigating away
      if (window.location.pathname === '/') {
        localStorage.removeItem('kfashion-cart')
        sessionStorage.clear()
      }
    }

    window.addEventListener('beforeunload', handleBeforeUnload)
    return () => window.removeEventListener('beforeunload', handleBeforeUnload)
  }, [])

  return <>{children}</>
}