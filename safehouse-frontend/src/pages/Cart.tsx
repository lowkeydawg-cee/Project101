import { useState } from 'react'
import { Link } from 'wouter'
import { X } from 'lucide-react'
import { useCart } from '@/context/CartContext'
import { formatRWF } from '@/lib/format'
import { Button, buttonClass } from '@/components/Button'

export function Cart() {
  const { lines, removeItem, setQuantity, subtotal } = useCart()
  const [checkoutClicked, setCheckoutClicked] = useState(false)

  if (lines.length === 0) {
    return (
      <div className="mx-auto max-w-2xl px-6 py-24 text-center">
        <p className="font-display text-2xl uppercase text-ink">Your cart is empty</p>
        <p className="mt-3 text-ink-dim">Nothing acquired yet.</p>
        <Link href="/shop" className={`${buttonClass('primary')} mt-6 inline-flex`}>
          Browse Storefront
        </Link>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-4xl px-6 py-16">
      <h1 className="font-display text-3xl uppercase text-ink">Cart</h1>

      <div className="mt-8 divide-y divide-hairline border-y border-hairline">
        {lines.map(({ product, quantity }) => (
          <div key={product.id} className="flex items-center gap-4 py-5">
            <div
              className="h-16 w-16 shrink-0 rounded-lg"
              style={{ background: product.image }}
              aria-hidden="true"
            />
            <div className="flex-1">
              <p className="font-display text-base uppercase text-ink">{product.name}</p>
              <p className="font-mono-label text-xs text-ink-dim">{formatRWF(product.price)}</p>
            </div>
            <div className="flex items-center rounded-full border border-ink/20">
              <button
                onClick={() => setQuantity(product.id, quantity - 1)}
                className="px-3 py-1.5 text-ink-dim hover:text-ink"
                aria-label={`Decrease quantity of ${product.name}`}
              >
                −
              </button>
              <span className="w-6 text-center font-mono-label text-xs">{quantity}</span>
              <button
                onClick={() => setQuantity(product.id, quantity + 1)}
                className="px-3 py-1.5 text-ink-dim hover:text-ink"
                aria-label={`Increase quantity of ${product.name}`}
              >
                +
              </button>
            </div>
            <p className="w-24 text-right font-mono-label text-sm text-ink">
              {formatRWF(product.price * quantity)}
            </p>
            <button
              onClick={() => removeItem(product.id)}
              aria-label={`Remove ${product.name} from cart`}
              className="text-ink-dim hover:text-signal-soft"
            >
              <X size={16} />
            </button>
          </div>
        ))}
      </div>

      <div className="mt-8 flex flex-col items-end gap-4">
        <div className="flex w-full max-w-xs justify-between font-mono-label text-sm">
          <span className="text-ink-dim uppercase">Subtotal</span>
          <span className="text-ink">{formatRWF(subtotal)}</span>
        </div>

        {!checkoutClicked ? (
          <Button onClick={() => setCheckoutClicked(true)}>Proceed to Checkout</Button>
        ) : (
          <div className="w-full max-w-sm rounded-2xl border border-signal-soft/40 bg-panel p-5 text-right">
            <p className="font-mono-label text-[11px] uppercase text-signal-soft">
              Checkout coming soon
            </p>
            <p className="mt-2 text-sm text-ink-dim">
              Online payment (MoMo & card) isn't connected yet. To acquire these pieces now,
              reach out directly and we'll arrange payment and pickup manually.
            </p>
            <Link href="/contact" className={`${buttonClass('secondary')} mt-4 inline-flex`}>
              Contact Us
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}
