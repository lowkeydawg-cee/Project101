import { Link } from 'wouter'

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
            <li><Link href="/shop" className="text-ink hover:text-signal-soft">Storefront</Link></li>
            <li><Link href="/custom" className="text-ink hover:text-signal-soft">Custom Quote</Link></li>
            <li><Link href="/about" className="text-ink hover:text-signal-soft">About</Link></li>
          </ul>
        </div>

        <div>
          <p className="font-mono-label text-[11px] uppercase text-ink-dim">Contact</p>
          <ul className="mt-3 space-y-2 text-sm text-ink-dim">
            <li>hello@safehouse.rw <span className="text-[10px]">(placeholder)</span></li>
            <li>Kigali, Rwanda</li>
          </ul>
        </div>

        <div>
          <p className="font-mono-label text-[11px] uppercase text-ink-dim">Elsewhere</p>
          <ul className="mt-3 space-y-2 text-sm text-ink-dim">
            <li>Instagram <span className="text-[10px]">(placeholder)</span></li>
            <li>WhatsApp <span className="text-[10px]">(placeholder)</span></li>
          </ul>
        </div>
      </div>
      <div className="border-t border-hairline px-6 py-5">
        <p className="mx-auto max-w-7xl font-mono-label text-[10px] uppercase text-ink-dim">
          © {new Date().getFullYear()} The Safehouse. All artifacts fabricated in Kigali.
        </p>
      </div>
    </footer>
  )
}
