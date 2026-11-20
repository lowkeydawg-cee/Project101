import { useEffect } from 'react'
import { Link } from 'wouter'
import { useCart } from '@/context/CartContext'
import { formatRWF } from '@/lib/format'

export function CartDrawer() {
  const {
    lines,
    isOpen,
    setIsOpen,
    removeItem,
    setQuantity,
    subtotal,
  } = useCart()

  useEffect(() => {
    if (!isOpen) return
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setIsOpen(false) }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [isOpen, setIsOpen])

  if (!isOpen) return null

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Your cart"
      className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-sm"
    >
      <button
        type="button"
        aria-label="Close cart"
        className="absolute inset-0 cursor-default"
        onClick={() => setIsOpen(false)}
      />

      <aside className="relative z-10 flex h-full w-full max-w-md flex-col justify-between border-l border-hairline bg-void p-6 text-ink">
        <div>
          <div className="flex items-center justify-between border-b border-hairline pb-4">
            <h2 className="text-xl font-mono uppercase tracking-wider">
              Your Cart
            </h2>

            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="text-sm font-mono text-ink-dim transition-colors hover:text-ink"
            >
              [CLOSE]
            </button>
          </div>

          <div className="mt-6 max-h-[60vh] space-y-4 overflow-y-auto pr-2">
            {lines.length === 0 ? (
              <p className="py-8 text-center text-sm font-mono text-ink-dim">
                Your cart is empty.
              </p>
            ) : (
              lines.map((line) => (
                <div
                  key={line.product.id}
                  className="flex items-center justify-between border border-hairline bg-panel p-4"
                >
                  <div className="min-w-0">
                    <h4 className="truncate text-sm font-mono uppercase">
                      {line.product.name}
                    </h4>

                    <p className="mt-1 text-xs text-ink-dim">
                      {formatRWF(line.product.price)} each
                    </p>
                  </div>

                  <div className="ml-4 flex shrink-0 items-center space-x-3">
                    <div className="flex items-center border border-hairline">
                      <button
                        type="button"
                        aria-label={`Decrease quantity of ${line.product.name}`}
                        onClick={() =>
                          setQuantity(
                            line.product.id,
                            line.quantity - 1
                          )
                        }
                        className="px-2 py-1 text-xs transition-colors hover:bg-ink hover:text-panel"
                      >
                        -
                      </button>

                      <span className="px-2 text-xs font-mono">
                        {line.quantity}
                      </span>

                      <button
                        type="button"
                        aria-label={`Increase quantity of ${line.product.name}`}
                        onClick={() =>
                          setQuantity(
                            line.product.id,
                            line.quantity + 1
                          )
                        }
                        className="px-2 py-1 text-xs transition-colors hover:bg-ink hover:text-panel"
                      >
                        +
                      </button>
                    </div>

                    <button
                      type="button"
                      onClick={() => removeItem(line.product.id)}
                      className="text-xs font-mono text-red-500 transition-colors hover:text-red-400"
                    >
                      [REMOVE]
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="mt-4 border-t border-hairline pt-4">
          <div className="mb-4 flex items-center justify-between text-sm font-mono">
            <span>TOTAL:</span>

            <span className="text-lg font-bold">
              {formatRWF(subtotal)}
            </span>
          </div>

          {lines.length === 0 ? (
            <button
              type="button"
              disabled
              className="w-full cursor-not-allowed bg-ink py-3 font-mono font-bold uppercase text-void opacity-50"
            >
              Proceed to Checkout
            </button>
          ) : (
            <Link
              href="/checkout"
              onClick={() => setIsOpen(false)}
              className="block w-full bg-ink py-3 text-center font-mono font-bold uppercase text-void transition-colors hover:opacity-90"
            >
              Proceed to Checkout
            </Link>
          )}
        </div>
      </aside>
    </div>
  )
}