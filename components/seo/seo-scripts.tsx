'use client'

import Script from 'next/script'

export default function SEOScripts() {
  return (
    <>
      {/* Google Analytics (향후 추가용) */}
      {process.env.NEXT_PUBLIC_GA_ID && (
        <>
          <Script
            strategy="afterInteractive"
            src={`https://www.googletagmanager.com/gtag/js?id=${process.env.NEXT_PUBLIC_GA_ID}`}
          />
          <Script
            id="google-analytics"
            strategy="afterInteractive"
            dangerouslySetInnerHTML={{
              __html: `
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('js', new Date());
                gtag('config', '${process.env.NEXT_PUBLIC_GA_ID}');
              `,
            }}
          />
        </>
      )}

      {/* Microsoft Clarity (향후 추가용) */}
      {process.env.NEXT_PUBLIC_CLARITY_ID && (
        <Script
          id="microsoft-clarity"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              (function(c,l,a,r,i,t,y){
                c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
                t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
                y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
              })(window, document, "clarity", "script", "${process.env.NEXT_PUBLIC_CLARITY_ID}");
            `,
          }}
        />
      )}

      {/* 한국 검색엔진 최적화 */}
      <Script
        id="korean-seo"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `
            // 네이버 검색 최적화
            if (typeof window !== 'undefined') {
              window.addEventListener('load', function() {
                // 페이지 로드 완료 신호
                if (window.gtag) {
                  gtag('event', 'page_view', {
                    page_title: document.title,
                    page_location: window.location.href,
                    content_group1: 'NIA INTERNATIONAL'
                  });
                }
              });
            }
          `,
        }}
      />
    </>
  )
}