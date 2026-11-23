import {
  createContext,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import type { Personalisation, Product } from '@/data/products'

export interface CartLine {
  product: Product
  quantity: number
  /** What the customer typed for this line. Absent for products without fields. */
  personalisation?: Personalisation
}

interface CartContextValue {
  lines: CartLine[]
  addItem: (product: Product, quantity?: number, personalisation?: Personalisation) => void
  removeItem: (key: string) => void
  setQuantity: (key: string, quantity: number) => void
  clear: () => void
  subtotal: number
  itemCount: number
  isOpen: boolean
  setIsOpen: (isOpen: boolean) => void
}

const CartContext = createContext<CartContextValue | null>(null)

const STORAGE_KEY = 'safehouse-cart'

/** Drops empty values and sorts keys, so equal personalisations compare equal. */
function normalise(p: Personalisation | undefined): Personalisation | undefined {
  if (!p) return undefined
  const out: Personalisation = {}
  for (const k of Object.keys(p).sort()) {
    const v = typeof p[k] === 'string' ? p[k].trim() : ''
    if (v) out[k] = v
  }
  return Object.keys(out).length > 0 ? out : undefined
}

/**
 * Identity of a cart line: the product plus what was typed for it, so the
 * same nameplate with two different names is two lines.
 */
export function lineKey(line: Pick<CartLine, 'product' | 'personalisation'>): string {
  const p = normalise(line.personalisation)
  return p ? `${line.product.id}::${JSON.stringify(p)}` : line.product.id
}

function readStoredCart(): CartLine[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)

    if (!stored) return []

    const parsed = JSON.parse(stored)

    if (!Array.isArray(parsed)) return []

    // Carts saved before personalisation existed have no such field; that is fine.
    return parsed.filter(
      (l): l is CartLine =>
        Boolean(l?.product?.id) && Number.isInteger(l.quantity) && l.quantity > 0,
    )
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
        localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
      } catch {
        // Ignore storage errors.
      }

      return next
    })
  }

  const addItem = (product: Product, quantity = 1, personalisation?: Personalisation) => {
    const incoming: CartLine = { product, quantity }
    const p = normalise(personalisation)
    if (p) incoming.personalisation = p
    const key = lineKey(incoming)

    updateLines((current) => {
      if (current.some((line) => lineKey(line) === key)) {
        return current.map((line) =>
          lineKey(line) === key
            ? { ...line, quantity: line.quantity + quantity }
            : line,
        )
      }

      return [...current, incoming]
    })
  }

  const removeItem = (key: string) => {
    updateLines((current) =>
      current.filter((line) => lineKey(line) !== key),
    )
  }

  const setQuantity = (key: string, quantity: number) => {
    updateLines((current) =>
      current
        .map((line) =>
          lineKey(line) === key
            ? { ...line, quantity }
            : line,
        )
        .filter((line) => line.quantity > 0),
    )
  }

  const clear = () => {
    setLines([])

    try {
      localStorage.removeItem(STORAGE_KEY)
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
