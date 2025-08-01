import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'NIA INTERNATIONAL 소개 - 한국 패션 B2B 도매 플랫폼',
  description: 'NIA INTERNATIONAL은 2020년 설립된 한국 패션 도매 전문 플랫폼입니다. 500+ 브랜드, 50+ 수출국가, 3000+ 활성 바이어와 함께하는 글로벌 네트워크를 제공합니다.',
  keywords: 'NIA INTERNATIONAL, 회사소개, 한국패션, 도매플랫폼, 글로벌네트워크, 패션수출',
}

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold text-gray-900 sm:text-5xl md:text-6xl mb-4">
            NIA INTERNATIONAL 소개
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            한국 패션의 우수성을 세계에 알리는 B2B 도매 플랫폼
          </p>
        </div>

        {/* Company Overview */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">
          <div className="bg-white rounded-lg shadow-lg p-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">회사 개요</h2>
            <div className="space-y-4 text-gray-600">
              <p>
                NIA INTERNATIONAL은 2020년 설립된 한국 패션 도매 전문 플랫폼입니다. 
                우리는 한국의 우수한 패션 브랜드와 전 세계 바이어를 연결하여 
                한국 패션의 글로벌 진출을 지원하고 있습니다.
              </p>
              <p>
                최신 기술과 효율적인 물류 시스템을 통해 빠르고 안전한 거래를 
                보장하며, 양질의 한국 패션 제품을 합리적인 가격에 제공합니다.
              </p>
              <div className="pt-4 border-t border-gray-200">
                <p className="text-sm text-gray-500">
                  <strong>회사명:</strong> NIA INTERNATIONAL<br />
                  <strong>대표자:</strong> 윤지언<br />
                  <strong>사업자등록번호:</strong> 291-81-02452<br />
                  <strong>주소:</strong> 서울특별시 강남구 논현로102길 5, 4층
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">비전 & 미션</h2>
            <div className="space-y-6">
              <div>
                <h3 className="text-xl font-semibold text-gray-800 mb-2">비전</h3>
                <p className="text-gray-600">
                  한국 패션의 글로벌 리더가 되어 K-Fashion을 세계 최고의 패션 브랜드로 만들어갑니다.
                </p>
              </div>
              <div>
                <h3 className="text-xl font-semibold text-gray-800 mb-2">미션</h3>
                <ul className="list-disc list-inside text-gray-600 space-y-2">
                  <li>한국 패션 브랜드의 해외 진출 지원</li>
                  <li>글로벌 바이어를 위한 원스톱 솔루션 제공</li>
                  <li>디지털 기술을 활용한 효율적인 도매 거래 플랫폼 구축</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Statistics */}
        <div className="bg-white rounded-lg shadow-lg p-8 mb-16">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-8">NIA INTERNATIONAL in Numbers</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="text-4xl font-bold text-blue-600 mb-2">500+</div>
              <div className="text-gray-600">등록 브랜드</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-blue-600 mb-2">10,000+</div>
              <div className="text-gray-600">상품 수</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-blue-600 mb-2">50+</div>
              <div className="text-gray-600">수출 국가</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-blue-600 mb-2">3,000+</div>
              <div className="text-gray-600">활성 바이어</div>
            </div>
          </div>
        </div>

        {/* Services */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-8">주요 서비스</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white rounded-lg shadow-lg p-6">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">도매 거래 플랫폼</h3>
              <p className="text-gray-600">
                브랜드와 바이어 간의 직접 거래를 지원하는 B2B 전문 플랫폼으로, 
                실시간 재고 확인과 주문 관리가 가능합니다.
              </p>
            </div>

            <div className="bg-white rounded-lg shadow-lg p-6">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">안전한 거래 보장</h3>
              <p className="text-gray-600">
                검증된 브랜드와 바이어만이 거래할 수 있는 신뢰할 수 있는 시스템으로, 
                안전한 결제와 배송을 보장합니다.
              </p>
            </div>

            <div className="bg-white rounded-lg shadow-lg p-6">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
                <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">글로벌 네트워크</h3>
              <p className="text-gray-600">
                전 세계 50개국 이상의 바이어 네트워크를 보유하고 있으며, 
                다양한 국가로의 수출을 지원합니다.
              </p>
            </div>
          </div>
        </div>

        {/* Team */}
        <div className="bg-white rounded-lg shadow-lg p-8 mb-16">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-8">경영진</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-32 h-32 bg-gray-300 rounded-full mx-auto mb-4"></div>
              <h3 className="text-xl font-semibold text-gray-900">윤지언</h3>
              <p className="text-gray-600">CEO / 대표이사</p>
              <p className="text-sm text-gray-500 mt-2">
                15년 이상의 패션 유통 경험
              </p>
            </div>
            <div className="text-center">
              <div className="w-32 h-32 bg-gray-300 rounded-full mx-auto mb-4"></div>
              <h3 className="text-xl font-semibold text-gray-900">김민수</h3>
              <p className="text-gray-600">COO / 운영이사</p>
              <p className="text-sm text-gray-500 mt-2">
                글로벌 물류 및 운영 전문가
              </p>
            </div>
            <div className="text-center">
              <div className="w-32 h-32 bg-gray-300 rounded-full mx-auto mb-4"></div>
              <h3 className="text-xl font-semibold text-gray-900">이지은</h3>
              <p className="text-gray-600">CMO / 마케팅이사</p>
              <p className="text-sm text-gray-500 mt-2">
                디지털 마케팅 및 브랜드 전략 전문가
              </p>
            </div>
          </div>
        </div>

        {/* Partners */}
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-8">주요 파트너사</h2>
          <div className="bg-white rounded-lg shadow-lg p-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                <div key={i} className="h-20 bg-gray-200 rounded flex items-center justify-center">
                  <span className="text-gray-500">Partner {i}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}