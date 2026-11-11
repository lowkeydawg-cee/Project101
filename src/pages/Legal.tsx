import { type ReactNode } from 'react'
import { Link } from 'wouter'
import { usePageMeta } from '@/lib/pageMeta'
import { LEGAL, MOMO, SITE, whatsappLink } from '@/lib/site'

/**
 * Privacy policy, terms of sale and returns policy.
 *
 * Written for a small Rwandan online shop under Law No. 058/2021 relating
 * to the protection of personal data and privacy. This is a plain-language
 * starting point, not legal advice: have a Kigali lawyer read it once
 * before the business grows.
 */

function Shell({ eyebrow, title, children }: { eyebrow: string; title: string; children: ReactNode }) {
  return (
    <main className="mx-auto max-w-3xl px-4 py-12 sm:px-6 sm:py-20">
      <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-ink-dim">{eyebrow}</p>
      <h1 className="mt-4 font-mono text-[clamp(2.2rem,5vw,3.6rem)] uppercase leading-[0.92] tracking-[-0.06em] text-ink">
        {title}
      </h1>
      <p className="mt-4 font-mono text-[10px] uppercase tracking-[0.14em] text-ink-dim">
        Last updated {LEGAL.updated}
      </p>
      <div className="mt-10 flex flex-col gap-9 text-[15px] leading-relaxed text-ink-dim [&_h2]:mb-3 [&_h2]:font-mono [&_h2]:text-[13px] [&_h2]:uppercase [&_h2]:tracking-[0.12em] [&_h2]:text-ink [&_li]:mt-1.5 [&_strong]:font-medium [&_strong]:text-ink [&_ul]:list-disc [&_ul]:pl-5">
        {children}
      </div>
      <nav className="mt-14 flex flex-wrap gap-6 border-t border-hairline pt-6 font-mono text-[10px] uppercase tracking-[0.14em]">
        <Link href="/privacy" className="text-ink-dim hover:text-ink">Privacy</Link>
        <Link href="/terms" className="text-ink-dim hover:text-ink">Terms of sale</Link>
        <Link href="/returns" className="text-ink-dim hover:text-ink">Returns</Link>
        <Link href="/contact" className="text-ink-dim hover:text-ink">Contact</Link>
      </nav>
    </main>
  )
}

function WhoWeAre() {
  return (
    <p>
      {LEGAL.registeredName}, {SITE.city}, {SITE.country}
      {LEGAL.tin ? `, TIN ${LEGAL.tin}` : ''}. Email{' '}
      <a className="text-ink underline underline-offset-4" href={`mailto:${SITE.email}`}>{SITE.email}</a>, WhatsApp{' '}
      <a className="text-ink underline underline-offset-4" href={whatsappLink()} target="_blank" rel="noreferrer noopener">
        {SITE.phoneDisplay}
      </a>
      .
    </p>
  )
}

export function Privacy() {
  usePageMeta('Privacy policy', 'What The Safehouse collects when you order, why, who sees it and how to have it deleted.')

  return (
    <Shell eyebrow="Your data" title="Privacy policy">
      <section>
        <h2>Who looks after your data</h2>
        <WhoWeAre />
        <p className="mt-3">
          We are the data controller for the details you give us on this site, under Rwanda's Law No. 058/2021
          relating to the protection of personal data and privacy.
          {LEGAL.ncsaCertificate
            ? ` We are registered with the National Cyber Security Authority, certificate ${LEGAL.ncsaCertificate}.`
            : ''}
        </p>
      </section>

      <section>
        <h2>What we collect</h2>
        <ul>
          <li><strong>When you order:</strong> your name, phone number, email, and your delivery address if you choose delivery.</li>
          <li><strong>When you pay:</strong> the MoMo transaction ID you send us. We never see your MoMo PIN or balance.</li>
          <li><strong>When you ask for a quote or message us:</strong> your name, contact details, your message, and any 3D file you upload.</li>
          <li><strong>When you browse:</strong> anonymous visit counts (which pages are viewed, roughly where from). No advertising trackers. Your light or dark and Minimal or Glass choice is stored only in your own browser.</li>
        </ul>
      </section>

      <section>
        <h2>Why we use it</h2>
        <p>
          Only to make and deliver what you ordered: to confirm your order, match your payment, tell you when it is
          ready, deliver it, and answer you if something goes wrong. We do not sell your details, share them for
          marketing, or send you promotions unless you ask us to.
        </p>
      </section>

      <section>
        <h2>Who else sees it</h2>
        <ul>
          <li><strong>Supabase</strong>, which stores orders and uploaded files for us.</li>
          <li><strong>Vercel</strong>, which runs this website.</li>
          <li><strong>Our email service</strong>, which sends order confirmations.</li>
          <li><strong>MTN Mobile Money</strong>, when you pay us.</li>
          <li><strong>WhatsApp</strong>, if you choose to message us there.</li>
          <li><strong>A delivery rider</strong>, who gets only your name, phone and address, for that one delivery.</li>
        </ul>
        <p className="mt-3">
          Supabase and Vercel store data on servers outside Rwanda. We use them because a business our size cannot
          run its own secure servers, and only the shop owner can read your order details.
        </p>
      </section>

      <section>
        <h2>How long we keep it</h2>
        <p>
          Order records are kept as long as Rwandan tax law requires us to keep sales records. 3D files from quote
          requests are deleted once the job is finished or declined, unless you ask us to keep them for a reorder.
          Messages are kept only while we are still helping you.
        </p>
      </section>

      <section>
        <h2>Your rights</h2>
        <p>
          You can ask us to show you what we hold about you, correct it, delete it, or stop using it. Message us on
          WhatsApp or by email and we will reply within 30 days. Some order details may have to stay for tax records,
          and we will tell you if so. You can also complain to the National Cyber Security Authority (NCSA).
        </p>
      </section>

      <section>
        <h2>If something goes wrong</h2>
        <p>
          If your data is ever exposed, we will tell the NCSA within 48 hours of finding out, as the law requires, and
          tell you directly if it puts you at risk.
        </p>
      </section>
    </Shell>
  )
}

export function Terms() {
  usePageMeta('Terms of sale', 'How ordering, paying, making and delivering works at The Safehouse.')

  return (
    <Shell eyebrow="Ordering" title="Terms of sale">
      <section>
        <h2>Who you are buying from</h2>
        <WhoWeAre />
      </section>

      <section>
        <h2>Prices</h2>
        <p>
          All prices are in Rwandan francs (RWF). The price shown when you place an order is the price you pay.
          Delivery inside {SITE.city} is a flat {SITE.deliveryFee.toLocaleString('en-US')} RWF and collection from the studio is free.
        </p>
      </section>

      <section>
        <h2>When your order is confirmed</h2>
        <p>
          Placing an order reserves it. It is confirmed once we receive your payment by MTN MoMo and you have sent us
          the transaction ID. If no payment arrives within {MOMO.payWindowHours} hours, the order is released and
          nothing is charged.
        </p>
      </section>

      <section>
        <h2>Making your piece</h2>
        <p>
          Everything is printed to order after payment. Catalogue pieces are usually ready in {SITE.leadTime}. Custom
          work gets its own date in your quote. If we are going to be late, we tell you before the date, not after.
        </p>
        <p className="mt-3">
          Printed objects show fine horizontal layer lines and can vary slightly in shade between batches of
          filament. That is how 3D printing looks, not a fault.
        </p>
      </section>

      <section>
        <h2>Custom orders</h2>
        <ul>
          <li>We price custom work after looking at your file or idea. The quote is the price you pay.</li>
          <li>We ask for a 50% deposit before printing starts, and the rest on collection or delivery.</li>
          <li>Once printing has started, the deposit cannot be refunded, because the material and machine time are used.</li>
          <li>Files you send stay yours. We use them only to make your order and never sell or share them.</li>
          <li>
            We may decline anything that is a weapon or weapon part, copies someone else's design or brand without
            their permission, or is otherwise illegal.
          </li>
        </ul>
      </section>

      <section>
        <h2>Collection and delivery</h2>
        <p>
          We tell you when your piece is ready. For delivery, a rider brings it to the address you gave. The piece is
          yours, and your responsibility, once it is handed to you or to the person you name. We photograph each
          package before it leaves so any damage in transit can be sorted out quickly.
        </p>
      </section>

      <section>
        <h2>If something is wrong</h2>
        <p>
          See our <Link href="/returns" className="text-ink underline underline-offset-4">returns policy</Link>. Our
          responsibility for any order is limited to reprinting it or refunding what you paid for it.
        </p>
      </section>

      <section>
        <h2>The law that applies</h2>
        <p>These terms are governed by the laws of Rwanda.</p>
      </section>
    </Shell>
  )
}

export function Returns() {
  usePageMeta('Returns policy', 'What happens if your Safehouse piece arrives damaged, faulty or not as agreed.')

  return (
    <Shell eyebrow="If something is wrong" title="Returns policy">
      <section>
        <h2>Made to order, so no change-of-mind returns</h2>
        <p>
          Every piece is printed for the person who ordered it, so we cannot take it back because you changed your mind
          or picked the wrong colour or size. Ask us anything before you pay. We would rather answer a question than
          print the wrong thing.
        </p>
      </section>

      <section>
        <h2>Damaged, faulty or not what we agreed</h2>
        <p>
          Tell us within 7 days of receiving it and send a photo. We will reprint it free, or refund what you paid
          for that piece to your MoMo, whichever you prefer.
        </p>
        <ul className="mt-3">
          <li>Broken or cracked on arrival</li>
          <li>A print fault, such as gaps, warping or layers separating</li>
          <li>Different from your order or quote: wrong item, size or material</li>
        </ul>
      </section>

      <section>
        <h2>What does not count as a fault</h2>
        <ul>
          <li>The fine layer lines every 3D print has</li>
          <li>A slight shade difference between filament batches</li>
          <li>Wear from use, drops, sunlight or heat after you have received it</li>
        </ul>
      </section>

      <section>
        <h2>Custom orders</h2>
        <p>
          The same promise applies if a custom piece does not match what we agreed in your quote. The deposit becomes
          non-refundable once printing starts, as our terms of sale explain.
        </p>
      </section>

      <section>
        <h2>How to start</h2>
        <p>
          Message us on{' '}
          <a className="text-ink underline underline-offset-4" href={whatsappLink('Hi Safehouse, there is a problem with my order ')} target="_blank" rel="noreferrer noopener">
            WhatsApp
          </a>{' '}
          with your order number and a photo. Refunds go back to the MoMo number you paid from.
        </p>
      </section>
    </Shell>
  )
}
