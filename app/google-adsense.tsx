'use client'

import { useEffect } from 'react'

declare global {
  interface Window {
    adsbygoogle: any[]
    __adsenseAutoAdsEnabled?: boolean
    __adsenseInitialized?: boolean
  }
}

// Global singleton to prevent multiple initializations
let adsenseInitializationInProgress = false

export default function GoogleAdSense() {
  useEffect(() => {
    // Comprehensive singleton check
    if (window.__adsenseInitialized || 
        adsenseInitializationInProgress ||
        window.__adsenseAutoAdsEnabled) {
      console.log('AdSense already initialized or in progress, skipping')
      return
    }

    // Mark initialization as in progress
    adsenseInitializationInProgress = true
    window.__adsenseInitialized = true

    // Check if script already exists
    const existingScript = document.querySelector('script[src*="ca-pub-9558805716031898"]')
    if (existingScript) {
      // Script exists but auto ads not enabled yet
      if (!window.__adsenseAutoAdsEnabled && window.adsbygoogle) {
        try {
          // Check if enable_page_level_ads is already in the queue
          // adsbygoogle might not be an array initially
          const hasPageLevelAds = Array.isArray(window.adsbygoogle) && 
            window.adsbygoogle.some((item: any) => 
              item && typeof item === 'object' && item.enable_page_level_ads === true
            )
          
          if (!hasPageLevelAds) {
            window.adsbygoogle.push({
              google_ad_client: 'ca-pub-9558805716031898',
              enable_page_level_ads: true
            })
            window.__adsenseAutoAdsEnabled = true
            console.log('AdSense auto ads enabled (existing script)')
          }
        } catch (error) {
          console.error('AdSense auto ads error:', error)
        }
      }
      adsenseInitializationInProgress = false
      return
    }

    // AdSense 스크립트 동적 로딩
    const script = document.createElement('script')
    script.async = true
    script.src = 'https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-9558805716031898'
    script.crossOrigin = 'anonymous'
    
    // Remove any existing preload links to avoid conflicts
    const preloadLinks = document.querySelectorAll('link[href*="adsbygoogle.js"]')
    preloadLinks.forEach(link => link.remove())
    
    // Load script and enable auto ads
    script.onload = () => {
      try {
        // Initialize adsbygoogle array if not exists
        window.adsbygoogle = window.adsbygoogle || []
        
        // Double-check before pushing to prevent duplicates
        if (!window.__adsenseAutoAdsEnabled) {
          // Check if enable_page_level_ads is already in the queue
          // adsbygoogle might not be an array initially
          const hasPageLevelAds = Array.isArray(window.adsbygoogle) && 
            window.adsbygoogle.some((item: any) => 
              item && typeof item === 'object' && item.enable_page_level_ads === true
            )
          
          if (!hasPageLevelAds) {
            window.adsbygoogle.push({
              google_ad_client: 'ca-pub-9558805716031898',
              enable_page_level_ads: true
            })
            window.__adsenseAutoAdsEnabled = true
            console.log('AdSense auto ads enabled (new script)')
          }
        }
      } catch (error) {
        console.error('AdSense auto ads error:', error)
      } finally {
        adsenseInitializationInProgress = false
      }
    }
    
    script.onerror = () => {
      console.error('Failed to load AdSense script')
      adsenseInitializationInProgress = false
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