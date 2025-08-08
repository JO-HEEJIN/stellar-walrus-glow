'use client'

import { useEffect } from 'react'

// 전역 상태로 AdSense 초기화 추적
if (typeof window !== 'undefined') {
  (window as any).__ADSENSE_INITIALIZED = false
}

declare global {
  interface Window {
    adsbygoogle: any[]
    __ADSENSE_INITIALIZED?: boolean
  }
}

export default function GoogleAdSense() {
  useEffect(() => {
    // 이미 초기화되었으면 아무것도 하지 않음
    if (typeof window !== 'undefined' && window.__ADSENSE_INITIALIZED) {
      console.log('AdSense already initialized globally, skipping')
      return
    }

    // 전역적으로 초기화 상태 설정
    if (typeof window !== 'undefined') {
      window.__ADSENSE_INITIALIZED = true
      // 추가 안전장치: 함수 자체를 덮어쓰기
      const originalPush = window.adsbygoogle?.push || function() {};
      let autoAdsEnabled = false;
      
      window.adsbygoogle = window.adsbygoogle || [];
      window.adsbygoogle.push = function(...args: any[]) {
        // enable_page_level_ads가 이미 설정되었는지 체크
        if (args[0]?.enable_page_level_ads && autoAdsEnabled) {
          console.warn('Blocked duplicate enable_page_level_ads call');
          return;
        }
        if (args[0]?.enable_page_level_ads) {
          autoAdsEnabled = true;
        }
        return originalPush.apply(window.adsbygoogle, args);
      };
    }

    console.log('Initializing AdSense for the first time')

    // AdSense 스크립트가 이미 있는지 확인
    const existingScript = document.querySelector('script[src*="ca-pub-9558805716031898"]')
    if (existingScript) {
      console.log('AdSense script already exists, skipping script loading')
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
    
    // Load script and enable auto ads - 단 한 번만
    script.onload = () => {
      try {
        // Initialize adsbygoogle array if not exists
        window.adsbygoogle = window.adsbygoogle || []
        
        // 한 번만 실행되도록 단순화 - 이미 push 함수가 보호되어 있음
        window.adsbygoogle.push({
          google_ad_client: 'ca-pub-9558805716031898',
          enable_page_level_ads: true
        })
        console.log('AdSense auto ads enabled (single initialization)')
      } catch (error) {
        console.error('AdSense auto ads error:', error)
      }
    }
    
    script.onerror = () => {
      console.error('Failed to load AdSense script')
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