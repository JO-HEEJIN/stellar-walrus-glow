// 인증 관련 유틸리티 함수들

export function getAuthToken(): string | null {
  if (typeof document === 'undefined') return null
  
  // 쿠키에서 auth-token 찾기
  const cookies = document.cookie.split(';')
  for (const cookie of cookies) {
    const [name, value] = cookie.trim().split('=')
    if (name === 'auth-token') {
      return decodeURIComponent(value)
    }
  }
  return null
}

export function isTokenExpired(token: string): boolean {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]))
    const currentTime = Math.floor(Date.now() / 1000)
    return payload.exp < currentTime
  } catch (error) {
    console.error('토큰 파싱 오류:', error)
    return true // 파싱 실패시 만료된 것으로 간주
  }
}

export function checkAuthStatus(): { 
  isAuthenticated: boolean
  token: string | null
  isExpired: boolean
  message?: string
} {
  const token = getAuthToken()
  
  if (!token) {
    return {
      isAuthenticated: false,
      token: null,
      isExpired: false,
      message: '토큰이 없습니다'
    }
  }
  
  const expired = isTokenExpired(token)
  
  return {
    isAuthenticated: !expired,
    token,
    isExpired: expired,
    message: expired ? '토큰이 만료되었습니다' : '인증 상태 양호'
  }
}

export async function refreshAuthIfNeeded(): Promise<boolean> {
  const authStatus = checkAuthStatus()
  
  if (!authStatus.isAuthenticated) {
    console.warn('인증 필요:', authStatus.message)
    
    // 토큰이 만료된 경우 로그인 페이지로 리디렉션하거나 자동 갱신 시도
    if (authStatus.isExpired) {
      // 여기서 자동 토큰 갱신 로직을 구현할 수 있음
      // 현재는 단순히 false 반환
      return false
    }
  }
  
  return authStatus.isAuthenticated
}