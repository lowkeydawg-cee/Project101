import {
  createContext,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
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
  isOpen: boolean
  setIsOpen: (isOpen: boolean) => void
}

const CartContext = createContext<CartContextValue | null>(null)

const STORAGE_KEY = 'safehouse-cart'

function readStoredCart(): CartLine[] {
  try {
    const stored = sessionStorage.getItem(STORAGE_KEY)

    if (!stored) return []

    const parsed = JSON.parse(stored)

    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [lines, setLines] = useState<CartLine[]>(() => readStoredCart())
  const [isOpen, setIsOpen] = useState(false)

  function updateLines(
    updater: (current: CartLine[]) => CartLine[],
  ) {
    setLines((current) => {
      const next = updater(current)

      try {
        sessionStorage.setItem(STORAGE_KEY, JSON.stringify(next))
      } catch {
        // Ignore storage errors.
      }

      return next
    })
  }

  const addItem = (product: Product, quantity = 1) => {
    updateLines((current) => {
      const existing = current.find(
        (line) => line.product.id === product.id,
      )

      if (existing) {
        return current.map((line) =>
          line.product.id === product.id
            ? {
                ...line,
                quantity: line.quantity + quantity,
              }
            : line,
        )
      }

      return [...current, { product, quantity }]
    })
  }

  const removeItem = (productId: string) => {
    updateLines((current) =>
      current.filter((line) => line.product.id !== productId),
    )
  }

  const setQuantity = (
    productId: string,
    quantity: number,
  ) => {
    updateLines((current) =>
      current
        .map((line) =>
          line.product.id === productId
            ? { ...line, quantity }
            : line,
        )
        .filter((line) => line.quantity > 0),
    )
  }

  const clear = () => {
    setLines([])

    try {
      sessionStorage.removeItem(STORAGE_KEY)
    } catch {
      // Ignore storage errors.
    }
  }

  const subtotal = useMemo(
    () =>
      lines.reduce(
        (sum, line) =>
          sum + line.product.price * line.quantity,
        0,
      ),
    [lines],
  )

  const itemCount = useMemo(
    () =>
      lines.reduce(
        (sum, line) => sum + line.quantity,
        0,
      ),
    [lines],
  )

  return (
    <CartContext.Provider
      value={{
        lines,
        addItem,
        removeItem,
        setQuantity,
        clear,
        subtotal,
        itemCount,
        isOpen,
        setIsOpen,
      }}
    >
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const ctx = useContext(CartContext)

  if (!ctx) {
    throw new Error(
      'useCart must be used within CartProvider',
    )
  }

  return ctx
}