import { useState } from 'react'
import { products } from '../data/products'
import { ProductCard } from '../components/ProductCard'

export function Shop() {
  const [active, setActive] = useState<string | null>(null)
  const categories = Array.from(new Set(products.map((p) => p.category)))
  const filtered = active ? products.filter((p) => p.category === active) : products

  return (
    <div className="mx-auto max-w-7xl px-6 py-16">
      <h1 className="mt-2 font-mono text-4xl uppercase text-ink">
        Active Artifacts, Made to Order.
      </h1>
      <div className="mt-8 flex flex-wrap gap-3">
        <button
          onClick={() => setActive(null)}
          className={`font-mono border px-4 py-2 uppercase ${
            active === null
              ? 'border-signal bg-signal text-void font-bold'
              : 'border-hairline text-ink-dim hover:text-ink hover:border-ink'
          }`}
        >
          All
        </button>
        {categories.map((c) => (
          <button
            key={c}
            onClick={() => setActive(c)}
            className={`font-mono border px-4 py-2 uppercase ${
              active === c
                ? 'border-signal bg-signal text-void font-bold'
                : 'border-hairline text-ink-dim hover:text-ink hover:border-ink'
            }`}
          >
            {c}
          </button>
        ))}
      </div>

      <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((p) => (
          <ProductCard key={p.id} product={p} />
        ))}
      </div>

      {filtered.length === 0 && (
        <p className="mt-16 text-center text-ink-dim font-mono">No artifacts found in this category.</p>
      )}
    </div>
  )
}