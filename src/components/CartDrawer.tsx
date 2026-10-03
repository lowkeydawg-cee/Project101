import { useCart } from '@/context/CartContext'

export function CartDrawer() {
  const {
    lines,
    isOpen,
    setIsOpen,
    removeItem,
    setQuantity,
    subtotal,
  } = useCart()

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-sm">
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
                      RWF {line.product.price.toLocaleString()} each
                    </p>
                  </div>

                  <div className="ml-4 flex shrink-0 items-center space-x-3">
                    <div className="flex items-center border border-hairline">
                      <button
                        type="button"
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
              RWF {subtotal.toLocaleString()}
            </span>
          </div>

          <button
            type="button"
            disabled={lines.length === 0}
            className="w-full bg-ink py-3 font-mono font-bold uppercase text-void transition-colors hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
            onClick={() => alert('Checkout flow triggered!')}
          >
            Proceed to Checkout
          </button>
        </div>
      </aside>
    </div>
  )
}