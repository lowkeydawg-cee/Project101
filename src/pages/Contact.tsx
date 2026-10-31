import { useState, type FormEvent } from 'react'
import { Eyebrow } from '@/components/Eyebrow'
import { TextField, TextAreaField } from '@/components/FormField'
import { Button } from '@/components/Button'
import { sendInquiry } from '@/lib/notify'
import { SITE, whatsappLink } from '@/lib/site'
import { usePageMeta } from '@/lib/pageMeta'

type State = 'idle' | 'sending' | 'sent' | 'failed'

export function Contact() {
  usePageMeta('Contact', 'Talk to the maker. Email, WhatsApp, or send a message from the site.')

  const [state, setState] = useState<State>('idle')
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [draft, setDraft] = useState('')

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()

    const form = new FormData(e.currentTarget)
    const name = String(form.get('name') || '').trim()
    const email = String(form.get('email') || '').trim()
    const phone = String(form.get('phone') || '').trim()
    const message = String(form.get('message') || '').trim()

    const nextErrors: Record<string, string> = {}
    if (!name) nextErrors.name = 'Enter your name.'
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) nextErrors.email = 'Enter a valid email address.'
    if (!message) nextErrors.message = 'Enter a message.'
    setErrors(nextErrors)
    if (Object.keys(nextErrors).length > 0) return

    setDraft(`Hi Safehouse, I'm ${name}. ${message}`)
    setState('sending')

    try {
      await sendInquiry({ kind: 'Contact', name, email, phone, message })
      setState('sent')
    } catch {
      // Never pretend it arrived. Hand the visitor a route that works.
      setState('failed')
    }
  }

  return (
    <div className="mx-auto max-w-3xl px-6 py-16">
      <Eyebrow>Get in Touch</Eyebrow>
      <h1 className="mt-2 font-display text-4xl uppercase text-ink">Talk to the Maker</h1>

      <div className="mt-10 grid gap-12 md:grid-cols-2">
        <div>
          {state === 'sent' ? (
            <div role="status" className="border border-hairline bg-panel p-5">
              <p className="font-mono text-xs uppercase tracking-[0.14em] text-ink">
                Message sent
              </p>
              <p className="mt-3 text-sm leading-relaxed text-ink-dim">
                It landed in the studio inbox. We usually reply within one working
                day. If it is urgent, WhatsApp is faster.
              </p>
              <a
                href={whatsappLink(draft)}
                target="_blank"
                rel="noreferrer noopener"
                className="mt-5 sh-btn inline-flex min-h-[44px] items-center border border-ink px-5 font-mono text-[11px] uppercase tracking-[0.14em] text-ink transition-colors hover:bg-ink hover:text-void"
              >
                Open WhatsApp instead
              </a>
            </div>
          ) : state === 'failed' ? (
            <div role="alert" className="border border-hairline bg-panel p-5">
              <p className="font-mono text-xs uppercase tracking-[0.14em] text-ink">
                Could not send from here
              </p>
              <p className="mt-3 text-sm leading-relaxed text-ink-dim">
                The message did not go through, so nothing was lost on our side and
                nothing reached us either. Send it on WhatsApp or by email and it
                will get to the studio right away.
              </p>
              <div className="mt-5 flex flex-wrap gap-3">
                <a
                  href={whatsappLink(draft)}
                  target="_blank"
                  rel="noreferrer noopener"
                  className="sh-btn inline-flex min-h-[44px] items-center bg-ink px-5 font-mono text-[11px] uppercase tracking-[0.14em] text-void transition-opacity hover:opacity-85"
                >
                  Send on WhatsApp
                </a>
                <a
                  href={`mailto:${SITE.email}?body=${encodeURIComponent(draft)}`}
                  className="sh-btn inline-flex min-h-[44px] items-center border border-ink px-5 font-mono text-[11px] uppercase tracking-[0.14em] text-ink transition-colors hover:bg-ink hover:text-void"
                >
                  Send by email
                </a>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col gap-6">
              <TextField id="name" name="name" label="Name" error={errors.name} />
              <TextField id="email" name="email" type="email" label="Email" error={errors.email} />
              <TextField id="phone" name="phone" type="tel" label="Phone (optional)" />
              <TextAreaField id="message" name="message" label="Message" error={errors.message} />
              <Button type="submit" className="self-start" disabled={state === 'sending'}>
                {state === 'sending' ? 'Sending...' : 'Send the idea'}
              </Button>
            </form>
          )}
        </div>

        <div>
          <p className="font-mono-label text-[11px] uppercase text-ink-dim">Direct</p>
          <p className="mt-2">
            <a href={`mailto:${SITE.email}`} className="text-ink underline underline-offset-4">
              {SITE.email}
            </a>
          </p>
          <p className="mt-1">
            <a
              href={whatsappLink()}
              target="_blank"
              rel="noreferrer noopener"
              className="text-ink underline underline-offset-4"
            >
              {SITE.phoneDisplay} (WhatsApp)
            </a>
          </p>

          <p className="font-mono-label mt-8 text-[11px] uppercase text-ink-dim">Studio</p>
          <p className="mt-2 text-ink">
            {SITE.city}, {SITE.country}
          </p>

          <p className="font-mono-label mt-8 text-[11px] uppercase text-ink-dim">Response time</p>
          <p className="mt-2 text-ink">Usually within one working day</p>

          <p className="font-mono-label mt-8 text-[11px] uppercase text-ink-dim">Print turnaround</p>
          <p className="mt-2 text-ink">{SITE.leadTime} once a piece is approved</p>
        </div>
      </div>
    </div>
  )
}
