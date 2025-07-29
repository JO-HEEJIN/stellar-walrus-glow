import Script from 'next/script'

export default function Head() {
  return (
    <>
      {/* Google AdSense Verification Meta Tag */}
      <meta name="google-adsense-account" content="ca-pub-9558805716031898" />
      
      {/* Google AdSense Auto Ads Script - Exact code from Google */}
      <Script
        async 
        src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-9558805716031898"
        crossOrigin="anonymous"
        strategy="beforeInteractive"
      />
    </>
  )
}