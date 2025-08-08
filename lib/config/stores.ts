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

export const STORES: Store[] = [
  {
    id: 'k-fashion',
    name: 'K-Fashion',
    nameKo: 'K-패션',
    slug: 'k-fashion',
    description: 'Korean Fashion Brands',
    descriptionKo: '한국 패션 브랜드',
    color: 'bg-pink-600',
    icon: '👗',
    path: '/stores/k-fashion'
  },
  {
    id: 'golf-wear',
    name: 'Golf Wear',
    nameKo: '골프웨어',
    slug: 'golf-wear',
    description: 'Golf Fashion & Accessories',
    descriptionKo: '골프 패션 & 액세서리',
    color: 'bg-green-600',
    icon: '⛳',
    path: '/stores/golf-wear'
  },
  {
    id: 'boutique',
    name: 'Boutique',
    nameKo: '부티크',
    slug: 'boutique',
    description: 'Premium Designer Brands',
    descriptionKo: '프리미엄 디자이너 브랜드',
    color: 'bg-purple-600',
    icon: '👑',
    path: '/stores/boutique'
  },
  {
    id: 'accessories',
    name: 'Accessories',
    nameKo: '악세사리',
    slug: 'accessories',
    description: 'Fashion Accessories & Jewelry',
    descriptionKo: '패션 액세서리 & 주얼리',
    color: 'bg-amber-600',
    icon: '💍',
    path: '/stores/accessories'
  },
  {
    id: 'shoes',
    name: 'Shoes',
    nameKo: '슈즈',
    slug: 'shoes',
    description: 'Fashion Footwear',
    descriptionKo: '패션 신발',
    color: 'bg-gray-600',
    icon: '👠',
    path: '/stores/shoes'
  }
]

export const NAVIGATION_ITEMS: NavigationItem[] = [
  {
    id: 'content',
    name: 'Content',
    nameKo: '콘텐츠',
    slug: 'content',
    description: '패션 콘텐츠 및 스타일링'
  },
  {
    id: 'recommend',
    name: 'Recommend',
    nameKo: '추천',
    slug: 'recommend',
    description: '큐레이티드 추천 상품'
  },
  {
    id: 'ranking',
    name: 'Ranking',
    nameKo: '랭킹',
    slug: 'ranking',
    description: '인기 상품 랭킹'
  },
  {
    id: 'sale',
    name: 'Sale',
    nameKo: '세일',
    slug: 'sale',
    description: '할인 상품'
  },
  {
    id: 'brands',
    name: 'Brands',
    nameKo: '브랜드',
    slug: 'brands',
    description: '브랜드 컬렉션'
  },
  {
    id: 'releases',
    name: 'Releases',
    nameKo: '발매',
    slug: 'releases',
    description: '신상품 발매'
  },
  {
    id: 'sports-week',
    name: 'Sports Week',
    nameKo: '스포츠위크',
    slug: 'sports-week',
    description: '스포츠 패션 특집'
  },
  {
    id: 'hot-summer',
    name: 'Hot Summer Look',
    nameKo: '핫 서머룩',
    slug: 'hot-summer',
    description: '여름 패션 컬렉션'
  }
]

export function getStoreBySlug(slug: string): Store | undefined {
  return STORES.find(store => store.slug === slug)
}

export function getNavigationItemBySlug(slug: string): NavigationItem | undefined {
  return NAVIGATION_ITEMS.find(item => item.slug === slug)
}