import { useState, lazy, Suspense, type FormEvent } from 'react'
import { ArrowUpRight, Check, Upload } from 'lucide-react'
import { TextAreaField, TextField, SelectField } from '@/components/FormField'
import { Button } from '@/components/Button'
import { sendInquiry } from '@/lib/notify'
import { supabase } from '@/lib/supabase'
import { SITE, whatsappLink } from '@/lib/site'
import { usePageMeta } from '@/lib/pageMeta'

const StlViewer = lazy(() =>
  import('@/components/StlViewer').then((m) => ({ default: m.StlViewer }))
)

const materials = [
  'No preference',
  'PLA',
  'PETG',
  'Resin (fine detail)',
]

/** Uploads the STL so the quote email can carry a link to it. */
async function uploadModel(file: File): Promise<string | null> {
  const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_')
  const path = `${Date.now()}-${safeName}`
  const { error } = await supabase.storage.from('quote-files').upload(path, file)
  if (error) {
    console.warn('STL upload failed:', error.message)
    return null
  }
  return supabase.storage.from('quote-files').getPublicUrl(path).data.publicUrl
}

export function CustomQuote() {
  usePageMeta('Custom Quote', 'Send us a model or just an idea. We check the file, pick the material and come back with one price and one date.')

  const [file, setFile] = useState<File | null>(null)
  const [state, setState] = useState<'idle' | 'sending' | 'sent' | 'failed'>('idle')
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [draft, setDraft] = useState('')
  const [modelPending, setModelPending] = useState(false)

  const submitted = state === 'sent'

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    const form = new FormData(e.currentTarget)
    const description = String(form.get('description') || '').trim()
    const name = String(form.get('name') || '').trim()
    const email = String(form.get('email') || '').trim()
    const phone = String(form.get('phone') || '').trim()
    const dimensions = String(form.get('dimensions') || '').trim()
    const quantity = String(form.get('quantity') || '1').trim()
    const material = String(form.get('material') || '').trim()

    const nextErrors: Record<string, string> = {}
    if (!description) nextErrors.description = 'Tell us what you’d like fabricated.'
    if (!name) nextErrors.name = 'Enter your name.'
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      nextErrors.email = 'Enter an email we can reply to.'
    }

    setErrors(nextErrors)
    if (Object.keys(nextErrors).length > 0) return

    setDraft(
      `Hi Safehouse, I'm ${name}. I'd like a quote for: ${description}` +
        (dimensions ? ` (about ${dimensions})` : '') +
        (quantity && quantity !== '1' ? `, quantity ${quantity}` : '')
    )
    setState('sending')

    let modelUrl: string | null = null
    if (file) modelUrl = await uploadModel(file)
    setModelPending(Boolean(file) && !modelUrl)

    try {
      await sendInquiry({
        kind: 'Custom quote',
        name,
        email,
        phone,
        message: description,
        details: {
          Dimensions: dimensions,
          Quantity: quantity,
          Material: material,
          Model: modelUrl ?? (file ? `${file.name} (upload failed, ask for it)` : 'None attached'),
        },
      })
      setState('sent')
    } catch {
      setState('failed')
    }
  }

  if (state === 'failed') {
    return (
      <main className="mx-auto max-w-[1400px] px-4 py-10 sm:px-6 sm:py-16 lg:px-8 lg:py-20">
        <section className="border-y border-hairline py-20 sm:py-28">
          <div className="max-w-3xl">
            <p className="font-mono text-[9px] uppercase tracking-[0.2em] text-ink-dim">
              Request / Not sent
            </p>
            <h1 className="mt-5 font-mono text-[clamp(2.5rem,7vw,5.5rem)] uppercase leading-[0.86] tracking-[-0.07em] text-ink">
              Send it
              <br />
              this way.
            </h1>
            <p className="mt-8 max-w-xl text-base leading-relaxed text-ink-dim">
              The request did not go through from here, so it has not reached the
              studio. Send the same details on WhatsApp or by email and we will
              price it for you.
            </p>
            <div className="mt-10 flex flex-wrap gap-3">
              <a
                href={whatsappLink(draft)}
                target="_blank"
                rel="noreferrer noopener"
                className="sh-btn inline-flex min-h-[48px] items-center gap-3 bg-ink px-6 font-mono text-[11px] uppercase tracking-[0.14em] text-void transition-opacity hover:opacity-85"
              >
                Send on WhatsApp
                <ArrowUpRight size={14} />
              </a>
              <a
                href={`mailto:${SITE.email}?subject=Custom%20quote&body=${encodeURIComponent(draft)}`}
                className="sh-btn inline-flex min-h-[48px] items-center gap-3 border border-ink px-6 font-mono text-[11px] uppercase tracking-[0.14em] text-ink transition-colors hover:bg-ink hover:text-void"
              >
                Send by email
              </a>
            </div>
          </div>
        </section>
      </main>
    )
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

            <p className="mt-8 max-w-xl text-base leading-relaxed text-ink-dim">
              It reached the studio. We review every request by hand and come
              back with a price and a timeline, usually within one working day.
              {modelPending
                ? ' Your model file did not upload, so please send the STL on WhatsApp and we will attach it to your request.'
                : ''}
            </p>

            <div className="mt-8">
              <a
                href={whatsappLink(draft)}
                target="_blank"
                rel="noreferrer noopener"
                className="sh-btn inline-flex min-h-[44px] items-center gap-3 border border-ink px-5 font-mono text-[11px] uppercase tracking-[0.14em] text-ink transition-colors hover:bg-ink hover:text-void"
              >
                {modelPending ? 'Send the model on WhatsApp' : 'Add a note on WhatsApp'}
                <ArrowUpRight size={13} />
              </a>
            </div>

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

            <div className="mt-10 border-b border-hairline pb-4">
              <p className="font-mono text-[9px] uppercase tracking-[0.16em] text-ink-dim">
                Where we send the quote
              </p>
            </div>

            <div className="mt-6 flex flex-col gap-6">
              <TextField id="name" name="name" label="Your name" error={errors.name} />
              <div className="grid gap-6 sm:grid-cols-2">
                <TextField
                  id="email"
                  name="email"
                  type="email"
                  label="Email"
                  error={errors.email}
                />
                <TextField
                  id="phone"
                  name="phone"
                  type="tel"
                  label="Phone / WhatsApp (optional)"
                />
              </div>
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
            disabled={state === 'sending'}
          >
            {state === 'sending' ? 'Sending...' : 'Send fabrication request'}
            <ArrowUpRight size={14} aria-hidden="true" />
          </Button>

        </div>

      </form>

    </main>
  )
}