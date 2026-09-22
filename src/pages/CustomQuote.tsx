import { useState, lazy, Suspense, type FormEvent } from 'react'
import { Eyebrow } from '@/components/Eyebrow'
import { TextAreaField, TextField, SelectField } from '@/components/FormField'
import { Button } from '@/components/Button'

// Three.js is heavy — only load it once someone actually reaches this page.
const StlViewer = lazy(() =>
  import('@/components/StlViewer').then((m) => ({ default: m.StlViewer }))
)

const materials = ['No preference', 'PLA', 'PETG', 'Resin (fine detail)']

export function CustomQuote() {
  const [file, setFile] = useState<File | null>(null)
  const [submitted, setSubmitted] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const form = new FormData(e.currentTarget)
    const description = String(form.get('description') || '').trim()
    const nextErrors: Record<string, string> = {}
    if (!description) nextErrors.description = 'Tell us what you\u2019d like fabricated.'
    setErrors(nextErrors)
    if (Object.keys(nextErrors).length === 0) {
      setSubmitted(true)
    }
  }

  if (submitted) {
    return (
      <div className="mx-auto max-w-xl px-6 py-24 text-center">
        <Eyebrow>Request Noted</Eyebrow>
        <h1 className="mt-4 font-display text-3xl uppercase text-ink">
          We've got your request
        </h1>
        <p className="mt-4 text-ink-dim">
          This is a front-end preview — the request isn't sent to us yet. Once the
          quote pipeline is connected, you'll receive a reply here and by email.
        </p>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-3xl px-6 py-16">
      <Eyebrow>Bring Your Own Model</Eyebrow>
      <h1 className="mt-2 font-display text-4xl uppercase text-ink">Request a Custom Piece</h1>
      <p className="mt-4 max-w-xl text-ink-dim">
        Describe the piece, or upload an STL and preview it right here before you send it over.
      </p>

      <form onSubmit={handleSubmit} className="mt-10 flex flex-col gap-6">
        <TextAreaField
          id="description"
          name="description"
          label="Description"
          placeholder="What do you want fabricated?"
          error={errors.description}
        />

        <div className="grid gap-6 sm:grid-cols-2">
          <TextField id="dimensions" name="dimensions" label="Approx. dimensions" placeholder="e.g. 15 x 15 x 20 cm" />
          <TextField id="quantity" name="quantity" type="number" min={1} defaultValue={1} label="Quantity" />
        </div>

        <SelectField id="material" name="material" label="Material preference" options={materials} />

        <div>
          <p className="font-mono-label mb-2 text-[11px] uppercase text-ink-dim">
            Model file (optional)
          </p>
          <Suspense
            fallback={
              <div className="flex h-72 items-center justify-center rounded-2xl border border-hairline bg-panel font-mono-label text-xs uppercase text-ink-dim">
                Loading viewer
              </div>
            }
          >
            <StlViewer file={file} onFileSelect={setFile} />
          </Suspense>
        </div>

        <Button type="submit" className="self-start">
          Send Request
        </Button>
      </form>
    </div>
  )
}
