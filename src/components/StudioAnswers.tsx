/**
 * The objections people actually raise before they buy a printed object,
 * answered plainly. Built on <details> so it works with no JavaScript and
 * reads correctly to a screen reader.
 */

import { SITE, whatsappLink } from '@/lib/site'

const answers = [
  {
    q: 'Will it look like the photo?',
    a: `Yes, because it is the same file and the same machine. Printed objects carry fine horizontal layer lines, which are part of how they look and feel. On close pieces we send you a photo of your actual print before it leaves the studio.`,
  },
  {
    q: 'How long does it take?',
    a: `${SITE.leadTime} for catalogue pieces once the order is in. Custom work depends on size and complexity, and we tell you the date before you commit, not after.`,
  },
  {
    q: 'Can the price change after I order?',
    a: `No. The price you see is the price you pay. For custom work we quote once we have looked at your file, and that quote is what you are charged.`,
  },
  {
    q: 'My 3D file might not be right.',
    a: `Send it anyway. Most files that come to us need something: a hole closed, a wall thickened, a part rescaled. We check it, tell you plainly what it needs, and fix it before printing. If you have no file at all, describe the thing and we work from that.`,
  },
  {
    q: 'Which material should I pick?',
    a: `Tell us what the piece has to survive and we will choose. PLA for decorative work and anything that lives indoors. PETG when it needs to take heat, sun or a knock. Resin when the detail is finer than a printer nozzle can hold.`,
  },
  {
    q: 'What if it arrives damaged or wrong?',
    a: `We reprint it. Tell us within seven days of collecting or receiving it, send a photo, and the replacement is on us.`,
  },
  {
    q: 'How do I get it?',
    a: `Collect it in ${SITE.city}, or we deliver inside ${SITE.city} for a flat ${SITE.deliveryFee.toLocaleString('en-US')} RWF. Outside ${SITE.city}, message us and we will work it out.`,
  },
]

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
            className="mt-6 inline-flex min-h-[48px] items-center border border-ink px-6 font-mono text-[12px] uppercase tracking-[0.12em] text-ink transition-colors hover:bg-ink hover:text-void"
          >
            Ask on WhatsApp
          </a>
        </div>

        <div className="sh-in border-t border-hairline">
          {answers.map((item) => (
            <details key={item.q} className="group border-b border-hairline">
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
          ))}
        </div>
      </div>
    </section>
  )
}
