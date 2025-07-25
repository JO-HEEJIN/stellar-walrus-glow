import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { rateLimiters, getIdentifier, rateLimitResponse } from '@/lib/rate-limit'

export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname

  // 1. Rate limiting for API routes
  if (path.startsWith('/api/')) {
    // Skip rate limiting for NextAuth routes
    if (!path.startsWith('/api/auth/')) {
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
  }

  // 2. Generate nonce for CSP
  const nonce = Buffer.from(crypto.randomUUID()).toString('base64')
  
  // 2. Define CSP header
  const isDev = process.env.NODE_ENV === 'development'
  
  const cspHeader = `
    default-src 'self';
    script-src 'self' 'nonce-${nonce}' 'unsafe-eval' 'unsafe-inline' https://vercel.live;
    style-src 'self' 'unsafe-inline';
    img-src 'self' blob: data: https:;
    font-src 'self';
    object-src 'none';
    base-uri 'self';
    form-action 'self' https://cognito-idp.us-east-2.amazonaws.com;
    frame-ancestors 'none';
    connect-src 'self' https://cognito-idp.us-east-2.amazonaws.com https://*.amazoncognito.com https://vercel.live;
  `.replace(/\s{2,}/g, ' ').trim()

  // 3. Create response with security headers
  const response = NextResponse.next()
  
  // Apply security headers
  response.headers.set('Content-Security-Policy', cspHeader)
  response.headers.set('X-Nonce', nonce)

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