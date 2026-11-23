import type { Personalisation, PersonaliseField } from '@/data/products'

/**
 * Shows what the customer typed for a line ("Name / Amani Uwase").
 * Labels come from the product's fields when known, otherwise the raw key.
 */
export function PersonalisationSummary({
  values,
  fields,
  className = '',
}: {
  values?: Personalisation | null
  fields?: PersonaliseField[]
  className?: string
}) {
  const entries = values ? Object.entries(values).filter(([, v]) => v) : []
  if (entries.length === 0) return null

  // Product field order first, then anything left over.
  const order = (fields ?? []).map((f) => f.key)
  entries.sort(([a], [b]) => {
    const ia = order.indexOf(a)
    const ib = order.indexOf(b)
    return (ia === -1 ? 999 : ia) - (ib === -1 ? 999 : ib)
  })

  return (
    <dl className={`border-l border-hairline pl-3 ${className}`}>
      {entries.map(([key, value]) => (
        <div key={key} className="flex flex-wrap gap-x-2 font-mono text-[10px] leading-5">
          <dt className="uppercase tracking-[0.12em] text-ink-dim">
            {fields?.find((f) => f.key === key)?.label ??
              (key.startsWith('colour_') ? `${key.slice(7).replace(/^./, (c) => c.toUpperCase())} colour` : key)} /
          </dt>
          <dd className="break-all text-ink">{value}</dd>
        </div>
      ))}
    </dl>
  )
}
