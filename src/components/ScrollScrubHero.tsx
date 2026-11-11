import { useEffect, useRef, useState } from 'react'
import { Link } from 'wouter'
import { SITE } from '@/lib/site'

/**
 * The homepage hero.
 *
 * The section pins and the scroll becomes a camera on one piece: it comes out
 * of the dark in profile, turns to face the light, the view pushes in on the
 * print layers, then it settles on a shelf at home.
 *
 * It runs on three stills, not a video, so it is light enough to scrub on
 * phones as well as laptops. The shown position chases the scroll position
 * instead of snapping to it, so a flick reads as a sweep rather than a jump.
 * No animation library.
 *
 * Anyone who asked their device for less motion gets one still screen.
 *
 * SAINT: the three images are AI-made concept renders and the hero says so in
 * small print. When you have photos of a real printed piece, replace the files
 * in public/photo: quiet-side, quiet-front, quiet-home, each as .jpg (1920
 * wide), -sm.jpg (960 wide) and -tall.jpg (900 by 1080, for phones).
 * The old 3D-rendered print clip is still in git history and tools/hero.
 */

const VIEWS = {
  side: {
    src: '/photo/quiet-side',
    alt: 'A small matte black 3D printed figure seen from the side, sitting with its knees drawn up and its head bowed.',
  },
  front: {
    src: '/photo/quiet-front',
    alt: 'The same figure from the front, arms folded over its knees, print layers visible across the surface.',
  },
  home: {
    src: '/photo/quiet-home',
    alt: 'The figure on a wooden shelf beside two books, lit by a lamp.',
  },
} as const

const clamp = (n: number) => Math.min(1, Math.max(0, n))
/** 0 before `a`, 1 after `b`, eased in between. */
const ramp = (p: number, a: number, b: number) => {
  const t = clamp((p - a) / (b - a))
  return t * t * (3 - 2 * t)
}

function Still({ view, eager = false }: { view: keyof typeof VIEWS; eager?: boolean }) {
  const v = VIEWS[view]
  return (
    <picture>
      <source media="(max-width: 1023px)" srcSet={`${v.src}-tall.jpg`} />
      <img
        src={`${v.src}.jpg`}
        srcSet={`${v.src}-sm.jpg 960w, ${v.src}.jpg 1920w`}
        sizes="100vw"
        alt={v.alt}
        className="h-full w-full object-cover"
        loading={eager ? 'eager' : 'lazy'}
        fetchPriority={eager ? 'high' : 'auto'}
        decoding="async"
      />
    </picture>
  )
}

const beats: { lines: [string, string]; h1?: boolean }[] = [
  { lines: ['Nothing here', 'sits in stock.'], h1: true },
  { lines: ['It starts printing', 'when you order it.'] },
  { lines: ['Every layer', 'left showing.'] },
  { lines: ['In your hands', `in ${SITE.leadTime}.`] },
]

/** When each line of copy is on screen, as the scroll runs 0 to 1. */
const WINDOWS: [number, number][] = [
  [0, 0.2],
  [0.25, 0.42],
  [0.46, 0.64],
  [0.71, 1.01],
]

export function ScrollScrubHero() {
  const section = useRef<HTMLElement>(null)
  const side = useRef<HTMLDivElement>(null)
  const front = useRef<HTMLDivElement>(null)
  const home = useRef<HTMLDivElement>(null)
  const texts = useRef<(HTMLDivElement | null)[]>([])
  const rail = useRef<HTMLDivElement>(null)
  const hint = useRef<HTMLParagraphElement>(null)

  // Scrub by default so the first paint already has the right height.
  const [scrub, setScrub] = useState(true)

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) setScrub(false)
  }, [])

  useEffect(() => {
    const el = section.current
    if (!scrub || !el) return

    let target = 0
    let shown = 0
    let frame = 0
    let last = -1
    let wide = window.matchMedia('(min-width: 1024px)').matches

    // The site header is sticky and sits on top of the page, so the hero pins
    // just under it and is exactly as tall as the screen that is left.
    let hdr = 0
    const measure = () => {
      const h = document.querySelector('header')
      hdr = h ? Math.max(0, Math.round(h.getBoundingClientRect().bottom)) : 0
      el.style.setProperty('--hdr', `${hdr}px`)
    }

    const read = () => {
      const rect = el.getBoundingClientRect()
      const travel = rect.height - (window.innerHeight - hdr)
      target = travel <= 0 ? 0 : clamp((hdr - rect.top) / travel)
    }
    const resize = () => {
      wide = window.matchMedia('(min-width: 1024px)').matches
      measure()
      last = -1
      read()
    }

    const paint = (p: number) => {
      // 0.00 to 0.20  the profile comes out of the dark
      // 0.20 to 0.42  it turns to face the light
      // 0.42 to 0.66  the view pushes in on the layers
      // 0.66 to 1.00  it settles on the shelf
      const emerge = 0.55 + 0.45 * ramp(p, 0, 0.16)
      const turn = ramp(p, 0.22, 0.4)
      const push = ramp(p, 0.42, 0.62)
      const settle = ramp(p, 0.66, 0.82)

      if (side.current) {
        side.current.style.opacity = String(emerge * (1 - turn))
        side.current.style.transform = `scale(${1.1 - 0.1 * ramp(p, 0, 0.2) + 0.04 * turn})`
      }
      if (front.current) {
        front.current.style.opacity = String(turn * (1 - settle))
        front.current.style.transformOrigin = wide ? '26% 30%' : '50% 42%'
        front.current.style.transform = `scale(${1 + (wide ? 0.6 : 0.5) * push})`
      }
      if (home.current) {
        home.current.style.opacity = String(settle)
        home.current.style.transform = `scale(${1.1 - 0.1 * ramp(p, 0.66, 1)})`
      }

      WINDOWS.forEach(([a, b], i) => {
        const node = texts.current[i]
        if (!node) return
        const fadeIn = i === 0 ? 1 : ramp(p, a, a + 0.06)
        const fadeOut = i === WINDOWS.length - 1 ? 1 : 1 - ramp(p, b - 0.05, b)
        node.style.opacity = String(fadeIn * fadeOut)
        node.style.transform = i === 0 ? '' : `translateY(${(1 - ramp(p, a, a + 0.08)) * 16}px)`
      })
      if (rail.current) rail.current.style.transform = `scaleY(${p})`
      if (hint.current) hint.current.style.opacity = String(1 - ramp(p, 0.02, 0.1))
    }

    const tick = () => {
      shown += (target - shown) * 0.12
      if (Math.abs(target - shown) < 0.0004) shown = target
      if (shown !== last) {
        paint(shown)
        last = shown
      }
      frame = requestAnimationFrame(tick)
    }

    measure()
    read()
    shown = target
    paint(shown)
    last = shown

    window.addEventListener('scroll', read, { passive: true })
    window.addEventListener('resize', resize)
    frame = requestAnimationFrame(tick)

    return () => {
      cancelAnimationFrame(frame)
      window.removeEventListener('scroll', read)
      window.removeEventListener('resize', resize)
    }
  }, [scrub])

  const layer = 'absolute inset-0 will-change-transform'

  return (
    <section
      ref={section}
      className={`relative border-b border-hairline ${scrub ? 'h-[340svh] lg:h-[380vh]' : ''}`}
    >
      <div
        className={`${scrub ? 'sticky top-[var(--hdr,80px)]' : 'relative'} flex h-[calc(100svh-var(--hdr,80px))] min-h-[520px] flex-col overflow-hidden bg-[#0b0b0a] lg:flex-row lg:items-center`}
      >
        {/* The piece. On phones it sits in the lower part of the screen so the
            whole figure fits. On wide screens it fills the frame. */}
        <div className="absolute inset-x-0 bottom-0 aspect-[5/6] max-h-[70svh] overflow-hidden max-lg:[mask-image:linear-gradient(to_bottom,transparent_1.5%,black_30%)] lg:inset-0 lg:aspect-auto lg:max-h-none">
          <div ref={side} className={layer} style={{ opacity: scrub ? 0.55 : 0 }}>
            <Still view="side" eager />
          </div>
          <div ref={front} className={layer} style={{ opacity: scrub ? 0 : 1 }}>
            <Still view="front" eager={!scrub} />
          </div>
          <div ref={home} className={layer} style={{ opacity: 0 }}>
            <Still view="home" />
          </div>

          {/* phones: blend the top of the image into the black above it, and
              darken the bottom so the buttons stay readable */}
          <div
            aria-hidden="true"
            className="absolute inset-0 lg:hidden"
            style={{
              background:
                'linear-gradient(to bottom, rgba(11,11,10,1) 0%, rgba(11,11,10,1) 4%, rgba(11,11,10,0) 34%, rgba(11,11,10,0) 62%, rgba(11,11,10,0.88) 100%)',
            }}
          />
          <div aria-hidden="true" className="absolute inset-x-0 top-0 h-1 bg-[#0b0b0a] lg:hidden" />
          {/* wide screens: a side wash keeps the words readable on the left */}
          <div
            aria-hidden="true"
            className="absolute inset-0 hidden lg:block"
            style={{
              background:
                'linear-gradient(to right, rgba(11,11,10,0.94) 0%, rgba(11,11,10,0.80) 30%, rgba(11,11,10,0.30) 50%, rgba(11,11,10,0) 66%)',
            }}
          />
        </div>

        {/* progress rail */}
        {scrub && (
          <div aria-hidden="true" className="absolute left-0 top-0 h-full w-px bg-[#a4a29b]/20">
            <div
              ref={rail}
              className="h-full w-px origin-top bg-[#f2f1eb]"
              style={{ transform: 'scaleY(0)' }}
            />
          </div>
        )}

        {/* the words */}
        <div className="relative mx-auto flex w-full max-w-[1320px] flex-1 flex-col px-4 pb-5 pt-8 sm:px-6 lg:flex-none lg:px-12 lg:py-16">
          <p className="font-mono text-xs uppercase tracking-[0.2em] text-[#a4a29b]">
            {SITE.city} / {SITE.country}
          </p>

          <div className="relative mt-5 h-[120px] sm:h-[150px] lg:mt-6 lg:h-[200px] lg:max-w-[62%]">
            {beats.map((b, i) => {
              const Tag = b.h1 ? 'h1' : 'h2'
              return (
                <div
                  key={b.lines[0]}
                  ref={(node) => {
                    texts.current[i] = node
                  }}
                  className="absolute inset-x-0 top-0"
                  style={{ opacity: i === 0 ? 1 : 0 }}
                >
                  <Tag className="font-mono text-[clamp(1.9rem,4.3vw,4.1rem)] font-medium uppercase leading-[0.9] tracking-[-0.07em] text-[#f2f1eb]">
                    {b.lines[0]}
                    <br />
                    <span className="text-[#a4a29b]">{b.lines[1]}</span>
                  </Tag>
                </div>
              )
            })}
          </div>

          <div className="mt-auto lg:mt-10">
            <div className="flex gap-3 lg:flex-wrap lg:gap-6">
              <Link
                href="/shop"
                className="sh-btn inline-flex min-h-[52px] flex-1 items-center justify-center bg-[#f2f1eb] px-4 text-center font-mono text-[12px] font-medium uppercase tracking-[0.1em] text-[#0b0b0a] transition-opacity hover:opacity-85 lg:flex-none lg:px-7 lg:text-[13px] lg:tracking-[0.12em]"
              >
                Browse the pieces
              </Link>
              <Link
                href="/custom-quote"
                className="sh-btn inline-flex min-h-[52px] flex-1 items-center justify-center border border-[#a4a29b] bg-[#0b0b0a]/50 px-4 text-center font-mono text-[12px] font-medium uppercase tracking-[0.1em] text-[#f2f1eb] transition-colors hover:bg-[#f2f1eb] hover:text-[#0b0b0a] lg:flex-none lg:px-7 lg:text-[13px] lg:tracking-[0.12em]"
              >
                Print my own design
              </Link>
            </div>

            <div className="mt-4 flex flex-wrap items-center justify-between gap-x-8 gap-y-2 lg:mt-10 lg:justify-start">
              {scrub && (
                <p
                  ref={hint}
                  className="font-mono text-[11px] uppercase tracking-[0.18em] text-[#a4a29b]"
                >
                  Scroll to turn it <span className="sh-blink">▌</span>
                </p>
              )}
              <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-[#a4a29b]/70">
                Concept piece. Images are renders.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
