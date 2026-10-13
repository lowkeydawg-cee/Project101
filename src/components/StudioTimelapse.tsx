import { useState } from 'react'

/**
 * A looping black-and-white time-lapse of the printer at work.
 * Drop the clip in /public/studio-timelapse.mp4 (MP4, muted, ideally
 * under ~8 MB and 10–20 s). Until it exists, a labelled placeholder shows.
 */
const VIDEO_SRC = '/studio-timelapse.mp4'

export function StudioTimelapse() {
  const [missing, setMissing] = useState(false)

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
          {missing ? (
            <div className="flex h-full w-full items-center justify-center p-6 text-center font-mono text-[11px] uppercase tracking-[0.14em] text-ink-dim">
              [Studio time-lapse — add public/studio-timelapse.mp4]
            </div>
          ) : (
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
          )}
        </div>
      </div>
    </section>
  )
}
