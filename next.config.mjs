/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  
  // Disable ESLint during builds for deployment
  eslint: {
    ignoreDuringBuilds: true,
  },
  
  // Disable type checking during builds for deployment
  typescript: {
    ignoreBuildErrors: true,
  },
  
  // For CloudFront + S3 deployment
  output: process.env.BUILD_STATIC === 'true' ? 'export' : 'standalone',
  trailingSlash: true,
  
  // Enable experimental features
  experimental: {
    // Server Components are now stable in Next.js 14
  },
  
  // Basic security headers (CSP disabled for Next.js compatibility)
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on'
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff'
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY'
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block'
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin'
          }
        ]
      }
    ]
  },
  
  // Configure external images from S3
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*.s3.*.amazonaws.com',
        pathname: '/**',
      },
    ],
  },
  
  // Environment variables available on the client
  env: {
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
  },
  
  // Redirect old routes if needed
  async redirects() {
    return []
  },
  
  // Rewrite rules if needed
  async rewrites() {
    return []
  }
}

export default nextConfig