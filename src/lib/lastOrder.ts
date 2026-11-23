import type { Personalisation, PersonaliseField } from '@/data/products'

/**
 * The order the visitor just placed, kept in sessionStorage so the
 * confirmation page can list the pieces and what was typed for them.
 * get_order_status deliberately returns no line items, and this never
 * leaves the visitor's own browser tab.
 */
export interface LastOrderLine {
  name: string
  quantity: number
  unit_price: number
  personalisation: Personalisation | null
  /** Labels for the personalisation keys, from the product at checkout time. */
  fields: PersonaliseField[]
}

export interface LastOrder {
  orderNumber: string
  lines: LastOrderLine[]
}

const KEY = 'safehouse-last-order'

export function saveLastOrder(order: LastOrder) {
  try {
    sessionStorage.setItem(KEY, JSON.stringify(order))
  } catch {
    // Private mode or full storage: the confirmation just won't list items.
  }
}

export function readLastOrder(orderNumber: string | null): LastOrder | null {
  if (!orderNumber) return null
  try {
    const raw = sessionStorage.getItem(KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as LastOrder
    if (parsed?.orderNumber !== orderNumber || !Array.isArray(parsed.lines)) return null
    return parsed
  } catch {
    return null
  }
}
