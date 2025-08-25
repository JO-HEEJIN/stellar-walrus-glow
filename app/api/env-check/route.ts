import { NextResponse } from 'next/server'

export async function GET() {
  const databaseUrl = process.env.DATABASE_URL
  const primaryUrl = process.env.DATABASE_URL_PRIMARY
  const replicaUrl = process.env.DATABASE_URL_REPLICA
  
  // URL에서 호스트 부분만 추출 (보안상 전체 URL 노출 금지)
  const extractHost = (url?: string) => {
    if (!url) return 'undefined'
    try {
      const match = url.match(/@([^:]+):/)
      return match ? match[1] : 'could not parse'
    } catch {
      return 'error parsing'
    }
  }
  
  return NextResponse.json({
    timestamp: new Date().toISOString(),
    urls: {
      DATABASE_URL: extractHost(databaseUrl),
      DATABASE_URL_PRIMARY: extractHost(primaryUrl),
      DATABASE_URL_REPLICA: extractHost(replicaUrl)
    },
    expected: {
      writer: 'k-fashion-aurora-cluster-instance-1.cf462wy64uko.us-east-2.rds.amazonaws.com',
      reader: 'k-fashion-aurora-cluster-instance-1-us-east-2b.cf462wy64uko.us-east-2.rds.amazonaws.com'
    }
  })
}