import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import Script from 'next/script'
import './globals.css'
import GoogleAdSense from './google-adsense'
import StructuredData from '@/components/seo/structured-data'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'NIA INTERNATIONAL - 한국 패션 B2B 도매 플랫폼',
  description: 'NIA INTERNATIONAL은 한국 패션의 우수성을 세계에 알리는 프리미엄 B2B 도매 플랫폼입니다. 검증된 브랜드와 글로벌 바이어를 연결합니다.',
  keywords: 'NIA INTERNATIONAL, 한국패션, 도매, B2B, Korean fashion, wholesale, 패션플랫폼, 수출, 글로벌',
  authors: [{ name: 'NIA INTERNATIONAL' }],
  openGraph: {
    title: 'NIA INTERNATIONAL - 한국 패션 B2B 도매 플랫폼',
    description: 'NIA INTERNATIONAL은 한국 패션의 우수성을 세계에 알리는 프리미엄 B2B 도매 플랫폼입니다. 검증된 브랜드와 글로벌 바이어를 연결합니다.',
    url: 'https://k-fashions.com',
    siteName: 'NIA INTERNATIONAL',
    locale: 'ko_KR',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'NIA INTERNATIONAL - 한국 패션 B2B 도매 플랫폼',
    description: 'NIA INTERNATIONAL은 한국 패션의 우수성을 세계에 알리는 프리미엄 B2B 도매 플랫폼입니다.',
    creator: '@nia_international',
  },
  alternates: {
    canonical: 'https://k-fashions.com',
  },
  other: {
    'google-adsense-account': 'ca-pub-9558805716031898',
    'google-site-verification': 'ca-pub-9558805716031898',
    'naver-site-verification': 'nia-international-naver-verification',
    'msvalidate.01': 'nia-international-bing-verification',
    'yandex-verification': 'nia-international-yandex-verification',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
}

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#000000',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ko" suppressHydrationWarning>
      <head>
        <StructuredData />
      </head>
      <body className={inter.className}>
        {/* Google AdSense는 동적으로 로드됨 */}
        
        {/* Google AdSense - Auto Ads */}
        <GoogleAdSense />
        {children}
      </body>
    </html>
  )
}