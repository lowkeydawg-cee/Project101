import { Link } from 'wouter'
import { Eyebrow } from '@/components/Eyebrow'
import { buttonClass } from '@/components/Button'
import { ProductCard } from '@/components/ProductCard'
import { products } from '@/data/products'

const steps = [
  {
    n: '01',
    title: 'Describe or upload',
    body: 'Tell us what you need, or upload an STL file and preview it right in your browser.',
  },
  {
    n: '02',
    title: 'We quote it',
    body: 'We review geometry, material, and print time, then send back a price and timeline.',
  },
  {
    n: '03',
    title: 'Fabricate & collect',
    body: 'Once approved, your piece goes into the queue. Pickup or delivery within Kigali.',
  },
]

export function Home() {
  const featured = products.slice(0, 4)

  return (
    <div>
      <section className="mx-auto max-w-7xl px-6 pb-20 pt-16 md:pt-24">
        <div className="max-w-2xl">
          <Eyebrow>Kigali 3D Fabrication</Eyebrow>
          <h1 className="mt-4 font-display text-5xl uppercase leading-[1.05] text-ink md:text-6xl">
            Active Artifacts,
            <br />
            made to order.
          </h1>
          <p className="mt-6 max-w-md text-ink-dim">
            A small-batch storefront and a custom fabrication queue. Buy from the
            catalog, or bring your own model and we'll print it.
          </p>
          <div className="mt-8 flex flex-wrap gap-4">
            <Link href="/shop" className={buttonClass('primary')}>
              Browse Storefront
            </Link>
            <Link href="/custom" className={buttonClass('secondary')}>
              Request a Custom Piece
            </Link>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 pb-20">
        <div className="mb-8 flex items-end justify-between">
          <div>
            <Eyebrow>Featured</Eyebrow>
            <h2 className="mt-2 font-display text-2xl uppercase text-ink">Active Artifacts</h2>
          </div>
          <Link href="/shop" className="font-mono-label text-xs uppercase text-ink-dim hover:text-ink">
            View all
          </Link>
        </div>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-4">
          {featured.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      </section>

      <section className="border-t border-hairline bg-panel/40">
        <div className="mx-auto max-w-7xl px-6 py-20">
          <Eyebrow>Custom Orders</Eyebrow>
          <h2 className="mt-2 font-display text-2xl uppercase text-ink">How it works</h2>
          <div className="mt-10 grid gap-10 md:grid-cols-3">
            {steps.map((s) => (
              <div key={s.n}>
                <span className="font-mono-label text-signal-soft">{s.n}</span>
                <h3 className="mt-3 font-display text-xl uppercase text-ink">{s.title}</h3>
                <p className="mt-2 text-sm text-ink-dim">{s.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}
