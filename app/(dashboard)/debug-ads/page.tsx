'use client'

import { useEffect, useState } from 'react'
import { TestAd, FakeAd } from '@/components/ads/test-ad'
import GoogleAdsense from '@/components/ads/google-adsense'

export default function DebugAdsPage() {
  const [adsenseLoaded, setAdsenseLoaded] = useState(false)
  const [adsenseErrors, setAdsenseErrors] = useState<string[]>([])
  const [adsbygoogleArray, setAdsbygoogleArray] = useState<any[]>([])

  useEffect(() => {
    // Check if AdSense script is loaded
    const checkAdSense = () => {
      if (typeof window !== 'undefined') {
        const script = document.querySelector('script[src*="adsbygoogle"]')
        setAdsenseLoaded(!!script)
        
        if (window.adsbygoogle) {
          setAdsbygoogleArray([...window.adsbygoogle])
        }
      }
    }

    checkAdSense()
    
    // Listen for console errors
    const originalError = console.error
    console.error = (...args) => {
      const message = args.join(' ')
      if (message.toLowerCase().includes('adsense') || message.toLowerCase().includes('adsbygoogle')) {
        setAdsenseErrors(prev => [...prev, message])
      }
      originalError(...args)
    }

    return () => {
      console.error = originalError
    }
  }, [])

  const testAdSense = () => {
    if (window.adsbygoogle) {
      try {
        window.adsbygoogle.push({})
        console.log('AdSense test push successful')
      } catch (error) {
        console.error('AdSense test failed:', error)
      }
    }
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">AdSense 디버깅</h1>
      
      {/* Status */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <h2 className="text-lg font-semibold mb-4">AdSense 상태</h2>
        <div className="space-y-2">
          <div className="flex items-center">
            <span className="w-32">스크립트 로드:</span>
            <span className={`px-2 py-1 rounded text-sm ${adsenseLoaded ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
              {adsenseLoaded ? '성공' : '실패'}
            </span>
          </div>
          <div className="flex items-center">
            <span className="w-32">adsbygoogle 배열:</span>
            <span className="text-sm">{adsbygoogleArray.length}개 항목</span>
          </div>
          <div className="flex items-center">
            <span className="w-32">Publisher ID:</span>
            <span className="text-sm font-mono">ca-pub-9558805716031898</span>
          </div>
        </div>
        
        <button
          onClick={testAdSense}
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          AdSense 테스트
        </button>
      </div>

      {/* Errors */}
      {adsenseErrors.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <h3 className="font-semibold text-red-800 mb-2">AdSense 에러</h3>
          <ul className="text-sm text-red-700 space-y-1">
            {adsenseErrors.map((error, index) => (
              <li key={index} className="font-mono">{error}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Test Ads */}
      <div className="space-y-6">
        <div>
          <h2 className="text-lg font-semibold mb-4">테스트 광고들</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Real AdSense Ads */}
            <div>
              <h3 className="font-medium mb-2">실제 AdSense 광고</h3>
              <GoogleAdsense
                adClient="ca-pub-9558805716031898"
                adSlot="9298592246"
                adFormat="auto"
                style={{ display: 'block', minHeight: '280px', border: '1px solid #e5e7eb' }}
              />
            </div>

            <div>
              <h3 className="font-medium mb-2">사이드바 광고</h3>
              <GoogleAdsense
                adClient="ca-pub-9558805716031898"
                adSlot="9482973819"
                adFormat="rectangle"
                width="300px"
                height="250px"
                style={{ display: 'block', border: '1px solid #e5e7eb' }}
              />
            </div>

            <div>
              <h3 className="font-medium mb-2">인라인 광고</h3>
              <GoogleAdsense
                adClient="ca-pub-9558805716031898"
                adSlot="5347954542"
                adFormat="auto"
                style={{ display: 'block', minHeight: '200px', border: '1px solid #e5e7eb' }}
              />
            </div>

            {/* Fallback Ad */}
            <div>
              <h3 className="font-medium mb-2">대체 광고 (개발용)</h3>
              <FakeAd />
            </div>
          </div>
        </div>
      </div>

      {/* Instructions */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-6">
        <h3 className="font-semibold text-blue-800 mb-2">문제 해결 방법</h3>
        <ul className="text-sm text-blue-700 space-y-1">
          <li>• 광고가 안 보이면 AdSense 계정 승인 대기 중일 수 있습니다</li>
          <li>• 브라우저의 광고 차단기를 비활성화해보세요</li>
          <li>• 개발자 도구 Console에서 에러 메시지를 확인하세요</li>
          <li>• 승인 후 광고가 나타나기까지 몇 시간이 걸릴 수 있습니다</li>
        </ul>
      </div>
    </div>
  )
}