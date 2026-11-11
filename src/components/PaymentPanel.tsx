import { useState, type FormEvent } from 'react'
import { Check, Copy, Phone } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { formatRWF } from '@/lib/format'
import { MOMO, whatsappLink } from '@/lib/site'
import { momoDialCode, momoReady, momoTelHref } from '@/lib/momo'

export type PaymentStatus = 'awaiting_payment' | 'paid' | 'expired' | 'refunded'

interface Props {
  orderNumber: string
  total: number
  paymentStatus: PaymentStatus
  payBy: string | null
  refSent: boolean
  onRefSent: () => void
}

function deadline(payBy: string | null): string {
  if (!payBy) return `within ${MOMO.payWindowHours} hours`
  return new Date(payBy).toLocaleString('en-GB', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  })
}

/**
 * What the customer owes and how to pay it, shown on their order page.
 * Manual MTN MoMo: they pay from their phone, paste the transaction ID from
 * MTN's SMS, and the owner confirms it in admin.
 */
export function PaymentPanel({ orderNumber, total, paymentStatus, payBy, refSent, onRefSent }: Props) {
  const [ref, setRef] = useState('')
  const [sending, setSending] = useState(false)
  const [error, setError] = useState('')
  const [copied, setCopied] = useState(false)

  const help = whatsappLink(`Hi Safehouse, this is about order ${orderNumber}.`)

  if (paymentStatus === 'paid') {
    return (
      <div className="border border-hairline p-6 sm:p-8">
        <p className="flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.16em] text-ink">
          <Check size={14} aria-hidden="true" /> Payment received
        </p>
        <p className="mt-3 max-w-xl text-[15px] leading-relaxed text-ink-dim">
          Thank you. {formatRWF(total)} is in, and your piece is in the queue.
          Its progress shows below.
        </p>
      </div>
    )
  }

  if (paymentStatus === 'expired' || paymentStatus === 'refunded') {
    return (
      <div className="border border-hairline p-6 sm:p-8">
        <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-ink">
          {paymentStatus === 'expired' ? 'This order was released' : 'This order was refunded'}
        </p>
        <p className="mt-3 max-w-xl text-[15px] leading-relaxed text-ink-dim">
          {paymentStatus === 'expired'
            ? `No payment arrived within ${MOMO.payWindowHours} hours, so nothing went on the printer. If you already paid, message us with your MoMo SMS and we will sort it out.`
            : 'Your payment was returned. Message us if anything looks wrong.'}
        </p>
        <a
          href={help}
          target="_blank"
          rel="noreferrer noopener"
          className="sh-btn mt-5 inline-flex min-h-[44px] items-center border border-ink px-5 font-mono text-[11px] uppercase tracking-[0.14em] text-ink transition-colors hover:bg-ink hover:text-void"
        >
          Message us on WhatsApp
        </a>
      </div>
    )
  }

  // Number not set up yet: never show a fake number to a real customer.
  if (!momoReady) {
    return (
      <div className="border border-hairline p-6 sm:p-8">
        <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-ink">Order received</p>
        <p className="mt-3 max-w-xl text-[15px] leading-relaxed text-ink-dim">
          We will message you on WhatsApp with payment details for {formatRWF(total)}.
        </p>
      </div>
    )
  }

  async function copyNumber() {
    try {
      await navigator.clipboard.writeText(MOMO.merchantCode || MOMO.number)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // Clipboard can be blocked. The number is on screen to read anyway.
    }
  }

  async function sendRef(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (sending) return
    setSending(true)
    setError('')
    const { error: rpcError } = await supabase.rpc('submit_payment_ref', {
      p_order_number: orderNumber,
      p_ref: ref,
    })
    setSending(false)
    if (rpcError) {
      setError(rpcError.message)
      return
    }
    setRef('')
    onRefSent()
  }

  const payee = MOMO.merchantCode ? 'Merchant code' : 'MoMo number'

  return (
    <div className="border border-ink p-6 sm:p-8">
      <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-ink-dim">
        Step 1 of 2 · Pay with MTN MoMo
      </p>
      <p className="mt-4 font-mono text-[clamp(2rem,5vw,3.25rem)] font-medium tracking-[-0.04em] text-ink">
        {formatRWF(total)}
      </p>

      <dl className="mt-5 grid max-w-xl gap-y-2 border-t border-hairline pt-4 text-[15px] sm:grid-cols-[150px_1fr]">
        <dt className="text-ink-dim">{payee}</dt>
        <dd className="flex items-center gap-3 font-mono text-ink">
          {MOMO.merchantCode || MOMO.number}
          <button
            type="button"
            onClick={copyNumber}
            className="inline-flex items-center gap-1 font-mono text-[10px] uppercase tracking-[0.14em] text-ink-dim hover:text-ink"
          >
            <Copy size={12} aria-hidden="true" /> {copied ? 'Copied' : 'Copy'}
          </button>
        </dd>
        {MOMO.accountName && (
          <>
            <dt className="text-ink-dim">Name shown</dt>
            <dd className="text-ink">{MOMO.accountName}</dd>
          </>
        )}
        <dt className="text-ink-dim">Pay by</dt>
        <dd className="text-ink">{deadline(payBy)}</dd>
      </dl>

      <a
        href={momoTelHref(total)}
        className="sh-btn mt-6 inline-flex min-h-[52px] items-center gap-2 bg-ink px-6 font-mono text-[12px] uppercase tracking-[0.12em] text-void transition-opacity hover:opacity-85"
      >
        <Phone size={15} aria-hidden="true" /> Dial to pay
      </a>
      <p className="mt-3 max-w-xl text-sm leading-relaxed text-ink-dim">
        On your phone this opens MoMo with the amount filled in: <span className="font-mono text-ink">{momoDialCode(total)}</span>.
        Or dial <span className="font-mono text-ink">*182#</span>, choose {MOMO.merchantCode ? 'Pay' : 'Send money'}, and enter the {MOMO.merchantCode ? 'merchant code' : 'MoMo number'} and amount above.
        {MOMO.accountName ? (
          <> Check the name says <span className="text-ink">{MOMO.accountName}</span> before you confirm.</>
        ) : (
          <> Check the amount matches before you confirm.</>
        )}
      </p>

      <div className="mt-8 border-t border-hairline pt-6">
        <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-ink-dim">
          Step 2 of 2 · Send us the transaction ID
        </p>

        {refSent ? (
          <p className="mt-3 max-w-xl text-[15px] leading-relaxed text-ink">
            Got it. We check it against our MoMo statement, usually within a few hours,
            and this page will show the payment as received. We start printing then.
          </p>
        ) : (
          <p className="mt-3 max-w-xl text-[15px] leading-relaxed text-ink-dim">
            MTN sends you an SMS after you pay. Copy the transaction ID from it and paste it here,
            so we can match your payment to order {orderNumber}.
          </p>
        )}

        <form onSubmit={sendRef} className="mt-4 flex max-w-xl flex-col gap-3 sm:flex-row">
          <label htmlFor="momo-ref" className="sr-only">MoMo transaction ID</label>
          <input
            id="momo-ref"
            value={ref}
            onChange={(e) => setRef(e.target.value)}
            inputMode="text"
            autoComplete="off"
            placeholder={refSent ? 'Send a different ID' : 'Transaction ID from the SMS'}
            className="sh-field min-h-[48px] flex-1 border border-hairline bg-transparent px-4 font-mono text-sm text-ink outline-none placeholder:text-ink-dim focus:border-ink"
          />
          <button
            type="submit"
            disabled={sending || ref.trim().length < 6}
            className="sh-btn min-h-[48px] border border-ink px-5 font-mono text-[11px] uppercase tracking-[0.14em] text-ink transition-colors hover:bg-ink hover:text-void disabled:cursor-not-allowed disabled:opacity-40"
          >
            {sending ? 'Sending...' : 'Send'}
          </button>
        </form>
        {error && (
          <p role="alert" className="mt-3 text-sm text-ink">
            {error}
          </p>
        )}
        <p className="mt-4 text-sm text-ink-dim">
          Easier on WhatsApp?{' '}
          <a href={help} target="_blank" rel="noreferrer noopener" className="text-ink underline underline-offset-4">
            Send us a screenshot of the SMS
          </a>
          .
        </p>
      </div>
    </div>
  )
}
