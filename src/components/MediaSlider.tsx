import { useState, useRef, useEffect } from 'react'
import type { CSSProperties } from 'react'
import { useModelViewerScript } from '@/lib/useModelViewerScript'
import { isPreviewImage } from '@/data/products'

export type SlideItem =
  | { type: 'model'; src: string }
  | { type: 'image'; src: string; alt?: string }

interface MediaSliderProps {
  slides: SlideItem[]
  productName: string
  catalogNo?: string
  fallbackBackground?: string
}

export function MediaSlider({ slides, productName, catalogNo, fallbackBackground }: MediaSliderProps) {
  const [current, setCurrent] = useState(0)
  const [reducedMotion, setReducedMotion] = useState(false)
  const touchStartX = useRef(0)
  const touchStartY = useRef(0)
  const hasModel = slides.some(s => s.type === 'model')

  useModelViewerScript(hasModel)

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    setReducedMotion(mq.matches)
    const handler = (e: MediaQueryListEvent) => setReducedMotion(e.matches)
    mq.addEventListener('change', handler)
    return () => mq.removeEventListener('change', handler)
  }, [])

  if (slides.length === 0) {
    return (
      <div
        className="relative min-h-[420px] flex-1 lg:min-h-[720px]"
        style={fallbackBackground ? { background: fallbackBackground } : undefined}
      >
        {catalogNo && (
          <div className="absolute left-5 top-5 z-10">
            <span className="font-mono text-[9px] uppercase tracking-[0.16em] text-ink">
              {catalogNo}
            </span>
          </div>
        )}
      </div>
    )
  }

  const count = slides.length
  const goTo = (i: number) => setCurrent(((i % count) + count) % count)
  const prev = () => goTo(current - 1)
  const next = () => goTo(current + 1)

  const currentSlide = slides[current]
  const isPreview =
    currentSlide.type === 'image' &&
    Boolean(currentSlide.src) &&
    isPreviewImage(currentSlide.src)

  return (
    <div
      className="flex flex-col outline-none"
      tabIndex={0}
      role="region"
      aria-label="Product media"
      onKeyDown={(e) => {
        if (e.key === 'ArrowLeft') prev()
        else if (e.key === 'ArrowRight') next()
      }}
    >
      {/* Main view */}
      <div className="relative min-h-[420px] flex-1 overflow-hidden lg:min-h-[720px]">

        {/* Catalog number badge */}
        {catalogNo && (
          <div className="absolute left-5 top-5 z-10">
            <span
              className={`font-mono text-[9px] uppercase tracking-[0.16em] ${
                currentSlide.type === 'image' && currentSlide.src
                  ? 'bg-black/70 px-2 py-1 text-white/85'
                  : 'text-ink'
              }`}
            >
              {catalogNo}
            </span>
          </div>
        )}

        {/* Preview render badge */}
        {isPreview && (
          <div className="absolute right-5 top-5 z-10 bg-black/70 px-2 py-1 font-mono text-[9px] uppercase tracking-[0.16em] text-white/85">
            Preview render
          </div>
        )}

        {/* 3D badge */}
        {currentSlide.type === 'model' && (
          <div className="absolute right-5 top-5 z-10 bg-ink px-2 py-1 font-mono text-[9px] uppercase tracking-[0.16em] text-panel">
            3D
          </div>
        )}

        {/* Prev / next arrows */}
        {count > 1 && (
          <>
            <button
              onClick={prev}
              aria-label="Previous"
              className="absolute left-4 top-1/2 z-10 -translate-y-1/2 flex h-9 w-9 items-center justify-center border border-black/70 bg-panel/80 font-mono text-sm text-ink transition-colors hover:bg-ink hover:text-panel"
            >
              ←
            </button>
            <button
              onClick={next}
              aria-label="Next"
              className="absolute right-4 top-1/2 z-10 -translate-y-1/2 flex h-9 w-9 items-center justify-center border border-black/70 bg-panel/80 font-mono text-sm text-ink transition-colors hover:bg-ink hover:text-panel"
            >
              →
            </button>
          </>
        )}

        {/* All slides rendered; opacity-swap keeps model-viewer mounted and loaded */}
        {slides.map((slide, i) => (
          <div
            key={i}
            className="absolute inset-0 transition-opacity duration-300 motion-reduce:transition-none"
            style={{
              opacity: i === current ? 1 : 0,
              pointerEvents: i === current ? 'auto' : 'none',
            }}
            aria-hidden={i !== current}
            onTouchStart={slide.type === 'model' ? undefined : (e) => {
              touchStartX.current = e.touches[0].clientX
              touchStartY.current = e.touches[0].clientY
            }}
            onTouchEnd={slide.type === 'model' ? undefined : (e) => {
              const dx = e.changedTouches[0].clientX - touchStartX.current
              const dy = e.changedTouches[0].clientY - touchStartY.current
              if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > 40) {
                dx < 0 ? next() : prev()
              }
            }}
          >
            {slide.type === 'model' ? (
              <model-viewer
                src={slide.src}
                alt={productName}
                loading="lazy"
                reveal="auto"
                camera-controls=""
                auto-rotate={reducedMotion ? undefined : ''}
                auto-rotate-delay="800"
                rotation-per-second="10deg"
                environment-image="neutral"
                exposure="0.92"
                shadow-intensity="0.4"
                shadow-softness="1"
                interaction-prompt="none"
                style={{
                  width: '100%',
                  height: '100%',
                  background: '#F2F1EB',
                  '--poster-color': '#F2F1EB',
                } as CSSProperties}
              />
            ) : (
              <img
                src={slide.src}
                alt={slide.alt ?? productName}
                className="absolute inset-0 h-full w-full bg-[#ECEAE8] object-contain"
              />
            )}
          </div>
        ))}
      </div>

      {/* Thumbnail strip */}
      {count > 1 && (
        <div
          className="flex gap-2 overflow-x-auto border-t border-hairline bg-void px-3 py-2.5"
          role="tablist"
          aria-label="Slide thumbnails"
        >
          {slides.map((slide, i) => (
            <button
              key={i}
              role="tab"
              aria-selected={i === current}
              aria-label={slide.type === 'model' ? '3D model' : `Image ${i + 1}`}
              onClick={() => goTo(i)}
              className={`relative h-14 w-14 flex-shrink-0 overflow-hidden border transition-colors motion-reduce:transition-none ${
                i === current ? 'border-ink' : 'border-hairline hover:border-ink/50'
              }`}
            >
              {slide.type === 'model' ? (
                <div className="flex h-full w-full items-center justify-center bg-[#F2F1EB]">
                  <span className="font-mono text-[7px] uppercase tracking-[0.14em] text-ink-dim">
                    3D
                  </span>
                </div>
              ) : (
                <img
                  src={slide.src}
                  alt=""
                  aria-hidden="true"
                  className="h-full w-full object-cover"
                />
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
