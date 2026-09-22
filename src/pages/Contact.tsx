import { useState, type FormEvent } from 'react'
import { Eyebrow } from '@/components/Eyebrow'
import { TextField, TextAreaField } from '@/components/FormField'
import { Button } from '@/components/Button'

export function Contact() {
  const [submitted, setSubmitted] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const form = new FormData(e.currentTarget)
    const name = String(form.get('name') || '').trim()
    const email = String(form.get('email') || '').trim()
    const message = String(form.get('message') || '').trim()
    const nextErrors: Record<string, string> = {}
    if (!name) nextErrors.name = 'Enter your name.'
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) nextErrors.email = 'Enter a valid email address.'
    if (!message) nextErrors.message = 'Enter a message.'
    setErrors(nextErrors)
    if (Object.keys(nextErrors).length === 0) setSubmitted(true)
  }

  return (
    <div className="mx-auto max-w-3xl px-6 py-16">
      <Eyebrow>Get in Touch</Eyebrow>
      <h1 className="mt-2 font-display text-4xl uppercase text-ink">Contact</h1>

      <div className="mt-10 grid gap-12 md:grid-cols-2">
        <div>
          {submitted ? (
            <p role="status" className="rounded-2xl border border-signal-soft/40 bg-panel p-5 text-ink">
              Message noted. This is a front-end preview, so it isn't sent yet — but the
              flow is ready for a real inbox once connected.
            </p>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col gap-6">
              <TextField id="name" name="name" label="Name" error={errors.name} />
              <TextField id="email" name="email" type="email" label="Email" error={errors.email} />
              <TextAreaField id="message" name="message" label="Message" error={errors.message} />
              <Button type="submit" className="self-start">
                Send Message
              </Button>
            </form>
          )}
        </div>

        <div>
          <p className="font-mono-label text-[11px] uppercase text-ink-dim">Direct</p>
          <p className="mt-2 text-ink">hello@safehouse.rw <span className="text-xs text-ink-dim">(placeholder)</span></p>
          <p className="mt-1 text-ink">+250 000 000 000 <span className="text-xs text-ink-dim">(placeholder)</span></p>

          <p className="font-mono-label mt-8 text-[11px] uppercase text-ink-dim">Studio</p>
          <p className="mt-2 text-ink">Kigali, Rwanda <span className="text-xs text-ink-dim">(placeholder address)</span></p>

          <p className="font-mono-label mt-8 text-[11px] uppercase text-ink-dim">Response time</p>
          <p className="mt-2 text-ink">Typically within 1–2 business days <span className="text-xs text-ink-dim">(placeholder)</span></p>
        </div>
      </div>
    </div>
  )
}
