import { useEffect, useState } from 'react'
import { Link } from 'wouter'
import { getProducts, type Product } from '@/data/products'
import { PrintHeadHero } from '@/components/PrintHeadHero'
import { StudioTimelapse } from '@/components/StudioTimelapse'
import { ProductGallery } from '@/components/ProductGallery'

const steps = [
  {
    n: '01',
    title: 'Tell us what you need',
    body: 'Have an idea, a reference or an existing 3D file? Start with whatever you have.',
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
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let active = true
    getProducts().then((data) => {
      if (!active) return
      setProducts(data)
      setLoading(false)
    })
    return () => {
      active = false
    }
  }, [])

  return (
    <div>
      <PrintHeadHero />

      <StudioTimelapse />

      <ProductGallery products={products} loading={loading} />

      {/* HOW IT WORKS */}
      <section className="border-b border-hairline">
        <div className="mx-auto grid max-w-[1320px] gap-y-10 px-4 py-20 sm:px-6 md:grid-cols-3 md:py-32 lg:px-12">
          {steps.map((s) => (
            <div key={s.n} className="sh-in border-l border-hairline px-7 py-2">
              <div className="font-mono text-xs uppercase tracking-[0.16em] text-ink-dim">
                Step {s.n}
              </div>
              <div className="mt-4 font-mono text-[22px] font-medium uppercase tracking-[-0.03em] text-ink">
                {s.title}
              </div>
              <div className="mt-2.5 text-base leading-relaxed text-ink-dim">{s.body}</div>
            </div>
          ))}
        </div>
      </section>

      {/* CUSTOM QUOTE */}
      <section className="bg-ink text-void">
        <div className="sh-in mx-auto flex max-w-[1320px] flex-wrap items-end justify-between gap-8 px-4 py-16 sm:px-6 md:py-24 lg:px-12">
          <h2 className="font-mono text-[clamp(2.25rem,5.4vw,5rem)] font-medium uppercase leading-[0.9] tracking-[-0.07em]">
            Have something
            <br />
            in mind?
          </h2>
          <Link
            href="/custom-quote"
            className="inline-flex min-h-[52px] items-center bg-void px-7 font-mono text-[13px] font-medium uppercase tracking-[0.12em] text-ink transition-opacity hover:opacity-85"
          >
            Start a custom quote
          </Link>
        </div>
      </section>
    </div>
  )
}
