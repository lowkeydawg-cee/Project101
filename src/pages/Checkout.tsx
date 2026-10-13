import { useState, type FormEvent } from 'react'
import { useLocation } from 'wouter'
import { useCart } from '@/context/CartContext'
import { supabase } from '@/lib/supabase'
import { formatRWF } from '@/lib/format'
import { sendOrderEmails, type OrderEmail } from '@/lib/notify'
type DeliveryMethod = 'pickup' | 'delivery'
interface PlaceOrderResult {
  order_number: string
  subtotal: number
  delivery_fee: number
  total: number
  items: OrderEmail['items']
}
export default function Checkout() {
  const { lines, subtotal, clear } = useCart()
  const [, navigate] = useLocation()
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [email, setEmail] = useState('')
  const [deliveryMethod, setDeliveryMethod] =
    useState<DeliveryMethod>('pickup')
  const [address, setAddress] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const deliveryFee = deliveryMethod === 'delivery' ? 2000 : 0
  const total = subtotal + deliveryFee
  if (lines.length === 0) {
    return (
      <main className="mx-auto max-w-2xl px-6 py-24 text-center">
        <p className="font-mono text-xl uppercase text-ink">
          Your cart is empty
        </p>
        <button
          type="button"
          onClick={() => navigate('/shop')}
          className="mt-6 border border-ink bg-ink px-5 py-3 font-mono text-xs uppercase text-panel"
        >
          Back to shop
        </button>
      </main>
    )
  }
  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (submitting) return
    setSubmitting(true)
    setError('')
    try {
      if (!name.trim()) {
        throw new Error('Please enter your full name.')
      }
      if (!phone.trim()) {
        throw new Error('Please enter your phone number.')
      }
      if (!email.trim()) {
        throw new Error('Please enter your email address.')
      }
      if (deliveryMethod === 'delivery' && !address.trim()) {
        throw new Error('Please enter your delivery address.')
      }
      // Prices and totals are calculated on the server from the products
      // table — the browser only says which products and how many.
      const { data, error: orderError } = await supabase.rpc('place_order', {
        p_customer_name: name.trim(),
        p_customer_phone: phone.trim(),
        p_customer_email: email.trim(),
        p_delivery_method: deliveryMethod,
        p_delivery_address:
          deliveryMethod === 'delivery' ? address.trim() : null,
        p_items: lines.map((line) => ({
          product_id: line.product.id,
          quantity: line.quantity,
        })),
      })
      if (orderError) {
        throw new Error(orderError.message)
      }
      const order = data as PlaceOrderResult | null
      if (!order?.order_number) {
        throw new Error('The order could not be created.')
      }
      await sendOrderEmails({
        orderNumber: order.order_number,
        customerName: name.trim(),
        customerEmail: email.trim(),
        customerPhone: phone.trim(),
        deliveryMethod,
        deliveryAddress:
          deliveryMethod === 'delivery' ? address.trim() : null,
        items: order.items,
        subtotal: order.subtotal,
        deliveryFee: order.delivery_fee,
        total: order.total,
      })
      clear()
      navigate(`/order-status?order=${order.order_number}`)
    } catch (submitError) {
      const message =
        submitError instanceof Error
          ? submitError.message
          : 'Something went wrong while placing your order.'
      setError(message)
      setSubmitting(false)
    }
  }
  return (
    <main className="mx-auto max-w-3xl px-4 py-10 sm:px-6 sm:py-16">
      <div>
        <p className="font-mono text-[9px] uppercase tracking-[0.16em] text-ink-dim">
          Safehouse / Order
        </p>
        <h1 className="mt-3 font-mono text-3xl uppercase tracking-[-0.04em] text-ink">
          Checkout
        </h1>
      </div>
      <form
        onSubmit={handleSubmit}
        className="mt-8 flex flex-col gap-5"
      >
        <input
          required
          type="text"
          autoComplete="name"
          placeholder="Full name"
          value={name}
          onChange={(event) => setName(event.target.value)}
          className="border border-hairline bg-transparent px-3 py-3 text-sm text-ink outline-none placeholder:text-ink-dim"
        />
        <input
          required
          type="tel"
          autoComplete="tel"
          placeholder="Phone number"
          value={phone}
          onChange={(event) => setPhone(event.target.value)}
          className="border border-hairline bg-transparent px-3 py-3 text-sm text-ink outline-none placeholder:text-ink-dim"
        />
        <input
          required
          type="email"
          autoComplete="email"
          placeholder="Email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          className="border border-hairline bg-transparent px-3 py-3 text-sm text-ink outline-none placeholder:text-ink-dim"
        />
        <fieldset className="flex flex-col gap-3 font-mono text-xs uppercase text-ink sm:flex-row sm:gap-6">
          <legend className="sr-only">Delivery method</legend>
          <label className="flex cursor-pointer items-center gap-2">
            <input
              type="radio"
              name="delivery-method"
              value="pickup"
              checked={deliveryMethod === 'pickup'}
              onChange={() => setDeliveryMethod('pickup')}
            />
            Pickup
          </label>
          <label className="flex cursor-pointer items-center gap-2">
            <input
              type="radio"
              name="delivery-method"
              value="delivery"
              checked={deliveryMethod === 'delivery'}
              onChange={() => setDeliveryMethod('delivery')}
            />
            Delivery (+{formatRWF(2000)})
          </label>
        </fieldset>
        {deliveryMethod === 'delivery' && (
          <input
            required
            type="text"
            autoComplete="street-address"
            placeholder="Delivery address"
            value={address}
            onChange={(event) => setAddress(event.target.value)}
            className="border border-hairline bg-transparent px-3 py-3 text-sm text-ink outline-none placeholder:text-ink-dim"
          />
        )}
        <div className="border-t border-hairline pt-5 font-mono text-sm text-ink">
          <div className="flex items-center justify-between">
            <span>Subtotal</span>
            <span>{formatRWF(subtotal)}</span>
          </div>
          <div className="mt-2 flex items-center justify-between text-ink-dim">
            <span>Delivery</span>
            <span>
              {deliveryFee === 0
                ? 'FREE'
                : formatRWF(deliveryFee)}
            </span>
          </div>
          <div className="mt-4 flex items-center justify-between border-t border-hairline pt-4 text-base">
            <span>Total</span>
            <span>{formatRWF(total)}</span>
          </div>
        </div>
        {error && (
          <div
            role="alert"
            className="border border-red-500/40 px-4 py-3"
          >
            <p className="font-mono text-xs leading-relaxed text-red-500">
              {error}
            </p>
          </div>
        )}
        <button
          type="submit"
          disabled={submitting}
          className="border border-ink bg-ink px-5 py-4 font-mono text-xs uppercase text-panel transition-opacity disabled:cursor-not-allowed disabled:opacity-50"
        >
          {submitting ? 'Placing order...' : 'Place order'}
        </button>
      </form>
    </main>
  )
}