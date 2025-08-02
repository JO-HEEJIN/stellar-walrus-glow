import { Metadata } from 'next'
import ContactForm from '@/components/contact/contact-form'
import SocialLinks from '@/components/ui/social-links'

export const metadata: Metadata = {
  title: 'NIA INTERNATIONAL 연락처 - 문의 및 상담',
  description: 'NIA INTERNATIONAL 고객센터 1544-7734. 평일 09:00-17:30, 토요일 09:00-13:00. 서울시 강남구 논현로102길 5, 4층. 일반문의, 사업제휴, 고객지원 서비스 제공.',
  keywords: 'NIA INTERNATIONAL, 연락처, 고객센터, 문의, 상담, 서비스',
}

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold text-gray-900 sm:text-5xl md:text-6xl mb-4">
            연락처
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            궁금한 점이나 문의사항이 있으시면 언제든지 연락해 주세요.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Contact Information */}
          <div className="space-y-8">
            <div className="bg-white rounded-lg shadow-lg p-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-6">연락처 정보</h2>
              
              <div className="space-y-6">
                <div className="flex items-start">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                      <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                    </div>
                  </div>
                  <div className="ml-4">
                    <h3 className="text-lg font-semibold text-gray-900">주소</h3>
                    <p className="text-gray-600">
                      서울특별시 강남구 논현로102길 5, 4층<br />
                      (우편번호: 06234)<br />
                      사업자등록번호: 291-81-02452
                    </p>
                  </div>
                </div>

                <div className="flex items-start">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                      <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                      </svg>
                    </div>
                  </div>
                  <div className="ml-4">
                    <h3 className="text-lg font-semibold text-gray-900">전화번호</h3>
                    <p className="text-gray-600">
                      고객센터: 1544-7734<br />
                      이메일: master@k-fashions.com
                    </p>
                  </div>
                </div>

                <div className="flex items-start">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                      <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                    </div>
                  </div>
                  <div className="ml-4">
                    <h3 className="text-lg font-semibold text-gray-900">이메일</h3>
                    <p className="text-gray-600">
                      일반문의: master@k-fashions.com<br />
                      사업제휴: master@k-fashions.com<br />
                      고객지원: master@k-fashions.com
                    </p>
                  </div>
                </div>

                <div className="flex items-start">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                      <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                  </div>
                  <div className="ml-4">
                    <h3 className="text-lg font-semibold text-gray-900">운영시간</h3>
                    <p className="text-gray-600">
                      평일: 오전 9시 - 오후 5시 30분<br />
                      토요일: 오전 9시 - 오후 1시<br />
                      일요일 및 공휴일: 휴무
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Map placeholder */}
            <div className="bg-white rounded-lg shadow-lg p-8">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">찾아오시는 길</h3>
              <div className="h-64 bg-gray-200 rounded-lg flex items-center justify-center">
                <p className="text-gray-500">지도 (Google Maps 연동 예정)</p>
              </div>
              <div className="mt-4 text-sm text-gray-600">
                <p><strong>지하철:</strong> 2호선 강남역 12번 출구에서 도보 5분</p>
                <p><strong>버스:</strong> 강남역 정류장 하차</p>
                <p><strong>주차:</strong> 건물 지하 1-3층 주차장 이용 가능</p>
              </div>
            </div>

            {/* Social Media */}
            <div className="bg-white rounded-lg shadow-lg p-8">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">소셜 미디어</h3>
              <p className="text-gray-600 mb-6">
                NIA INTERNATIONAL의 최신 소식과 다양한 정보를 소셜 미디어에서 만나보세요.
              </p>
              <SocialLinks size="large" showLabels={true} orientation="vertical" />
            </div>
          </div>

          {/* Contact Form */}
          <ContactForm />
        </div>
      </div>
    </div>
  )
}