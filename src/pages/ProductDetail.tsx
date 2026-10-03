import { useState, useEffect } from 'react'
import { useParams, Link, useLocation } from 'wouter'
import { ArrowLeft, ArrowUpRight } from 'lucide-react'
import { getProductBySlug, type Product } from '@/data/products'
import { formatRWF } from '@/lib/format'
import { useCart } from '@/context/CartContext'

export function ProductDetail() {
  const { slug } = useParams()
  const [, navigate] = useLocation()
  const [product, setProduct] = useState<Product | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!slug) return
    getProductBySlug(slug).then((data) => {
      setProduct(data)
      setLoading(false)
    })
  }, [slug])

  const { addItem } = useCart()
  const [quantity, setQuantity] = useState(1)
  const [added, setAdded] = useState(false)

  if (loading) {
    return (
      <main className="mx-auto max-w-2xl px-6 py-24 text-center">
        <p className="font-mono text-xs uppercase text-ink-dim">Loading...</p>
      </main>
    )
  }

  if (!product) {
    return (
      <main className="mx-auto max-w-2xl px-6 py-24 text-center">
        <p className="font-mono text-xl uppercase tracking-[-0.03em] text-ink">
          Object not found
        </p>

        <Link
          href="/shop"
          className="
            mt-6
            inline-block
            font-mono
            text-[10px]
            uppercase
            tracking-[0.16em]
            text-ink-dim
            underline
            underline-offset-4
            transition-colors
            hover:text-ink
          "
        >
          Back to collection →
        </Link>
      </main>
    )
  }

  const handleAcquire = () => {
    addItem(product, quantity)
    setAdded(true)
  }

  const hasImage = Boolean(product.image) && product.image.startsWith('http')

  return (
    <main className="mx-auto max-w-[1400px] px-4 py-6 sm:px-6 sm:py-10 lg:px-8 lg:py-12">

      {/* Back */}
      <button
        onClick={() => navigate('/shop')}
        className="
          mb-6
          flex
          items-center
          gap-2
          font-mono
          text-[9px]
          uppercase
          tracking-[0.16em]
          text-ink-dim
          transition-colors
          hover:text-ink
        "
      >
        <ArrowLeft size={13} aria-hidden="true" />
        Collection 001
      </button>

      {/* Product */}
      <section className="grid border-y border-hairline lg:grid-cols-[minmax(0,1.35fr)_minmax(340px,0.65fr)]">

        {/* Object image */}
        <div
          className="
            relative
            min-h-[420px]
            overflow-hidden
            border-b
            border-hairline
            lg:min-h-[720px]
            lg:border-b-0
            lg:border-r
          "
          style={!hasImage ? { background: product.image } : undefined}
        >
          {hasImage ? (
            <img
              src={product.image}
              alt={product.name}
              className="
                h-full
                min-h-[420px]
                w-full
                object-cover
                lg:min-h-[720px]
              "
            />
          ) : (
            <div
              className="absolute inset-0"
              style={{ background: product.image }}
            />
          )}

          {/* Object label */}
          <div className="absolute left-5 top-5">
            <span
              className="
                font-mono
                text-[9px]
                uppercase
                tracking-[0.16em]
                text-ink
              "
            >
              {product.catalogNo}
            </span>
          </div>

          {/* Image marker */}
          <div
            className="
              absolute
              bottom-5
              right-5
              flex
              h-10
              w-10
              items-center
              justify-center
              border
              border-black/70
              bg-panel/80
              font-mono
              text-sm
              text-ink
            "
          >
            ↗
          </div>
        </div>

        {/* Product information */}
        <div className="flex flex-col">

          {/* Header */}
          <div className="border-b border-hairline p-6 sm:p-8 lg:p-10">

            <p className="font-mono text-[9px] uppercase tracking-[0.18em] text-ink-dim">
              {product.category} / {product.catalogNo}
            </p>

            <h1
              className="
                mt-5
                font-mono
                text-[clamp(2rem,5vw,4.5rem)]
                uppercase
                leading-[0.9]
                tracking-[-0.07em]
                text-ink
              "
            >
              {product.name}
            </h1>

            <p className="mt-6 font-mono text-base text-ink">
              {formatRWF(product.price)}
            </p>

          </div>

          {/* Description */}
          <div className="border-b border-hairline p-6 sm:p-8 lg:p-10">
            <p className="max-w-md text-sm leading-7 text-ink-dim">
              {product.description}
            </p>
          </div>

          {/* Specifications */}
          <div className="border-b border-hairline">

            <div className="grid grid-cols-2">

              <div className="border-r border-hairline p-6 sm:p-8">
                <dt className="font-mono text-[8px] uppercase tracking-[0.16em] text-ink-dim">
                  Material
                </dt>

                <dd className="mt-3 font-mono text-xs uppercase text-ink">
                  {product.material}
                </dd>
              </div>

              <div className="p-6 sm:p-8">
                <dt className="font-mono text-[8px] uppercase tracking-[0.16em] text-ink-dim">
                  Finish
                </dt>

                <dd className="mt-3 font-mono text-xs uppercase text-ink">
                  {product.finish}
                </dd>
              </div>

            </div>

          </div>

          {/* Order */}
          <div className="p-6 sm:p-8 lg:p-10">

            <div className="flex items-center justify-between">
              <span className="font-mono text-[9px] uppercase tracking-[0.16em] text-ink-dim">
                Quantity
              </span>

              <div className="flex items-center border border-hairline">

                <button
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  className="
                    flex
                    h-9
                    w-9
                    items-center
                    justify-center
                    font-mono
                    text-sm
                    text-ink-dim
                    transition-colors
                    hover:bg-ink
                    hover:text-panel
                  "
                  aria-label="Decrease quantity"
                >
                  −
                </button>

                <span className="flex h-9 w-10 items-center justify-center border-x border-hairline font-mono text-xs text-ink">
                  {quantity}
                </span>

                <button
                  onClick={() => setQuantity((q) => q + 1)}
                  className="
                    flex
                    h-9
                    w-9
                    items-center
                    justify-center
                    font-mono
                    text-sm
                    text-ink-dim
                    transition-colors
                    hover:bg-ink
                    hover:text-panel
                  "
                  aria-label="Increase quantity"
                >
                  +
                </button>

              </div>
            </div>

            {/* Add to cart */}
            <button
              onClick={handleAcquire}
              className="
                mt-6
                flex
                w-full
                items-center
                justify-between
                border
                border-ink
                bg-ink
                px-5
                py-4
                font-mono
                text-[10px]
                uppercase
                tracking-[0.16em]
                text-panel
                transition-all
                duration-200
                hover:bg-transparent
                hover:text-ink
              "
            >
              <span>
                {added ? 'Added to your order' : 'Add to your order'}
              </span>

              <ArrowUpRight size={15} aria-hidden="true" />
            </button>

            {/* Confirmation */}
            {added && (
              <div
                role="status"
                className="
                  mt-4
                  flex
                  items-center
                  justify-between
                  border
                  border-hairline
                  px-4
                  py-3
                "
              >
                <span className="font-mono text-[9px] uppercase tracking-[0.12em] text-ink-dim">
                  Object secured
                </span>

                <Link
                  href="/cart"
                  className="
                    font-mono
                    text-[9px]
                    uppercase
                    tracking-[0.12em]
                    text-ink
                    underline
                    underline-offset-4
                  "
                >
                  View cart →
                </Link>
              </div>
            )}

            <p className="mt-5 font-mono text-[8px] uppercase leading-relaxed tracking-[0.12em] text-ink-dim">
              Made to order / Produced locally / Kigali, Rwanda
            </p>

          </div>

        </div>

      </section>

      {/* Lower information strip */}
      <section className="grid border-b border-hairline sm:grid-cols-3">

        <div className="border-b border-hairline p-5 sm:border-b-0 sm:border-r">
          <p className="font-mono text-[8px] uppercase tracking-[0.16em] text-ink-dim">
            Object
          </p>
          <p className="mt-2 font-mono text-xs text-ink">
            {product.catalogNo}
          </p>
        </div>

        <div className="border-b border-hairline p-5 sm:border-b-0 sm:border-r">
          <p className="font-mono text-[8px] uppercase tracking-[0.16em] text-ink-dim">
            Production
          </p>
          <p className="mt-2 font-mono text-xs text-ink">
            Made to order
          </p>
        </div>

        <div className="p-5">
          <p className="font-mono text-[8px] uppercase tracking-[0.16em] text-ink-dim">
            Origin
          </p>
          <p className="mt-2 font-mono text-xs text-ink">
            Kigali / Rwanda
          </p>
        </div>

      </section>

    </main>
  )
}