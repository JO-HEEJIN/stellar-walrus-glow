export interface Store {
  id: string
  name: string
  nameKo: string
  slug: string
  description: string
  descriptionKo: string
  color: string
  icon: string
  path: string
}

export interface NavigationItem {
  id: string
  name: string
  nameKo: string
  slug: string
  description?: string
}

// Phase 1: 골프웨어 B2B 특화 (현재)
export const STORES: Store[] = [
  {
    id: 'golf-wear',
    name: 'Golf Wear',
    nameKo: '골프웨어',
    slug: 'golf-wear',
    description: 'Premium Korean Golf Fashion for Chinese Buyers',
    descriptionKo: '중국 바이어를 위한 프리미엄 한국 골프 패션',
    color: 'bg-green-600',
    icon: '⛳',
    path: '/stores/golf-wear'
  }
  // Phase 2에서 확장 예정:
  // - k-fashion (한국 패션)
  // - dongdaemun (동대문 도매)
]

// B2B 골프웨어 특화 네비게이션
export const NAVIGATION_ITEMS: NavigationItem[] = [
  {
    id: 'catalog',
    name: 'Product Catalog',
    nameKo: '전체 상품',
    slug: 'catalog',
    description: 'B2B 골프웨어 전체 카탈로그'
  },
  {
    id: 'quick-order',
    name: 'Quick Order',
    nameKo: '빠른 주문',
    slug: 'quick-order',
    description: 'SKU 직접 입력 및 대량 주문'
  },
  {
    id: 'brands',
    name: 'Licensed Brands',
    nameKo: '판권 브랜드',
    slug: 'brands',
    description: '구매대행 판권 보유 브랜드'
  },
  {
    id: 'new-arrivals',
    name: 'New Arrivals',
    nameKo: '신상품',
    slug: 'new-arrivals',
    description: '최신 입고 상품'
  },
  {
    id: 'wholesale-price',
    name: 'Wholesale Pricing',
    nameKo: '도매 가격',
    slug: 'wholesale-price',
    description: '수량별 도매 가격표'
  },
  {
    id: 'seasonal',
    name: 'Seasonal Collection',
    nameKo: '시즌 컬렉션',
    slug: 'seasonal',
    description: '시즌별 골프웨어 컬렉션'
  }
]

export function getStoreBySlug(slug: string): Store | undefined {
  return STORES.find(store => store.slug === slug)
}

// 통합 카테고리 매핑 시스템
export interface CategoryMapping {
  unified: Record<string, string[]>
  brands: Record<string, Record<string, string>>
}

export const CATEGORY_MAPPING: CategoryMapping = {
  // 통합 카테고리 - 골프웨어 특화
  unified: {
    "남성 골프 상의": ["Men's Golf Top", "남성 골프셔츠", "맨즈 골프 탑", "골프 폴로셔츠"],
    "남성 골프 하의": ["Men's Golf Bottom", "남성 골프팬츠", "골프 바지", "골프 쇼츠"],
    "여성 골프 상의": ["Women's Golf Top", "여성 골프셔츠", "레이디스 골프 탑"],
    "여성 골프 하의": ["Women's Golf Bottom", "여성 골프팬츠", "골프 스커트", "골프 쇼츠"],
    "골프 아우터": ["Golf Outer", "골프 자켓", "골프 점퍼", "골프 바람막이", "골프 조끼"],
    "골프 액세서리": ["Golf Accessories", "골프 모자", "골프 장갑", "골프 벨트", "골프 양말"],
    "골프화": ["Golf Shoes", "골프신발", "스파이크 신발"],
    "골프 가방": ["Golf Bag", "캐디백", "보스턴백", "골프 파우치"]
  },

  // 브랜드별 카테고리 매핑 (실제 브랜드 추가 시 확장)
  brands: {
    brandA: {
      "GOLF_TOP_M_001": "남성 골프 상의",
      "GOLF_BTM_M_001": "남성 골프 하의",
      "GOLF_TOP_W_001": "여성 골프 상의",
      "GOLF_BTM_W_001": "여성 골프 하의",
      "GOLF_OUTER_001": "골프 아우터",
      "GOLF_ACC_001": "골프 액세서리"
    },
    brandB: {
      "MT-G001": "남성 골프 상의",
      "MB-G001": "남성 골프 하의",
      "WT-G001": "여성 골프 상의",
      "WB-G001": "여성 골프 하의"
    }
    // 더 많은 브랜드 매핑 추가 가능
  }
}

// 구매대행 판권 관리 시스템
export interface LicenseInfo {
  brandId: string
  brandName: string
  contractStart: string
  contractEnd: string
  regions: string[] // 판매 가능 지역
  commissionRate: number // 수수료율
  minOrderQuantity: number // 최소 주문 수량
  isExclusive: boolean // 독점 여부
  status: 'ACTIVE' | 'EXPIRED' | 'SUSPENDED'
  autoRenew: boolean
}

export const LICENSE_BRANDS: LicenseInfo[] = [
  {
    brandId: 'golf-brand-a',
    brandName: '골프 브랜드 A',
    contractStart: '2024-01-01',
    contractEnd: '2024-12-31',
    regions: ['중국', '홍콩', '마카오'],
    commissionRate: 0.15,
    minOrderQuantity: 50,
    isExclusive: true,
    status: 'ACTIVE',
    autoRenew: true
  },
  {
    brandId: 'golf-brand-b',
    brandName: '골프 브랜드 B',
    contractStart: '2024-03-01',
    contractEnd: '2025-02-28',
    regions: ['중국', '대만'],
    commissionRate: 0.12,
    minOrderQuantity: 30,
    isExclusive: false,
    status: 'ACTIVE',
    autoRenew: false
  }
]

// 도메인 구조 설정
export const DOMAIN_CONFIG = {
  corporate: process.env.CORPORATE_DOMAIN || "https://company.com",
  wholesale: process.env.WHOLESALE_DOMAIN || "https://wholesale.company.com",
  api: process.env.API_DOMAIN || "https://api.company.com",
  current: process.env.NODE_ENV === 'production' ? 'wholesale' : 'wholesale'
}

export function getStoreBySlug(slug: string): Store | undefined {
  return STORES.find(store => store.slug === slug)
}

export function getNavigationItemBySlug(slug: string): NavigationItem | undefined {
  return NAVIGATION_ITEMS.find(item => item.slug === slug)
}

// 카테고리 매핑 함수들
export function mapBrandCategoryToUnified(brandId: string, brandCategory: string): string | null {
  const brandMapping = CATEGORY_MAPPING.brands[brandId]
  if (!brandMapping) return null
  
  return brandMapping[brandCategory] || null
}

export function getUnifiedCategoryVariants(unifiedCategory: string): string[] {
  return CATEGORY_MAPPING.unified[unifiedCategory] || []
}

// 판권 관리 함수들
export function getActiveLicenses(): LicenseInfo[] {
  return LICENSE_BRANDS.filter(license => license.status === 'ACTIVE')
}

export function getLicenseByBrandId(brandId: string): LicenseInfo | undefined {
  return LICENSE_BRANDS.find(license => license.brandId === brandId)
}

export function isLicenseExpiringSoon(license: LicenseInfo, daysThreshold = 30): boolean {
  const endDate = new Date(license.contractEnd)
  const today = new Date()
  const diffTime = endDate.getTime() - today.getTime()
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  
  return diffDays <= daysThreshold && diffDays > 0
}