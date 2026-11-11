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

  /** Live address of the site. Change this if the domain ever changes, along with index.html and public/sitemap.xml. */
  url: 'https://www.safehouse.rw',

  /** TODO replace with a mailbox you actually read. */
  email: 'hello@safehouse.rw',

  /** International format, no spaces, no plus. Used for the wa.me link. */
  whatsapp: '250783200122',

  /** Shown to humans. */
  phoneDisplay: '+250 783 200 122',

  city: 'Kigali',
  country: 'Rwanda',

  /** How long before a made-to-order piece is ready. */
  leadTime: '2 to 4 days',

  /** Flat delivery fee inside Kigali, in RWF. Matches the database. */
  deliveryFee: 2000,
} as const

/**
 * Facts the legal pages state. Leave a field empty until it is true: the
 * pages only mention a TIN or an NCSA registration once you fill it in.
 */
export const LEGAL = {
  /** Business name as registered with RDB. */
  registeredName: 'The Safehouse (Domus Tuta)',
  /** TIN from your RDB registration. TODO after registering. */
  tin: '',
  /** NCSA data controller certificate number. TODO once issued. */
  ncsaCertificate: '',
  /** Date the policies below last changed. */
  updated: '10 November 2026',
} as const

/**
 * Where customers pay. MTN MoMo only for now.
 *
 * SAINT: put your business MoMo number and the name MoMo shows when someone
 * pays it. Customers compare that name before confirming, so it must match.
 * When MTN gives you a MoMo Pay merchant code, add it to `merchantCode` and
 * the pay button switches to it by itself.
 */
export const MOMO = {
  /** As the customer would type it, e.g. 0788123456. TODO real number. */
  number: '0780000000',
  /** The name MoMo shows on the confirmation screen. TODO real name. */
  accountName: 'Account name as MoMo shows it',
  /** MoMo Pay merchant code, once MTN issues it. Leave empty until then. */
  merchantCode: '',
  /** Hours a customer has to pay before the order is released. Matches the database. */
  payWindowHours: 48,
} as const

/**
 * Social profiles. SAINT: paste the full link to each profile you run, for
 * example 'https://www.instagram.com/safehouse.rw'. Leave a platform empty
 * and it simply does not appear on the site, so there are never dead links.
 */
export const SOCIAL = {
  instagram: '',
  tiktok: '',
  facebook: '',
  x: '',
  youtube: '',
  whatsapp: SITE.whatsapp,
} as const

export interface SocialLink {
  label: string
  href: string
}

/** Every profile that has a link, plus WhatsApp, in display order. */
export function socialLinks(): SocialLink[] {
  const list: SocialLink[] = [
    { label: 'Instagram', href: SOCIAL.instagram },
    { label: 'TikTok', href: SOCIAL.tiktok },
    { label: 'Facebook', href: SOCIAL.facebook },
    { label: 'X', href: SOCIAL.x },
    { label: 'YouTube', href: SOCIAL.youtube },
  ].filter((s) => s.href.startsWith('https://'))
  list.push({ label: 'WhatsApp', href: `https://wa.me/${SOCIAL.whatsapp}` })
  return list
}

/** Pre-filled WhatsApp chat link. */
export function whatsappLink(message?: string): string {
  const base = `https://wa.me/${SITE.whatsapp}`
  return message ? `${base}?text=${encodeURIComponent(message)}` : base
}
