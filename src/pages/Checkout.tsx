import { useState, type FormEvent } from 'react'
import { useLocation } from 'wouter'
import { useCart } from '@/context/CartContext'
import { supabase } from '@/lib/supabase'
import { formatRWF } from '@/lib/format'
type DeliveryMethod = 'pickup' | 'delivery'
function generateOrderNumber() {
  return `SH-${Date.now().toString(36).toUpperCase()}`
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
      const orderNumber = generateOrderNumber()
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert({
          order_number: orderNumber,
          customer_name: name.trim(),
          customer_phone: phone.trim(),
          customer_email: email.trim(),
          delivery_method: deliveryMethod,
          delivery_address:
            deliveryMethod === 'delivery' ? address.trim() : null,
          subtotal,
          delivery_fee: deliveryFee,
          total,
          status: 'received',
        })
        .select('id, order_number')
        .single()
      if (orderError) {
        throw new Error(orderError.message)
      }
      if (!order) {
        throw new Error('The order could not be created.')
      }
      const items = lines.map((line) => ({
        order_id: order.id,
        product_name: line.product.name,
        quantity: line.quantity,
        unit_price: line.product.price,
      }))
      const { error: itemsError } = await supabase
        .from('order_items')
        .insert(items)
      if (itemsError) {
        // Try to remove the parent order if item creation failed.
        await supabase
          .from('orders')
          .delete()
          .eq('id', order.id)
        throw new Error(
          `Order items could not be saved: ${itemsError.message}`,
        )
      }
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