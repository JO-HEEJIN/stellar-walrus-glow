'use client'

import { useEffect, useRef } from 'react'

declare global {
  interface Window {
    adsbygoogle: any[]
  }
}

interface TestAdProps {
  className?: string
  adSlot?: string
}

export function TestAd({ className = '', adSlot = '1234567890' }: TestAdProps) {
  const adRef = useRef<HTMLModElement>(null)

  useEffect(() => {
    try {
      // Push ad to adsbygoogle array
      if (typeof window !== 'undefined' && window.adsbygoogle) {
        console.log('Pushing ad to adsbygoogle...', { adSlot })
        ;(window.adsbygoogle = window.adsbygoogle || []).push({})
      }
    } catch (error) {
      console.error('AdSense error:', error)
    }
  }, [adSlot])

  return (
    <div className={`test-ad-container ${className}`}>
      <div className="text-xs text-gray-400 mb-2 text-center">광고</div>
      <ins
        ref={adRef}
        className="adsbygoogle"
        style={{
          display: 'block',
          width: '100%',
          height: '280px'
        }}
        data-ad-client="ca-pub-9558805716031898"
        data-ad-slot={adSlot}
        data-ad-format="auto"
        data-full-width-responsive="true"
      />
    </div>
  )
}

// 개발용 가짜 광고 컴포넌트
export function FakeAd({ className = '' }: { className?: string }) {
  return (
    <div className={`bg-gray-100 border-2 border-dashed border-gray-300 rounded-lg p-6 text-center ${className}`}>
      <div className="text-xs text-gray-400 mb-2">광고 자리</div>
      <div className="text-gray-500">
        <div className="w-16 h-16 bg-gray-300 rounded mx-auto mb-2"></div>
        <p className="text-sm">AdSense 광고가 여기 표시됩니다</p>
        <p className="text-xs mt-1">승인 후 실제 광고로 대체됩니다</p>
      </div>
    </div>
  )
}