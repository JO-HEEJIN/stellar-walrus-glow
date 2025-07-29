import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import Script from 'next/script'
import './globals.css'
import GoogleAdSense from './google-adsense'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'K-Fashion Wholesale Platform',
  description: 'Premium K-Fashion B2B wholesale platform connecting brands with global buyers',
  keywords: 'k-fashion, wholesale, b2b, korean fashion, 도매, 패션',
  authors: [{ name: 'K-Fashion Platform' }],
  other: {
    'google-adsense-account': 'ca-pub-9558805716031898',
    'google-site-verification': 'ca-pub-9558805716031898',
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
      <body className={inter.className}>
        {/* Google AdSense Verification Script */}
        <Script
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-9558805716031898"
          crossOrigin="anonymous"
          strategy="beforeInteractive"
        />
        
        {/* Google AdSense - Auto Ads */}
        <GoogleAdSense />
        {children}
      </body>
    </html>
  )
}