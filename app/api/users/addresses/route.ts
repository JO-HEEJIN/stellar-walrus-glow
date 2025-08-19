import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    // Mock data for development
    const mockAddresses = [
      {
        id: '1',
        name: '집',
        recipient: '홍길동',
        phone: '010-1234-5678',
        countryCode: 'KR',
        regionCode: 'SEOUL',
        zipCode: '06142',
        address: '서울특별시 강남구 테헤란로 123',
        detailAddress: '456호',
        isDefault: true,
      },
      {
        id: '2',
        name: '회사',
        recipient: '홍길동',
        phone: '010-1234-5678',
        countryCode: 'KR',
        regionCode: 'SEOUL',
        zipCode: '06234',
        address: '서울특별시 강남구 역삼로 456',
        detailAddress: '789호',
        isDefault: false,
      }
    ]

    return NextResponse.json({
      success: true,
      data: mockAddresses
    })
  } catch (error) {
    console.error('Address fetch error:', error)
    return NextResponse.json(
      { success: false, error: '배송지 정보를 불러오는데 실패했습니다' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Mock successful address creation
    const newAddress = {
      id: `addr-${Date.now()}`,
      ...body,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    return NextResponse.json({
      success: true,
      data: newAddress,
      message: '배송지가 성공적으로 추가되었습니다'
    }, { status: 201 })
  } catch (error) {
    console.error('Address creation error:', error)
    return NextResponse.json(
      { success: false, error: '배송지 추가에 실패했습니다' },
      { status: 400 }
    )
  }
}