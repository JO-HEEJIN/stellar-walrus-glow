'use client'

import { useEffect } from 'react'
import { logger } from '@/lib/logger'

declare global {
  interface Window {
    adsbygoogle: any[]
  }
}

export default function GoogleAdSense() {
  useEffect(() => {
    // AdSense 스크립트가 이미 있는지 확인
    const existingScript = document.querySelector('script[src*="ca-pub-9558805716031898"]')
    if (existingScript) {
      logger.debug('AdSense script already exists, skipping initialization')
      return
    }

    // AdSense 스크립트 동적 로딩
    const script = document.createElement('script')
    script.async = true
    script.src = 'https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-9558805716031898'
    script.crossOrigin = 'anonymous'
    
    script.onload = () => {
      try {
        window.adsbygoogle = window.adsbygoogle || []
        
        // Auto ads가 이미 활성화되었는지 확인
        if (!(window as any).__ADSENSE_AUTO_ADS_ENABLED) {
          window.adsbygoogle.push({
            google_ad_client: 'ca-pub-9558805716031898',
            enable_page_level_ads: true
          })
          ;(window as any).__ADSENSE_AUTO_ADS_ENABLED = true
          logger.info('AdSense auto ads enabled')
        }
      } catch (error) {
        logger.error('AdSense initialization failed', error instanceof Error ? error : new Error(String(error)))
      }
    }
    
    script.onerror = () => {
      logger.error('Failed to load AdSense script', new Error('Script loading failed'))
    }
    
    document.head.appendChild(script)

    // Meta 태그 추가 (중복 체크)
    if (!document.querySelector('meta[name="google-adsense-account"]')) {
      const meta = document.createElement('meta')
      meta.name = 'google-adsense-account'
      meta.content = 'ca-pub-9558805716031898'
      document.head.appendChild(meta)
    }
  }, [])

  return null
}