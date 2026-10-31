import { setStyle, useUi, type UiStyle } from '@/lib/uiStyle'

const OPTIONS: { value: UiStyle; label: string }[] = [
  { value: 'minimal', label: 'Minimal' },
  { value: 'glass', label: 'Glass' },
]

/** Lets each visitor pick the look of the site. The choice is remembered on their device. */
export function StyleSwitch({ className = '' }: { className?: string }) {
  const { style } = useUi()

  return (
    <div
      role="radiogroup"
      aria-label="Site style"
      className={`sh-seg flex items-center border border-hairline p-0.5 ${className}`}
    >
      {OPTIONS.map((o) => {
        const active = style === o.value
        return (
          <button
            key={o.value}
            type="button"
            role="radio"
            aria-checked={active}
            onClick={() => setStyle(o.value)}
            className={`sh-seg-btn px-3 py-1.5 font-mono-label text-[10px] uppercase transition-colors duration-200 ${
              active ? 'bg-ink text-void' : 'text-ink-dim hover:text-ink'
            }`}
          >
            {o.label}
          </button>
        )
      })}
    </div>
  )
}
