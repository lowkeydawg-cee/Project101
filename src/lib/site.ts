/**
 * Every real-world detail about the business lives here, in one place.
 *
 * ──────────────────────────────────────────────────────────────
 *  SAINT: these are the only lines you need to edit. Change them
 *  once and the footer, the contact page, the WhatsApp button,
 *  the search listing and the WhatsApp link preview all update.
 * ──────────────────────────────────────────────────────────────
 */

export const SITE = {
  name: 'The Safehouse',
  legalName: 'The Safehouse (Domus Tuta)',
  tagline: 'Kigali 3D fabrication studio',
  description:
    'The Safehouse is a Kigali 3D printing studio. Wall art, figurines, tealight modules and custom parts, printed to order and collected in Kigali or delivered.',

  /** Live address of the site. Update when a custom domain is connected. */
  url: 'https://project101-puce.vercel.app',

  /** TODO replace with a mailbox you actually read. */
  email: 'hello@safehouse.rw',

  /** International format, no spaces, no plus. Used for the wa.me link. */
  whatsapp: '250000000000',

  /** Shown to humans. */
  phoneDisplay: '+250 000 000 000',

  city: 'Kigali',
  country: 'Rwanda',

  /** How long before a made-to-order piece is ready. */
  leadTime: '2 to 4 days',

  /** Flat delivery fee inside Kigali, in RWF. Matches the database. */
  deliveryFee: 2000,
} as const

export const SOCIAL = {
  /** TODO replace with the real profile. */
  instagram: 'https://instagram.com/',
  whatsapp: SITE.whatsapp,
} as const

/** Pre-filled WhatsApp chat link. */
export function whatsappLink(message?: string): string {
  const base = `https://wa.me/${SITE.whatsapp}`
  return message ? `${base}?text=${encodeURIComponent(message)}` : base
}
