import { useEffect } from 'react'
import { Link } from 'wouter'
import { usePageMeta } from '@/lib/pageMeta'
import { whatsappLink } from '@/lib/site'
import { FAQ_GROUPS } from '@/data/faq'
import { FaqItem } from '@/components/StudioAnswers'

/** Publishes the questions to Google as FAQPage structured data while this page is open. */
function useFaqSchema() {
  useEffect(() => {
    const tag = document.createElement('script')
    tag.type = 'application/ld+json'
    tag.dataset.faq = 'true'
    tag.textContent = JSON.stringify({
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: FAQ_GROUPS.flatMap((g) => g.items).map((f) => ({
        '@type': 'Question',
        name: f.q,
        acceptedAnswer: { '@type': 'Answer', text: f.a },
      })),
    })
    document.head.appendChild(tag)
    return () => tag.remove()
  }, [])
}

export function Faq() {
  usePageMeta(
    'Questions',
    'How ordering, paying, custom prints, delivery and returns work at The Safehouse, a 3D printing studio in Kigali.',
  )
  useFaqSchema()

  return (
    <main className="mx-auto max-w-[1320px] px-4 py-12 sm:px-6 sm:py-20 lg:px-12">
      <div className="grid gap-12 lg:grid-cols-[0.7fr_1.3fr]">
        <div className="lg:sticky lg:top-28 lg:self-start">
          <p className="font-mono text-xs uppercase tracking-[0.2em] text-ink-dim">Questions</p>
          <h1 className="mt-5 font-mono text-[clamp(2.2rem,5vw,3.8rem)] font-medium uppercase leading-[0.92] tracking-[-0.06em] text-ink">
            Ask before
            <br />
            you buy.
          </h1>
          <p className="mt-5 max-w-sm text-base leading-relaxed text-ink-dim">
            If your question is not here, message us. A real person answers.
          </p>
          <a
            href={whatsappLink('Hi Safehouse, I have a question: ')}
            target="_blank"
            rel="noreferrer noopener"
            className="sh-btn mt-6 inline-flex min-h-[48px] items-center border border-ink px-6 font-mono text-[12px] uppercase tracking-[0.12em] text-ink transition-colors hover:bg-ink hover:text-void"
          >
            Ask on WhatsApp
          </a>
          <nav aria-label="Topics" className="mt-10 hidden flex-col gap-2 lg:flex">
            {FAQ_GROUPS.map((g) => (
              <a
                key={g.title}
                href={`#${g.title.toLowerCase().replace(/\s+/g, '-')}`}
                className="font-mono text-[11px] uppercase tracking-[0.14em] text-ink-dim hover:text-ink"
              >
                {g.title}
              </a>
            ))}
          </nav>
        </div>

        <div className="flex flex-col gap-12">
          {FAQ_GROUPS.map((g) => (
            <section key={g.title} id={g.title.toLowerCase().replace(/\s+/g, '-')} className="scroll-mt-28">
              <h2 className="border-b border-hairline pb-3 font-mono text-[12px] uppercase tracking-[0.16em] text-ink-dim">
                {g.title}
              </h2>
              {g.items.map((item) => (
                <FaqItem key={item.q} item={item} />
              ))}
            </section>
          ))}
          <p className="text-sm text-ink-dim">
            The full rules are in our{' '}
            <Link href="/terms" className="text-ink underline underline-offset-4">terms of sale</Link>,{' '}
            <Link href="/returns" className="text-ink underline underline-offset-4">returns policy</Link> and{' '}
            <Link href="/privacy" className="text-ink underline underline-offset-4">privacy policy</Link>.
          </p>
        </div>
      </div>
    </main>
  )
}
