import { auth } from '@/auth'
import Link from 'next/link'

export default async function TestAuthPage() {
  const session = await auth()

  return (
    <div className="min-h-screen p-8">
      <h1 className="text-2xl font-bold mb-4">Authentication Test</h1>
      
      <div className="mb-8 p-4 bg-gray-100 rounded">
        <h2 className="font-semibold mb-2">Current Session:</h2>
        {session ? (
          <pre className="text-sm">{JSON.stringify(session, null, 2)}</pre>
        ) : (
          <p>No active session</p>
        )}
      </div>

      <div className="space-y-4">
        <div>
          <h3 className="font-semibold mb-2">Test Links:</h3>
          <div className="space-x-4">
            <Link href="/api/auth/signin" className="text-blue-600 hover:underline">
              Direct SignIn (NextAuth)
            </Link>
            <Link href="/api/auth/signout" className="text-blue-600 hover:underline">
              Direct SignOut (NextAuth)
            </Link>
            <Link href="/login" className="text-blue-600 hover:underline">
              Custom Login Page
            </Link>
          </div>
        </div>

        <div className="mt-8 p-4 bg-yellow-50 rounded">
          <h3 className="font-semibold mb-2">Cognito Configuration Required:</h3>
          <ul className="text-sm space-y-1 list-disc list-inside">
            <li>Callback URL: http://localhost:3000/api/auth/callback/cognito</li>
            <li>Sign out URL: http://localhost:3000</li>
            <li>OAuth Flows: Authorization code grant</li>
            <li>OAuth Scopes: openid, email, profile</li>
          </ul>
        </div>

        <div className="mt-4 p-4 bg-blue-50 rounded">
          <h3 className="font-semibold mb-2">Environment Variables:</h3>
          <ul className="text-sm space-y-1 font-mono">
            <li>COGNITO_CLIENT_ID: {process.env.COGNITO_CLIENT_ID ? '✓ Set' : '✗ Missing'}</li>
            <li>COGNITO_CLIENT_SECRET: {process.env.COGNITO_CLIENT_SECRET ? '✓ Set' : '✗ Missing'}</li>
            <li>COGNITO_ISSUER: {process.env.COGNITO_ISSUER ? '✓ Set' : '✗ Missing'}</li>
            <li>NEXTAUTH_URL: {process.env.NEXTAUTH_URL ? '✓ Set' : '✗ Missing'}</li>
            <li>NEXTAUTH_SECRET: {process.env.NEXTAUTH_SECRET ? '✓ Set' : '✗ Missing'}</li>
          </ul>
        </div>
      </div>
    </div>
  )
}