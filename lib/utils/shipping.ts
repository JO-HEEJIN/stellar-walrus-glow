// Shein-style shipping API utilities

interface Country {
  code: string
  name: string
  nameZh: string
  currency: string
  flag: string
  regions?: Region[]
}

interface Region {
  code: string
  name: string
  nameZh: string
  cities?: City[]
}

interface City {
  code: string
  name: string
  nameZh: string
}

interface ShippingMethod {
  id: string
  name: string
  nameZh: string
  description: string
  descriptionZh: string
  estimatedDays: string
  estimatedDaysZh: string
  price: number
  currency: string
  available: boolean
  logo?: string
}

interface ShippingAddress {
  id?: string
  name: string
  recipient: string
  phone: string
  countryCode: string
  regionCode?: string
  cityCode?: string
  postalCode: string
  addressLine1: string
  addressLine2?: string
  isDefault?: boolean
}

// Supported countries with regions
export const COUNTRIES: Country[] = [
  {
    code: 'KR',
    name: 'South Korea',
    nameZh: '韩国',
    currency: 'KRW',
    flag: '🇰🇷',
    regions: [
      { code: 'SEOUL', name: 'Seoul', nameZh: '首尔特别市' },
      { code: 'BUSAN', name: 'Busan', nameZh: '釜山广域市' },
      { code: 'INCHEON', name: 'Incheon', nameZh: '仁川广域市' },
      { code: 'GYEONGGI', name: 'Gyeonggi-do', nameZh: '京畸道' },
    ]
  },
  {
    code: 'CN',
    name: 'China',
    nameZh: '中国',
    currency: 'CNY',
    flag: '🇨🇳',
    regions: [
      { 
        code: 'BEIJING', 
        name: 'Beijing', 
        nameZh: '北京市',
        cities: [
          { code: 'DONGCHENG', name: 'Dongcheng District', nameZh: '东城区' },
          { code: 'XICHENG', name: 'Xicheng District', nameZh: '西城区' },
          { code: 'CHAOYANG', name: 'Chaoyang District', nameZh: '朝阳区' },
        ]
      },
      { 
        code: 'SHANGHAI', 
        name: 'Shanghai', 
        nameZh: '上海市',
        cities: [
          { code: 'HUANGPU', name: 'Huangpu District', nameZh: '黄浦区' },
          { code: 'XUHUI', name: 'Xuhui District', nameZh: '徐汇区' },
          { code: 'CHANGNING', name: 'Changning District', nameZh: '长宁区' },
        ]
      },
      { 
        code: 'GUANGDONG', 
        name: 'Guangdong Province', 
        nameZh: '广东省',
        cities: [
          { code: 'GUANGZHOU', name: 'Guangzhou', nameZh: '广州市' },
          { code: 'SHENZHEN', name: 'Shenzhen', nameZh: '深圳市' },
          { code: 'DONGGUAN', name: 'Dongguan', nameZh: '东莞市' },
        ]
      },
    ]
  },
  {
    code: 'US',
    name: 'United States',
    nameZh: '美国',
    currency: 'USD',
    flag: '🇺🇸',
    regions: [
      { code: 'CA', name: 'California', nameZh: '加利福尼亚州' },
      { code: 'NY', name: 'New York', nameZh: '纽约州' },
      { code: 'TX', name: 'Texas', nameZh: '德克萨斯州' },
    ]
  },
]

// Shipping methods by country
export const SHIPPING_METHODS: Record<string, ShippingMethod[]> = {
  'KR': [
    {
      id: 'kr_standard',
      name: 'Standard Domestic',
      nameZh: '国内标准配送',
      description: '1-3 business days',
      descriptionZh: '1-3个工作日',
      estimatedDays: '1-3 days',
      estimatedDaysZh: '1-3天',
      price: 3000,
      currency: 'KRW',
      available: true,
    },
    {
      id: 'kr_express',
      name: 'Express Domestic',
      nameZh: '国内快速配送',
      description: 'Next day delivery',
      descriptionZh: '次日达',
      estimatedDays: '1 day',
      estimatedDaysZh: '1天',
      price: 8000,
      currency: 'KRW',
      available: true,
    }
  ],
  'CN': [
    {
      id: 'cn_ems',
      name: 'EMS International',
      nameZh: 'EMS国际快递',
      description: 'Express international shipping',
      descriptionZh: '国际快速配送',
      estimatedDays: '3-7 days',
      estimatedDaysZh: '3-7天',
      price: 25000,
      currency: 'KRW',
      available: true,
      logo: '/shipping/ems-logo.png'
    },
    {
      id: 'cn_dhl',
      name: 'DHL Express',
      nameZh: 'DHL快递',
      description: 'Fast and reliable',
      descriptionZh: '快速可靠',
      estimatedDays: '2-4 days',
      estimatedDaysZh: '2-4天',
      price: 45000,
      currency: 'KRW',
      available: true,
      logo: '/shipping/dhl-logo.png'
    },
    {
      id: 'cn_sf',
      name: 'SF Express',
      nameZh: '顺丰快递',
      description: 'Popular in China',
      descriptionZh: '中国热门快递',
      estimatedDays: '3-5 days',
      estimatedDaysZh: '3-5天',
      price: 35000,
      currency: 'KRW',
      available: true,
      logo: '/shipping/sf-logo.png'
    }
  ],
  'US': [
    {
      id: 'us_usps',
      name: 'USPS International',
      nameZh: 'USPS国际邮政',
      description: 'Standard international',
      descriptionZh: '标准国际配送',
      estimatedDays: '7-14 days',
      estimatedDaysZh: '7-14天',
      price: 30000,
      currency: 'KRW',
      available: true,
    }
  ]
}

// Calculate shipping cost based on order total and destination
export function calculateShippingCost(
  countryCode: string, 
  orderTotal: number, 
  shippingMethodId?: string
): {
  methods: ShippingMethod[]
  freeShippingThreshold?: number
  recommendedMethodId?: string
} {
  const methods = SHIPPING_METHODS[countryCode] || []
  
  // Apply free shipping thresholds
  const processedMethods = methods.map(method => {
    let finalPrice = method.price
    
    // Korea: Free shipping over 50,000 KRW
    if (countryCode === 'KR' && orderTotal >= 50000) {
      finalPrice = 0
    }
    // China: Free shipping over 200,000 KRW
    else if (countryCode === 'CN' && orderTotal >= 200000) {
      finalPrice = 0
    }
    // US: Free shipping over 300,000 KRW
    else if (countryCode === 'US' && orderTotal >= 300000) {
      finalPrice = 0
    }
    
    return {
      ...method,
      price: finalPrice
    }
  })
  
  const thresholds = {
    'KR': 50000,
    'CN': 200000,
    'US': 300000
  }
  
  // Recommend fastest method for high-value orders
  const recommendedMethodId = orderTotal >= (thresholds[countryCode as keyof typeof thresholds] || 999999)
    ? processedMethods.find(m => m.id.includes('express') || m.id.includes('dhl'))?.id
    : processedMethods[0]?.id
  
  return {
    methods: processedMethods,
    freeShippingThreshold: thresholds[countryCode as keyof typeof thresholds],
    recommendedMethodId
  }
}

// Get country by code
export function getCountryByCode(code: string): Country | undefined {
  return COUNTRIES.find(country => country.code === code)
}

// Get regions by country code
export function getRegionsByCountryCode(countryCode: string): Region[] {
  const country = getCountryByCode(countryCode)
  return country?.regions || []
}

// Get cities by country and region code
export function getCitiesByRegionCode(countryCode: string, regionCode: string): City[] {
  const country = getCountryByCode(countryCode)
  const region = country?.regions?.find(r => r.code === regionCode)
  return region?.cities || []
}

// Validate address
export function validateShippingAddress(address: ShippingAddress): {
  isValid: boolean
  errors: string[]
} {
  const errors: string[] = []
  
  if (!address.recipient?.trim()) {
    errors.push('Recipient name is required')
  }
  
  if (!address.phone?.trim()) {
    errors.push('Phone number is required')
  }
  
  if (!address.countryCode) {
    errors.push('Country is required')
  }
  
  if (!address.postalCode?.trim()) {
    errors.push('Postal code is required')
  }
  
  if (!address.addressLine1?.trim()) {
    errors.push('Address is required')
  }
  
  // Country-specific validations
  if (address.countryCode === 'CN' && !address.regionCode) {
    errors.push('Province/Region is required for China')
  }
  
  return {
    isValid: errors.length === 0,
    errors
  }
}

// Format address for display
export function formatAddressDisplay(address: ShippingAddress, language: 'ko' | 'zh' = 'ko'): string {
  const country = getCountryByCode(address.countryCode)
  const region = country?.regions?.find(r => r.code === address.regionCode)
  const city = region?.cities?.find(c => c.code === address.cityCode)
  
  const parts = [
    address.addressLine1,
    address.addressLine2,
    city ? (language === 'zh' ? city.nameZh : city.name) : undefined,
    region ? (language === 'zh' ? region.nameZh : region.name) : undefined,
    country ? (language === 'zh' ? country.nameZh : country.name) : undefined,
    address.postalCode
  ].filter(Boolean)
  
  return parts.join(', ')
}
