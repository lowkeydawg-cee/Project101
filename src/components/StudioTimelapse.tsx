import { useState } from 'react'

/**
 * A looping black-and-white time-lapse of the real printer at work. This is
 * the strongest proof on the site: it shows the studio exists.
 *
 * SAINT: record 10 to 20 seconds of a print running, save it as
 * public/studio-timelapse.mp4 (muted, under about 8 MB) and this section
 * appears on the homepage by itself. Until that file exists the section
 * renders nothing at all, so the page never shows an empty box.
 */
const VIDEO_SRC = '/studio-timelapse.mp4'

export function StudioTimelapse() {
  const [missing, setMissing] = useState(false)

  if (missing) return null

  return (
    <section className="border-b border-hairline">
      <div className="mx-auto grid max-w-[1320px] items-end gap-10 px-4 py-20 sm:px-6 md:py-28 lg:grid-cols-[0.8fr_1.2fr] lg:px-12">
        <div className="sh-in">
          <p className="font-mono text-xs uppercase tracking-[0.2em] text-ink-dim">
            Live from the studio
          </p>
          <h2 className="mt-5 font-mono text-[clamp(2rem,4.6vw,4rem)] font-medium uppercase leading-[0.95] tracking-[-0.06em] text-ink">
            Every piece,
            <br />
            layer by layer.
          </h2>
          <p className="mt-5 max-w-sm text-base leading-relaxed text-ink-dim">
            Nothing here is mass-produced. Your order is printed in our Kigali
            studio after you place it.
          </p>
        </div>

        <div className="sh-in relative aspect-video overflow-hidden border border-hairline bg-panel">
          <video
            className="h-full w-full object-cover grayscale"
            src={VIDEO_SRC}
            autoPlay
            muted
            loop
            playsInline
            preload="metadata"
            aria-label="Time-lapse of a piece being 3D printed in the Safehouse studio"
            onError={() => setMissing(true)}
          />
        </div>
      </div>
    </section>
  )
}
