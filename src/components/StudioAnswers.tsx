/**
 * The objections people actually raise before they buy a printed object,
 * answered plainly. Built on <details> so it works with no JavaScript and
 * reads correctly to a screen reader.
 */

import { Link } from 'wouter'
import { whatsappLink } from '@/lib/site'
import { FEATURED_FAQ, type Faq } from '@/data/faq'


export function StudioAnswers() {
  return (
    <section className="border-b border-hairline">
      <div className="mx-auto grid max-w-[1320px] gap-10 px-4 py-20 sm:px-6 md:py-28 lg:grid-cols-[0.75fr_1.25fr] lg:px-12">
        <div className="sh-in">
          <p className="font-mono text-xs uppercase tracking-[0.2em] text-ink-dim">
            Before you order
          </p>
          <h2 className="mt-5 font-mono text-[clamp(2rem,4.6vw,3.6rem)] font-medium uppercase leading-[0.95] tracking-[-0.06em] text-ink">
            The questions
            <br />
            we get asked.
          </h2>
          <p className="mt-5 max-w-sm text-base leading-relaxed text-ink-dim">
            Still unsure about something? Ask before you buy, not after.
          </p>
          <a
            href={whatsappLink()}
            target="_blank"
            rel="noreferrer noopener"
            className="mt-6 sh-btn inline-flex min-h-[48px] items-center border border-ink px-6 font-mono text-[12px] uppercase tracking-[0.12em] text-ink transition-colors hover:bg-ink hover:text-void"
          >
            Ask on WhatsApp
          </a>
        </div>

        <div className="sh-in border-t border-hairline">
          {FEATURED_FAQ.map((item) => (
            <FaqItem key={item.q} item={item} />
          ))}
          <Link
            href="/faq"
            className="mt-6 inline-block font-mono text-[12px] uppercase tracking-[0.12em] text-ink underline underline-offset-4 hover:text-ink-dim"
          >
            All questions →
          </Link>
        </div>
      </div>
    </section>
  )
}

/** One question. Built on <details> so it opens without JavaScript and reads correctly to screen readers. */
export function FaqItem({ item }: { item: Faq }) {
  return (
    <details className="group border-b border-hairline">
      <summary className="flex cursor-pointer list-none items-center justify-between gap-6 py-5 font-mono text-[15px] uppercase tracking-[-0.01em] text-ink marker:content-none">
        {item.q}
        <span
          aria-hidden="true"
          className="shrink-0 font-mono text-xl leading-none text-ink-dim transition-transform duration-200 group-open:rotate-45"
        >
          +
        </span>
      </summary>
      <p className="max-w-2xl pb-6 text-base leading-relaxed text-ink-dim">{item.a}</p>
    </details>
  )
}
