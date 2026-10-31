import { useEffect, useRef, useState } from 'react'
import { Link } from 'wouter'
import { SITE } from '@/lib/site'

/**
 * The homepage hero.
 *
 * Scrolling down plays the print forward. Scrolling up un-prints it. The
 * video never plays on its own: the scroll position is the playhead.
 *
 * How it stays smooth:
 *  - the clip is fetched once as a Blob so seeking never waits on the network
 *  - the shown time chases the scroll target instead of snapping to it, so a
 *    flick of the wheel reads as a sweep rather than a jump
 *  - only one seek is ever in flight, so a fast scroll cannot pile up
 *  - the file is encoded with every frame a keyframe, so any seek is instant
 *
 * Phones, small screens and anyone who asked for less motion get the finished
 * piece as a still. No video is downloaded in that case.
 */

const CLIP = '/hero-build.mp4'
const CLIP_FALLBACK = '/hero-build.webm'
const POSTER = '/hero-poster.jpg'
const POSTER_PORTRAIT = '/hero-poster-mobile.jpg'

/** Every current browser plays the MP4. WebM covers the rare build that cannot. */
function pickClip(): string {
  if (typeof document === 'undefined') return CLIP
  const probe = document.createElement('video')
  if (probe.canPlayType('video/mp4; codecs="avc1.42E01E"')) return CLIP
  if (probe.canPlayType('video/webm; codecs="vp9"')) return CLIP_FALLBACK
  return CLIP
}

/**
 * Visibility curve for one caption beat, as the scroll runs 0 to 1.
 * A beat that starts at the very top is already on screen, so it does not
 * fade in. A beat marked `hold` stays up once it arrives.
 */
function beat(p: number, from: number, to: number, hold = false) {
  const fade = 0.1
  const clamp = (n: number) => Math.min(1, Math.max(0, n))

  if (p < from) return 0
  if (from > 0 && p < from + fade) return clamp((p - from) / fade)
  if (hold || p < to - fade) return 1
  if (p < to) return clamp((to - p) / fade)
  return 0
}

export function ScrollScrubHero() {
  const section = useRef<HTMLElement>(null)
  const video = useRef<HTMLVideoElement>(null)
  const b1 = useRef<HTMLDivElement>(null)
  const b2 = useRef<HTMLDivElement>(null)
  const b3 = useRef<HTMLDivElement>(null)
  const rail = useRef<HTMLDivElement>(null)

  const [scrub, setScrub] = useState(false)
  const [loaded, setLoaded] = useState(false)

  // Decide once whether this visitor gets the scrubbing version.
  useEffect(() => {
    const big = window.matchMedia('(min-width: 1024px)').matches
    const fine = window.matchMedia('(hover: hover)').matches
    const calm = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    setScrub(big && fine && !calm)
  }, [])

  // Pull the clip down in one piece so seeks are local.
  useEffect(() => {
    if (!scrub) return
    let url: string | null = null
    let cancelled = false

    fetch(pickClip())
      .then((r) => (r.ok ? r.blob() : Promise.reject(new Error(String(r.status)))))
      .then((blob) => {
        if (cancelled || !video.current) return
        url = URL.createObjectURL(blob)
        video.current.src = url
      })
      .catch(() => {
        // Keep the poster. The page still works.
      })

    return () => {
      cancelled = true
      if (url) URL.revokeObjectURL(url)
    }
  }, [scrub])

  // The scroll loop. Writes straight to the DOM so React never re-renders here.
  useEffect(() => {
    const el = section.current
    if (!el) return

    let target = 0
    let shown = 0
    let seeking = false
    let frame = 0

    const v = video.current

    const onSeeked = () => {
      seeking = false
    }
    v?.addEventListener('seeked', onSeeked)

    const read = () => {
      const rect = el.getBoundingClientRect()
      const travel = rect.height - window.innerHeight
      target = travel <= 0 ? 0 : Math.min(1, Math.max(0, -rect.top / travel))
    }

    const paint = (p: number) => {
      if (b1.current) b1.current.style.opacity = String(beat(p, 0, 0.34))
      if (b2.current) b2.current.style.opacity = String(beat(p, 0.34, 0.7))
      if (b3.current) b3.current.style.opacity = String(beat(p, 0.72, 1, true))
      if (rail.current) rail.current.style.transform = `scaleY(${p})`
    }

    const tick = () => {
      // chase, do not snap
      shown += (target - shown) * 0.14
      if (Math.abs(target - shown) < 0.0004) shown = target

      paint(shown)

      if (scrub && v && v.readyState >= 1 && v.duration) {
        const want = shown * (v.duration - 0.03)
        if (!seeking && Math.abs(want - v.currentTime) > 1 / 60) {
          seeking = true
          v.currentTime = want
        }
      }

      frame = requestAnimationFrame(tick)
    }

    read()
    shown = target
    paint(shown)

    window.addEventListener('scroll', read, { passive: true })
    window.addEventListener('resize', read)
    frame = requestAnimationFrame(tick)

    return () => {
      cancelAnimationFrame(frame)
      window.removeEventListener('scroll', read)
      window.removeEventListener('resize', read)
      v?.removeEventListener('seeked', onSeeked)
    }
  }, [scrub])

  return (
    <section
      ref={section}
      className="relative border-b border-hairline"
      style={{ height: scrub ? '340vh' : undefined }}
    >
      <div
        className={`${scrub ? 'sticky top-0 h-screen' : ''} flex items-center overflow-hidden bg-[#0b0b0a]`}
      >
        {/* the print, or the finished piece */}
        <div className="absolute inset-0">
          {/* Phones get a portrait crop framed on the piece. A wide frame
              letterboxed into a tall screen loses the object entirely. */}
          <picture>
            <source media="(min-width: 1024px)" srcSet={POSTER} />
            <source media="(orientation: portrait)" srcSet={POSTER_PORTRAIT} />
            <img
              src={POSTER}
              alt="A twisted tealight module, 3D printed in the Safehouse studio in Kigali."
              className={`h-full w-full object-cover transition-opacity duration-700 ${
                loaded ? 'opacity-0' : 'opacity-100'
              }`}
            />
          </picture>
          {scrub && (
            <video
              ref={video}
              className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-700 ${
                loaded ? 'opacity-100' : 'opacity-0'
              }`}
              muted
              playsInline
              preload="auto"
              tabIndex={-1}
              aria-hidden="true"
              onLoadedData={() => setLoaded(true)}
            />
          )}
          {/* Keeps the words readable over the bright piece. Wide screens get a
              side wash so the object stays clean on the right; narrow screens
              have no room for that, so they get a top-down wash instead. */}
          <div
            aria-hidden="true"
            className="absolute inset-0 lg:hidden"
            style={{
              background:
                'linear-gradient(to bottom, rgba(11,11,10,0.93) 0%, rgba(11,11,10,0.76) 24%, rgba(11,11,10,0.10) 50%, rgba(11,11,10,0.18) 76%, rgba(11,11,10,0.58) 100%)',
            }}
          />
          <div
            aria-hidden="true"
            className="absolute inset-0 hidden lg:block"
            style={{
              background:
                'linear-gradient(to right, rgba(11,11,10,0.95) 0%, rgba(11,11,10,0.86) 34%, rgba(11,11,10,0.55) 58%, rgba(11,11,10,0) 80%)',
            }}
          />
        </div>

        {/* progress rail, the only moving decoration */}
        {scrub && (
          <div
            aria-hidden="true"
            className="absolute left-0 top-0 hidden h-full w-px bg-[#a4a29b]/20 lg:block"
          >
            <div
              ref={rail}
              className="h-full w-px origin-top bg-[#f2f1eb]"
              style={{ transform: 'scaleY(0)' }}
            />
          </div>
        )}

        {/* the words, in the clear lane on the left */}
        <div className="relative mx-auto w-full max-w-[1320px] px-4 py-24 sm:px-6 lg:px-12">
          <p className="font-mono text-xs uppercase tracking-[0.2em] text-[#a4a29b]">
            {SITE.city} / {SITE.country}
          </p>

          <div className="relative mt-6 lg:h-[300px] lg:max-w-[57%]">
            <div ref={b1} className="lg:absolute lg:inset-x-0 lg:top-0">
              <h1 className="font-mono text-[clamp(2.4rem,5.2vw,5rem)] font-medium uppercase leading-[0.88] tracking-[-0.07em] text-[#f2f1eb]">
                Nothing here
                <br />
                <span className="text-[#a4a29b]">sits on a shelf.</span>
              </h1>
            </div>

            <div ref={b2} className="mt-8 lg:absolute lg:inset-x-0 lg:top-0 lg:mt-0 lg:opacity-0">
              <h2 className="font-mono text-[clamp(2rem,4.3vw,4.1rem)] font-medium uppercase leading-[0.92] tracking-[-0.06em] text-[#f2f1eb]">
                It starts printing
                <br />
                <span className="text-[#a4a29b]">when you order it.</span>
              </h2>
            </div>

            <div ref={b3} className="mt-8 lg:absolute lg:inset-x-0 lg:top-0 lg:mt-0 lg:opacity-0">
              <h2 className="font-mono text-[clamp(2rem,4.3vw,4.1rem)] font-medium uppercase leading-[0.92] tracking-[-0.06em] text-[#f2f1eb]">
                In your hands
                <br />
                <span className="text-[#a4a29b]">in {SITE.leadTime}.</span>
              </h2>
            </div>
          </div>

          <div className="mt-10 flex flex-wrap items-center gap-6 lg:mt-14">
            <Link
              href="/shop"
              className="sh-btn inline-flex min-h-[52px] items-center bg-[#f2f1eb] px-7 font-mono text-[13px] font-medium uppercase tracking-[0.12em] text-[#0b0b0a] transition-opacity hover:opacity-85"
            >
              Browse the pieces
            </Link>
            <Link
              href="/custom-quote"
              className="sh-btn inline-flex min-h-[52px] items-center border border-[#a4a29b] px-7 font-mono text-[13px] font-medium uppercase tracking-[0.12em] text-[#f2f1eb] transition-colors hover:bg-[#f2f1eb] hover:text-[#0b0b0a]"
            >
              Print my own design
            </Link>
          </div>

          {scrub && (
            <p className="mt-12 font-mono text-[11px] uppercase tracking-[0.18em] text-[#a4a29b]">
              Scroll to print <span className="sh-blink">▌</span>
            </p>
          )}
        </div>
      </div>
    </section>
  )
}
