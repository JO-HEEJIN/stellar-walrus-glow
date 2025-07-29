import { NextResponse } from 'next/server'

export async function GET() {
  const html = `<!DOCTYPE html>
<html>
<head>
    <meta name="google-adsense-account" content="ca-pub-9558805716031898">
    <script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-9558805716031898" crossorigin="anonymous"></script>
</head>
<body>
    <h1>Google AdSense Verification</h1>
    <p>Site: k-fashions.com</p>
    <p>Publisher ID: ca-pub-9558805716031898</p>
</body>
</html>`
  
  return new NextResponse(html, {
    headers: {
      'Content-Type': 'text/html',
    },
  })
}