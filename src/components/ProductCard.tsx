import { Link } from 'wouter'
import type { Product } from '@/data/products'
import { formatRWF } from '@/lib/format'

export function ProductCard({ product }: { product: Product }) {
  return (
    <Link
      href={`/shop/${product.slug}`}
      className="group block"
    >
      {/* Product image */}
      <div
        className="
          relative aspect-[4/3]
          overflow-hidden
          bg-ink/5
          transition-transform
          duration-300
          ease-out
          group-hover:-translate-y-0.5
        "
        style={{ background: product.image }}
        aria-hidden="true"
      >
        {/* Image surface */}
        <div
          className="
            absolute inset-0
            transition-transform
            duration-500
            ease-out
            group-hover:scale-[1.025]
          "
          style={{ background: product.image }}
        />

        {/* Small product index */}
        <span
          className="
            absolute
            left-3
            top-3
            font-mono
            text-[9px]
            uppercase
            tracking-[0.18em]
            text-ink-dim
            opacity-70
          "
        >
          {product.category}
        </span>

        {/* View indicator */}
        <span
          className="
            absolute
            bottom-3
            right-3
            flex
            h-8
            w-8
            items-center
            justify-center
            rounded-full
            bg-void/80
            text-xs
            text-ink
            opacity-0
            backdrop-blur-sm
            transition-all
            duration-300
            group-hover:opacity-100
          "
        >
          ↗
        </span>
      </div>

      {/* Product information */}
      <div className="pt-4">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <p
              className="
                font-mono
                text-[9px]
                uppercase
                tracking-[0.16em]
                text-ink-dim
              "
            >
              {product.category}
            </p>

            <h3
              className="
                mt-1
                font-display
                text-lg
                leading-tight
                text-ink
                transition-opacity
                duration-200
                group-hover:opacity-70
              "
            >
              {product.name}
            </h3>
          </div>

          <span
            className="
              shrink-0
              pt-1
              font-mono
              text-xs
              text-ink
            "
          >
            {formatRWF(product.price)}
          </span>
        </div>

        {/* Bottom metadata */}
        <div
          className="
            mt-4
            flex
            items-center
            justify-between
            border-t
            border-hairline
            pt-3
          "
        >
          <span
            className="
              font-mono
              text-[9px]
              uppercase
              tracking-[0.14em]
              text-ink-dim
            "
          >
            Made to order
          </span>

          <span
            className="
              font-mono
              text-[9px]
              uppercase
              tracking-[0.14em]
              text-ink-dim
              transition-colors
              duration-200
              group-hover:text-ink
            "
          >
            View piece →
          </span>
        </div>
      </div>
    </Link>
  )
}