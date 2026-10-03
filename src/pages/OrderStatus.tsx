import { useEffect, useState } from 'react'
import { Link, useSearch } from 'wouter'
import { ArrowLeft } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { OrderTracker } from '@/components/OrderTracker'

type OrderStatusValue =
  | 'received'
  | 'production'
  | 'quality'
  | 'delivery'
  | 'delivered'

type Order = {
  order_number: string
  status: OrderStatusValue
  estimated_ready: string | null
  location: string | null
  delivery_method: string
}

export function OrderStatus() {
  const search = useSearch()
  const params = new URLSearchParams(search)
  const orderNumber = params.get('order')

  const [order, setOrder] = useState<Order | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    async function loadOrder() {
      if (!orderNumber) {
        setError('No order number provided.')
        setLoading(false)
        return
      }

      const { data, error } = await supabase
        .from('orders')
        .select(
          'order_number, status, estimated_ready, location, delivery_method',
        )
        .eq('order_number', orderNumber)
        .single()

      if (error) {
        setError('Order not found.')
        setLoading(false)
        return
      }

      setOrder(data as Order)
      setLoading(false)
    }

    loadOrder()
  }, [orderNumber])

  return (
    <main className="mx-auto max-w-[1400px] px-4 py-8 sm:px-6 sm:py-12 lg:px-8 lg:py-16">
      <section className="border-y border-hairline py-10 sm:py-14">
        <Link
          href="/"
          className="inline-flex items-center gap-2 font-mono text-[9px] uppercase tracking-[0.16em] text-ink-dim transition-colors hover:text-ink"
        >
          <ArrowLeft size={13} strokeWidth={1.5} />
          Back to Safehouse
        </Link>

        <div className="mt-10 grid gap-8 lg:grid-cols-[1fr_320px] lg:items-end">
          <div>
            <p className="font-mono text-[9px] uppercase tracking-[0.2em] text-ink-dim">
              Order / {orderNumber || 'UNKNOWN'}
            </p>

            <h1 className="mt-5 max-w-4xl font-mono text-[clamp(3rem,7vw,7rem)] uppercase leading-[0.85] tracking-[-0.07em] text-ink">
              Follow your
              <br />
              object.
            </h1>
          </div>

          <p className="max-w-sm font-mono text-[11px] leading-relaxed text-ink-dim">
            From fabrication to delivery, see where your Safehouse object is
            and what happens next.
          </p>
        </div>
      </section>

      <section className="mt-10">
        {loading ? (
          <div className="border-y border-hairline p-10">
            <p className="font-mono text-[9px] uppercase tracking-[0.16em] text-ink-dim">
              Loading order...
            </p>
          </div>
        ) : error || !order ? (
          <div className="border-y border-hairline p-10">
            <p className="font-mono text-sm uppercase text-ink">
              {error || 'Order not found.'}
            </p>

            <Link
              href="/shop"
              className="mt-5 inline-block font-mono text-[9px] uppercase tracking-[0.16em] text-ink underline underline-offset-4"
            >
              Back to storefront →
            </Link>
          </div>
        ) : (
          <OrderTracker
            orderNumber={order.order_number}
            currentStage={order.status}
            estimatedReady={order.estimated_ready || 'To be confirmed'}
            deliveryTime={
              order.delivery_method === 'pickup'
                ? 'Pickup after production'
                : '1 — 2 days after production'
            }
            location={order.location || 'Safehouse Studio / Kigali'}
          />
        )}
      </section>

      <div className="flex flex-col gap-4 border-b border-hairline py-6 sm:flex-row sm:items-center sm:justify-between">
        <p className="font-mono text-[8px] uppercase tracking-[0.14em] text-ink-dim">
          Need help with your order?
        </p>

        <Link
          href="/contact"
          className="font-mono text-[9px] uppercase tracking-[0.16em] text-ink underline underline-offset-4"
        >
          Contact Safehouse →
        </Link>
      </div>
    </main>
  )
}

export default OrderStatus