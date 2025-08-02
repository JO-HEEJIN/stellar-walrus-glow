import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  const baseUrl = 'https://k-fashions.com'
  
  return {
    rules: [
      // Google 봇들에 대한 명시적 허용
      {
        userAgent: 'Googlebot',
        allow: [
          '/',
          '/products/',
          '/brands/',
          '/about',
          '/contact',
          '/privacy',
          '/terms',
        ],
        disallow: [
          '/api/',
          '/(dashboard)/',
          '/admin/',
          '/login',
          '/register',
          '/forgot-password',
          '/debug*',
          '/test*',
        ],
      },
      {
        userAgent: 'Googlebot-Image',
        allow: [
          '/',
          '/products/',
          '/brands/',
          '/_next/static/',
          '/images/',
        ],
      },
      // 소셜 미디어 크롤러들
      {
        userAgent: 'facebookexternalhit',
        allow: [
          '/',
          '/products/',
          '/brands/',
          '/about',
          '/contact',
        ],
      },
      {
        userAgent: 'Twitterbot',
        allow: [
          '/',
          '/products/',
          '/brands/',
          '/about',
          '/contact',
        ],
      },
      // 검색엔진들
      {
        userAgent: 'Bingbot',
        allow: [
          '/',
          '/products/',
          '/brands/',
          '/about',
          '/contact',
        ],
        disallow: [
          '/api/',
          '/(dashboard)/',
          '/admin/',
          '/login',
          '/register',
        ],
      },
      {
        userAgent: 'YandexBot',
        allow: [
          '/',
          '/products/',
          '/brands/',
        ],
        disallow: [
          '/api/',
          '/(dashboard)/',
          '/admin/',
        ],
      },
      // 네이버 검색엔진
      {
        userAgent: 'NaverBot',
        allow: [
          '/',
          '/products/',
          '/brands/',
          '/about',
          '/contact',
        ],
        disallow: [
          '/api/',
          '/(dashboard)/',
          '/admin/',
        ],
      },
      // 다음 검색엔진
      {
        userAgent: 'DaumBot',
        allow: [
          '/',
          '/products/',
          '/brands/',
          '/about',
          '/contact',
        ],
        disallow: [
          '/api/',
          '/(dashboard)/',
          '/admin/',
        ],
      },
      // AdSense 크롤러
      {
        userAgent: 'Mediapartners-Google',
        allow: '/',
      },
      {
        userAgent: 'AdsBot-Google',
        allow: '/',
      },
      // 기본 규칙
      {
        userAgent: '*',
        allow: [
          '/',
          '/products/',
          '/brands/',
          '/about',
          '/contact',
          '/privacy',
          '/terms',
          '/_next/static/',
        ],
        disallow: [
          '/api/',
          '/(dashboard)/',
          '/admin/',
          '/login',
          '/register',
          '/forgot-password',
          '/forgot-id',
          '/confirm-email',
          '/debug*',
          '/test*',
          '/_next/webpack-hmr',
        ],
        crawlDelay: 1, // 크롤링 간격 1초
      },
    ],
    sitemap: [`${baseUrl}/sitemap.xml`],
    host: baseUrl,
  }
}