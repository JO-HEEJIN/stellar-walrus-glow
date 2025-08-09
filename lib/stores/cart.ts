import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface CartItem {
  id: string // Unique cart item ID (productId-color-size)
  productId: string
  name: string
  brandName: string
  price: number
  quantity: number
  imageUrl: string
  color?: string
  size?: string
}

interface CartStore {
  items: CartItem[]
  addItem: (item: Omit<CartItem, 'quantity'> & { quantity?: number }) => void
  removeItem: (itemId: string) => void
  updateQuantity: (itemId: string, quantity: number) => void
  clearCart: () => void
  getTotalAmount: () => number
  getTotalItems: () => number
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      
      addItem: (item) => set((state) => {
        const existingItem = state.items.find(i => i.id === item.id)
        const quantityToAdd = item.quantity || 1
        
        if (existingItem) {
          return {
            items: state.items.map(i =>
              i.id === item.id
                ? { ...i, quantity: i.quantity + quantityToAdd }
                : i
            )
          }
        }
        
        return {
          items: [...state.items, { ...item, quantity: quantityToAdd }]
        }
      }),
      
      removeItem: (itemId) => set((state) => ({
        items: state.items.filter(item => item.id !== itemId)
      })),
      
      updateQuantity: (itemId, quantity) => set((state) => ({
        items: quantity <= 0
          ? state.items.filter(item => item.id !== itemId)
          : state.items.map(item =>
              item.id === itemId
                ? { ...item, quantity }
                : item
            )
      })),
      
      clearCart: () => set({ items: [] }),
      
      getTotalAmount: () => {
        const { items } = get()
        return items.reduce((total, item) => total + (item.price * item.quantity), 0)
      },
      
      getTotalItems: () => {
        const { items } = get()
        return items.reduce((total, item) => total + item.quantity, 0)
      }
    }),
    {
      name: 'kfashion-cart',
    }
  )
)