import { useState } from 'react'
import { products } from '../data/products'
import { ProductCard } from '../components/ProductCard'

export function Shop() {
  const [active, setActive] = useState<string | null>(null)

  const categories = Array.from(
    new Set(products.map((product) => product.category))
  )

  const filtered = active
    ? products.filter((product) => product.category === active)
    : products

  const getCategoryClass = (isActive: boolean) => {
    const base =
      'shrink-0 rounded-full border px-4 py-2 font-mono text-[11px] uppercase tracking-wider transition-all duration-200 ease-out'

    if (isActive) {
      return `${base} border-signal bg-signal text-void shadow-[0_0_18px_rgba(255,255,255,0.08)]`
    }

    return `${base} border-hairline bg-transparent text-ink-dim hover:border-ink hover:bg-ink/5 hover:text-ink active:scale-95`
  }

  return (
    <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6 sm:py-14 lg:px-8 lg:py-20">

      {/* Header */}
      <section>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="mb-3 font-mono text-[10px] uppercase tracking-[0.25em] text-ink-dim">
              Collection / 001
            </p>

            <h1 className="max-w-3xl font-mono text-3xl uppercase leading-tight tracking-tight text-ink sm:text-4xl lg:text-5xl">
              Active Artifacts,
              <br className="hidden sm:block" />
              Made to Order.
            </h1>
          </div>

          <p className="max-w-xs font-mono text-xs leading-relaxed text-ink-dim">
            Objects designed digitally,
            printed locally, and made when ordered.
          </p>
        </div>
      </section>

      {/* Category filters */}
      <div className="mt-8 border-y border-hairline py-4 sm:mt-10">
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
          <button
            onClick={() => setActive(null)}
            className={getCategoryClass(active === null)}
          >
            All
          </button>

          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setActive(category)}
              className={getCategoryClass(active === category)}
            >
              {category}
            </button>
          ))}
        </div>
      </div>

      {/* Result count */}
      <div className="mt-6 flex items-center justify-between">
        <p className="font-mono text-[10px] uppercase tracking-widest text-ink-dim">
          {filtered.length} {filtered.length === 1 ? 'artifact' : 'artifacts'}
        </p>

        {active && (
          <button
            onClick={() => setActive(null)}
            className="font-mono text-[10px] uppercase tracking-widest text-ink-dim transition-colors hover:text-ink"
          >
            Clear filter ×
          </button>
        )}
      </div>

      {/* Products */}
      {filtered.length > 0 ? (
        <div className="mt-6 grid grid-cols-2 gap-3 sm:mt-8 sm:grid-cols-2 sm:gap-5 lg:grid-cols-3 lg:gap-6">
          {filtered.map((product, index) => (
            <div
              key={product.id}
              className="animate-[fadeIn_0.4s_ease-out_both]"
              style={{
                animationDelay: `${Math.min(index * 50, 300)}ms`,
              }}
            >
              <ProductCard product={product} />
            </div>
          ))}
        </div>
      ) : (
        <div className="flex min-h-[280px] items-center justify-center">
          <div className="text-center">
            <p className="font-mono text-sm uppercase text-ink">
              No artifacts found
            </p>
            <p className="mt-2 font-mono text-xs text-ink-dim">
              Try another category.
            </p>
          </div>
        </div>
      )}
    </main>
  )
}