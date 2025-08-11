'use client'

import { useEffect } from 'react'
import Script from 'next/script'

declare global {
  interface Window {
    adsbygoogle: any[]
  }
}

interface GoogleAdsenseProps {
  adClient: string
  adSlot: string
  adFormat?: 'auto' | 'rectangle' | 'vertical' | 'horizontal' | 'fixed'
  fullWidthResponsive?: boolean
  style?: React.CSSProperties
  className?: string
  width?: string
  height?: string
}

export default function GoogleAdsense({
  adClient,
  adSlot,
  adFormat = 'auto',
  fullWidthResponsive = true,
  style = { display: 'block' },
  className = '',
  width,
  height
}: GoogleAdsenseProps) {
  useEffect(() => {
    if (typeof window === 'undefined') return

    try {
      // Check if this ad unit has already been initialized
      const adElement = document.querySelector(`ins[data-ad-slot="${adSlot}"]`) as HTMLElement
      if (adElement && (adElement as any).__adsbygooglePushed) {
        return // Already initialized
      }

      // Initialize adsbygoogle if not exists
      if (!window.adsbygoogle) {
        window.adsbygoogle = []
      }

      // Simple push with error handling
      const pushAd = () => {
        try {
          const currentAdElement = document.querySelector(`ins[data-ad-slot="${adSlot}"]`) as HTMLElement
          if (!currentAdElement || (currentAdElement as any).__adsbygooglePushed) {
            return
          }

          window.adsbygoogle.push({})
          ;(currentAdElement as any).__adsbygooglePushed = true
        } catch (pushError) {
          console.warn('AdSense push failed:', pushError)
        }
      }
      
      // Delay to ensure DOM is ready
      const timer = setTimeout(pushAd, 1000)
      return () => clearTimeout(timer)
    } catch (error) {
      console.warn('AdSense initialization error:', error)
    }
  }, [adClient, adSlot, adFormat])

  return (
    <>
      {/* Google AdSense Script */}
      <Script
        id={`adsense-${adSlot}`}
        async
        src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${adClient}`}
        crossOrigin="anonymous"
        strategy="afterInteractive"
      />
      
      {/* Ad Unit */}
      <ins
        className={`adsbygoogle ${className}`}
        style={{
          ...style,
          ...(width && height ? {
            display: 'inline-block',
            width: width,
            height: height
          } : {})
        }}
        data-ad-client={adClient}
        data-ad-slot={adSlot}
        {...(adFormat !== 'fixed' && { 'data-ad-format': adFormat })}
        {...(!width && !height && { 'data-full-width-responsive': fullWidthResponsive.toString() })}
      />
    </>
  )
}

// 자동 광고용 컴포넌트는 더 이상 사용하지 않음 (app/google-adsense.tsx에서 처리)
// export function GoogleAutoAds는 제거됨