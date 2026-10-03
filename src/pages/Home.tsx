import { Link } from 'wouter'
import { ArrowUpRight } from 'lucide-react'
import { Eyebrow } from '@/components/Eyebrow'
import { buttonClass } from '@/components/Button'
import { products } from '@/data/products'
import { formatRWF } from '@/lib/format'

const steps = [
  {
    n: '01',
    title: 'Tell us what you need',
    body: 'Have an idea, a reference, or an existing 3D file? Start with whatever you have.',
  },
  {
    n: '02',
    title: 'We work out the build',
    body: 'We check the geometry, material and print time, then send you the price and timeline.',
  },
  {
    n: '03',
    title: 'Made here in Kigali',
    body: 'Once approved, your piece goes into production. Collect it or arrange delivery.',
  },
]

export function Home() {
  const featured = products.slice(0, 3)

  return (
    <div>
      {/* HERO */}
      <section className="border-b border-hairline">
        <div className="mx-auto grid max-w-[1400px] gap-12 px-4 py-16 sm:px-6 md:grid-cols-[1.4fr_0.6fr] md:py-24 lg:gap-20 lg:px-8">
          <div>
            <p className="font-mono text-[9px] uppercase tracking-[0.2em] text-ink-dim">
              Kigali / Rwanda
            </p>

            <h1 className="mt-6 max-w-4xl font-mono text-[clamp(3rem,7vw,7rem)] uppercase leading-[0.86] tracking-[-0.07em] text-ink">
              Made in Kigali.
              <br />
              Built to be yours.
            </h1>

            <p className="mt-6 max-w-lg font-mono text-[11px] leading-relaxed text-ink-dim">
              3D-printed objects, architectural models, and custom fabrication,
              made locally in Kigali, one piece at a time.
            </p>

            <div className="mt-10 flex flex-wrap gap-3">
              <Link href="/shop" className={buttonClass('primary')}>
                Shop the collection
              </Link>

              <Link href="/custom-quote" className={buttonClass('secondary')}>
                Have an idea? Let's make it
              </Link>
            </div>
          </div>

          <div className="flex flex-col justify-end border-t border-hairline pt-6 md:border-l md:border-t-0 md:pl-8 md:pt-0">
            <p className="max-w-xs font-mono text-[11px] leading-relaxed text-ink-dim">
              Designed digitally.
              <br />
              Printed locally.
              <br />
              Made when ordered.
            </p>

            <div className="mt-10 grid grid-cols-2 border-t border-hairline pt-5">
              <div>
                <span className="font-mono text-[8px] uppercase tracking-[0.16em] text-ink-dim">
                  Based in
                </span>
                <p className="mt-2 font-mono text-[10px] uppercase text-ink">
                  Kigali, Rwanda
                </p>
              </div>

              <div>
                <span className="font-mono text-[8px] uppercase tracking-[0.16em] text-ink-dim">
                  Made to
                </span>
                <p className="mt-2 font-mono text-[10px] uppercase text-ink">
                  Order
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FEATURED COLLECTION */}
      <section className="mx-auto max-w-[1400px] px-4 py-20 sm:px-6 md:py-28 lg:px-8">
        <div className="flex items-end justify-between border-b border-hairline pb-5">
          <div>
            <Eyebrow>01 / The collection</Eyebrow>

            <h2 className="mt-3 font-mono text-2xl uppercase leading-none tracking-[-0.04em] text-ink md:text-4xl">
              Objects worth keeping.
            </h2>
          </div>

          <Link
            href="/shop"
            className="hidden font-mono text-[9px] uppercase tracking-[0.16em] text-ink-dim transition-colors hover:text-ink sm:block"
          >
            View all →
          </Link>
        </div>

        {/* THREE OBJECTS / CURATED RHYTHM */}
        <div className="mt-12 space-y-20 md:space-y-28">
          {featured.map((product, index) => {
            const hasImage = Boolean(product.imageUrl)
            const reversed = index === 1

            return (
              <Link
                key={product.id}
                href={`/shop/${product.slug}`}
                className="group block"
              >
                <article
                  className={`
                    grid
                    border-y
                    border-hairline
                    lg:grid-cols-[minmax(0,1.65fr)_minmax(280px,0.7fr)]
                    ${reversed ? 'lg:grid-cols-[minmax(280px,0.7fr)_minmax(0,1.65fr)]' : ''}
                  `}
                >
                  {/* PRODUCT IMAGE */}
                  <div
                    className={`
                      relative
                      aspect-[4/3]
                      overflow-hidden
                      bg-panel
                      ${reversed ? 'lg:order-2' : ''}
                    `}
                  >
                    {hasImage ? (
                      <img
                        src={product.imageUrl}
                        alt={product.name}
                        className="
                          h-full
                          w-full
                          object-cover
                          transition-transform
                          duration-700
                          ease-[cubic-bezier(0.22,1,0.36,1)]
                          group-hover:scale-[1.025]
                        "
                      />
                    ) : (
                      <div
                        className="
                          absolute
                          inset-0
                          transition-transform
                          duration-700
                          ease-[cubic-bezier(0.22,1,0.36,1)]
                          group-hover:scale-[1.025]
                        "
                        style={{ background: product.image }}
                      />
                    )}

                    <div className="absolute left-5 top-5 font-mono text-[8px] uppercase tracking-[0.16em] text-ink">
                      {product.category}
                    </div>

                    <div className="absolute bottom-5 right-5 flex h-9 w-9 items-center justify-center border border-ink bg-panel/80 font-mono text-sm text-ink transition-all duration-300 group-hover:bg-ink group-hover:text-panel">
                      ↗
                    </div>
                  </div>

                  {/* PRODUCT INFORMATION */}
                  <div
                    className={`
                      flex
                      min-h-[240px]
                      flex-col
                      justify-between
                      border-t
                      border-hairline
                      bg-void
                      p-6
                      sm:p-8
                      lg:min-h-0
                      lg:border-t-0
                      lg:p-10
                      ${reversed ? 'lg:order-1 lg:border-r' : 'lg:border-l'}
                    `}
                  >
                    <div>
                      <p className="font-mono text-[8px] uppercase tracking-[0.18em] text-ink-dim">
                        {product.catalogNo}
                      </p>

                      <h3 className="mt-5 font-mono text-[clamp(1.3rem,2.2vw,2rem)] uppercase leading-[0.95] tracking-[-0.05em] text-ink">
                        {product.name}
                      </h3>

                      <p className="mt-3 font-mono text-[8px] uppercase tracking-[0.16em] text-ink-dim">
                        Made to order
                      </p>
                    </div>

                    <div className="mt-12">
                      <div className="flex items-end justify-between border-b border-hairline pb-4">
                        <span className="font-mono text-[8px] uppercase tracking-[0.16em] text-ink-dim">
                          Object / {String(index + 1).padStart(3, '0')}
                        </span>

                        <span className="font-mono text-[11px] tracking-[-0.02em] text-ink">
                          {formatRWF(product.price)}
                        </span>
                      </div>

                      <div className="flex items-center justify-between pt-4">
                        <span className="font-mono text-[8px] uppercase tracking-[0.16em] text-ink-dim">
                          {product.material}
                        </span>

                        <span className="font-mono text-[8px] uppercase tracking-[0.16em] text-ink-dim transition-colors group-hover:text-ink">
                          View object{' '}
                          <ArrowUpRight
                            size={11}
                            className="ml-1 inline"
                            aria-hidden="true"
                          />
                        </span>
                      </div>
                    </div>
                  </div>
                </article>
              </Link>
            )
          })}
        </div>

        <div className="mt-10 flex justify-end">
          <Link
            href="/shop"
            className="font-mono text-[9px] uppercase tracking-[0.16em] text-ink-dim transition-colors hover:text-ink"
          >
            Explore all objects →
          </Link>
        </div>
      </section>

      {/* CUSTOM FABRICATION */}
      <section className="border-y border-hairline bg-panel">
        <div className="mx-auto grid max-w-[1400px] gap-12 px-4 py-20 sm:px-6 md:grid-cols-[0.7fr_1.3fr] md:py-24 lg:px-8">
          <div>
            <Eyebrow>02 / Custom fabrication</Eyebrow>

            <h2 className="mt-4 max-w-3xl font-mono text-[clamp(2.8rem,6vw,6rem)] uppercase leading-[0.88] tracking-[-0.07em] text-ink">
              Have something
              <br />
              in mind?
            </h2>

            <p className="mt-6 max-w-sm font-mono text-[11px] leading-relaxed text-ink-dim">
              You don't need a finished 3D model to get started. Send us the
              idea, dimensions, reference or file and we'll figure out the
              next step with you.
            </p>

            <Link
              href="/custom-quote"
              className="mt-8 inline-block font-mono text-[9px] uppercase tracking-[0.16em] text-ink underline underline-offset-4 transition-colors hover:text-signal"
            >
              Tell us about your project →
            </Link>
          </div>

          <div className="border-t border-hairline">
            {steps.map((step) => (
              <div
                key={step.n}
                className="grid gap-4 border-b border-hairline py-6 sm:grid-cols-[70px_1fr]"
              >
                <span className="font-mono text-[9px] text-ink-dim">
                  {step.n}
                </span>

                <div>
                  <h3 className="font-mono text-[12px] uppercase tracking-[0.08em] text-ink">
                    {step.title}
                  </h3>

                  <p className="mt-2 max-w-xl font-mono text-[10px] leading-relaxed text-ink-dim">
                    {step.body}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CLOSING STATEMENT */}
      <section className="mx-auto max-w-[1400px] px-4 py-20 sm:px-6 md:py-28 lg:px-8">
        <div className="border-t border-hairline pt-6">
          <Eyebrow>03 / Why Safehouse</Eyebrow>

          <div className="mt-8 grid gap-10 md:grid-cols-2">
            <h2 className="font-mono text-2xl uppercase leading-[0.95] tracking-[-0.05em] text-ink md:text-5xl">
              From a digital idea
              <br />
              to something you
              <br />
              can actually hold.
            </h2>

            <div className="flex items-end">
              <p className="max-w-md font-mono text-[11px] leading-relaxed text-ink-dim">
                Safehouse is a small fabrication studio built around making
                useful, personal and well-designed things locally. No mass
                production. No unnecessary middleman. Just an idea, a machine
                and a finished object.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}