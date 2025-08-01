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
    try {
      if (typeof window !== 'undefined') {
        // Wait for AdSense script to load
        const checkAndPush = () => {
          if (window.adsbygoogle && (window.adsbygoogle as any).loaded) {
            console.log('Pushing AdSense ad:', { adClient, adSlot, adFormat })
            window.adsbygoogle.push({})
          } else if (window.adsbygoogle) {
            console.log('Pushing AdSense ad (script loaded):', { adClient, adSlot, adFormat })
            window.adsbygoogle.push({})
          } else {
            console.warn('AdSense script not loaded yet, retrying...')
            setTimeout(checkAndPush, 200)
          }
        }
        
        // Longer delay to ensure DOM and script are ready
        setTimeout(checkAndPush, 500)
      }
    } catch (error) {
      console.error('AdSense error:', error)
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

// 자동 광고용 컴포넌트 (AdSense 인증 포함)
export function GoogleAutoAds({ adClient }: { adClient: string }) {
  return (
    <>
      {/* Google AdSense Verification & Auto Ads */}
      <Script
        id="google-adsense-verification"
        async
        src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-9558805716031898"
        crossOrigin="anonymous"
        strategy="afterInteractive"
      />
      <Script
        id="google-auto-ads"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `
            (adsbygoogle = window.adsbygoogle || []).push({
              google_ad_client: "${adClient}",
              enable_page_level_ads: true
            });
          `,
        }}
      />
    </>
  )
}