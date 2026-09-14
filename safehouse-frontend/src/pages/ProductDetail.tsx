import { useState } from 'react'
import { useParams, Link, useLocation } from 'wouter'
import { ArrowLeft } from 'lucide-react'
import { products } from '@/data/products'
import { formatRWF } from '@/lib/format'
import { Button } from '@/components/Button'
import { useCart } from '@/context/CartContext'

export function ProductDetail() {
  const { slug } = useParams()
  const [, navigate] = useLocation()
  const product = products.find((p) => p.slug === slug)
  const { addItem } = useCart()
  const [quantity, setQuantity] = useState(1)
  const [added, setAdded] = useState(false)

  if (!product) {
    return (
      <div className="mx-auto max-w-2xl px-6 py-24 text-center">
        <p className="font-display text-2xl uppercase text-ink">Artifact not found</p>
        <Link href="/shop" className="mt-4 inline-block text-signal-soft underline">
          Back to storefront
        </Link>
      </div>
    )
  }

  const handleAcquire = () => {
    addItem(product, quantity)
    setAdded(true)
  }

  return (
    <div className="mx-auto max-w-6xl px-6 py-16">
      <button
        onClick={() => navigate('/shop')}
        className="mb-8 flex items-center gap-2 font-mono-label text-xs uppercase text-ink-dim hover:text-ink"
      >
        <ArrowLeft size={14} aria-hidden="true" /> Back to storefront
      </button>

      <div className="grid gap-10 md:grid-cols-2">
        <div
          className="flex h-80 items-center justify-center rounded-2xl border border-hairline md:h-full"
          style={{ background: product.image }}
          aria-hidden="true"
        >
          <span className="font-mono-label text-xs opacity-40">{product.catalogNo}</span>
        </div>

        <div>
          <span className="font-mono-label text-[11px] uppercase text-signal-soft">
            {product.category}
          </span>
          <h1 className="mt-2 font-display text-3xl uppercase leading-tight text-ink">
            {product.name}
          </h1>
          <p className="mt-4 font-mono-label text-lg text-ink">{formatRWF(product.price)}</p>
          <p className="mt-6 max-w-md text-sm text-ink-dim">{product.description}</p>

          <dl className="mt-6 grid grid-cols-2 gap-4 border-t border-hairline pt-6 text-sm">
            <div>
              <dt className="font-mono-label text-[10px] uppercase text-ink-dim">Material</dt>
              <dd className="mt-1 text-ink">{product.material}</dd>
            </div>
            <div>
              <dt className="font-mono-label text-[10px] uppercase text-ink-dim">Finish</dt>
              <dd className="mt-1 text-ink">{product.finish}</dd>
            </div>
          </dl>

          <div className="mt-8 flex items-center gap-4">
            <div className="flex items-center rounded-full border border-ink/20">
              <button
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                className="px-4 py-2 text-ink-dim hover:text-ink"
                aria-label="Decrease quantity"
              >
                −
              </button>
              <span className="w-8 text-center font-mono-label text-sm">{quantity}</span>
              <button
                onClick={() => setQuantity((q) => q + 1)}
                className="px-4 py-2 text-ink-dim hover:text-ink"
                aria-label="Increase quantity"
              >
                +
              </button>
            </div>
            <Button onClick={handleAcquire}>Acquire</Button>
          </div>
          {added && (
            <p role="status" className="mt-4 text-sm text-signal-soft">
              Added to cart. <Link href="/cart" className="underline">View cart</Link>
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
