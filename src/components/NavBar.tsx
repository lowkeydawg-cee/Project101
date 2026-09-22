import { useState } from 'react'
import { Link } from 'wouter'
import { Menu, X, ShoppingBag } from 'lucide-react'
import { useCart } from '@/context/CartContext'

const links = [
  { href: '/shop', label: 'Storefront' },
  { href: '/custom', label: 'Custom Quote' },
  { href: '/about', label: 'About' },
  { href: '/contact', label: 'Contact' },
]

export function NavBar() {
  const [open, setOpen] = useState(false)
  const { itemCount } = useCart()

  return (
    <header className="sticky top-0 z-40 border-b border-hairline bg-void/90 backdrop-blur">
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
        <Link
          href="/"
          className="font-mono-label text-xs uppercase text-ink"
          aria-label="The Safehouse, home"
        >
          The Safehouse
        </Link>

        <div className="hidden items-center gap-7 md:flex">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="font-mono-label text-xs uppercase text-ink-dim transition-colors hover:text-ink"
            >
              {l.label}
            </Link>
          ))}
          <Link
            href="/cart"
            className="relative flex items-center gap-2 font-mono-label text-xs uppercase text-ink-dim transition-colors hover:text-ink"
            aria-label={`Cart, ${itemCount} item${itemCount === 1 ? '' : 's'}`}
          >
            <ShoppingBag size={16} aria-hidden="true" />
            {itemCount > 0 && (
              <span className="rounded-full bg-signal px-1.5 py-0.5 text-[10px] text-ink">
                {itemCount}
              </span>
            )}
          </Link>
        </div>

        <button
          className="text-ink md:hidden"
          onClick={() => setOpen((o) => !o)}
          aria-expanded={open}
          aria-label={open ? 'Close menu' : 'Open menu'}
        >
          {open ? <X size={22} /> : <Menu size={22} />}
        </button>
      </nav>

      {open && (
        <div className="border-t border-hairline px-6 py-4 md:hidden">
          <div className="flex flex-col gap-4">
            {links.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                onClick={() => setOpen(false)}
                className="font-mono-label text-sm uppercase text-ink-dim hover:text-ink"
              >
                {l.label}
              </Link>
            ))}
            <Link
              href="/cart"
              onClick={() => setOpen(false)}
              className="font-mono-label text-sm uppercase text-ink-dim hover:text-ink"
            >
              Cart {itemCount > 0 ? `(${itemCount})` : ''}
            </Link>
          </div>
        </div>
      )}
    </header>
  )
}
