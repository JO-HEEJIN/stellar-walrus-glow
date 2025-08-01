import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'NIA INTERNATIONAL 이용약관',
  description: 'NIA INTERNATIONAL B2B 도매 플랫폼의 이용약관입니다. 서비스 이용 시 준수해야 할 규정과 회원의 권리 및 의무사항을 확인하세요.',
  keywords: '이용약관, 서비스약관, NIA INTERNATIONAL, B2B플랫폼, 회원약관',
}

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-8">이용약관</h1>
        
        <div className="bg-white shadow rounded-lg p-8 space-y-6 prose prose-lg max-w-none">
          <p className="text-gray-600">
            <strong>시행일:</strong> 2025년 8월 1일
          </p>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">제1조 (목적)</h2>
            <p>본 약관은 K-Fashion(이하 "회사")이 운영하는 K-Fashion 도매 플랫폼(이하 "서비스")의 이용과 관련하여 회사와 이용자의 권리, 의무 및 책임사항을 규정함을 목적으로 합니다.</p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">제2조 (정의)</h2>
            <ul className="list-decimal pl-6 space-y-2">
              <li>"서비스"란 회사가 제공하는 K-Fashion 도매 플랫폼 및 관련 제반 서비스를 의미합니다.</li>
              <li>"이용자"란 본 약관에 따라 회사가 제공하는 서비스를 받는 회원 및 비회원을 말합니다.</li>
              <li>"회원"이란 회사와 서비스 이용계약을 체결하고 이용자 ID를 부여받은 이용자를 말합니다.</li>
              <li>"브랜드 회원"이란 상품을 등록하고 판매하는 도매업체 회원을 말합니다.</li>
              <li>"구매자 회원"이란 등록된 상품을 구매하는 소매업체 회원을 말합니다.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">제3조 (약관의 게시와 개정)</h2>
            <ol className="list-decimal pl-6 space-y-2">
              <li>회사는 본 약관의 내용을 이용자가 쉽게 알 수 있도록 서비스 초기 화면에 게시합니다.</li>
              <li>회사는 필요한 경우 관련 법령을 위반하지 않는 범위에서 본 약관을 개정할 수 있습니다.</li>
              <li>회사가 약관을 개정할 경우에는 적용일자 및 개정사유를 명시하여 현행약관과 함께 서비스 초기화면에 그 적용일자 7일 이전부터 적용일자 전일까지 공지합니다.</li>
            </ol>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">제4조 (서비스의 제공 및 변경)</h2>
            <ol className="list-decimal pl-6 space-y-2">
              <li>회사는 다음과 같은 서비스를 제공합니다:
                <ul className="list-disc pl-6 mt-2">
                  <li>도매 상품 정보 제공</li>
                  <li>전자상거래 플랫폼 제공</li>
                  <li>주문 및 결제 시스템 제공</li>
                  <li>기타 회사가 정하는 서비스</li>
                </ul>
              </li>
              <li>회사는 서비스의 내용을 변경할 수 있으며, 이 경우 변경된 서비스의 내용 및 제공일자를 명시하여 이용자에게 통지합니다.</li>
            </ol>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">제5조 (회원가입)</h2>
            <ol className="list-decimal pl-6 space-y-2">
              <li>이용자는 회사가 정한 가입 양식에 따라 회원정보를 기입한 후 본 약관에 동의한다는 의사표시를 함으로써 회원가입을 신청합니다.</li>
              <li>회사는 제1항과 같이 회원으로 가입할 것을 신청한 이용자 중 다음 각 호에 해당하지 않는 한 회원으로 등록합니다:
                <ul className="list-disc pl-6 mt-2">
                  <li>가입신청자가 본 약관에 의하여 이전에 회원자격을 상실한 적이 있는 경우</li>
                  <li>등록 내용에 허위, 기재누락, 오기가 있는 경우</li>
                  <li>기타 회원으로 등록하는 것이 회사의 기술상 현저히 지장이 있다고 판단되는 경우</li>
                </ul>
              </li>
            </ol>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">제6조 (회원의 의무)</h2>
            <ol className="list-decimal pl-6 space-y-2">
              <li>회원은 다음 행위를 하여서는 안 됩니다:
                <ul className="list-disc pl-6 mt-2">
                  <li>타인의 정보 도용</li>
                  <li>회사가 게시한 정보의 변경</li>
                  <li>회사가 정한 정보 이외의 정보의 송신 또는 게시</li>
                  <li>회사와 기타 제3자의 저작권 등 지적재산권에 대한 침해</li>
                  <li>회사 및 기타 제3자의 명예를 손상시키거나 업무를 방해하는 행위</li>
                </ul>
              </li>
            </ol>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">제7조 (상품 등록 및 판매)</h2>
            <ol className="list-decimal pl-6 space-y-2">
              <li>브랜드 회원은 관련 법령에 위반되지 않는 상품만을 등록할 수 있습니다.</li>
              <li>브랜드 회원은 등록한 상품 정보의 정확성에 대한 책임을 집니다.</li>
              <li>회사는 등록된 상품이 관련 법령 및 회사 정책에 위반되는 경우 사전 통지 없이 삭제할 수 있습니다.</li>
            </ol>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">제8조 (구매 및 결제)</h2>
            <ol className="list-decimal pl-6 space-y-2">
              <li>구매자 회원은 서비스 상에서 다음 또는 이와 유사한 방법으로 구매를 신청합니다:
                <ul className="list-disc pl-6 mt-2">
                  <li>상품 선택 및 수량 입력</li>
                  <li>배송지 정보 입력</li>
                  <li>결제 방법 선택</li>
                  <li>약관 동의 및 주문 확인</li>
                </ul>
              </li>
              <li>회사는 구매자 회원의 구매 신청에 대하여 승낙의 의사표시를 합니다.</li>
            </ol>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">제9조 (배송 및 반품)</h2>
            <ol className="list-decimal pl-6 space-y-2">
              <li>상품의 배송은 브랜드 회원과 구매자 회원 간의 약정에 따릅니다.</li>
              <li>반품 및 교환은 관련 법령 및 회사의 반품정책에 따라 처리됩니다.</li>
              <li>회사는 거래 당사자 간의 분쟁에 대해 중재할 수 있으나, 이에 대한 최종 책임은 거래 당사자에게 있습니다.</li>
            </ol>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">제10조 (면책조항)</h2>
            <ol className="list-decimal pl-6 space-y-2">
              <li>회사는 천재지변 또는 이에 준하는 불가항력으로 인하여 서비스를 제공할 수 없는 경우에는 서비스 제공에 관한 책임이 면제됩니다.</li>
              <li>회사는 회원의 귀책사유로 인한 서비스 이용의 장애에 대하여는 책임을 지지 않습니다.</li>
              <li>회사는 회원이 서비스와 관련하여 게재한 정보, 자료, 사실의 신뢰도, 정확성 등의 내용에 관하여는 책임을 지지 않습니다.</li>
            </ol>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">제11조 (분쟁해결)</h2>
            <ol className="list-decimal pl-6 space-y-2">
              <li>회사는 이용자가 제기하는 정당한 의견이나 불만을 반영하고 그 피해를 보상처리하기 위하여 고객센터를 설치·운영합니다.</li>
              <li>회사와 이용자 간에 발생한 전자상거래 분쟁과 관련하여 이용자의 피해구제신청이 있는 경우에는 공정거래위원회 또는 시·도지사가 의뢰하는 분쟁조정기관의 조정에 따를 수 있습니다.</li>
            </ol>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">제12조 (재판권 및 준거법)</h2>
            <ol className="list-decimal pl-6 space-y-2">
              <li>회사와 이용자 간에 발생한 분쟁에 관한 소송은 대한민국 법원에 제기합니다.</li>
              <li>회사와 이용자 간에 제기된 소송에는 대한민국 법을 적용합니다.</li>
            </ol>
          </section>

          <div className="mt-12 p-4 bg-gray-100 rounded-lg">
            <p className="text-center text-gray-600">
              본 약관은 2025년 8월 1일부터 시행됩니다.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}