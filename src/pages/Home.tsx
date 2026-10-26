import { useEffect, useState } from 'react'
import { Link } from 'wouter'
import { getProducts, type Product } from '@/data/products'
import { ScrollScrubHero } from '@/components/ScrollScrubHero'
import { ProductGallery } from '@/components/ProductGallery'
import { StudioAnswers } from '@/components/StudioAnswers'
import { DetailBand } from '@/components/DetailBand'
import { StudioTimelapse } from '@/components/StudioTimelapse'
import { SITE } from '@/lib/site'
import { usePageMeta } from '@/lib/pageMeta'

/** The three promises that answer the objections people arrive with. */
const promises = [
  {
    label: 'Made to order',
    body: 'Nothing is bought in and resold. Your piece goes on the machine after you order it.',
  },
  {
    label: `Ready in ${SITE.leadTime}`,
    body: 'You get the date before you pay, and we tell you the moment it comes off the bed.',
  },
  {
    label: 'Reprinted if wrong',
    body: 'Damaged or not what was agreed? Send a photo within seven days and we print it again.',
  },
]

const steps = [
  {
    n: '01',
    title: 'Tell us what you need',
    body: 'An idea, a photo, a sketch or a finished 3D file. Whatever you have is enough to start.',
    img: 'studio-sketch',
    alt: 'A notebook of pencil sketches with a caliper resting across the page.',
  },
  {
    n: '02',
    title: 'We work out the build',
    body: 'We check the geometry, pick the material and time the print, then send you one price and one date.',
    img: 'studio-bench',
    alt: 'A workbench by a window, printer running, filament and hand tools laid out.',
  },
  {
    n: '03',
    title: `Printed here in ${SITE.city}`,
    body: 'Once you approve it, your piece goes into production. Collect it from the studio or have it delivered.',
    img: 'studio-night',
    alt: 'The studio late in the evening, a single lamp over a running printer.',
  },
]

export function Home() {
  usePageMeta('', 'The Safehouse is a Kigali 3D printing studio. Wall art, figurines, tealight modules and custom parts, printed to order.')

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
      <ScrollScrubHero />

      {/* THE PROMISES */}
      <section className="border-b border-hairline">
        <div className="mx-auto grid max-w-[1320px] gap-px bg-hairline sm:grid-cols-3">
          {promises.map((p) => (
            <div key={p.label} className="bg-void px-6 py-10 sm:px-8">
              <p className="font-mono text-[12px] uppercase tracking-[0.14em] text-ink">
                {p.label}
              </p>
              <p className="mt-3 text-[15px] leading-relaxed text-ink-dim">{p.body}</p>
            </div>
          ))}
        </div>
      </section>

      <StudioTimelapse />

      <ProductGallery products={products} loading={loading} />

      <DetailBand />

      {/* HOW IT WORKS */}
      <section className="border-b border-hairline">
        <div className="mx-auto grid max-w-[1320px] gap-y-10 px-4 py-20 sm:px-6 md:grid-cols-3 md:py-32 lg:px-12">
          {steps.map((s) => (
            <div key={s.n} className="sh-in border-l border-hairline px-7 py-2">
              <img
                src={`/photo/${s.img}.jpg`}
                srcSet={`/photo/${s.img}-sm.jpg 800w, /photo/${s.img}.jpg 1600w`}
                sizes="(min-width: 768px) 33vw, 100vw"
                alt={s.alt}
                className="mb-6 aspect-[4/3] w-full border border-hairline object-cover"
                loading="lazy"
                decoding="async"
                width={1600}
                height={900}
              />
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

      <StudioAnswers />

      {/* WHERE THEY END UP */}
      <section className="border-b border-hairline">
        <div className="mx-auto grid max-w-[1320px] items-center gap-10 px-4 py-20 sm:px-6 md:py-28 lg:grid-cols-[1.15fr_0.85fr] lg:px-12">
          <img
            src="/photo/piece-at-home.jpg"
            srcSet="/photo/piece-at-home-sm.jpg 800w, /photo/piece-at-home.jpg 1600w"
            sizes="(min-width: 1024px) 55vw, 100vw"
            alt="A printed vessel on a sunlit windowsill beside a woven basket and a plant."
            className="sh-in w-full border border-hairline object-cover"
            loading="lazy"
            decoding="async"
            width={1600}
            height={900}
          />
          <div className="sh-in">
            <p className="font-mono text-xs uppercase tracking-[0.2em] text-ink-dim">
              Where they end up
            </p>
            <h2 className="mt-5 font-mono text-[clamp(1.9rem,4.2vw,3.4rem)] font-medium uppercase leading-[0.95] tracking-[-0.06em] text-ink">
              One of a run
              <br />
              of one.
            </h2>
            <p className="mt-5 max-w-sm text-base leading-relaxed text-ink-dim">
              Every piece leaves here made for the person who ordered it. No
              warehouse, no overstock, no two the same unless you ask for two.
            </p>
            <Link
              href="/shop"
              className="mt-7 inline-flex min-h-[48px] items-center border border-ink px-6 font-mono text-[12px] uppercase tracking-[0.12em] text-ink transition-colors hover:bg-ink hover:text-void"
            >
              See what is on the bed
            </Link>
          </div>
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
