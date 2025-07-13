export default function TestCognitoPage() {
  // Build the Cognito login URL manually
  const cognitoDomain = 'https://ap-northeast-1xv5gzrnik.auth.ap-northeast-1.amazoncognito.com'
  const clientId = process.env.COGNITO_CLIENT_ID
  const redirectUri = encodeURIComponent('http://localhost:3000/api/auth/callback/cognito')
  
  const cognitoLoginUrl = `${cognitoDomain}/login?client_id=${clientId}&response_type=code&scope=openid+email+profile&redirect_uri=${redirectUri}`

  return (
    <div className="min-h-screen p-8">
      <h1 className="text-2xl font-bold mb-4">Cognito Direct Test</h1>
      
      <div className="space-y-4">
        <div className="p-4 bg-gray-100 rounded">
          <h2 className="font-semibold mb-2">Cognito Configuration:</h2>
          <ul className="text-sm space-y-1">
            <li>Domain: ap-northeast-1xv5gzrnik.auth.ap-northeast-1.amazoncognito.com</li>
            <li>Client ID: {process.env.COGNITO_CLIENT_ID || 'Not set'}</li>
            <li>Redirect URI: http://localhost:3000/api/auth/callback/cognito</li>
          </ul>
        </div>

        <div className="space-y-2">
          <p className="text-sm text-gray-600">Click below to test direct Cognito login:</p>
          <a 
            href={cognitoLoginUrl}
            className="inline-block px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Direct Cognito Login
          </a>
        </div>

        <div className="mt-8 p-4 bg-yellow-50 rounded">
          <h3 className="font-semibold mb-2">Manual URL (for debugging):</h3>
          <p className="text-xs font-mono break-all">{cognitoLoginUrl}</p>
        </div>
      </div>
    </div>
  )
}