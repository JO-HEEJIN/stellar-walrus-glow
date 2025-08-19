'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'

type Language = 'ko' | 'zh'

interface LanguageContextType {
  language: Language
  setLanguage: (lang: Language) => void
  t: typeof translations.ko
}

const translations = {
  ko: {
    // Navigation
    home: '홈',
    products: '상품',
    cart: '장바구니',
    wishlist: '관심상품',
    myPage: '마이페이지',
    orders: '주문내역',
    quotes: '견적서',
    
    // Countries
    korea: '한국',
    china: '중국',
    
    // Shipping
    domesticShipping: '국내배송',
    internationalShipping: '해외배솨',
    shippingFee: '배송비',
    freeShipping: '무료배솨',
    
    // Address
    country: '국가',
    province: '지역/성',
    city: '도시',
    district: '구/현',
    zipCode: '우편번호',
    address: '주소',
    detailAddress: '상세주소',
    
    // Payment
    payment: '결제',
    paymentMethod: '결제수단',
    creditCard: '신용카드',
    alipay: '알리페이',
    wechatPay: '위챗페이',
    bankTransfer: '무통장입금',
  },
  zh: {
    // Navigation
    home: '首页',
    products: '产品',
    cart: '购物车',
    wishlist: '收藏',
    myPage: '我的页面',
    orders: '订单',
    quotes: '报价单',
    
    // Countries
    korea: '韩国',
    china: '中国',
    
    // Shipping
    domesticShipping: '国内配送',
    internationalShipping: '国际配送',
    shippingFee: '配送费',
    freeShipping: '免费配送',
    
    // Address
    country: '国家',
    province: '省/直辖市',
    city: '城市',
    district: '区/县',
    zipCode: '邮政编码',
    address: '地址',
    detailAddress: '详细地址',
    
    // Payment
    payment: '支付',
    paymentMethod: '支付方式',
    creditCard: '信用卡',
    alipay: '支付宝',
    wechatPay: '微信支付',
    bankTransfer: '银行转账',
  }
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined)

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState<Language>('ko')

  useEffect(() => {
    // 로컬 스토리지에서 언어 설정 로드
    const savedLanguage = localStorage.getItem('language') as Language
    if (savedLanguage && ['ko', 'zh'].includes(savedLanguage)) {
      setLanguage(savedLanguage)
    }
  }, [])

  const handleSetLanguage = (lang: Language) => {
    setLanguage(lang)
    localStorage.setItem('language', lang)
  }

  const t = translations[language]

  return (
    <LanguageContext.Provider value={{ language, setLanguage: handleSetLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  )
}

export function useLanguage() {
  const context = useContext(LanguageContext)
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider')
  }
  return context
}

export { translations }
export type { Language }
