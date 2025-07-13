import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { getToken } from 'next-auth/jwt'
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
    script-src 'self' 'nonce-${nonce}' ${isDev ? "'unsafe-eval'" : "'strict-dynamic'"};
    style-src 'self' 'unsafe-inline';
    img-src 'self' blob: data: https:;
    font-src 'self';
    object-src 'none';
    base-uri 'self';
    form-action 'self' https://cognito-idp.ap-northeast-1.amazonaws.com https://ap-northeast-1xv5gzrnik.auth.ap-northeast-1.amazoncognito.com;
    frame-ancestors 'none';
    connect-src 'self' https://cognito-idp.ap-northeast-1.amazonaws.com https://*.amazoncognito.com https://ap-northeast-1xv5gzrnik.auth.ap-northeast-1.amazoncognito.com;
    block-all-mixed-content;
    upgrade-insecure-requests;
  `.replace(/\s{2,}/g, ' ').trim()

  // 3. Create response with security headers
  const response = NextResponse.next()
  
  // Apply security headers
  response.headers.set('Content-Security-Policy', cspHeader)
  response.headers.set('X-Nonce', nonce)

  // 4. Define protected routes
  const protectedPaths = ['/admin', '/master', '/dashboard', '/orders']
  const authPaths = ['/login', '/register']
  const isProtectedPath = protectedPaths.some(p => path.startsWith(p))
  const isAuthPath = authPaths.some(p => path.startsWith(p))

  // 5. Get authentication token
  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET!,
  })

  // 6. Redirect authenticated users away from auth pages
  if (isAuthPath && token) {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  // 7. Protect authenticated routes
  if (isProtectedPath && !token) {
    const redirectUrl = new URL('/login', request.url)
    redirectUrl.searchParams.set('callbackUrl', request.url)
    return NextResponse.redirect(redirectUrl)
  }

  // 8. Role-based access control
  if (path.startsWith('/master') && token?.role !== 'MASTER_ADMIN') {
    return NextResponse.redirect(new URL('/unauthorized', request.url))
  }

  if (path.startsWith('/admin') && !['BRAND_ADMIN', 'MASTER_ADMIN'].includes(token?.role as string)) {
    return NextResponse.redirect(new URL('/unauthorized', request.url))
  }

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