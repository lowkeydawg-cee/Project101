import { MOMO, SITE } from '@/lib/site'

/**
 * Every question and answer on the site, in one place. The homepage shows
 * the ones marked `featured`; /faq shows them all, grouped, and publishes them
 * to Google as an FAQ.
 *
 * SAINT: only write answers that are true today. If a question comes up more
 * than twice on WhatsApp, add it here.
 */

export interface Faq {
  q: string
  a: string
  featured?: boolean
}

export interface FaqGroup {
  title: string
  items: Faq[]
}

const fee = SITE.deliveryFee.toLocaleString('en-US')

export const FAQ_GROUPS: FaqGroup[] = [
  {
    title: 'The pieces',
    items: [
      {
        q: 'Will it look like the photo?',
        a: `Yes, because it is the same file and the same machine. Printed objects carry fine horizontal layer lines, which are part of how they look and feel. Ask and we will send you a photo of your actual print before it leaves the studio.`,
        featured: true,
      },
      {
        q: 'Which material should I pick?',
        a: `Tell us what the piece has to survive and we will choose with you. PLA for decorative work and anything that lives indoors. PETG when it needs to take heat, sun or a knock.`,
        featured: true,
      },
      {
        q: 'What colours do you have?',
        a: `It changes as we buy filament. Message us on WhatsApp before you order and we will tell you what is on the shelf today.`,
      },
      {
        q: 'How big can you print?',
        a: `Up to about 25 cm wide, deep and tall in one piece. Larger objects can sometimes be printed in parts and joined. Send us the size and we will tell you honestly whether it works.`,
      },
    ],
  },
  {
    title: 'Custom work',
    items: [
      {
        q: 'Can you print something I designed or found?',
        a: `Yes. Send an STL file through the custom quote form, or describe the object if you have no file. We look at it and send one price and one date.`,
      },
      {
        q: 'My 3D file might not be right.',
        a: `Send it anyway. Most files that come to us need something: a hole closed, a wall thickened, a part rescaled. We check it, tell you plainly what it needs, and fix it before printing.`,
        featured: true,
      },
      {
        q: 'Which files can I send?',
        a: `STL files upload straight through the quote form. If you have another format, send it on WhatsApp and we will tell you whether we can use it.`,
      },
      {
        q: 'Is there anything you will not print?',
        a: `Weapons or weapon parts, copies of someone else's design or brand without their permission, and anything illegal.`,
      },
    ],
  },
  {
    title: 'Price and payment',
    items: [
      {
        q: 'Can the price change after I order?',
        a: `No. The price you see is the price you pay. For custom work we quote once we have looked at your file, and that quote is what you are charged.`,
        featured: true,
      },
      {
        q: 'How do I pay?',
        a: `With MTN MoMo. After you place your order, your order page shows the amount and the number to pay. Send us the transaction ID from MTN's SMS and we start printing once it is in.`,
        featured: true,
      },
      {
        q: 'Do you take a deposit?',
        a: `For custom pieces, yes: 50% before printing starts and the rest on collection or delivery. Catalogue pieces are paid in full when you order.`,
      },
      {
        q: 'What if I do not pay straight away?',
        a: `Your order is held for ${MOMO.payWindowHours} hours. After that it is released and nothing is charged. You can always order again.`,
      },
    ],
  },
  {
    title: 'Getting it',
    items: [
      {
        q: 'How long does it take?',
        a: `${SITE.leadTime} for catalogue pieces once payment is in. Custom work depends on size and complexity, and we tell you the date before you commit, not after.`,
        featured: true,
      },
      {
        q: 'How do I get it?',
        a: `Collect it in ${SITE.city}, or we deliver inside ${SITE.city} for a flat ${fee} RWF. Outside ${SITE.city}, message us and we will work it out.`,
        featured: true,
      },
      {
        q: 'Can I track my order?',
        a: `Yes. Your order number is on the confirmation screen and in your email. Enter it on the order status page to see whether it is paid, printing, or ready.`,
      },
    ],
  },
  {
    title: 'If something is wrong',
    items: [
      {
        q: 'What if it arrives damaged or wrong?',
        a: `Tell us within 7 days and send a photo. We reprint it free, or refund what you paid for that piece to your MoMo.`,
        featured: true,
      },
      {
        q: 'Can I return it if I change my mind?',
        a: `No, because every piece is printed for the person who ordered it. Ask us anything before you pay. We would rather answer a question than print the wrong thing.`,
      },
      {
        q: 'What do you do with my details and files?',
        a: `We use them only to make and deliver your order, never for marketing, and we delete quote files once the job is done. The privacy policy has the details.`,
      },
    ],
  },
]

export const FEATURED_FAQ: Faq[] = FAQ_GROUPS.flatMap((g) => g.items).filter((f) => f.featured)
