import { useEffect, useRef, useState } from 'react'
import { Link } from 'wouter'

/**
 * The signature piece scene.
 *
 * On a laptop or desktop the section pins and the scroll becomes a camera:
 * the piece comes out of the dark in profile, turns to face the light, the
 * view pushes in on the print layers, then it settles on a shelf at home.
 *
 * It runs on three stills, not a video, so it costs about 250 KB and the
 * same scroll loop as the hero drives it. No animation library.
 *
 * Phones, small screens and anyone who asked for less motion get the same
 * three views as a plain vertical sequence.
 *
 * SAINT: these three images are AI-made concept renders, and the section says
 * so. When you have photos of a real printed piece, replace the three files in
 * public/photo (quiet-side, quiet-front, quiet-home, plus the -sm versions).
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
    alt: 'The figure on a wooden shelf beside two books and a cup, lit by a lamp.',
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
    <img
      src={`${v.src}.jpg`}
      srcSet={`${v.src}-sm.jpg 960w, ${v.src}.jpg 1920w`}
      sizes="100vw"
      alt={v.alt}
      className="h-full w-full object-cover"
      loading={eager ? 'eager' : 'lazy'}
      decoding="async"
      width={1920}
      height={1080}
    />
  )
}

const beats = [
  {
    kicker: 'Signature piece',
    title: ['The', 'Quiet One.'],
    body: 'A seated figure, about 18 cm tall, built one thin layer at a time.',
  },
  {
    kicker: 'The form',
    title: ['Turned to', 'the light.'],
    body: 'No face and no detail to hide behind. Just the curve of a back and folded arms.',
  },
  {
    kicker: 'The surface',
    title: ['Every layer', 'left showing.'],
    body: 'We do not sand the lines away. They are how you know it was printed, not cast.',
  },
  {
    kicker: 'At home',
    title: ['Made for', 'one shelf.'],
    body: 'Pick the size and the colour. We print yours after you ask for it.',
  },
]

function Cta() {
  return (
    <div>
      <Link
        href="/custom-quote"
        className="sh-btn inline-flex min-h-[52px] items-center bg-[#f2f1eb] px-7 font-mono text-[13px] font-medium uppercase tracking-[0.12em] text-[#0b0b0a] transition-opacity hover:opacity-85"
      >
        Request this piece
      </Link>
      <p className="mt-5 max-w-xs font-mono text-[10px] uppercase leading-relaxed tracking-[0.16em] text-[#a4a29b]">
        Concept piece. Images are renders, not photos of a finished print.
      </p>
    </div>
  )
}

export function SignaturePiece() {
  const section = useRef<HTMLElement>(null)
  const side = useRef<HTMLDivElement>(null)
  const front = useRef<HTMLDivElement>(null)
  const home = useRef<HTMLDivElement>(null)
  const texts = useRef<(HTMLDivElement | null)[]>([])
  const cta = useRef<HTMLDivElement>(null)
  const rail = useRef<HTMLDivElement>(null)

  const [scrub, setScrub] = useState(false)

  useEffect(() => {
    const big = window.matchMedia('(min-width: 1024px)').matches
    const calm = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    setScrub(big && !calm)
  }, [])

  useEffect(() => {
    const el = section.current
    if (!scrub || !el) return

    let target = 0
    let shown = 0
    let frame = 0
    let last = -1

    const read = () => {
      const rect = el.getBoundingClientRect()
      const travel = rect.height - window.innerHeight
      target = travel <= 0 ? 0 : clamp(-rect.top / travel)
    }

    const paint = (p: number) => {
      // 0.00 to 0.20  the profile comes out of the dark
      // 0.20 to 0.42  it turns to face the light
      // 0.42 to 0.66  the view pushes in on the layers
      // 0.66 to 1.00  it settles on the shelf
      const emerge = ramp(p, 0.02, 0.2)
      const turn = ramp(p, 0.22, 0.4)
      const push = ramp(p, 0.42, 0.62)
      const settle = ramp(p, 0.66, 0.82)

      if (side.current) {
        side.current.style.opacity = String(emerge * (1 - turn))
        side.current.style.transform = `scale(${1.08 - 0.08 * emerge + 0.04 * turn})`
      }
      if (front.current) {
        front.current.style.opacity = String(turn * (1 - settle))
        front.current.style.transform = `scale(${1 + 0.6 * push})`
      }
      if (home.current) {
        home.current.style.opacity = String(settle)
        home.current.style.transform = `scale(${1.1 - 0.1 * ramp(p, 0.66, 1)})`
      }

      const windows: [number, number][] = [
        [0.04, 0.22],
        [0.26, 0.42],
        [0.46, 0.64],
        [0.72, 1.01],
      ]
      windows.forEach(([a, b], i) => {
        const node = texts.current[i]
        if (!node) return
        const o = ramp(p, a, a + 0.06) * (i === 3 ? 1 : 1 - ramp(p, b - 0.05, b))
        node.style.opacity = String(o)
        node.style.transform = `translateY(${(1 - ramp(p, a, a + 0.08)) * 18}px)`
      })
      if (cta.current) {
        const o = ramp(p, 0.8, 0.88)
        cta.current.style.opacity = String(o)
        cta.current.style.pointerEvents = o > 0.5 ? 'auto' : 'none'
      }
      if (rail.current) rail.current.style.transform = `scaleY(${p})`
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

    read()
    shown = target
    paint(shown)
    last = shown

    window.addEventListener('scroll', read, { passive: true })
    window.addEventListener('resize', read)
    frame = requestAnimationFrame(tick)

    return () => {
      cancelAnimationFrame(frame)
      window.removeEventListener('scroll', read)
      window.removeEventListener('resize', read)
    }
  }, [scrub])

  // Phones, small screens, reduced motion: the same story, top to bottom.
  if (!scrub) {
    const order: (keyof typeof VIEWS)[] = ['side', 'front', 'home']
    const copy = [beats[0], beats[2], beats[3]]
    return (
      <section className="border-b border-hairline bg-[#0b0b0a] text-[#f2f1eb]">
        {order.map((view, i) => (
          <div key={view} className="sh-in">
            <div className="aspect-[4/3] overflow-hidden sm:aspect-[16/9]">
              <Still view={view} />
            </div>
            <div className="mx-auto max-w-[1320px] px-4 pb-14 pt-8 sm:px-6">
              <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-[#a4a29b]">
                {copy[i].kicker}
              </p>
              <h2 className="mt-4 font-mono text-[clamp(2rem,8vw,3rem)] font-medium uppercase leading-[0.92] tracking-[-0.06em]">
                {copy[i].title[0]}
                <br />
                <span className="text-[#a4a29b]">{copy[i].title[1]}</span>
              </h2>
              <p className="mt-4 max-w-md text-base leading-relaxed text-[#a4a29b]">{copy[i].body}</p>
              {i === 2 && (
                <div className="mt-8">
                  <Cta />
                </div>
              )}
            </div>
          </div>
        ))}
      </section>
    )
  }

  return (
    <section
      ref={section}
      className="relative border-b border-hairline"
      style={{ height: '380vh' }}
      aria-label="Signature piece: The Quiet One"
    >
      <div className="sticky top-0 flex h-screen items-center overflow-hidden bg-[#0b0b0a]">
        <div ref={side} className="absolute inset-0 will-change-transform" style={{ opacity: 0 }}>
          <Still view="side" eager />
        </div>
        <div
          ref={front}
          className="absolute inset-0 will-change-transform"
          style={{ opacity: 0, transformOrigin: '26% 30%' }}
        >
          <Still view="front" />
        </div>
        <div ref={home} className="absolute inset-0 will-change-transform" style={{ opacity: 0 }}>
          <Still view="home" />
        </div>

        {/* keeps the words readable in the left lane */}
        <div
          aria-hidden="true"
          className="absolute inset-0"
          style={{
            background:
              'linear-gradient(to right, rgba(11,11,10,0.94) 0%, rgba(11,11,10,0.80) 30%, rgba(11,11,10,0.30) 50%, rgba(11,11,10,0) 66%)',
          }}
        />

        <div aria-hidden="true" className="absolute left-0 top-0 h-full w-px bg-[#a4a29b]/20">
          <div ref={rail} className="h-full w-px origin-top bg-[#f2f1eb]" style={{ transform: 'scaleY(0)' }} />
        </div>

        <div className="relative mx-auto w-full max-w-[1320px] px-12">
          <div className="relative h-[340px] max-w-[42%]">
            {beats.map((b, i) => (
              <div
                key={b.kicker}
                ref={(node) => {
                  texts.current[i] = node
                }}
                className="absolute inset-x-0 top-0"
                style={{ opacity: 0 }}
              >
                <p className="font-mono text-xs uppercase tracking-[0.2em] text-[#a4a29b]">{b.kicker}</p>
                <h2 className="mt-5 font-mono text-[clamp(2rem,4.3vw,4.1rem)] font-medium uppercase leading-[0.92] tracking-[-0.06em] text-[#f2f1eb]">
                  {b.title[0]}
                  <br />
                  <span className="text-[#a4a29b]">{b.title[1]}</span>
                </h2>
                <p className="mt-5 max-w-sm text-base leading-relaxed text-[#a4a29b]">{b.body}</p>
              </div>
            ))}
          </div>
          <div ref={cta} className="mt-4" style={{ opacity: 0, pointerEvents: 'none' }}>
            <Cta />
          </div>
        </div>
      </div>
    </section>
  )
}
