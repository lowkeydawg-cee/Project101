import { Link } from 'wouter'
import type { Product } from '@/data/products'
import { formatRWF } from '@/lib/format'

export function ProductCard({ product, index }: { product: Product; index: number }) {
  const hasImage = Boolean(product.image) && product.image.startsWith('http')

  return (
    <Link
      href={`/shop/${product.slug}`}
      className="group block"
    >
      {/* Object */}
      <div
        className="
          relative
          aspect-[4/3]
          overflow-hidden
          border
          border-black/80
          bg-[#f1f0ec]
        "
      >
        {hasImage ? (
          <img
            src={product.image}
            alt={product.name}
            className="
              h-full
              w-full
              object-cover
              transition-transform
              duration-700
              ease-[cubic-bezier(0.22,1,0.36,1)]
              group-hover:scale-[1.035]
            "
          />
        ) : (
          <div
            className="
              absolute
              inset-0
              transition-transform
              duration-700
              ease-[cubic-bezier(0.22,1,0.36,1)]
              group-hover:scale-[1.035]
            "
            style={{ background: product.image }}
          />
        )}

        {/* Object number */}
        <div
          className="
            absolute
            left-4
            top-4
            font-mono
            text-[9px]
            uppercase
            tracking-[0.16em]
            text-black
          "
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
            bg-[#f1f0ec]/90
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