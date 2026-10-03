import { Link } from 'wouter'
import { ArrowLeft, ArrowUpRight, Minus, Plus, X } from 'lucide-react'
import { useCart } from '@/context/CartContext'
import { formatRWF } from '@/lib/format'
import { buttonClass } from '@/components/Button'
export function Cart() {
  const { lines, removeItem, setQuantity, subtotal } = useCart()

  if (lines.length === 0) {
    return (
      <main className="mx-auto max-w-[1400px] px-4 py-10 sm:px-6 sm:py-16 lg:px-8 lg:py-20">

        <section className="border-y border-hairline py-20 sm:py-28">
          <div className="max-w-2xl">

            <p className="font-mono text-[9px] uppercase tracking-[0.2em] text-ink-dim">
              Your selection / 000
            </p>

            <h1
              className="
                mt-6
                max-w-xl
                font-mono
                text-[clamp(3rem,8vw,7rem)]
                uppercase
                leading-[0.85]
                tracking-[-0.07em]
                text-ink
              "
            >
              Nothing
              <br />
              here yet.
            </h1>

            <p className="mt-8 max-w-sm font-mono text-xs leading-relaxed text-ink-dim">
              Your cart is currently empty. Explore the collection and find
              something worth making.
            </p>

            <Link
              href="/shop"
              className={`${buttonClass('primary')} mt-8 inline-flex items-center gap-3`}
            >
             Browse the pieces
              <ArrowUpRight size={14} aria-hidden="true" />
            </Link>

          </div>
        </section>

      </main>
    )
  }

  return (
    <main className="mx-auto max-w-[1400px] px-4 py-10 sm:px-6 sm:py-16 lg:px-8 lg:py-20">

      {/* Header */}
      <section className="border-y border-hairline py-10 sm:py-14">

        <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">

          <div>
            <p className="font-mono text-[9px] uppercase tracking-[0.2em] text-ink-dim">
              Selection / {String(lines.length).padStart(2, '0')}
            </p>

            <h1
              className="
                mt-5
                font-mono
                text-[clamp(3rem,7vw,6rem)]
                uppercase
                leading-[0.86]
                tracking-[-0.07em]
                text-ink
              "
            >
              Your
              <br />
              selection.
            </h1>
          </div>

          <Link
            href="/shop"
            className="
              inline-flex
              items-center
              gap-2
              self-start
              font-mono
              text-[9px]
              uppercase
              tracking-[0.16em]
              text-ink-dim
              transition-colors
              hover:text-ink
              sm:self-end
            "
          >
            <ArrowLeft size={12} aria-hidden="true" />
           Keep looking
          </Link>

        </div>

      </section>

      {/* Cart contents */}
      <section className="mt-8">

        <div className="grid gap-10 lg:grid-cols-[1fr_360px] lg:gap-16">

          {/* Items */}
          <div>

            <div className="flex items-center justify-between border-b border-hairline pb-4">
              <p className="font-mono text-[9px] uppercase tracking-[0.16em] text-ink-dim">
                Objects
              </p>

              <p className="font-mono text-[9px] uppercase tracking-[0.16em] text-ink-dim">
                Made to order
              </p>
            </div>

            <div className="divide-y divide-hairline">

              {lines.map(({ product, quantity }) => {
                const hasImage = Boolean(product.image) && product.image.startsWith('http')

                return (
                  <article
                    key={product.id}
                    className="grid gap-5 py-7 sm:grid-cols-[180px_1fr] sm:gap-6"
                  >

                    {/* Product image */}
                    <Link
                      href={`/shop/${product.slug}`}
                      className="
                        group
                        block
                        aspect-square
                        overflow-hidden
                        border
                        border-hairline
                        bg-panel
                      "
                      aria-label={`View ${product.name}`}
                    >
                      {hasImage ? (
                        <img
                          src={product.image}
                          alt={product.name}
                          className="
                            h-full
                            w-full
                            object-cover
                            transition-transform
                            duration-500
                            ease-out
                            group-hover:scale-[1.03]
                          "
                        />
                      ) : (
                        <div
                          className="
                            h-full
                            w-full
                            transition-transform
                            duration-500
                            ease-out
                            group-hover:scale-[1.03]
                          "
                          style={{ background: product.image }}
                        />
                      )}
                    </Link>

                    {/* Product information */}
                    <div className="flex min-w-0 flex-col justify-between gap-6">

                      <div>

                        <div className="flex items-start justify-between gap-4">

                          <div>
                            <p className="font-mono text-[9px] uppercase tracking-[0.16em] text-ink-dim">
                              {product.category}
                            </p>

                            <Link
                              href={`/shop/${product.slug}`}
                              className="
                                mt-2
                                block
                                font-mono
                                text-xl
                                uppercase
                                leading-tight
                                tracking-[-0.03em]
                                text-ink
                                transition-opacity
                                hover:opacity-60
                              "
                            >
                              {product.name}
                            </Link>
                          </div>

                          <button
                            onClick={() => removeItem(product.id)}
                            aria-label={`Remove ${product.name} from cart`}
                            className="
                              shrink-0
                              p-1
                              text-ink-dim
                              transition-colors
                              hover:text-ink
                            "
                          >
                            <X size={16} strokeWidth={1.5} />
                          </button>

                        </div>

                        <p className="mt-3 font-mono text-xs text-ink-dim">
                          {formatRWF(product.price)} / piece
                        </p>

                      </div>

                      <div className="flex items-end justify-between gap-4">

                        {/* Quantity */}
                        <div>
                          <p className="mb-2 font-mono text-[8px] uppercase tracking-[0.16em] text-ink-dim">
                            Quantity
                          </p>

                          <div className="flex h-9 items-center border border-hairline">

                            <button
                              onClick={() =>
                                setQuantity(product.id, quantity - 1)
                              }
                              className="
                                flex
                                h-full
                                w-9
                                items-center
                                justify-center
                                text-ink-dim
                                transition-colors
                                hover:bg-ink
                                hover:text-panel
                              "
                              aria-label={`Decrease quantity of ${product.name}`}
                            >
                              <Minus size={12} />
                            </button>

                            <span className="flex h-full w-9 items-center justify-center border-x border-hairline font-mono text-[10px] text-ink">
                              {quantity}
                            </span>

                            <button
                              onClick={() =>
                                setQuantity(product.id, quantity + 1)
                              }
                              className="
                                flex
                                h-full
                                w-9
                                items-center
                                justify-center
                                text-ink-dim
                                transition-colors
                                hover:bg-ink
                                hover:text-panel
                              "
                              aria-label={`Increase quantity of ${product.name}`}
                            >
                              <Plus size={12} />
                            </button>

                          </div>
                        </div>

                        {/* Line total */}
                        <div className="text-right">
                          <p className="font-mono text-[8px] uppercase tracking-[0.16em] text-ink-dim">
                            Total
                          </p>

                          <p className="mt-1 font-mono text-sm text-ink">
                            {formatRWF(product.price * quantity)}
                          </p>
                        </div>

                      </div>

                    </div>

                  </article>
                )
              })}

            </div>

          </div>

          {/* Summary */}
          <aside className="lg:sticky lg:top-24 lg:self-start">

            <div className="border border-hairline">

              <div className="border-b border-hairline p-5 sm:p-6">

                <p className="font-mono text-[9px] uppercase tracking-[0.16em] text-ink-dim">
                  Order summary
                </p>

                <div className="mt-6 flex items-end justify-between gap-4">

                  <span className="font-mono text-xs uppercase text-ink-dim">
                    Subtotal
                  </span>

                  <span className="font-mono text-xl tracking-[-0.03em] text-ink">
                    {formatRWF(subtotal)}
                  </span>

                </div>

              </div>

              <div className="p-5 sm:p-6">

                <div className="space-y-4 font-mono text-[9px] uppercase tracking-[0.12em]">

                  <div className="flex justify-between gap-4">
                    <span className="text-ink-dim">Production</span>
                    <span className="text-ink">Made to order</span>
                  </div>

                  <div className="flex justify-between gap-4">
                    <span className="text-ink-dim">Origin</span>
                    <span className="text-ink">Kigali / Rwanda</span>
                  </div>

                  <div className="flex justify-between gap-4">
                    <span className="text-ink-dim">Payment</span>
                    <span className="text-ink">Coming soon</span>
                  </div>

                </div>

                <Link
                  href="/checkout"
                  className="
                    mt-8
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
                  <span>Proceed to checkout</span>
                  <ArrowUpRight size={15} aria-hidden="true" />
                </Link>

                <Link
                  href="/contact"
                  className="
                    mt-3
                    flex
                    w-full
                    items-center
                    justify-between
                    border
                    border-hairline
                    px-4
                    py-3
                    font-mono
                    text-[9px]
                    uppercase
                    tracking-[0.14em]
                    text-ink-dim
                    transition-colors
                    hover:border-ink
                    hover:text-ink
                  "
                >
                  Talk to the maker
                  <ArrowUpRight size={13} aria-hidden="true" />
                </Link>

              </div>

            </div>

            <p className="mt-4 font-mono text-[8px] uppercase leading-relaxed tracking-[0.12em] text-ink-dim">
              Every piece is produced after your order is confirmed.
              Pickup and delivery details can be arranged directly.
            </p>

          </aside>

        </div>

      </section>

    </main>
  )
}