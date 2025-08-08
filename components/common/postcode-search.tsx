'use client'

import { Search } from 'lucide-react'

// Daum Postcode API 타입 정의
declare global {
  interface Window {
    daum: {
      Postcode: new (options: {
        oncomplete: (data: PostcodeData) => void
        onclose?: (state: 'FORCE_CLOSE' | 'COMPLETE_CLOSE') => void
        width?: string
        height?: string
      }) => {
        open: () => void
        embed: (element: HTMLElement) => void
      }
    }
  }
}

interface PostcodeData {
  zonecode: string // 우편번호 (5자리)
  address: string // 주소
  addressEnglish: string // 영문 주소
  addressType: 'R' | 'J' // R: 도로명, J: 지번
  bcode: string // 법정동/법정리 코드
  bname: string // 법정동/법정리 이름
  bnameEnglish: string // 법정동/법정리 영문 이름
  buildingCode: string // 건물관리번호
  buildingName: string // 건물명
  hname: string // 행정동 이름
  noSelected: 'Y' | 'N' // 검색 결과에서 선택된 주소가 없을 경우
  roadAddress: string // 도로명 주소
  roadAddressEnglish: string // 영문 도로명 주소
  roadname: string // 도로명
  roadnameCode: string // 도로명 코드
  roadnameEnglish: string // 영문 도로명
  sido: string // 시/도
  sidoEnglish: string // 영문 시/도
  sigungu: string // 시/군/구
  sigunguCode: string // 시/군/구 코드
  sigunguEnglish: string // 영문 시/군/구
  userLanguageType: 'K' | 'E' // 사용자 언어 설정
  userSelectedType: 'R' | 'J' // 사용자가 선택한 주소 타입
}

interface PostcodeSearchProps {
  onAddressSelect: (data: { zipCode: string; address: string }) => void
  buttonText?: string
  buttonClassName?: string
  disabled?: boolean
}

export default function PostcodeSearch({
  onAddressSelect,
  buttonText = "우편번호 검색",
  buttonClassName = "px-3 py-2 text-sm border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50",
  disabled = false
}: PostcodeSearchProps) {
  
  const handlePostcodeSearch = () => {
    if (disabled) return
    
    if (!window.daum) {
      alert('우편번호 검색 서비스를 불러오는 중입니다. 잠시만 기다려주세요.')
      return
    }

    new window.daum.Postcode({
      oncomplete: function(data: PostcodeData) {
        // 도로명 주소를 우선으로 사용, 없으면 지번 주소 사용
        const fullAddress = data.userSelectedType === 'R' ? data.roadAddress : data.address
        
        onAddressSelect({
          zipCode: data.zonecode,
          address: fullAddress
        })
      },
      onclose: function(state) {
        if (state === 'FORCE_CLOSE') {
          // 사용자가 팝업을 강제로 닫았을 때
        } else if (state === 'COMPLETE_CLOSE') {
          // 검색 완료 후 자동으로 닫혔을 때
        }
      },
      width: '100%',
      height: '400px'
    }).open()
  }

  return (
    <button
      type="button"
      onClick={handlePostcodeSearch}
      disabled={disabled}
      className={`inline-flex items-center ${buttonClassName} ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
    >
      <Search className="w-4 h-4 mr-1" />
      {buttonText}
    </button>
  )
}