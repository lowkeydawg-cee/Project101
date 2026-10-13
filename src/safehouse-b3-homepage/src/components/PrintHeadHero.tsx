import { useEffect, useState, type PointerEvent } from 'react'
import { Link } from 'wouter'

// Bambu Lab A1 build plate is 256 × 256 mm — the readout maps the hero to it.
const BED_MM = 256

/**
 * Homepage hero with a print-head crosshair.
 * - Mouse: the head follows the pointer.
 * - Touch screens: the head makes slow automatic passes; a tap moves it there.
 * - Reduced motion: the head stays still.
 */
export function PrintHeadHero() {
  const [pos, setPos] = useState({ x: 72, y: 38 })
  const [active, setActive] = useState(false)
  const [auto, setAuto] = useState(false)

  useEffect(() => {
    const touch = window.matchMedia('(hover: none)').matches
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    setAuto(touch && !reduced)
  }, [])

  function moveTo(e: PointerEvent<HTMLElement>) {
    const r = e.currentTarget.getBoundingClientRect()
    setPos({
      x: Math.max(0, Math.min(100, ((e.clientX - r.left) / r.width) * 100)),
      y: Math.max(0, Math.min(100, ((e.clientY - r.top) / r.height) * 100)),
    })
  }

  function onMove(e: PointerEvent<HTMLElement>) {
    if (e.pointerType !== 'mouse') return
    setActive(true)
    moveTo(e)
  }

  function onTap(e: PointerEvent<HTMLElement>) {
    if (e.pointerType === 'mouse') return
    setAuto(false)
    setActive(true)
    moveTo(e)
  }

  const lineTone = active ? 'bg-stone' : 'bg-hairline'

  return (
    <section
      onPointerMove={onMove}
      onPointerLeave={() => setActive(false)}
      onPointerDown={onTap}
      className={`relative overflow-hidden border-b border-hairline sm:cursor-crosshair ${auto ? 'ph-auto' : ''}`}
    >
      <div aria-hidden="true" className="pointer-events-none absolute inset-0">
        {/* vertical axis + head travel together along X */}
        <div className="ph-col absolute bottom-0 top-0" style={auto ? undefined : { left: `${pos.x}%` }}>
          <div className={`absolute bottom-0 top-0 w-px transition-colors duration-300 ${lineTone}`} />
          <div
            className={`ph-head absolute -ml-[7px] -mt-[7px] h-3.5 w-3.5 border border-ink transition-colors duration-200 ${active || auto ? 'bg-ink' : 'bg-transparent'}`}
            style={auto ? undefined : { top: `${pos.y}%` }}
          />
          {!auto && (
            <div
              className="absolute ml-3.5 mt-3 whitespace-nowrap font-mono text-[11px] tracking-[0.12em] text-ink-dim"
              style={{ top: `${pos.y}%` }}
            >
              X {((pos.x / 100) * BED_MM).toFixed(1)} · Y {((pos.y / 100) * BED_MM).toFixed(1)} mm
            </div>
          )}
        </div>
        <div
          className={`ph-row absolute left-0 right-0 h-px transition-colors duration-300 ${lineTone}`}
          style={auto ? undefined : { top: `${pos.y}%` }}
        />
      </div>

      <div className="relative mx-auto max-w-[1320px] px-4 pb-20 pt-24 sm:px-6 md:pb-36 md:pt-48 lg:px-12">
        <p className="sh-up d1 mb-7 font-mono text-xs uppercase tracking-[0.2em] text-ink-dim">
          Kigali / Rwanda <span className="sh-blink text-ink">▌</span>
        </p>
        <h1 className="max-w-[1100px] font-mono text-[clamp(3.1rem,8.4vw,8.5rem)] font-medium uppercase leading-[0.88] tracking-[-0.07em] text-ink">
          <span className="sh-up d2 block">Move the head.</span>
          <span className="sh-up d3 block text-ink-dim">We print the rest.</span>
        </h1>
        <div className="sh-up d4 mt-11 flex flex-wrap items-center gap-7">
          <Link
            href="/shop"
            className="inline-flex min-h-[52px] items-center bg-ink px-7 font-mono text-[13px] font-medium uppercase tracking-[0.12em] text-void transition-opacity hover:opacity-85"
          >
            Browse the pieces
          </Link>
          <p className="max-w-[380px] text-base leading-relaxed text-ink-dim">
            3D-printed objects and custom parts, made to order in our Kigali studio.
          </p>
        </div>
      </div>
    </section>
  )
}
