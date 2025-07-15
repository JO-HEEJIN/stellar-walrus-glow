// Enums
export enum Role {
  MASTER_ADMIN = 'MASTER_ADMIN',
  BRAND_ADMIN = 'BRAND_ADMIN',
  BUYER = 'BUYER'
}

export enum UserStatus {
  ACTIVE = 'ACTIVE',
  SUSPENDED = 'SUSPENDED',
  DELETED = 'DELETED'
}

export enum ProductStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  OUT_OF_STOCK = 'OUT_OF_STOCK'
}

export enum OrderStatus {
  PENDING = 'PENDING',
  PAID = 'PAID',
  PREPARING = 'PREPARING',
  SHIPPED = 'SHIPPED',
  DELIVERED = 'DELIVERED',
  CANCELLED = 'CANCELLED'
}

// Interfaces
export interface User {
  id: string
  username: string        // 새로운 필드: kf001, kf002 형태의 고유 아이디
  email: string          // 실제 사용자 이메일
  systemEmail: string    // 시스템 이메일: username@k-fashions.com
  name?: string
  role: Role
  status: UserStatus
  brandId?: string
  createdAt: Date
  updatedAt: Date
}

export interface Brand {
  id: string
  nameKo: string
  nameCn?: string
  slug: string
  description?: string
  logoUrl?: string
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}

export interface Product {
  id: string
  brandId: string
  brand?: Brand
  sku: string
  nameKo: string
  nameCn?: string
  descriptionKo?: string
  descriptionCn?: string
  categoryId?: string
  category?: Category
  status: ProductStatus
  basePrice: number
  inventory: number
  images?: string[]
  options?: Record<string, string[]>
  createdAt: Date
  updatedAt: Date
}

export interface Category {
  id: string
  name: string
  slug: string
  parentId?: string
  parent?: Category
  children?: Category[]
  createdAt: Date
  updatedAt: Date
}

export interface Order {
  id: string
  orderNumber: string
  userId: string
  user?: User
  status: OrderStatus
  totalAmount: number
  shippingAddress: ShippingAddress
  paymentMethod?: string
  paymentInfo?: any
  memo?: string
  items?: OrderItem[]
  createdAt: Date
  updatedAt: Date
}

export interface OrderItem {
  id: string
  orderId: string
  productId: string
  product?: Product
  quantity: number
  price: number
  options?: Record<string, string>
  createdAt: Date
}

export interface ShippingAddress {
  name: string
  phone: string
  address: string
  addressDetail?: string
  zipCode: string
}

// API Response Types
export interface ApiResponse<T> {
  data: T
  meta?: {
    page?: number
    limit?: number
    totalItems?: number
    totalPages?: number
  }
}

export interface ApiError {
  error: {
    code: string
    message: string
    details?: any
  }
  timestamp: string
  path: string
  requestId: string
}

// Form Types
export interface RegisterFormData {
  email: string
  password: string
  name: string
  businessNumber: string
  phone: string
}

export interface LoginFormData {
  username: string      // 변경: 아이디로 로그인
  password: string
}

// 아이디 찾기용 인터페이스
export interface FindUsernameFormData {
  name: string
  email: string
}

export interface ProductFormData {
  brandId: string
  sku: string
  nameKo: string
  nameCn?: string
  descriptionKo?: string
  descriptionCn?: string
  categoryId?: string
  basePrice: number
  inventory: number
  images: string[]
  options?: Record<string, string[]>
}

export interface OrderFormData {
  items: Array<{
    productId: string
    quantity: number
  }>
  shippingAddress: ShippingAddress
  paymentMethod: 'BANK_TRANSFER' | 'CARD'
  memo?: string
}