import { Link } from 'wouter'
import { Eyebrow } from '@/components/Eyebrow'
import { buttonClass } from '@/components/Button'

const principles = [
  {
    title: 'Print-native design',
    body: 'Layer lines and print artifacts are part of the object, not something to hide.',
  },
  {
    title: 'Small batch, made to fit',
    body: 'Most pieces are printed on request. Nothing sits in a warehouse waiting to sell.',
  },
  {
    title: 'Your file, your piece',
    body: 'If you can model it, we can likely print it — bring your own STL any time.',
  },
]

export function About() {
  return (
    <div>
      <section className="mx-auto max-w-4xl px-6 py-16">
        <Eyebrow>The Studio</Eyebrow>
        <h1 className="mt-4 font-display text-4xl uppercase leading-tight text-ink md:text-5xl">
          A fabrication studio,
          <br />
          not a factory.
        </h1>
        <p className="mt-6 max-w-xl text-ink-dim">
          The Safehouse started as a handful of printers and a growing catalog of
          objects worth keeping. We fabricate on demand out of Kigali — a mix of
          our own designs and pieces our customers bring in as their own files.
        </p>
      </section>

      <section className="border-t border-hairline bg-panel/40">
        <div className="mx-auto max-w-4xl px-6 py-16">
          <blockquote className="font-display text-2xl uppercase leading-snug text-ink md:text-3xl">
            "Every artifact carries the mark of how it was made."
          </blockquote>
        </div>
      </section>

      <section className="mx-auto max-w-4xl px-6 py-16">
        <Eyebrow>Principles</Eyebrow>
        <div className="mt-8 grid gap-10 sm:grid-cols-3">
          {principles.map((p) => (
            <div key={p.title}>
              <h3 className="font-display text-lg uppercase text-ink">{p.title}</h3>
              <p className="mt-2 text-sm text-ink-dim">{p.body}</p>
            </div>
          ))}
        </div>

        <div className="mt-14 flex flex-wrap gap-4 border-t border-hairline pt-10">
          <Link href="/shop" className={buttonClass('primary')}>
            Browse Storefront
          </Link>
          <Link href="/custom" className={buttonClass('secondary')}>
            Request a Custom Piece
          </Link>
        </div>
      </section>
    </div>
  )
}
