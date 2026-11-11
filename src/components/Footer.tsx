import { Link } from 'wouter'
import { SITE, socialLinks } from '@/lib/site'

export function Footer() {
  return (
    <footer className="border-t border-hairline">
      <div className="mx-auto grid max-w-7xl gap-10 px-6 py-16 sm:grid-cols-2 md:grid-cols-4">
        <div>
          <p className="font-display text-xl uppercase text-ink">The Safehouse</p>
          <p className="mt-3 max-w-[24ch] text-sm text-ink-dim">
            Kigali 3D fabrication studio. Catalog artifacts and one-off custom pieces.
          </p>
        </div>

        <div>
          <p className="font-mono-label text-[11px] uppercase text-ink-dim">Navigate</p>
          <ul className="mt-3 space-y-2 text-sm">
            <li><Link href="/shop" className="text-ink hover:text-signal-soft">Shop</Link></li>
            <li><Link href="/custom-quote" className="text-ink hover:text-signal-soft">Custom Orders</Link></li>
            <li><Link href="/order-status" className="text-ink hover:text-signal-soft">Track an Order</Link></li>
            <li><Link href="/faq" className="text-ink hover:text-signal-soft">Questions</Link></li>
            <li><Link href="/contact" className="text-ink hover:text-signal-soft">Contact</Link></li>
            <li><Link href="/about" className="text-ink hover:text-signal-soft">About</Link></li>
            <li><Link href="/terms" className="text-ink hover:text-signal-soft">Terms of sale</Link></li>
            <li><Link href="/returns" className="text-ink hover:text-signal-soft">Returns</Link></li>
            <li><Link href="/privacy" className="text-ink hover:text-signal-soft">Privacy</Link></li>
          </ul>
        </div>

        <div>
          <p className="font-mono-label text-[11px] uppercase text-ink-dim">Contact</p>
          <ul className="mt-3 space-y-2 text-sm text-ink-dim">
            <li>
              <a href={`mailto:${SITE.email}`} className="text-ink hover:text-signal-soft">
                {SITE.email}
              </a>
            </li>
            <li>
              {SITE.city}, {SITE.country}
            </li>
          </ul>
        </div>

        <div>
          <p className="font-mono-label text-[11px] uppercase text-ink-dim">Elsewhere</p>
          <ul className="mt-3 space-y-2 text-sm">
            {socialLinks().map((l) => (
              <li key={l.label}>
                <a href={l.href} target="_blank" rel="noreferrer noopener" className="text-ink hover:text-signal-soft">
                  {l.label}
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>
      <div className="border-t border-hairline px-6 py-5">
        <div className="mx-auto flex max-w-7xl flex-wrap justify-between gap-x-8 gap-y-2">
          <p className="font-mono-label text-[10px] uppercase text-ink-dim">
            © {new Date().getFullYear()} The Safehouse. All artifacts fabricated in {SITE.city}.
          </p>
          {/* Said plainly, because a buyer deserves to know which pictures are
              of a real object and which are setting a mood. Product photos on
              the storefront are real; these are not. */}
          <p className="font-mono-label text-[10px] uppercase text-ink-dim">
            Studio and lifestyle imagery is illustrative
          </p>
        </div>
      </div>
    </footer>
  )
}