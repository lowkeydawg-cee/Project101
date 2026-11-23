import { useRef, useState } from 'react'
import { Link } from 'wouter'
import { isPreviewImage, type Product } from '@/data/products'
import { formatRWF } from '@/lib/format'

function prefersReducedMotion() {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

export function ProductCard({ product, index }: { product: Product; index: number }) {
  const primary = product.gallery[0] ?? product.image
  const secondary = product.gallery[1]
  const hasImage = Boolean(primary) && primary.startsWith('http')
  const hasSecondary = typeof secondary === 'string' && secondary.startsWith('http')
  const preview = hasImage && isPreviewImage(primary)
  const frameRef = useRef<HTMLDivElement>(null)
  // The second image is only requested on the first mouse hover, so the grid
  // loads exactly what it did before. Touch never triggers it.
  const [armSecondary, setArmSecondary] = useState(false)
  const [secondaryReady, setSecondaryReady] = useState(false)
  const crossfade = hasSecondary && secondaryReady

  function handlePointerEnter(e: React.PointerEvent<HTMLDivElement>) {
    if (e.pointerType === 'mouse' && hasSecondary) setArmSecondary(true)
  }

  function handlePointerMove(e: React.PointerEvent<HTMLDivElement>) {
    if (prefersReducedMotion()) return
    const el = frameRef.current
    if (!el) return
    const rect = el.getBoundingClientRect()
    const x = (e.clientX - rect.left) / rect.width - 0.5
    const y = (e.clientY - rect.top) / rect.height - 0.5
    el.style.transform = `perspective(800px) rotateX(${(-y * 6).toFixed(2)}deg) rotateY(${(x * 8).toFixed(2)}deg)`
  }

  function handlePointerLeave() {
    const el = frameRef.current
    if (!el) return
    el.style.transform = 'perspective(800px) rotateX(0deg) rotateY(0deg)'
  }

  return (
    <Link
      href={`/shop/${product.slug}`}
      className="group block"
    >
      {/* Object */}
      <div
        ref={frameRef}
        onPointerEnter={handlePointerEnter}
        onPointerMove={handlePointerMove}
        onPointerLeave={handlePointerLeave}
        className="
          relative
          aspect-[4/3]
          overflow-hidden
          border
          border-black/80
          bg-[#ECEAE8]
          transition-transform
          duration-200
          ease-out
          [will-change:transform]
        "
      >
        {hasImage ? (
          <>
            <img
              src={primary}
              alt={product.name}
              className={`
                absolute inset-0 h-full w-full object-contain
                transition-[transform,opacity] duration-500
                ease-[cubic-bezier(0.22,1,0.36,1)]
                motion-reduce:transition-none
                ${crossfade ? 'group-hover:opacity-0' : 'group-hover:scale-[1.035]'}
              `}
            />
            {hasSecondary && armSecondary && (
              <img
                src={secondary}
                alt=""
                aria-hidden="true"
                decoding="async"
                onLoad={() => setSecondaryReady(true)}
                className={`
                  absolute inset-0 h-full w-full object-contain
                  opacity-0 transition-opacity duration-500
                  ease-[cubic-bezier(0.22,1,0.36,1)]
                  motion-reduce:transition-none
                  ${crossfade ? 'group-hover:opacity-100' : ''}
                `}
              />
            )}
          </>
        ) : (
          <div
            className="
              absolute
              inset-0
              transition-transform
              duration-700
              ease-[cubic-bezier(0.22,1,0.36,1)]
              motion-reduce:transition-none
              group-hover:scale-[1.035]
            "
            style={{ background: primary }}
          />
        )}

        {preview && (
          <div className="absolute right-4 top-4 bg-black/70 px-2 py-1 font-mono text-[8px] uppercase tracking-[0.16em] text-white/85">
            Preview render
          </div>
        )}

        {/* Object number */}
        <div
          className={`absolute left-4 top-4 font-mono text-[9px] uppercase tracking-[0.16em] ${
            hasImage ? 'bg-black/70 px-2 py-1 text-white/85' : 'text-black'
          }`}
        >
          {product.category}
        </div>

        {/* View indicator */}
        <div
          className="
            absolute
            bottom-4
            right-4
            flex
            h-9
            w-9
            items-center
            justify-center
            border
            border-black
            bg-[#ECEAE8]/90
            font-mono
            text-sm
            text-black
            transition-all
            duration-300
            group-hover:bg-black
            group-hover:text-white
          "
        >
          ↗
        </div>

        {/* Technical overlay, real spec fields only, revealed on hover */}
        <div
          className="
            absolute
            inset-x-0
            bottom-0
            translate-y-full
            bg-black/85
            px-4
            py-3
            opacity-0
            transition-all
            duration-300
            ease-out
            group-hover:translate-y-0
            group-hover:opacity-100
          "
        >
          <div className="flex flex-wrap gap-x-5 gap-y-1 font-mono text-[8px] uppercase tracking-[0.14em] text-white/80">
            <span>Material / {product.material}</span>
            <span>Finish / {product.finish}</span>
            <span>Category / {product.category}</span>
          </div>
        </div>
      </div>

      {/* Product information */}
      <div className="mt-4">
        <div className="flex items-start justify-between gap-6">
          <div>
            <h3
              className="
                font-mono
                text-[15px]
                uppercase
                leading-tight
                tracking-[-0.02em]
                text-ink
              "
            >
              {product.name}
            </h3>

            <p
              className="
                mt-2
                font-mono
                text-[9px]
                uppercase
                tracking-[0.14em]
                text-ink-dim
              "
            >
              Made to order
            </p>
          </div>

          <span
            className="
              shrink-0
              font-mono
              text-[13px]
              tracking-[-0.02em]
              text-ink
            "
          >
            {formatRWF(product.price)}
          </span>
        </div>

        {/* Technical line */}
        <div
          className="
            mt-4
            flex
            items-center
            justify-between
            border-t
            border-black/20
            pt-2
          "
        >
          <span
            className="
              font-mono
              text-[8px]
              uppercase
              tracking-[0.16em]
              text-ink-dim
            "
          >
           OBJECT / {String(index + 1).padStart(3, '0')}
          </span>

          <span
            className="
              font-mono
              text-[8px]
              uppercase
              tracking-[0.16em]
              text-ink-dim
            "
          >
             SEE WHAT'S ON THE SHELF →
          </span>
        </div>
      </div>
    </Link>
  )
}