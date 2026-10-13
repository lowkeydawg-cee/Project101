/**
 * Order notification emails via EmailJS (https://www.emailjs.com).
 *
 * Two emails go out after a successful order:
 *   - one to the shop (the admin template's "To" address is set in EmailJS)
 *   - one to the customer (the customer template's "To" is {{customer_email}})
 *
 * If the VITE_EMAILJS_* variables aren't set, this does nothing — orders
 * still go through, you just won't get emails. Email failures never block
 * or undo an order.
 */

const SERVICE_ID = import.meta.env.VITE_EMAILJS_SERVICE_ID as string | undefined
const PUBLIC_KEY = import.meta.env.VITE_EMAILJS_PUBLIC_KEY as string | undefined
const ADMIN_TEMPLATE = import.meta.env.VITE_EMAILJS_ADMIN_TEMPLATE_ID as string | undefined
const CUSTOMER_TEMPLATE = import.meta.env.VITE_EMAILJS_CUSTOMER_TEMPLATE_ID as string | undefined

export interface OrderEmail {
  orderNumber: string
  customerName: string
  customerEmail: string
  customerPhone: string
  deliveryMethod: 'pickup' | 'delivery'
  deliveryAddress: string | null
  items: { name: string; quantity: number; unit_price: number }[]
  subtotal: number
  deliveryFee: number
  total: number
}

function rwf(amount: number) {
  return `${amount.toLocaleString('en-US')} RWF`
}

async function send(templateId: string, params: Record<string, string>) {
  const response = await fetch('https://api.emailjs.com/api/v1.0/email/send', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      service_id: SERVICE_ID,
      template_id: templateId,
      user_id: PUBLIC_KEY,
      template_params: params,
    }),
  })
  if (!response.ok) {
    throw new Error(`EmailJS ${response.status}: ${await response.text()}`)
  }
}

export async function sendOrderEmails(order: OrderEmail): Promise<void> {
  if (!SERVICE_ID || !PUBLIC_KEY) return

  const params: Record<string, string> = {
    order_number: order.orderNumber,
    customer_name: order.customerName,
    customer_email: order.customerEmail,
    customer_phone: order.customerPhone,
    delivery_method: order.deliveryMethod === 'delivery' ? 'Delivery' : 'Pickup',
    delivery_address: order.deliveryAddress ?? '—',
    items: order.items
      .map((i) => `${i.quantity} × ${i.name} — ${rwf(i.unit_price * i.quantity)}`)
      .join('\n'),
    subtotal: rwf(order.subtotal),
    delivery_fee: order.deliveryFee ? rwf(order.deliveryFee) : 'Free',
    total: rwf(order.total),
    status_link: `${window.location.origin}/order-status?order=${order.orderNumber}`,
  }

  const jobs: Promise<void>[] = []
  if (ADMIN_TEMPLATE) jobs.push(send(ADMIN_TEMPLATE, params))
  if (CUSTOMER_TEMPLATE) jobs.push(send(CUSTOMER_TEMPLATE, params))

  const results = await Promise.allSettled(jobs)
  for (const r of results) {
    if (r.status === 'rejected') console.warn('Order email failed:', r.reason)
  }
}
