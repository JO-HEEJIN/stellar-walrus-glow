'use client'

import { useSession, signIn, signOut } from 'next-auth/react'
import { useState, useEffect } from 'react'

export default function DebugAuth() {
  const { data: session, status } = useSession()
  const [debugInfo, setDebugInfo] = useState<any>({})

  useEffect(() => {
    setDebugInfo({
      status,
      session: session ? {
        user: session.user,
        expires: session.expires,
      } : null,
      env: {
        NEXTAUTH_URL: process.env.NEXTAUTH_URL,
        NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
      },
      window: {
        location: typeof window !== 'undefined' ? window.location.href : 'server',
        protocol: typeof window !== 'undefined' ? window.location.protocol : 'server',
      }
    })
  }, [session, status])

  return (
    <div className="min-h-screen p-8 bg-gray-100">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">🔍 NextAuth Debug Page</h1>
        
        {/* Session Status */}
        <div className="bg-white p-6 rounded-lg shadow mb-6">
          <h2 className="text-xl font-semibold mb-4">Session Status</h2>
          <div className="space-y-2">
            <p><strong>Status:</strong> <span className={`px-2 py-1 rounded text-sm ${
              status === 'authenticated' ? 'bg-green-100 text-green-800' :
              status === 'loading' ? 'bg-yellow-100 text-yellow-800' :
              'bg-red-100 text-red-800'
            }`}>{status}</span></p>
            <p><strong>Has Session:</strong> {session ? '✅ Yes' : '❌ No'}</p>
            {session?.user && (
              <div>
                <p><strong>User Email:</strong> {session.user.email}</p>
                <p><strong>User Name:</strong> {session.user.name}</p>
                <p><strong>User ID:</strong> {session.user.id}</p>
              </div>
            )}
          </div>
        </div>

        {/* Auth Actions */}
        <div className="bg-white p-6 rounded-lg shadow mb-6">
          <h2 className="text-xl font-semibold mb-4">Auth Actions</h2>
          <div className="space-x-4">
            {status === 'authenticated' ? (
              <button
                onClick={() => signOut()}
                className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
              >
                Sign Out
              </button>
            ) : (
              <>
                <button
                  onClick={() => signIn('cognito')}
                  className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                >
                  Sign In with Cognito
                </button>
                <button
                  onClick={() => signIn()}
                  className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
                >
                  Sign In (All Providers)
                </button>
              </>
            )}
          </div>
        </div>

        {/* Debug Info */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Debug Information</h2>
          <pre className="bg-gray-100 p-4 rounded text-sm overflow-auto">
            {JSON.stringify(debugInfo, null, 2)}
          </pre>
        </div>

        {/* Quick Links */}
        <div className="bg-white p-6 rounded-lg shadow mt-6">
          <h2 className="text-xl font-semibold mb-4">Quick Links</h2>
          <div className="space-y-2">
            <a href="/api/auth/signin" className="text-blue-500 hover:underline block">
              📋 NextAuth Sign In Page
            </a>
            <a href="/api/auth/session" className="text-blue-500 hover:underline block">
              🔍 Session API Endpoint
            </a>
            <a href="/api/auth/providers" className="text-blue-500 hover:underline block">
              🔧 Available Providers
            </a>
            <a href="/api/health" className="text-blue-500 hover:underline block">
              ❤️ Health Check
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}