import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { rateLimiters, getIdentifier, rateLimitResponse } from '@/lib/rate-limit'

export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname

  // 1. Rate limiting for API routes
  if (path.startsWith('/api/')) {
    // Skip rate limiting for NextAuth routes and in development mode
    if (!path.startsWith('/api/auth/') && process.env.NODE_ENV !== 'development') {
      try {
        const identifier = getIdentifier(request)
        const { success, limit, reset, remaining } = await rateLimiters.api.limit(identifier)
        
        if (!success) {
          return rateLimitResponse(remaining, reset, limit)
        }
      } catch (error) {
        // If Redis is not configured, continue without rate limiting
        console.warn('Rate limiting not available:', error)
      }
    }
    
    // In development mode, allow all API calls without authentication
    if (process.env.NODE_ENV === 'development') {
      const response = NextResponse.next()
      response.headers.set('X-Frame-Options', 'DENY')
      response.headers.set('X-Content-Type-Options', 'nosniff')
      response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')
      return response
    }
  }

  // 2. Create response with basic security headers (CSP disabled for Next.js compatibility)
  const response = NextResponse.next()
  
  // Apply basic security headers without CSP
  response.headers.set('X-Frame-Options', 'DENY')
  response.headers.set('X-Content-Type-Options', 'nosniff')
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')

  // 4. Skip auth middleware for logout-redirect page
  if (path === '/logout-redirect') {
    return response
  }

  // Skip auth middleware for now - will be implemented later
  // if (path.startsWith('/dashboard') || path.startsWith('/products') || path.startsWith('/orders')) {
  //   // TODO: Implement authentication
  // }

  return response
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
}