'use client'

import GoogleAdsense from './google-adsense'

const AD_CLIENT = process.env.NEXT_PUBLIC_GOOGLE_ADSENSE_CLIENT || 'ca-pub-XXXXXXXXXX'

// 배너 광고 (상단/하단)
export function BannerAd({ 
  adSlot, 
  className = '' 
}: { 
  adSlot: string
  className?: string 
}) {
  return (
    <div className={`w-full my-4 text-center ${className}`}>
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 min-h-[90px]">
        <GoogleAdsense
          adClient={AD_CLIENT}
          adSlot={adSlot}
          adFormat="auto"
          fullWidthResponsive={true}
          style={{ display: 'block' }}
        />
      </div>
    </div>
  )
}

// 사이드바 광고 - 고정 크기 (300x250)
export function SidebarAd({ 
  adSlot,
  className = '' 
}: { 
  adSlot: string
  className?: string 
}) {
  return (
    <div className={`w-full mb-6 ${className}`}>
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 flex items-center justify-center min-h-[300px]">
        <GoogleAdsense
          adClient={AD_CLIENT}
          adSlot={adSlot}
          adFormat="fixed"
          width="300px"
          height="250px"
          style={{ display: 'inline-block', maxWidth: '100%' }}
        />
      </div>
    </div>
  )
}

// 인라인 광고 (콘텐츠 사이)
export function InlineAd({ 
  adSlot,
  className = '' 
}: { 
  adSlot: string
  className?: string 
}) {
  return (
    <div className={`w-full my-6 ${className}`}>
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 min-h-[200px]">
        <p className="text-xs text-gray-400 mb-2 text-center">광고</p>
        <GoogleAdsense
          adClient={AD_CLIENT}
          adSlot={adSlot}
          adFormat="rectangle"
          style={{ display: 'block', margin: '0 auto' }}
        />
      </div>
    </div>
  )
}

// 모바일 전용 광고 - 고정 크기
export function MobileAd({ 
  adSlot,
  className = '' 
}: { 
  adSlot: string
  className?: string 
}) {
  return (
    <div className={`w-full my-4 block md:hidden ${className}`}>
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 flex items-center justify-center min-h-[100px]">
        <GoogleAdsense
          adClient={AD_CLIENT}
          adSlot={adSlot}
          adFormat="fixed"
          width="320px"
          height="50px"
          style={{ display: 'inline-block', maxWidth: '100%' }}
        />
      </div>
    </div>
  )
}

// 제품 목록용 광고 (제품 사이에 삽입) - 고정 크기
export function ProductListAd({ 
  adSlot,
  className = '' 
}: { 
  adSlot: string
  className?: string 
}) {
  return (
    <div className={`bg-white rounded-lg shadow-sm border border-gray-200 p-4 flex flex-col items-center justify-center min-h-[300px] ${className}`}>
      <p className="text-xs text-gray-400 mb-2 text-center">스폰서</p>
      <div className="flex items-center justify-center w-full">
        <GoogleAdsense
          adClient={AD_CLIENT}
          adSlot={adSlot}
          adFormat="fixed"
          width="300px"
          height="250px"
          style={{ display: 'inline-block', maxWidth: '100%' }}
        />
      </div>
    </div>
  )
}