import { Link } from 'wouter'
import { buttonClass } from '@/components/Button'

export function NotFound() {
  return (
    <div className="mx-auto flex max-w-2xl flex-col items-center px-6 py-32 text-center">
      <p className="font-mono-label text-signal-soft">[ 404 ]</p>
      <h1 className="mt-4 font-display text-6xl uppercase text-ink">Not Found</h1>
      <p className="mt-4 text-ink-dim">This artifact doesn't exist, or has been moved.</p>
      <Link href="/" className={`${buttonClass('primary')} mt-8`}>
        Return Home
      </Link>
    </div>
  )
}
