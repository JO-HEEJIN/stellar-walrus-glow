'use client';

import { useState } from 'react';
import { ProductDetail, ProductTab } from '@/types/product-detail';
import { cn } from '@/lib/utils';

interface ProductDetailTabsProps {
  product: ProductDetail;
}

const tabs: ProductTab[] = [
  { id: 'description', label: '상품상세' },
  { id: 'size', label: '사이즈 가이드' },
  { id: 'review', label: '상품리뷰', count: 328 },
  { id: 'qna', label: 'Q&A', count: 45 },
  { id: 'shipping', label: '배송/교환/반품' },
];

export function ProductDetailTabs({ product }: ProductDetailTabsProps) {
  const [activeTab, setActiveTab] = useState('description');

  return (
    <div className="mt-16 border-t-2 border-black">
      {/* Tab Navigation */}
      <div className="flex border-b">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              "flex-1 py-4 text-center font-medium transition-all relative",
              activeTab === tab.id
                ? "bg-white font-bold border-b-2 border-black"
                : "bg-gray-50 hover:bg-gray-100"
            )}
          >
            {tab.label}
            {tab.count && ` (${tab.count})`}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="py-10 min-h-[500px]">
        {activeTab === 'description' && (
          <div className="max-w-4xl mx-auto space-y-8">
            <div className="aspect-[4/3] bg-gray-100 rounded-lg mb-8" />
            
            <div>
              <h3 className="text-lg font-bold mb-4">프리미엄 퍼포먼스 소재</h3>
              <p className="text-gray-700 leading-relaxed">
                {product.brandName} 투어 퍼포먼스 폴로는 프로 선수들이 착용하는 것과 동일한 고급 소재를 사용했습니다.
                폴리에스터 88%, 스판덱스 12%의 조합으로 뛰어난 신축성과 형태 유지력을 자랑합니다.
              </p>
            </div>

            <div>
              <h3 className="text-lg font-bold mb-4">우수한 기능성</h3>
              <ul className="space-y-2 text-gray-700">
                {product.features.map((feature, index) => (
                  <li key={index} className="flex items-start">
                    <span className="mr-2">•</span>
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="aspect-[4/3] bg-gray-100 rounded-lg" />

            <div>
              <h3 className="text-lg font-bold mb-4">디테일한 마감</h3>
              <p className="text-gray-700 leading-relaxed">
                목 부분의 편안한 착용감을 위한 플랫 니트 칼라, 옆면의 통기성을 위한 메쉬 패널,
                그리고 뒷면의 드롭 테일 헴라인까지 세심한 디테일이 돋보입니다.
              </p>
            </div>

            <div className="aspect-[4/3] bg-gray-100 rounded-lg" />
          </div>
        )}

        {activeTab === 'size' && (
          <div className="max-w-4xl mx-auto">
            <h3 className="text-lg font-bold mb-6">사이즈 측정 가이드</h3>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="border px-4 py-3 text-sm font-semibold">사이즈</th>
                    <th className="border px-4 py-3 text-sm font-semibold">가슴둘레</th>
                    <th className="border px-4 py-3 text-sm font-semibold">총장</th>
                    <th className="border px-4 py-3 text-sm font-semibold">어깨너비</th>
                    <th className="border px-4 py-3 text-sm font-semibold">소매길이</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="border px-4 py-3 text-center">90 (S)</td>
                    <td className="border px-4 py-3 text-center">98</td>
                    <td className="border px-4 py-3 text-center">68</td>
                    <td className="border px-4 py-3 text-center">42</td>
                    <td className="border px-4 py-3 text-center">20</td>
                  </tr>
                  <tr className="bg-gray-50">
                    <td className="border px-4 py-3 text-center">95 (M)</td>
                    <td className="border px-4 py-3 text-center">103</td>
                    <td className="border px-4 py-3 text-center">70</td>
                    <td className="border px-4 py-3 text-center">44</td>
                    <td className="border px-4 py-3 text-center">21</td>
                  </tr>
                  <tr>
                    <td className="border px-4 py-3 text-center">100 (L)</td>
                    <td className="border px-4 py-3 text-center">108</td>
                    <td className="border px-4 py-3 text-center">72</td>
                    <td className="border px-4 py-3 text-center">46</td>
                    <td className="border px-4 py-3 text-center">22</td>
                  </tr>
                  <tr className="bg-gray-50">
                    <td className="border px-4 py-3 text-center">105 (XL)</td>
                    <td className="border px-4 py-3 text-center">113</td>
                    <td className="border px-4 py-3 text-center">74</td>
                    <td className="border px-4 py-3 text-center">48</td>
                    <td className="border px-4 py-3 text-center">23</td>
                  </tr>
                  <tr>
                    <td className="border px-4 py-3 text-center">110 (2XL)</td>
                    <td className="border px-4 py-3 text-center">118</td>
                    <td className="border px-4 py-3 text-center">76</td>
                    <td className="border px-4 py-3 text-center">50</td>
                    <td className="border px-4 py-3 text-center">24</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <p className="mt-4 text-sm text-gray-600">
              * 단위: cm<br />
              * 측정 방법에 따라 1~2cm 오차가 있을 수 있습니다.
            </p>
          </div>
        )}

        {activeTab === 'review' && (
          <div className="max-w-4xl mx-auto">
            <h3 className="text-lg font-bold mb-6">구매 리뷰</h3>
            <p className="text-gray-600">리뷰 콘텐츠가 여기에 표시됩니다.</p>
          </div>
        )}

        {activeTab === 'qna' && (
          <div className="max-w-4xl mx-auto">
            <h3 className="text-lg font-bold mb-6">상품 Q&A</h3>
            <p className="text-gray-600">Q&A 콘텐츠가 여기에 표시됩니다.</p>
          </div>
        )}

        {activeTab === 'shipping' && (
          <div className="max-w-4xl mx-auto space-y-8">
            <div>
              <h3 className="text-lg font-bold mb-4">배송 정보</h3>
              <ul className="space-y-2 text-gray-700">
                <li>• 배송방법: EMS 국제특송</li>
                <li>• 배송기간: 결제 후 3~5일</li>
                <li>• 배송비: 주문금액 ₩300,000 이상 무료배송</li>
              </ul>
            </div>

            <div>
              <h3 className="text-lg font-bold mb-4">교환/반품 안내</h3>
              <ul className="space-y-2 text-gray-700">
                <li>• 상품 수령 후 7일 이내 가능</li>
                <li>• 상품 불량 및 오배송: 100% 교환/환불</li>
                <li>• 단순 변심: 왕복 배송비 구매자 부담</li>
              </ul>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}