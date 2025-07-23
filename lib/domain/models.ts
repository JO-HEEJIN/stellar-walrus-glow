// Domain Models with Business Logic
import { Role, UserStatus, ProductStatus, OrderStatus } from '@/types'

// User Aggregate
export class User {
  id: string
  email: string
  role: Role
  status: UserStatus
  brandId?: string

  constructor(data: {
    id: string
    email: string
    role: Role
    status: UserStatus
    brandId?: string
  }) {
    this.id = data.id
    this.email = data.email
    this.role = data.role
    this.status = data.status
    this.brandId = data.brandId
  }

  // Business Rules
  canManageBrand(brandId: string): boolean {
    return this.role === Role.MASTER_ADMIN ||
           (this.role === Role.BRAND_ADMIN && this.brandId === brandId)
  }

  canPlaceOrder(): boolean {
    return this.status === UserStatus.ACTIVE &&
           [Role.BUYER, Role.BRAND_ADMIN, Role.MASTER_ADMIN].includes(this.role)
  }

  canAccessAdminPanel(): boolean {
    return [Role.BRAND_ADMIN, Role.MASTER_ADMIN].includes(this.role)
  }

  canManageAllBrands(): boolean {
    return this.role === Role.MASTER_ADMIN
  }

  canViewAllOrders(): boolean {
    return this.role === Role.MASTER_ADMIN
  }
}

// Product Aggregate
export class Product {
  id: string
  brandId: string
  sku: string
  inventory: number
  status: ProductStatus
  basePrice: number

  constructor(data: {
    id: string
    brandId: string
    sku: string
    inventory: number
    status: ProductStatus
    basePrice: number
  }) {
    this.id = data.id
    this.brandId = data.brandId
    this.sku = data.sku
    this.inventory = data.inventory
    this.status = data.status
    this.basePrice = data.basePrice
  }

  // Business Rules
  isOrderable(quantity: number): boolean {
    return this.status === ProductStatus.ACTIVE && this.inventory >= quantity
  }

  calculatePrice(quantity: number, userRole: Role): number {
    let price = Number(this.basePrice)

    // Bulk discount based on quantity
    if (quantity >= 100) {
      price *= 0.85 // 15% discount
    } else if (quantity >= 50) {
      price *= 0.9 // 10% discount
    } else if (quantity >= 10) {
      price *= 0.95 // 5% discount
    }

    // Role-based discount
    if (userRole === Role.BUYER) {
      price *= 0.98 // 2% additional discount for buyers
    }

    return Math.round(price * 100) / 100 // Round to 2 decimal places
  }

  decreaseStock(quantity: number): void {
    if (!this.isOrderable(quantity)) {
      throw new Error('Insufficient inventory')
    }
    this.inventory -= quantity
  }

  increaseStock(quantity: number): void {
    this.inventory += quantity
  }

  shouldUpdateStatus(): ProductStatus {
    if (this.inventory === 0 && this.status === ProductStatus.ACTIVE) {
      return ProductStatus.OUT_OF_STOCK
    } else if (this.inventory > 0 && this.status === ProductStatus.OUT_OF_STOCK) {
      return ProductStatus.ACTIVE
    }
    return this.status
  }
}

// Order Aggregate
export class Order {
  id: string
  userId: string
  status: OrderStatus
  items: OrderItem[]
  totalAmount: number
  shippingAddress: ShippingAddress

  constructor(data: {
    id: string
    userId: string
    status: OrderStatus
    items: OrderItem[]
    totalAmount: number
    shippingAddress: ShippingAddress
  }) {
    this.id = data.id
    this.userId = data.userId
    this.status = data.status
    this.items = data.items
    this.totalAmount = data.totalAmount
    this.shippingAddress = data.shippingAddress
  }

  // State Transitions
  canTransitionTo(newStatus: OrderStatus): boolean {
    const transitions: Record<OrderStatus, OrderStatus[]> = {
      [OrderStatus.PENDING]: [OrderStatus.PAID, OrderStatus.CANCELLED],
      [OrderStatus.PAID]: [OrderStatus.PREPARING, OrderStatus.CANCELLED],
      [OrderStatus.PREPARING]: [OrderStatus.SHIPPED, OrderStatus.CANCELLED],
      [OrderStatus.SHIPPED]: [OrderStatus.DELIVERED],
      [OrderStatus.DELIVERED]: [],
      [OrderStatus.CANCELLED]: []
    }
    return transitions[this.status]?.includes(newStatus) ?? false
  }

  calculateTotal(): number {
    return this.items.reduce((sum, item) => sum + (item.price * item.quantity), 0)
  }

  canBeCancelled(): boolean {
    return [OrderStatus.PENDING, OrderStatus.PAID, OrderStatus.PREPARING].includes(this.status)
  }

  requiresRefund(): boolean {
    return [OrderStatus.PAID, OrderStatus.PREPARING].includes(this.status)
  }
}

// Value Objects
export interface OrderItem {
  id: string
  productId: string
  quantity: number
  price: number
  options?: Record<string, string>
}

export interface ShippingAddress {
  name: string
  phone: string
  address: string
  addressDetail?: string
  zipCode: string
}

// Constants
export const MIN_ORDER_AMOUNT = 10000 // 최소 주문 금액 1만원
export const MAX_PRODUCT_IMAGES = 10 // 상품 이미지 최대 개수
export const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5MB

// Helper functions
export function validatePhoneNumber(phone: string): boolean {
  // Korean phone number format
  const phoneRegex = /^(01[0-9]{1})-?([0-9]{3,4})-?([0-9]{4})$/
  return phoneRegex.test(phone.replace(/-/g, ''))
}

export function validateBusinessNumber(businessNumber: string): boolean {
  // Korean business number format (10 digits)
  const regex = /^[0-9]{10}$/
  return regex.test(businessNumber.replace(/-/g, ''))
}