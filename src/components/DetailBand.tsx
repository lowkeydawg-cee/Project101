import { SITE } from '@/lib/site'

/**
 * A full-width macro of the printed surface, sitting between sections.
 *
 * It does one job: show what a layer line actually looks like, close up,
 * before anyone has to ask. "Will it look like the photo" is the first thing
 * buyers worry about, and the honest answer is that printed objects have
 * visible layers. Showing them at this scale turns that from a surprise into
 * the reason to buy.
 */
export function DetailBand() {
  return (
    <section className="relative border-b border-hairline bg-[#0b0b0a]">
      <img
        src="/photo/layers-macro.jpg"
        srcSet="/photo/layers-macro-sm.jpg 800w, /photo/layers-macro.jpg 1600w"
        sizes="100vw"
        alt="Close-up of two printed pieces, the raking light picking out every individual layer."
        className="h-[46vh] max-h-[460px] min-h-[260px] w-full object-cover"
        loading="lazy"
        decoding="async"
        width={1600}
        height={900}
      />

      {/* Narrow screens have no clear lane to the side, so the wash goes
          top-down instead and the texture shows through at the bottom. */}
      <div
        aria-hidden="true"
        className="absolute inset-0 lg:hidden"
        style={{
          background:
            'linear-gradient(to bottom, rgba(11,11,10,0.93) 0%, rgba(11,11,10,0.88) 46%, rgba(11,11,10,0.30) 78%, rgba(11,11,10,0.20) 100%)',
        }}
      />
      <div
        aria-hidden="true"
        className="absolute inset-0 hidden lg:block"
        style={{
          background:
            'linear-gradient(to right, rgba(11,11,10,0.92) 0%, rgba(11,11,10,0.62) 36%, rgba(11,11,10,0) 64%)',
        }}
      />

      <div className="absolute inset-0 flex items-start pt-8 lg:items-center lg:pt-0">
        <div className="mx-auto w-full max-w-[1320px] px-4 sm:px-6 lg:px-12">
          <p className="font-mono text-xs uppercase tracking-[0.2em] text-[#a4a29b]">
            0.2 mm per layer
          </p>
          <h2 className="mt-4 max-w-[18ch] font-mono text-[clamp(1.7rem,3.4vw,3rem)] font-medium uppercase leading-[0.95] tracking-[-0.06em] text-[#f2f1eb]">
            You can see
            <br />
            how it was made.
          </h2>
          <p className="mt-4 max-w-sm text-[15px] leading-relaxed text-[#a4a29b]">
            Printed objects carry fine lines where each layer meets the next.
            We do not sand them away. It is how you know the piece was built in{' '}
            {SITE.city} and not stamped out somewhere else.
          </p>
        </div>
      </div>
    </section>
  )
}
