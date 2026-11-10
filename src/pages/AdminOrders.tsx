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
  payment_status: PaymentStatus
  payment_ref: string | null
  momo_txn_id: string | null
  paid_at: string | null
  pay_by: string | null
  order_items: OrderItem[]
}
type PaymentStatus = 'awaiting_payment' | 'paid' | 'expired' | 'refunded'

/** Unpaid orders past their deadline count as expired, even before any job tidies the table. */
function effectivePayment(order: Order): PaymentStatus {
  if (order.payment_status === 'awaiting_payment' && order.pay_by && new Date(order.pay_by) < new Date()) {
    return 'expired'
  }
  return order.payment_status
}

const paymentLabel: Record<PaymentStatus, string> = {
  awaiting_payment: 'Awaiting payment',
  paid: 'Paid',
  expired: 'Expired, not paid',
  refunded: 'Refunded',
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
        payment_status,
        payment_ref,
        momo_txn_id,
        paid_at,
        pay_by,
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
  async function setPayment(order: Order, next: PaymentStatus, txnId: string) {
    setSaving(order.id)
    setError('')
    const patch =
      next === 'paid'
        ? { payment_status: 'paid', momo_txn_id: txnId.trim() || order.payment_ref, paid_at: new Date().toISOString() }
        : next === 'awaiting_payment'
          ? {
              payment_status: 'awaiting_payment',
              momo_txn_id: null,
              paid_at: null,
              // reopening an expired order gives the customer a fresh 48 hours
              pay_by: new Date(Date.now() + 48 * 3600 * 1000).toISOString(),
            }
          : { payment_status: next }
    const { error: updateError } = await supabase.from('orders').update(patch).eq('id', order.id)
    if (updateError) {
      setError(updateError.message)
      setSaving(null)
      return
    }
    setOrders((current) =>
      current.map((o) => (o.id === order.id ? ({ ...o, ...patch } as Order) : o)),
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
          {!loading && (
            <p className="mt-2 font-mono text-[10px] uppercase tracking-[0.14em] text-ink-dim">
              {orders.filter((o) => effectivePayment(o) === 'awaiting_payment').length} awaiting payment
              {' · '}
              {orders.filter((o) => effectivePayment(o) === 'awaiting_payment' && o.payment_ref).length} with an ID to check
            </p>
          )}
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
              {/* PAYMENT */}
              <PaymentRow
                order={order}
                saving={saving === order.id}
                onSet={(next, txn) => void setPayment(order, next, txn)}
              />
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
                    placeholder="02 to 04 OCT"
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
function PaymentRow({
  order,
  saving,
  onSet,
}: {
  order: Order
  saving: boolean
  onSet: (next: PaymentStatus, txnId: string) => void
}) {
  const state = effectivePayment(order)
  const [txn, setTxn] = useState(order.momo_txn_id ?? order.payment_ref ?? '')

  return (
    <div className="border-b border-hairline p-5 sm:p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="font-mono text-[8px] uppercase tracking-[0.16em] text-ink-dim">Payment</p>
        <span
          className={`border px-2 py-1 font-mono text-[9px] uppercase tracking-[0.14em] ${
            state === 'paid' ? 'border-ink bg-ink text-void' : 'border-hairline text-ink'
          }`}
        >
          {paymentLabel[state]}
        </span>
      </div>

      {state === 'paid' ? (
        <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
          <p className="font-mono text-[10px] text-ink-dim">
            MoMo ID {order.momo_txn_id || 'not recorded'}
            {order.paid_at ? ` · marked paid ${new Date(order.paid_at).toLocaleString()}` : ''}
          </p>
          <button
            type="button"
            disabled={saving}
            onClick={() => onSet('awaiting_payment', '')}
            className="font-mono text-[9px] uppercase tracking-[0.14em] text-ink-dim underline underline-offset-4 hover:text-ink disabled:opacity-50"
          >
            Undo
          </button>
        </div>
      ) : (
        <>
          <p className="mt-3 font-mono text-[10px] leading-relaxed text-ink-dim">
            {order.payment_ref
              ? `Customer sent MoMo ID ${order.payment_ref}. Find it on your MoMo statement, check the amount is ${formatRWF(order.total)}, then mark paid.`
              : `No transaction ID from the customer yet. ${
                  state === 'expired' ? 'The payment window has closed.' : `Pay by ${order.pay_by ? new Date(order.pay_by).toLocaleString() : 'not set'}.`
                }`}
          </p>
          <div className="mt-4 flex flex-col gap-3 sm:flex-row">
            <input
              value={txn}
              onChange={(e) => setTxn(e.target.value)}
              placeholder="MoMo transaction ID you confirmed"
              disabled={saving}
              className="min-h-[44px] flex-1 border border-hairline bg-transparent px-3 font-mono text-[10px] uppercase text-ink outline-none disabled:opacity-50"
            />
            <button
              type="button"
              disabled={saving}
              onClick={() => onSet('paid', txn)}
              className="min-h-[44px] border border-ink bg-ink px-5 font-mono text-[10px] uppercase tracking-[0.14em] text-void disabled:opacity-50"
            >
              Mark paid
            </button>
            {state === 'expired' && (
              <button
                type="button"
                disabled={saving}
                onClick={() => onSet('awaiting_payment', '')}
                className="min-h-[44px] border border-hairline px-5 font-mono text-[10px] uppercase tracking-[0.14em] text-ink disabled:opacity-50"
              >
                Reopen 48h
              </button>
            )}
          </div>
        </>
      )}
    </div>
  )
}

export default AdminOrders