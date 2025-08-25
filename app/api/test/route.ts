import { NextResponse } from 'next/server'

export async function GET() {
  try {
    console.log('Simple API test started')
    
    return NextResponse.json({
      status: 'success',
      message: 'API is working',
      timestamp: new Date().toISOString(),
      database: 'not tested yet'
    })
  } catch (error) {
    console.error('Simple API test error:', error)
    return NextResponse.json(
      { error: 'API test failed' },
      { status: 500 }
    )
  }
}