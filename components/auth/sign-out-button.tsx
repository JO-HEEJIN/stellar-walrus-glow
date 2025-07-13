'use client'

export default function SignOutButton() {
  const handleSignOut = () => {
    // Clear local storage
    if (typeof window !== 'undefined') {
      localStorage.removeItem('kfashion-cart')
      sessionStorage.clear()
    }

    // Construct Cognito logout URL
    const cognitoDomain = 'https://ap-northeast-1xv5gzrnik.auth.ap-northeast-1.amazoncognito.com'
    const clientId = 'r03rnf7k4b9fafv8rs5av22it'
    const logoutUri = encodeURIComponent('http://localhost:3000')
    
    // Redirect to Cognito logout endpoint which will clear Cognito session
    // and then redirect back to our app
    window.location.href = `${cognitoDomain}/logout?client_id=${clientId}&logout_uri=${logoutUri}`
  }

  return (
    <button
      onClick={handleSignOut}
      type="button"
      className="rounded-md bg-gray-100 px-3 py-2 text-sm font-semibold text-gray-900 hover:bg-gray-200"
    >
      로그아웃
    </button>
  )
}