import { Link } from 'wouter'
import { Eyebrow } from '@/components/Eyebrow'
import { buttonClass } from '@/components/Button'
import { ProductCard } from '@/components/ProductCard'
import { products } from '@/data/products'

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
  const featured = products.slice(0, 4)

  return (
    <div>
      {/* HERO */}
      <section className="border-b border-hairline">
        <div className="mx-auto grid max-w-7xl gap-12 px-6 py-16 md:grid-cols-[1.4fr_0.6fr] md:py-24 lg:gap-20">
          <div>
            <Eyebrow>Kigali / Small-Batch Fabrication</Eyebrow>

            <h1 className="mt-6 max-w-4xl font-display text-5xl leading-[0.98] tracking-tight text-ink sm:text-6xl md:text-7xl lg:text-8xl">
              Made in Kigali.
              <br />
              Built to be yours.
            </h1>

            <p className="mt-8 max-w-xl text-base leading-7 text-ink-dim md:text-lg">
              3D-printed objects, architectural models and functional parts,
              made locally in small batches — or built from your own idea.
            </p>

            <div className="mt-10 flex flex-wrap gap-3">
              <Link href="/shop" className={buttonClass('primary')}>
                Shop the collection
              </Link>

              <Link href="/custom" className={buttonClass('secondary')}>
                Start a custom build
              </Link>
            </div>
          </div>

          <div className="flex flex-col justify-end border-t border-hairline pt-6 md:border-l md:border-t-0 md:pl-8 md:pt-0">
            <p className="max-w-xs text-sm leading-6 text-ink-dim">
              Designed digitally.
              <br />
              Printed locally.
              <br />
              Made when ordered.
            </p>

            <div className="mt-10 grid grid-cols-2 border-t border-hairline pt-5 text-xs">
              <div>
                <span className="font-mono-label text-ink-dim">BASED IN</span>
                <p className="mt-2 text-ink">Kigali, Rwanda</p>
              </div>

              <div>
                <span className="font-mono-label text-ink-dim">MADE TO</span>
                <p className="mt-2 text-ink">Order</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FEATURED WORK */}
      <section className="mx-auto max-w-7xl px-6 py-20 md:py-28">
        <div className="flex items-end justify-between border-b border-hairline pb-5">
          <div>
            <Eyebrow>01 / The collection</Eyebrow>

            <h2 className="mt-3 font-display text-3xl leading-tight text-ink md:text-4xl">
              Objects worth keeping.
            </h2>
          </div>

          <Link
            href="/shop"
            className="hidden text-sm text-ink-dim transition-colors hover:text-ink sm:block"
          >
            View all →
          </Link>
        </div>

        <div className="mt-8 grid grid-cols-1 gap-x-5 gap-y-12 sm:grid-cols-2 lg:grid-cols-4">
          {featured.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>

        <Link
          href="/shop"
          className="mt-10 block text-sm text-ink-dim transition-colors hover:text-ink sm:hidden"
        >
          View the full collection →
        </Link>
      </section>

      {/* CUSTOM FABRICATION */}
      <section className="border-y border-hairline bg-panel">
        <div className="mx-auto grid max-w-7xl gap-12 px-6 py-20 md:grid-cols-[0.7fr_1.3fr] md:py-24">
          <div>
            <Eyebrow>02 / Custom fabrication</Eyebrow>

            <h2 className="mt-4 max-w-md font-display text-3xl leading-tight text-ink md:text-5xl">
              Have something
              <br />
              in mind?
            </h2>

            <p className="mt-6 max-w-sm text-sm leading-6 text-ink-dim">
              You don't need a finished 3D model to get started. Send us the
              idea, dimensions, reference or file and we'll figure out the
              next step with you.
            </p>

            <Link
              href="/custom"
              className="mt-8 inline-block text-sm text-ink underline underline-offset-4 transition-colors hover:text-signal"
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
                <span className="font-mono-label text-xs text-ink-dim">
                  {step.n}
                </span>

                <div>
                  <h3 className="text-lg font-medium text-ink">
                    {step.title}
                  </h3>

                  <p className="mt-2 max-w-xl text-sm leading-6 text-ink-dim">
                    {step.body}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CLOSING STATEMENT */}
      <section className="mx-auto max-w-7xl px-6 py-20 md:py-28">
        <div className="border-t border-hairline pt-6">
          <Eyebrow>03 / Why Safehouse</Eyebrow>

          <div className="mt-8 grid gap-10 md:grid-cols-2">
            <h2 className="font-display text-3xl leading-tight text-ink md:text-5xl">
              From a digital idea
              <br />
              to something you
              <br />
              can actually hold.
            </h2>

            <div className="flex items-end">
              <p className="max-w-md text-sm leading-7 text-ink-dim">
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

