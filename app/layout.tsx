import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'K-Fashion Wholesale Platform',
  description: 'Premium K-Fashion B2B wholesale platform connecting brands with global buyers',
  keywords: 'k-fashion, wholesale, b2b, korean fashion, 도매, 패션',
  authors: [{ name: 'K-Fashion Platform' }],
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
        {children}
      </body>
    </html>
  )
}