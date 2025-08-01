import Link from 'next/link'

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-white">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="col-span-1 md:col-span-2">
            <h3 className="text-2xl font-bold mb-4">NIA INTERNATIONAL</h3>
            <p className="text-gray-400 mb-4 max-w-md">
              한국 패션의 우수성을 세계에 알리는 B2B 도매 플랫폼입니다. 
              우수한 품질의 K-Fashion 제품을 합리적인 가격에 제공합니다.
            </p>
            <div className="space-y-2 text-sm text-gray-400">
              <p>📍 서울특별시 강남구 논현로102길 5, 4층</p>
              <p>📞 고객센터: 1544-7734</p>
              <p>📧 이메일: master@k-fashions.com</p>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-lg font-semibold mb-4">빠른 링크</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/about" className="text-gray-400 hover:text-white transition-colors">
                  회사 소개
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-gray-400 hover:text-white transition-colors">
                  연락처
                </Link>
              </li>
              <li>
                <Link href="/products" className="text-gray-400 hover:text-white transition-colors">
                  상품 목록
                </Link>
              </li>
              <li>
                <Link href="/brands" className="text-gray-400 hover:text-white transition-colors">
                  브랜드
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="text-lg font-semibold mb-4">법적 고지</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/terms" className="text-gray-400 hover:text-white transition-colors">
                  이용약관
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="text-gray-400 hover:text-white transition-colors">
                  개인정보 처리방침
                </Link>
              </li>
              <li>
                <a href="mailto:master@k-fashions.com" className="text-gray-400 hover:text-white transition-colors">
                  개인정보 문의
                </a>
              </li>
              <li>
                <a href="mailto:master@k-fashions.com" className="text-gray-400 hover:text-white transition-colors">
                  고객 지원
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-gray-800 mt-8 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="text-sm text-gray-400 mb-4 md:mb-0">
              <p>&copy; 2025 NIA INTERNATIONAL. All rights reserved.</p>
              <p>사업자등록번호: 291-81-02452 | 통신판매업신고번호: 2025-서울강남-1234</p>
            </div>
            
            {/* Social Links */}
            <div className="flex space-x-4">
              <a href="https://www.facebook.com/niainternational" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-blue-500 transition-colors" title="Facebook">
                <span className="sr-only">Facebook</span>
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M20 10C20 4.477 15.523 0 10 0S0 4.477 0 10c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V10h2.54V7.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V10h2.773l-.443 2.89h-2.33v6.988C16.343 19.128 20 14.991 20 10z" clipRule="evenodd" />
                </svg>
              </a>
              <a href="https://www.instagram.com/nia_international" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-pink-500 transition-colors" title="Instagram">
                <span className="sr-only">Instagram</span>
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M5 0C2.238 0 0 2.238 0 5v10c0 2.762 2.238 5 5 5h10c2.762 0 5-2.238 5-5V5c0-2.762-2.238-5-5-5H5zm6 13a3 3 0 110-6 3 3 0 010 6zm0-8a1 1 0 100-2 1 1 0 000 2zm5.5-1a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z" clipRule="evenodd" />
                </svg>
              </a>
              <a href="https://www.linkedin.com/company/nia-international" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-blue-600 transition-colors" title="LinkedIn">
                <span className="sr-only">LinkedIn</span>
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.338 16.338H13.67V12.16c0-.995-.017-2.277-1.387-2.277-1.39 0-1.601 1.086-1.601 2.207v4.248H8.014v-8.59h2.559v1.174h.037c.356-.675 1.227-1.387 2.526-1.387 2.703 0 3.203 1.778 3.203 4.092v4.711zM5.005 6.575a1.548 1.548 0 11-.003-3.096 1.548 1.548 0 01.003 3.096zm-1.337 9.763H6.34v-8.59H3.667v8.59zM17.668 1H2.328C1.595 1 1 1.581 1 2.298v15.403C1 18.418 1.595 19 2.328 19h15.34c.734 0 1.332-.582 1.332-1.299V2.298C19 1.581 18.402 1 17.668 1z" clipRule="evenodd" />
                </svg>
              </a>
              <a href="https://www.youtube.com/@niainternational" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-red-500 transition-colors" title="YouTube">
                <span className="sr-only">YouTube</span>
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M10 0C4.486 0 0 4.486 0 10s4.486 10 10 10 10-4.486 10-10S15.514 0 10 0zm5.01 10.025c0 2.504-2.004 4.53-4.478 4.53H5.468C2.994 14.555.99 12.529.99 10.025V9.975c0-2.504 2.004-4.53 4.478-4.53h5.064c2.474 0 4.478 2.026 4.478 4.53v.05zM8 7v6l5-3-5-3z"/>
                </svg>
              </a>
              <a href="https://pf.kakao.com/_NiaInt" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-yellow-500 transition-colors" title="카카오톡 채널">
                <span className="sr-only">카카오톡</span>
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M10 0C4.486 0 0 3.343 0 7.5c0 2.614 1.69 4.929 4.257 6.257l-.857 3.171c-.096.357.266.638.566.438L7.257 15.5c.914.157 1.857.238 2.743.238 5.514 0 10-3.343 10-7.5S15.514 0 10 0z"/>
                </svg>
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}