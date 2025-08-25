import { NextResponse } from 'next/server'

export async function GET() {
  const dbUrl = process.env.DATABASE_URL || 'NOT SET'
  const dbPrimary = process.env.DATABASE_URL_PRIMARY || 'NOT SET'
  const dbReplica = process.env.DATABASE_URL_REPLICA || 'NOT SET'
  
  // URL에서 호스트 부분만 추출 (비밀번호 숨김)
  const extractHost = (url: string) => {
    if (url === 'NOT SET') return 'NOT SET'
    try {
      const parts = url.split('@')
      const hostPart = parts[1] ? parts[1].split('/')[0] : 'INVALID'
      return hostPart
    } catch {
      return 'ERROR PARSING'
    }
  }
  
  const maskPassword = (url: string) => {
    if (url === 'NOT SET') return 'NOT SET'
    return url.replace(/:[^:@]*@/, ':****@')
  }
  
  return NextResponse.json({
    environment: process.env.NODE_ENV,
    vercel: !!process.env.VERCEL,
    urls: {
      DATABASE_URL: {
        host: extractHost(dbUrl),
        isProxy: extractHost(dbUrl).includes('proxy'),
        masked: maskPassword(dbUrl)
      },
      DATABASE_URL_PRIMARY: {
        host: extractHost(dbPrimary),
        isProxy: extractHost(dbPrimary).includes('proxy'),
        masked: maskPassword(dbPrimary)
      },
      DATABASE_URL_REPLICA: {
        host: extractHost(dbReplica),
        isProxy: extractHost(dbReplica).includes('proxy'),
        masked: maskPassword(dbReplica)
      }
    },
    prismaClientInfo: {
      clientVersion: '5.22.0', // 현재 사용 중인 버전
      note: 'Check if client was generated with correct DATABASE_URL'
    }
  })
}