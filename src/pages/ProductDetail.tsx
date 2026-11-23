import { useState, useEffect, type FormEvent } from 'react'
import { useParams, Link, useLocation } from 'wouter'
import { ArrowLeft, ArrowUpRight } from 'lucide-react'
import {
  getProductBySlug,
  isPreviewImage,
  type Personalisation,
  type Product,
} from '@/data/products'
import { MediaSlider, type SlideItem } from '@/components/MediaSlider'
import { formatRWF } from '@/lib/format'
import { useCart } from '@/context/CartContext'
import { SITE } from '@/lib/site'
import { usePageMeta } from '@/lib/pageMeta'

export function ProductDetail() {
  const { slug } = useParams()
  const [, navigate] = useLocation()
  const [product, setProduct] = useState<Product | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!slug) return
    let active = true
    getProductBySlug(slug).then((data) => {
      if (!active) return
      setProduct(data)
      setLoading(false)
    })
    return () => { active = false }
  }, [slug])

  const { addItem } = useCart()
  const [quantity, setQuantity] = useState(1)
  const [added, setAdded] = useState(false)
  const [personalValues, setPersonalValues] = useState<Personalisation>({})

  usePageMeta(
    product?.name ?? 'Piece',
    product
      ? `${product.name}. ${product.description || `${product.material}, 3D printed to order in ${SITE.city}.`} Ready in ${SITE.leadTime}.`
      : undefined
  )

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

  const handleAcquire = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    // The browser has already enforced required + maxLength; trim and cap again
    // so pasted whitespace or odd input never reaches the cart.
    const values: Personalisation = {}
    for (const field of product.personalise) {
      const v = (personalValues[field.key] ?? '').trim().slice(0, field.max)
      if (v) values[field.key] = v
    }
    addItem(product, quantity, values)
    setAdded(true)
  }

  const slides: SlideItem[] = []
  if (product.glbUrl) slides.push({ type: 'model', src: product.glbUrl })
  for (const url of product.gallery) {
    if (url?.startsWith('http')) slides.push({ type: 'image', src: url, alt: product.name })
  }

  const fallbackBackground =
    !product.image.startsWith('http') && product.image ? product.image : undefined

  const preview = product.gallery.some(url => url && isPreviewImage(url))

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

        {/* Media slider */}
        <div className="border-b border-hairline lg:border-b-0 lg:border-r">
          <MediaSlider
            slides={slides}
            productName={product.name}
            catalogNo={product.catalogNo}
            fallbackBackground={fallbackBackground}
          />
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
            {preview && (
              <p className="mt-5 max-w-md border-l border-hairline pl-4 font-mono text-[10px] uppercase leading-5 tracking-[0.12em] text-ink-dim">
                The picture is a preview render. Your piece is printed to order,
                so colour and finish can differ slightly.
              </p>
            )}
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
          <form onSubmit={handleAcquire} className="p-6 sm:p-8 lg:p-10">

            {/* Personalisation, one input per field the product defines */}
            {product.personalise.length > 0 && (
              <fieldset className="mb-6 flex flex-col gap-4">
                <legend className="mb-4 font-mono text-[9px] uppercase tracking-[0.16em] text-ink-dim">
                  Make it yours
                </legend>
                {product.personalise.map((field) => {
                  const id = `personalise-${field.key}`
                  const value = personalValues[field.key] ?? ''
                  return (
                    <div key={field.key}>
                      <div className="mb-2 flex items-baseline justify-between gap-4">
                        <label
                          htmlFor={id}
                          className="font-mono text-[10px] uppercase tracking-[0.14em] text-ink"
                        >
                          {field.label}
                          {!field.required && (
                            <span className="text-ink-dim"> (optional)</span>
                          )}
                        </label>
                        <span
                          aria-hidden="true"
                          className="font-mono text-[9px] tabular-nums text-ink-dim"
                        >
                          {value.length}/{field.max}
                        </span>
                      </div>
                      <input
                        id={id}
                        name={field.key}
                        type="text"
                        autoComplete="off"
                        maxLength={field.max}
                        required={field.required}
                        value={value}
                        onChange={(e) => {
                          setPersonalValues((v) => ({ ...v, [field.key]: e.target.value }))
                          setAdded(false)
                        }}
                        className="w-full border border-hairline bg-transparent px-3 py-3 text-sm text-ink outline-none placeholder:text-ink-dim focus:border-ink"
                      />
                    </div>
                  )
                })}
              </fieldset>
            )}

            <div className="flex items-center justify-between">
              <span className="font-mono text-[9px] uppercase tracking-[0.16em] text-ink-dim">
                Quantity
              </span>

              <div className="flex items-center border border-hairline">

                <button
                  type="button"
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
                  type="button"
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
              type="submit"
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

            {/* The three things people want to know before they commit. */}
            <dl className="mt-6 border-t border-hairline">
              {[
                ['Ready in', `${SITE.leadTime} from order`],
                ['Collection', `Free from the studio in ${SITE.city}`],
                ['Delivery', `${formatRWF(SITE.deliveryFee)} inside ${SITE.city}`],
                ['If it arrives wrong', 'We reprint it, free, within 7 days'],
              ].map(([k, v]) => (
                <div
                  key={k}
                  className="flex items-baseline justify-between gap-4 border-b border-hairline py-2.5"
                >
                  <dt className="font-mono text-[10px] uppercase tracking-[0.14em] text-ink-dim">
                    {k}
                  </dt>
                  <dd className="text-right font-mono text-[11px] text-ink">{v}</dd>
                </div>
              ))}
            </dl>

            <p className="mt-5 font-mono text-[9px] uppercase leading-relaxed tracking-[0.12em] text-ink-dim">
              Made to order / Printed in {SITE.city}, {SITE.country}
            </p>

          </form>

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