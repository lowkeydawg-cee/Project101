import { Check } from 'lucide-react'

type OrderStage =
  | 'received'
  | 'production'
  | 'quality'
  | 'delivery'
  | 'delivered'

type OrderTrackerProps = {
  currentStage?: OrderStage
  orderNumber?: string
  estimatedReady?: string
  deliveryTime?: string
  location?: string
}

const stages = [
  {
    id: 'received' as const,
    number: '01',
    title: 'Order received',
    description: 'Your request has been confirmed.',
  },
  {
    id: 'production' as const,
    number: '02',
    title: 'In production',
    description: 'Your object is being fabricated.',
  },
  {
    id: 'quality' as const,
    number: '03',
    title: 'Quality check',
    description: 'Final inspection before dispatch.',
  },
  {
    id: 'delivery' as const,
    number: '04',
    title: 'Out for delivery',
    description: 'Your object is on its way.',
  },
  {
    id: 'delivered' as const,
    number: '05',
    title: 'Delivered',
    description: 'Your order has arrived.',
  },
]

export function OrderTracker({
  currentStage = 'production',
  orderNumber = '001',
  estimatedReady = '02 — 04 OCT',
  deliveryTime = '1 — 2 days after production',
  location = 'Safehouse Studio / Kigali',
}: OrderTrackerProps) {
  const currentIndex = stages.findIndex(
    (stage) => stage.id === currentStage,
  )

  return (
    <section className="border-y border-hairline">
      {/* HEADER */}
      <div className="flex flex-col gap-4 border-b border-hairline p-6 sm:flex-row sm:items-end sm:justify-between sm:p-8">
        <div>
          <p className="font-mono text-[8px] uppercase tracking-[0.18em] text-ink-dim">
            Order / {orderNumber}
          </p>

          <h2 className="mt-3 font-mono text-xl uppercase leading-none tracking-[-0.04em] text-ink sm:text-2xl">
            Production status
          </h2>
        </div>

        <p className="font-mono text-[8px] uppercase tracking-[0.16em] text-ink-dim">
          Safehouse / Kigali
        </p>
      </div>

      {/* CURRENT STATUS */}
      <div className="grid border-b border-hairline lg:grid-cols-[1fr_320px]">
        <div className="p-6 sm:p-8 lg:p-10">
          <p className="font-mono text-[8px] uppercase tracking-[0.18em] text-ink-dim">
            Current status
          </p>

          <div className="mt-4 flex items-center gap-3">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping bg-signal opacity-60" />
              <span className="relative inline-flex h-2 w-2 bg-signal" />
            </span>

            <p className="font-mono text-[clamp(1.5rem,3vw,2.5rem)] uppercase leading-none tracking-[-0.05em] text-ink">
              {stages[currentIndex]?.title}
            </p>
          </div>

          <p className="mt-4 max-w-md font-mono text-[9px] leading-relaxed text-ink-dim">
            {stages[currentIndex]?.description}
          </p>
        </div>

        <div className="grid grid-cols-2 border-t border-hairline lg:border-l lg:border-t-0">
          <div className="border-r border-hairline p-6 sm:p-8">
            <p className="font-mono text-[8px] uppercase tracking-[0.16em] text-ink-dim">
              Estimated ready
            </p>

            <p className="mt-3 font-mono text-xs uppercase text-ink">
              {estimatedReady}
            </p>
          </div>

          <div className="p-6 sm:p-8">
            <p className="font-mono text-[8px] uppercase tracking-[0.16em] text-ink-dim">
              Location
            </p>

            <p className="mt-3 font-mono text-[9px] uppercase leading-relaxed text-ink">
              {location}
            </p>
          </div>
        </div>
      </div>

      {/* STAGES */}
      <div>
        {stages.map((stage, index) => {
          const isComplete = index < currentIndex
          const isCurrent = index === currentIndex
          const isUpcoming = index > currentIndex

          return (
            <div
              key={stage.id}
              className={`
                grid
                grid-cols-[48px_1fr]
                gap-4
                border-b
                border-hairline
                p-5
                last:border-b-0
                sm:grid-cols-[64px_1fr_auto]
                sm:items-center
                sm:gap-6
                sm:p-6
                lg:px-8
              `}
            >
              {/* NUMBER / INDICATOR */}
              <div className="flex items-center">
                <div
                  className={`
                    flex
                    h-8
                    w-8
                    items-center
                    justify-center
                    border
                    font-mono
                    text-[8px]
                    ${
                      isComplete
                        ? 'border-ink bg-ink text-panel'
                        : isCurrent
                          ? 'border-ink text-ink'
                          : 'border-hairline text-ink-dim'
                    }
                  `}
                >
                  {isComplete ? (
                    <Check size={12} strokeWidth={1.5} aria-hidden="true" />
                  ) : (
                    stage.number
                  )}
                </div>
              </div>

              {/* DETAILS */}
              <div>
                <div className="flex items-center gap-3">
                  <p
                    className={`
                      font-mono
                      text-[10px]
                      uppercase
                      tracking-[0.12em]
                      ${
                        isUpcoming
                          ? 'text-ink-dim'
                          : 'text-ink'
                      }
                    `}
                  >
                    {stage.title}
                  </p>

                  {isCurrent && (
                    <span className="font-mono text-[7px] uppercase tracking-[0.16em] text-signal">
                      Current
                    </span>
                  )}
                </div>

                <p className="mt-2 font-mono text-[8px] leading-relaxed text-ink-dim">
                  {stage.description}
                </p>
              </div>

              {/* STATE */}
              <div className="hidden sm:block">
                <span className="font-mono text-[8px] uppercase tracking-[0.14em] text-ink-dim">
                  {isComplete
                    ? 'Complete'
                    : isCurrent
                      ? 'In progress'
                      : 'Upcoming'}
                </span>
              </div>
            </div>
          )
        })}
      </div>

      {/* DELIVERY INFO */}
      <div className="grid border-t border-hairline sm:grid-cols-2">
        <div className="border-b border-hairline p-6 sm:border-b-0 sm:border-r sm:p-8">
          <p className="font-mono text-[8px] uppercase tracking-[0.16em] text-ink-dim">
            Delivery
          </p>

          <p className="mt-3 font-mono text-[10px] uppercase text-ink">
            Kigali
          </p>

          <p className="mt-2 font-mono text-[8px] leading-relaxed text-ink-dim">
            {deliveryTime}
          </p>
        </div>

        <div className="p-6 sm:p-8">
          <p className="font-mono text-[8px] uppercase tracking-[0.16em] text-ink-dim">
            Production note
          </p>

          <p className="mt-3 max-w-md font-mono text-[9px] leading-relaxed text-ink-dim">
            Your object is made to order. Timing can vary slightly depending
            on the object, material and current production queue.
          </p>
        </div>
      </div>
    </section>
  )
}