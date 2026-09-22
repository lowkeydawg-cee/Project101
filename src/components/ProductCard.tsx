import { Link } from 'wouter'
import type { Product } from '@/data/products'
import { formatRWF } from '@/lib/format'

export function ProductCard({ product }: { product: Product }) {
  return (
    <Link
      href={`/shop/${product.slug}`}
      className="group flex flex-col overflow-hidden rounded-2xl border border-hairline bg-panel transition-colors hover:border-ink/30"
    >
      <div
        className="flex h-48 items-center justify-center text-[10px] text-ink-dim"
        style={{ background: product.image }}
        aria-hidden="true"
      >
        <span className="font-mono-label opacity-40">{product.catalogNo}</span>
      </div>
      <div className="flex flex-1 flex-col gap-1 p-4">
        <span className="font-mono-label text-[10px] uppercase text-signal-soft">
          {product.category}
        </span>
        <h3 className="font-display text-lg uppercase leading-snug text-ink">{product.name}</h3>
      </div>
      <div className="flex items-center justify-between border-t border-hairline p-4 pt-3">
        <span className="font-mono-label text-xs text-ink">{formatRWF(product.price)}</span>
        <span className="font-mono-label rounded-full bg-ink px-3 py-1.5 text-[10px] uppercase text-void transition-colors group-hover:bg-signal group-hover:text-ink">
          Acquire
        </span>
      </div>
    </Link>
  )
}
