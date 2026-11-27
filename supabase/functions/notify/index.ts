// notify: alerts the studio about new orders, payment IDs and messages.
//
// Called by database triggers (see migration "inquiries_and_alerts"), never
// by the browser. Each channel switches on when its secrets are set in
// Supabase → Edge Functions → Secrets, and is skipped quietly until then:
//
//   WhatsApp (CallMeBot, free):  CALLMEBOT_APIKEY, ALERT_WHATSAPP (+250...)
//   WhatsApp (TextMeBot, paid):  TEXTMEBOT_APIKEY, ALERT_WHATSAPP
//   Email (Resend, free tier):   RESEND_API_KEY, ALERT_EMAIL
//                                (customers also get an order confirmation)
import { createClient } from 'npm:@supabase/supabase-js@2.45.4'

const db = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
)

const SITE = 'https://www.safehouse.rw'
const FROM = Deno.env.get('ALERT_FROM') ?? 'The Safehouse <orders@safehouse.rw>'
const rwf = (n: number) => `${Number(n).toLocaleString('en-US')} RWF`

async function whatsapp(text: string) {
  const to = Deno.env.get('ALERT_WHATSAPP')
  if (!to) return 'whatsapp: no number'
  const callmebot = Deno.env.get('CALLMEBOT_APIKEY')
  const textmebot = Deno.env.get('TEXTMEBOT_APIKEY')
  if (callmebot) {
    const url = `https://api.callmebot.com/whatsapp.php?phone=${encodeURIComponent(to)}&text=${encodeURIComponent(text)}&apikey=${encodeURIComponent(callmebot)}`
    const r = await fetch(url)
    return `whatsapp(callmebot): ${r.status}`
  }
  if (textmebot) {
    const url = `https://api.textmebot.com/send.php?recipient=${encodeURIComponent(to)}&apikey=${encodeURIComponent(textmebot)}&text=${encodeURIComponent(text)}`
    const r = await fetch(url)
    return `whatsapp(textmebot): ${r.status}`
  }
  return 'whatsapp: not configured'
}

async function email(to: string, subject: string, text: string, replyTo?: string) {
  const key = Deno.env.get('RESEND_API_KEY')
  if (!key || !to) return 'email: not configured'
  const r = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ from: FROM, to: [to], subject, text, reply_to: replyTo }),
  })
  return `email(${to.split('@')[1]}): ${r.status}`
}

function itemLines(items: Array<Record<string, unknown>>) {
  return items.map((i) => {
    const p = (i.personalisation ?? {}) as Record<string, string>
    const extra = Object.entries(p).filter(([, v]) => v).map(([k, v]) => `${k.replace('colour_', '')}: ${v}`)
    return `• ${i.quantity} × ${i.product_name ?? i.name ?? 'Item'}${extra.length ? ` (${extra.join(', ')})` : ''}`
  }).join('\n')
}

Deno.serve(async (req) => {
  // Only the database knows this secret.
  const secret = req.headers.get('x-notify-secret') ?? ''
  const { data: ok } = await db.rpc('notify_secret_ok', { p: secret })
  if (!ok) return new Response('forbidden', { status: 403 })

  const { kind, id } = await req.json()
  const results: string[] = []

  if (kind === 'order' || kind === 'payment_ref') {
    const { data: o } = await db.from('orders').select('*').eq('id', id).single()
    if (!o) return new Response('no order', { status: 404 })
    const { data: items } = await db.from('order_items').select('*').eq('order_id', id)
    const list = itemLines(items ?? [])

    if (kind === 'order') {
      const msg = [
        `🧾 *New order ${o.order_number}*`,
        `${o.customer_name} · ${o.customer_phone}`,
        list,
        `Total: *${rwf(o.total)}* · ${o.delivery_method === 'delivery' ? `Delivery: ${o.delivery_address ?? ''}` : 'Pickup'}`,
        `Waiting for MoMo payment.`,
        `${SITE}/admin/orders`,
      ].join('\n')
      results.push(await whatsapp(msg))
      results.push(await email(Deno.env.get('ALERT_EMAIL') ?? '', `New order ${o.order_number} · ${rwf(o.total)}`, msg.replace(/\*/g, ''), o.customer_email))
      if (o.customer_email) {
        results.push(await email(o.customer_email, `Your Safehouse order ${o.order_number}`, [
          `Hi ${o.customer_name},`,
          ``,
          `Thank you. We have your order ${o.order_number}:`,
          list,
          `Total: ${rwf(o.total)}`,
          ``,
          `To start printing, pay with MTN MoMo using the details on your order page, then send us the transaction ID from MTN's SMS:`,
          `${SITE}/order-status?order=${o.order_number}`,
          ``,
          `Questions? Reply to this email or WhatsApp +250 783 200 122.`,
          `The Safehouse, Kigali`,
        ].join('\n'), Deno.env.get('ALERT_EMAIL') ?? undefined))
      }
    } else {
      const msg = [
        `💸 *Payment ID sent for ${o.order_number}*`,
        `${o.customer_name} · ${rwf(o.total)}`,
        `MoMo ID: *${o.payment_ref}*`,
        `Check it in MoMo, then mark it paid: ${SITE}/admin/orders`,
      ].join('\n')
      results.push(await whatsapp(msg))
      results.push(await email(Deno.env.get('ALERT_EMAIL') ?? '', `Payment ID for ${o.order_number}`, msg.replace(/\*/g, '')))
    }
  }

  if (kind === 'inquiry') {
    const { data: q } = await db.from('inquiries').select('*').eq('id', id).single()
    if (!q) return new Response('no inquiry', { status: 404 })
    const details = Object.entries(q.details ?? {}).map(([k, v]) => `${k}: ${v}`).join('\n')
    const msg = [
      q.kind === 'Custom quote' ? `📐 *New quote request*` : `✉️ *New message*`,
      `${q.name} · ${q.email}${q.phone ? ` · ${q.phone}` : ''}`,
      q.message.slice(0, 900),
      details,
      q.file_url ? `File: ${q.file_url}` : '',
    ].filter(Boolean).join('\n')
    results.push(await whatsapp(msg))
    results.push(await email(Deno.env.get('ALERT_EMAIL') ?? '', `${q.kind} from ${q.name}`, msg.replace(/\*/g, ''), q.email))
  }

  console.log(kind, id, results.join(' | '))
  return new Response(JSON.stringify({ ok: true, results }), { headers: { 'Content-Type': 'application/json' } })
})
