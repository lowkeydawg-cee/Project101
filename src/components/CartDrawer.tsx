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

      <aside className="relative z-10 flex h-full w-full max-w-md flex-col justify-between border-l border-neutral-800 bg-neutral-950 p-6 text-neutral-100">
        <div>
          <div className="flex items-center justify-between border-b border-neutral-800 pb-4">
            <h2 className="text-xl font-mono uppercase tracking-wider">
              Your Cart
            </h2>

            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="text-sm font-mono text-neutral-400 transition-colors hover:text-white"
            >
              [CLOSE]
            </button>
          </div>

          <div className="mt-6 max-h-[60vh] space-y-4 overflow-y-auto pr-2">
            {lines.length === 0 ? (
              <p className="py-8 text-center text-sm font-mono text-neutral-500">
                Your cart is empty.
              </p>
            ) : (
              lines.map((line) => (
                <div
                  key={line.product.id}
                  className="flex items-center justify-between border border-neutral-800 bg-neutral-900/50 p-4"
                >
                  <div className="min-w-0">
                    <h4 className="truncate text-sm font-mono uppercase">
                      {line.product.name}
                    </h4>

                    <p className="mt-1 text-xs text-neutral-400">
                      RWF {line.product.price.toLocaleString()} each
                    </p>
                  </div>

                  <div className="ml-4 flex shrink-0 items-center space-x-3">
                    <div className="flex items-center border border-neutral-700">
                      <button
                        type="button"
                        onClick={() =>
                          setQuantity(
                            line.product.id,
                            line.quantity - 1
                          )
                        }
                        className="px-2 py-1 text-xs transition-colors hover:bg-neutral-800"
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
                        className="px-2 py-1 text-xs transition-colors hover:bg-neutral-800"
                      >
                        +
                      </button>
                    </div>

                    <button
                      type="button"
                      onClick={() => removeItem(line.product.id)}
                      className="text-xs font-mono text-red-400 transition-colors hover:text-red-300"
                    >
                      [REMOVE]
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="mt-4 border-t border-neutral-800 pt-4">
          <div className="mb-4 flex items-center justify-between text-sm font-mono">
            <span>TOTAL:</span>

            <span className="text-lg font-bold">
              RWF {subtotal.toLocaleString()}
            </span>
          </div>

          <button
            type="button"
            disabled={lines.length === 0}
            className="w-full bg-white py-3 font-mono font-bold uppercase text-black transition-colors hover:bg-neutral-200 disabled:cursor-not-allowed disabled:opacity-50"
            onClick={() => alert('Checkout flow triggered!')}
          >
            Proceed to Checkout
          </button>
        </div>
      </aside>
    </div>
  )
}