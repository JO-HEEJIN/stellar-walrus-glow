'use client'

import { useEffect } from 'react'

declare global {
  interface Window {
    adsbygoogle: any[]
  }
}

export default function GoogleAdSense() {
  useEffect(() => {
    // AdSense 스크립트 동적 로딩
    const script = document.createElement('script')
    script.async = true
    script.src = 'https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-9558805716031898'
    script.crossOrigin = 'anonymous'
    document.head.appendChild(script)

    // Meta 태그 추가
    const meta = document.createElement('meta')
    meta.name = 'google-adsense-account'
    meta.content = 'ca-pub-9558805716031898'
    document.head.appendChild(meta)

    return () => {
      // Clean up
      const existingScript = document.querySelector(`script[src*="ca-pub-9558805716031898"]`)
      const existingMeta = document.querySelector('meta[name="google-adsense-account"]')
      
      if (existingScript) {
        existingScript.remove()
      }
      if (existingMeta) {
        existingMeta.remove()
      }
    }
  }, [])

  return null
}