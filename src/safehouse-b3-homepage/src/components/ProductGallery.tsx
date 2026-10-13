import { Link } from 'wouter'
import { hasProductImage, type Product } from '@/data/products'
import { formatRWF } from '@/lib/format'

/**
 * Sideways product row on the grey band. On wide screens, scrolling down
 * slides it sideways (see .sh-gallery in index.css); on phones it's a
 * normal swipe row.
 */
export function ProductGallery({
  products,
  loading,
}: {
  products: Product[]
  loading: boolean
}) {
  return (
    <section id="gallery" className="sh-gallery bg-stone text-[#0b0b0a]">
      <div className="sh-sticky py-16 md:py-20">
        <div className="mx-auto box-border flex w-full max-w-[1320px] flex-wrap items-end justify-between gap-4 px-4 pb-8 sm:px-6 lg:px-12">
          <h2 className="font-mono text-[clamp(2rem,4.6vw,4rem)] font-medium uppercase leading-[0.95] tracking-[-0.06em]">
            Off the print bed
          </h2>
          <Link
            href="/shop"
            className="font-mono text-xs uppercase tracking-[0.14em] text-[#0b0b0a] underline underline-offset-4"
          >
            View all →
          </Link>
        </div>

        <div className="sh-track-wrap px-4 sm:px-6 lg:px-12">
          {loading ? (
            <p className="font-mono text-xs uppercase tracking-[0.14em]">Loading pieces...</p>
          ) : products.length === 0 ? (
            <p className="font-mono text-xs uppercase tracking-[0.14em]">New pieces are on the way.</p>
          ) : (
            <div className="sh-track flex w-max gap-6 pb-2">
              {products.map((p) => (
                <Link
                  key={p.id}
                  href={`/shop/${p.slug}`}
                  className="sh-tile block w-[clamp(240px,28vw,400px)] flex-none text-[#0b0b0a]"
                >
                  <div className="sh-photo flex aspect-[4/5] items-center justify-center overflow-hidden border border-[#0b0b0a] p-5 text-center font-mono text-[11px] uppercase tracking-[0.14em]">
                    {hasProductImage(p) ? (
                      <img src={p.image} alt={p.name} className="h-full w-full object-cover" loading="lazy" />
                    ) : (
                      'Photo coming soon'
                    )}
                  </div>
                  <div className="mt-4 flex justify-between gap-3">
                    <span className="font-mono text-[17px] font-medium uppercase tracking-[-0.03em]">{p.name}</span>
                    <span className="whitespace-nowrap font-mono text-[13px]">{formatRWF(p.price)}</span>
                  </div>
                  <div className="mt-1.5 font-mono text-[11px] uppercase tracking-[0.14em]">
                    {[p.catalogNo, p.material].filter(Boolean).join(' · ')}
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  )
}
