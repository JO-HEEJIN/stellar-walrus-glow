'use client'

import { useEffect } from 'react'

declare global {
  interface Window {
    adsbygoogle: any[]
  }
}

export default function GoogleAdSense() {
  useEffect(() => {
    // Check if script already exists
    if (document.querySelector('script[src*="ca-pub-9558805716031898"]')) {
      return
    }

    // AdSense 스크립트 동적 로딩
    const script = document.createElement('script')
    script.async = true
    script.src = 'https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-9558805716031898'
    script.crossOrigin = 'anonymous'
    
    // Remove preload to avoid conflicts
    const preloadLinks = document.querySelectorAll('link[href*="adsbygoogle.js"]')
    preloadLinks.forEach(link => link.remove())
    
    // Load script and enable auto ads
    script.onload = () => {
      try {
        // Initialize adsbygoogle array if not exists
        window.adsbygoogle = window.adsbygoogle || []
        
        // Enable auto ads for page level ads
        window.adsbygoogle.push({
          google_ad_client: 'ca-pub-9558805716031898',
          enable_page_level_ads: true
        })
        
        console.log('AdSense auto ads enabled')
      } catch (error) {
        console.error('AdSense auto ads error:', error)
      }
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