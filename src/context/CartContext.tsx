import { createContext, useContext, useMemo, useState, type ReactNode } from 'react'
import type { Product } from '@/data/products'

export interface CartLine {
  product: Product
  quantity: number
}

interface CartContextValue {
  lines: CartLine[]
  addItem: (product: Product, quantity?: number) => void
  removeItem: (productId: string) => void
  setQuantity: (productId: string, quantity: number) => void
  clear: () => void
  subtotal: number
  itemCount: number
}

const CartContext = createContext<CartContextValue | null>(null)

export function CartProvider({ children }: { children: ReactNode }) {
  const [lines, setLines] = useState<CartLine[]>([])

  const addItem = (product: Product, quantity = 1) => {
    setLines((prev) => {
      const existing = prev.find((l) => l.product.id === product.id)
      if (existing) {
        return prev.map((l) =>
          l.product.id === product.id ? { ...l, quantity: l.quantity + quantity } : l
        )
      }
      return [...prev, { product, quantity }]
    })
  }

  const removeItem = (productId: string) => {
    setLines((prev) => prev.filter((l) => l.product.id !== productId))
  }

  const setQuantity = (productId: string, quantity: number) => {
    setLines((prev) =>
      prev
        .map((l) => (l.product.id === productId ? { ...l, quantity } : l))
        .filter((l) => l.quantity > 0)
    )
  }

  const clear = () => setLines([])

  const subtotal = useMemo(
    () => lines.reduce((sum, l) => sum + l.product.price * l.quantity, 0),
    [lines]
  )
  const itemCount = useMemo(() => lines.reduce((sum, l) => sum + l.quantity, 0), [lines])

  return (
    <CartContext.Provider
      value={{ lines, addItem, removeItem, setQuantity, clear, subtotal, itemCount }}
    >
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error('useCart must be used within CartProvider')
  return ctx
}
