import { useState, lazy, Suspense, type FormEvent } from 'react'
import { ArrowUpRight, Check, Upload } from 'lucide-react'
import { TextAreaField, TextField, SelectField } from '@/components/FormField'
import { Button } from '@/components/Button'

const StlViewer = lazy(() =>
  import('@/components/StlViewer').then((m) => ({ default: m.StlViewer }))
)

const materials = [
  'No preference',
  'PLA',
  'PETG',
  'Resin (fine detail)',
]

export function CustomQuote() {
  const [file, setFile] = useState<File | null>(null)
  const [submitted, setSubmitted] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    const form = new FormData(e.currentTarget)
    const description = String(form.get('description') || '').trim()

    const nextErrors: Record<string, string> = {}

    if (!description) {
      nextErrors.description = 'Tell us what you’d like fabricated.'
    }

    setErrors(nextErrors)

    if (Object.keys(nextErrors).length === 0) {
      setSubmitted(true)
    }
  }

  if (submitted) {
    return (
      <main className="mx-auto max-w-[1400px] px-4 py-10 sm:px-6 sm:py-16 lg:px-8 lg:py-20">

        <section className="border-y border-hairline py-20 sm:py-28">
          <div className="max-w-3xl">

            <div className="flex h-10 w-10 items-center justify-center border border-ink">
              <Check size={16} strokeWidth={1.5} />
            </div>

            <p className="mt-8 font-mono text-[9px] uppercase tracking-[0.2em] text-ink-dim">
              Request / Received
            </p>

            <h1
              className="
                mt-5
                font-mono
                text-[clamp(3rem,8vw,7rem)]
                uppercase
                leading-[0.84]
                tracking-[-0.07em]
                text-ink
              "
            >
              We've got
              <br />
              your idea.
            </h1>

            <p className="mt-8 max-w-xl font-mono text-xs leading-relaxed text-ink-dim">
              Your request has been captured in this frontend preview.
              Once the quote pipeline is connected, we’ll review the details
              and get back to you with production information.
            </p>

            <div className="mt-10 flex flex-wrap gap-3">
              <a
                href="/shop"
                className="
                  inline-flex
                  items-center
                  gap-3
                  border
                  border-ink
                  bg-ink
                  px-5
                  py-3
                  font-mono
                  text-[9px]
                  uppercase
                  tracking-[0.14em]
                  text-panel
                  transition-opacity
                  hover:opacity-80
                "
              >
                Back to storefront
                <ArrowUpRight size={13} />
              </a>
            </div>

          </div>
        </section>

      </main>
    )
  }

  return (
    <main className="mx-auto max-w-[1400px] px-4 py-10 sm:px-6 sm:py-16 lg:px-8 lg:py-20">

      {/* Header */}
      <section className="border-y border-hairline py-10 sm:py-14">

        <div className="grid gap-8 lg:grid-cols-[1fr_320px] lg:items-end">

          <div>
            <p className="font-mono text-[9px] uppercase tracking-[0.2em] text-ink-dim">
              Custom fabrication / 001
            </p>

            <h1
              className="
                mt-5
                max-w-4xl
                font-mono
                text-[clamp(3rem,7vw,7rem)]
                uppercase
                leading-[0.85]
                tracking-[-0.07em]
                text-ink
              "
            >
              Bring us
              <br />
              something
              <br />
              to make.
            </h1>
          </div>

          <div>
            <p className="max-w-sm font-mono text-[11px] leading-relaxed text-ink-dim">
              Have an STL? Upload it. Have an idea? Describe it.
              We’ll figure out the fabrication details with you.
            </p>

            <p className="mt-6 font-mono text-[9px] uppercase tracking-[0.16em] text-ink-dim">
              Kigali / Rwanda
            </p>
          </div>

        </div>

      </section>

      {/* Process strip */}
      <section className="grid border-b border-hairline sm:grid-cols-3">

        <div className="border-b border-hairline py-5 sm:border-b-0 sm:border-r sm:pr-6">
          <p className="font-mono text-[9px] text-ink-dim">01</p>
          <p className="mt-2 font-mono text-[10px] uppercase tracking-[0.12em] text-ink">
            Describe or upload
          </p>
        </div>

        <div className="border-b border-hairline py-5 sm:border-b-0 sm:px-6 sm:border-r">
          <p className="font-mono text-[9px] text-ink-dim">02</p>
          <p className="mt-2 font-mono text-[10px] uppercase tracking-[0.12em] text-ink">
            We review the details
          </p>
        </div>

        <div className="py-5 sm:pl-6">
          <p className="font-mono text-[9px] text-ink-dim">03</p>
          <p className="mt-2 font-mono text-[10px] uppercase tracking-[0.12em] text-ink">
            Quote & fabrication
          </p>
        </div>

      </section>

      {/* Form */}
      <form onSubmit={handleSubmit} className="mt-10">

        <div className="grid gap-10 lg:grid-cols-[1fr_420px] lg:gap-16">

          {/* Left */}
          <div>

            <div className="border-b border-hairline pb-4">
              <p className="font-mono text-[9px] uppercase tracking-[0.16em] text-ink-dim">
                Project details
              </p>
            </div>

            <div className="mt-6 flex flex-col gap-6">

              <TextAreaField
                id="description"
                name="description"
                label="What are we making?"
                placeholder="Tell us what you want fabricated..."
                error={errors.description}
              />

              <div className="grid gap-6 sm:grid-cols-2">
                <TextField
                  id="dimensions"
                  name="dimensions"
                  label="Approx. dimensions"
                  placeholder="e.g. 15 x 15 x 20 cm"
                />

                <TextField
                  id="quantity"
                  name="quantity"
                  type="number"
                  min={1}
                  defaultValue={1}
                  label="Quantity"
                />
              </div>

              <SelectField
                id="material"
                name="material"
                label="Material preference"
                options={materials}
              />

            </div>

          </div>

          {/* Right */}
          <div>

            <div className="border-b border-hairline pb-4">
              <p className="font-mono text-[9px] uppercase tracking-[0.16em] text-ink-dim">
                Model / STL
              </p>
            </div>

            <div className="mt-6">

              <Suspense
                fallback={
                  <div className="flex aspect-square items-center justify-center border border-hairline bg-panel">
                    <p className="font-mono text-[9px] uppercase tracking-[0.14em] text-ink-dim">
                      Loading viewer...
                    </p>
                  </div>
                }
              >
                <StlViewer
                  file={file}
                  onFileSelect={setFile}
                />
              </Suspense>

              <div className="mt-4 flex items-start gap-3 border-t border-hairline pt-4">
                <Upload
                  size={14}
                  strokeWidth={1.5}
                  className="mt-0.5 shrink-0 text-ink-dim"
                />

                <div>
                  <p className="font-mono text-[9px] uppercase tracking-[0.14em] text-ink">
                    STL upload optional
                  </p>

                  <p className="mt-2 font-mono text-[9px] leading-relaxed text-ink-dim">
                    No model yet? That’s fine. Describe what you need and
                    we’ll work from the idea.
                  </p>
                </div>
              </div>

              {file && (
                <div className="mt-4 flex items-center justify-between border border-hairline px-4 py-3">

                  <div className="min-w-0">
                    <p className="truncate font-mono text-[9px] uppercase text-ink">
                      {file.name}
                    </p>

                    <p className="mt-1 font-mono text-[8px] uppercase text-ink-dim">
                      Model attached
                    </p>
                  </div>

                  <span className="ml-4 shrink-0 font-mono text-[8px] uppercase tracking-[0.12em] text-ink-dim">
                    Ready
                  </span>

                </div>
              )}

            </div>

          </div>

        </div>

        {/* Submit */}
        <div className="mt-12 flex flex-col gap-5 border-t border-hairline pt-6 sm:flex-row sm:items-center sm:justify-between">

          <p className="max-w-md font-mono text-[9px] uppercase leading-relaxed tracking-[0.1em] text-ink-dim">
            Submitting this form does not start production. We review the
            request first and confirm the quote with you.
          </p>

          <Button
            type="submit"
            className="shrink-0"
          >
            Send fabrication request
            <ArrowUpRight size={14} aria-hidden="true" />
          </Button>

        </div>

      </form>

    </main>
  )
}