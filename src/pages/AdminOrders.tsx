import { useCallback, useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
type OrderStatus =
  | 'received'
  | 'production'
  | 'quality'
  | 'delivery'
  | 'delivered'
type OrderItem = {
  id: string
  product_name: string
  quantity: number
  unit_price: number
}
type Order = {
  id: string
  order_number: string
  customer_name: string
  customer_phone: string
  customer_email: string
  delivery_method: string
  delivery_address: string | null
  subtotal: number
  delivery_fee: number
  total: number
  status: OrderStatus
  estimated_ready: string | null
  location: string | null
  created_at: string
  order_items: OrderItem[]
}
const statuses: {
  value: OrderStatus
  label: string
}[] = [
  { value: 'received', label: 'Order received' },
  { value: 'production', label: 'In production' },
  { value: 'quality', label: 'Quality check' },
  { value: 'delivery', label: 'Out for delivery' },
  { value: 'delivered', label: 'Delivered' },
]
function formatRWF(value: number) {
  return `${Number(value || 0).toLocaleString('en-US')} RWF`
}
export function AdminOrders() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState<string | null>(null)
  const [error, setError] = useState('')
  const loadOrders = useCallback(async () => {
    setLoading(true)
    setError('')
    const { data, error: ordersError } = await supabase
      .from('orders')
      .select(`
        id,
        order_number,
        customer_name,
        customer_phone,
        customer_email,
        delivery_method,
        delivery_address,
        subtotal,
        delivery_fee,
        total,
        status,
        estimated_ready,
        location,
        created_at,
        order_items (
          id,
          product_name,
          quantity,
          unit_price
        )
      `)
      .order('created_at', { ascending: false })
    if (ordersError) {
      setOrders([])
      setError(ordersError.message)
      setLoading(false)
      return
    }
    setOrders((data ?? []) as Order[])
    setLoading(false)
  }, [])
  useEffect(() => {
    void loadOrders()
  }, [loadOrders])
  async function updateStatus(
    orderId: string,
    status: OrderStatus,
  ) {
    setSaving(orderId)
    setError('')
    const { error: updateError } = await supabase
      .from('orders')
      .update({ status })
      .eq('id', orderId)
    if (updateError) {
      setError(updateError.message)
      setSaving(null)
      return
    }
    setOrders((current) =>
      current.map((order) =>
        order.id === orderId
          ? { ...order, status }
          : order,
      ),
    )
    setSaving(null)
  }
  async function updateOrderDetails(
    orderId: string,
    estimatedReady: string,
    location: string,
  ) {
    setSaving(orderId)
    setError('')
    const nextEstimatedReady = estimatedReady.trim()
    const nextLocation = location.trim()
    const { error: updateError } = await supabase
      .from('orders')
      .update({
        estimated_ready: nextEstimatedReady || null,
        location: nextLocation || null,
      })
      .eq('id', orderId)
    if (updateError) {
      setError(updateError.message)
      setSaving(null)
      return
    }
    setOrders((current) =>
      current.map((order) =>
        order.id === orderId
          ? {
              ...order,
              estimated_ready:
                nextEstimatedReady || null,
              location: nextLocation || null,
            }
          : order,
      ),
    )
    setSaving(null)
  }
  return (
    <main className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="mb-8 flex flex-col gap-3 border-b border-hairline pb-6 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="font-mono text-[8px] uppercase tracking-[0.18em] text-ink-dim">
            Safehouse / Operations
          </p>
          <h1 className="mt-3 font-mono text-3xl uppercase tracking-[-0.05em] text-ink">
            Orders
          </h1>
        </div>
        <button
          type="button"
          onClick={() => void loadOrders()}
          disabled={loading}
          className="self-start border border-hairline px-4 py-2 font-mono text-[9px] uppercase tracking-[0.14em] text-ink-dim transition-colors hover:text-ink disabled:cursor-not-allowed disabled:opacity-50"
        >
          {loading ? 'Loading...' : 'Refresh'}
        </button>
      </div>
      {error && (
        <div
          role="alert"
          className="mb-6 border border-red-500/40 px-4 py-3"
        >
          <p className="font-mono text-[9px] uppercase leading-relaxed text-red-500">
            {error}
          </p>
        </div>
      )}
      {loading ? (
        <div className="border border-hairline p-8">
          <p className="font-mono text-[9px] uppercase tracking-[0.14em] text-ink-dim">
            Loading orders...
          </p>
        </div>
      ) : orders.length === 0 ? (
        <div className="border border-hairline p-10">
          <p className="font-mono text-sm uppercase text-ink">
            No orders yet.
          </p>
          <p className="mt-2 font-mono text-[9px] leading-relaxed text-ink-dim">
            Orders placed through the storefront will appear here.
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-6">
          {orders.map((order) => (
            <article
              key={order.id}
              className="border border-hairline"
            >
              {/* ORDER HEADER */}
              <div className="flex flex-col gap-5 border-b border-hairline p-5 sm:flex-row sm:items-start sm:justify-between sm:p-6">
                <div>
                  <p className="font-mono text-[8px] uppercase tracking-[0.18em] text-ink-dim">
                    Order
                  </p>
                  <h2 className="mt-2 font-mono text-lg uppercase tracking-[-0.03em] text-ink">
                    {order.order_number}
                  </h2>
                  <p className="mt-2 font-mono text-[9px] uppercase text-ink-dim">
                    {new Date(order.created_at).toLocaleString()}
                  </p>
                </div>
                <div className="sm:text-right">
                  <p className="font-mono text-[8px] uppercase tracking-[0.16em] text-ink-dim">
                    Total
                  </p>
                  <p className="mt-2 font-mono text-sm text-ink">
                    {formatRWF(order.total)}
                  </p>
                </div>
              </div>
              {/* CUSTOMER + FULFILMENT */}
              <div className="grid border-b border-hairline md:grid-cols-2">
                <div className="border-b border-hairline p-5 md:border-b-0 md:border-r sm:p-6">
                  <p className="font-mono text-[8px] uppercase tracking-[0.16em] text-ink-dim">
                    Customer
                  </p>
                  <p className="mt-3 font-mono text-xs uppercase text-ink">
                    {order.customer_name}
                  </p>
                  <p className="mt-2 font-mono text-[9px] text-ink-dim">
                    {order.customer_phone}
                  </p>
                  <p className="mt-1 break-all font-mono text-[9px] text-ink-dim">
                    {order.customer_email}
                  </p>
                </div>
                <div className="p-5 sm:p-6">
                  <p className="font-mono text-[8px] uppercase tracking-[0.16em] text-ink-dim">
                    Fulfilment
                  </p>
                  <p className="mt-3 font-mono text-xs uppercase text-ink">
                    {order.delivery_method}
                  </p>
                  {order.delivery_address && (
                    <p className="mt-2 font-mono text-[9px] leading-relaxed text-ink-dim">
                      {order.delivery_address}
                    </p>
                  )}
                </div>
              </div>
              {/* ORDER ITEMS */}
              <div className="border-b border-hairline">
                <div className="border-b border-hairline p-5 sm:p-6">
                  <p className="font-mono text-[8px] uppercase tracking-[0.16em] text-ink-dim">
                    Objects ordered
                  </p>
                </div>
                {order.order_items?.length > 0 ? (
                  <div>
                    {order.order_items.map((item) => (
                      <div
                        key={item.id}
                        className="grid grid-cols-[1fr_auto] gap-4 border-b border-hairline p-5 last:border-b-0 sm:grid-cols-[1fr_80px_140px] sm:items-center sm:p-6"
                      >
                        <div>
                          <p className="font-mono text-[10px] uppercase text-ink">
                            {item.product_name}
                          </p>
                          <p className="mt-2 font-mono text-[8px] uppercase text-ink-dim">
                            Unit / {formatRWF(item.unit_price)}
                          </p>
                        </div>
                        <p className="font-mono text-[9px] uppercase text-ink-dim sm:text-center">
                          × {item.quantity}
                        </p>
                        <p className="font-mono text-[10px] text-ink sm:text-right">
                          {formatRWF(
                            item.unit_price * item.quantity,
                          )}
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-5 sm:p-6">
                    <p className="font-mono text-[9px] uppercase text-ink-dim">
                      No order items found.
                    </p>
                  </div>
                )}
              </div>
              {/* FINANCIAL SUMMARY */}
              <div className="grid border-b border-hairline sm:grid-cols-3">
                <div className="border-b border-hairline p-5 sm:border-b-0 sm:border-r sm:p-6">
                  <p className="font-mono text-[8px] uppercase tracking-[0.16em] text-ink-dim">
                    Objects
                  </p>
                  <p className="mt-3 font-mono text-xs text-ink">
                    {formatRWF(order.subtotal)}
                  </p>
                </div>
                <div className="border-b border-hairline p-5 sm:border-b-0 sm:border-r sm:p-6">
                  <p className="font-mono text-[8px] uppercase tracking-[0.16em] text-ink-dim">
                    Delivery
                  </p>
                  <p className="mt-3 font-mono text-xs text-ink">
                    {order.delivery_fee === 0
                      ? 'FREE'
                      : formatRWF(order.delivery_fee)}
                  </p>
                </div>
                <div className="p-5 sm:p-6">
                  <p className="font-mono text-[8px] uppercase tracking-[0.16em] text-ink-dim">
                    Total
                  </p>
                  <p className="mt-3 font-mono text-xs text-ink">
                    {formatRWF(order.total)}
                  </p>
                </div>
              </div>
              {/* PRODUCTION STATUS */}
              <div className="border-b border-hairline p-5 sm:p-6">
                <p className="mb-4 font-mono text-[8px] uppercase tracking-[0.16em] text-ink-dim">
                  Production status
                </p>
                <select
                  value={order.status}
                  disabled={saving === order.id}
                  onChange={(event) =>
                    void updateStatus(
                      order.id,
                      event.target.value as OrderStatus,
                    )
                  }
                  className="w-full border border-hairline bg-transparent px-3 py-3 font-mono text-[10px] uppercase text-ink outline-none md:max-w-md"
                >
                  {statuses.map((status) => (
                    <option
                      key={status.value}
                      value={status.value}
                      className="bg-panel text-ink"
                    >
                      {status.label}
                    </option>
                  ))}
                </select>
              </div>
              {/* PRODUCTION DETAILS */}
              <div className="grid sm:grid-cols-2">
                <label className="border-b border-hairline p-5 sm:border-b-0 sm:border-r sm:p-6">
                  <span className="font-mono text-[8px] uppercase tracking-[0.16em] text-ink-dim">
                    Estimated ready
                  </span>
                  <input
                    defaultValue={order.estimated_ready ?? ''}
                    disabled={saving === order.id}
                    onBlur={(event) =>
                      void updateOrderDetails(
                        order.id,
                        event.target.value,
                        order.location ?? '',
                      )
                    }
                    placeholder="02 — 04 OCT"
                    className="mt-3 w-full border border-hairline bg-transparent px-3 py-3 font-mono text-[10px] uppercase text-ink outline-none disabled:opacity-50"
                  />
                </label>
                <label className="p-5 sm:p-6">
                  <span className="font-mono text-[8px] uppercase tracking-[0.16em] text-ink-dim">
                    Current location
                  </span>
                  <input
                    defaultValue={order.location ?? ''}
                    disabled={saving === order.id}
                    onBlur={(event) =>
                      void updateOrderDetails(
                        order.id,
                        order.estimated_ready ?? '',
                        event.target.value,
                      )
                    }
                    placeholder="Safehouse Studio / Kigali"
                    className="mt-3 w-full border border-hairline bg-transparent px-3 py-3 font-mono text-[10px] uppercase text-ink outline-none disabled:opacity-50"
                  />
                </label>
              </div>
            </article>
          ))}
        </div>
      )}
    </main>
  )
}
export default AdminOrders