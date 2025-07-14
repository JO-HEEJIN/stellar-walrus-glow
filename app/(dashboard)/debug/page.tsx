'use client'

import { useSession } from 'next-auth/react'
import { useEffect, useState } from 'react'

export default function DebugPage() {
  const { data: session, status } = useSession()
  const [authCheck, setAuthCheck] = useState<any>(null)

  useEffect(() => {
    // Check auth via API
    fetch('/api/auth/check')
      .then(res => res.json())
      .then(data => setAuthCheck(data))
      .catch(err => console.error('Auth check error:', err))
  }, [])

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Debug Information</h1>
      
      <div className="space-y-6">
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-lg font-semibold mb-4">Client-Side Session (useSession)</h2>
          <pre className="bg-gray-100 p-4 rounded overflow-auto text-sm">
            Status: {status}
            {'\n'}
            Session: {JSON.stringify(session, null, 2)}
          </pre>
        </div>

        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-lg font-semibold mb-4">Server-Side Auth Check</h2>
          <pre className="bg-gray-100 p-4 rounded overflow-auto text-sm">
            {JSON.stringify(authCheck, null, 2)}
          </pre>
        </div>

        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-lg font-semibold mb-4">Actions</h2>
          <div className="space-x-4">
            <button
              onClick={() => window.location.href = '/api/auth/signin'}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Sign In
            </button>
            <button
              onClick={() => window.location.href = '/api/auth/signout'}
              className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
            >
              Sign Out
            </button>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
            >
              Refresh Page
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}