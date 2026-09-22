import { useState } from 'react'
import { ProductCard } from '@/components/ProductCard'
import { products, categories } from '@/data/products'

export function Shop() {
  const [active, setActive] = useState<string | null>(null)
  const filtered = active ? products.filter((p) => p.category === active) : products

  return (
    <div className="mx-auto max-w-7xl px-6 py-16">
      
      <h1 className="mt-2 font-display text-4xl uppercase text-ink">Active Artifacts</h1>

      <div className="mt-8 flex flex-wrap gap-3">
        <button
          onClick={() => setActive(null)}
          className={`font-mono-label rounded-full border px-4 py-2 text-[11px] uppercase transition-colors ${
            active === null
              ? 'border-signal bg-signal text-ink'
              : 'border-ink/20 text-ink-dim hover:text-ink'
          }`}
        >
          All
        </button>
        {categories.map((c) => (
          <button
            key={c}
            onClick={() => setActive(c)}
            className={`font-mono-label rounded-full border px-4 py-2 text-[11px] uppercase transition-colors ${
              active === c
                ? 'border-signal bg-signal text-ink'
                : 'border-ink/20 text-ink-dim hover:text-ink'
            }`}
          >
            {c}
          </button>
        ))}
      </div>

      <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-4">
        {filtered.map((p) => (
          <ProductCard key={p.id} product={p} />
        ))}
      </div>

      {filtered.length === 0 && (
        <p className="mt-16 text-center text-ink-dim">No artifacts in this category yet.</p>
      )}
    </div>
  )
}
