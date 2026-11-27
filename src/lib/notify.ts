/**
 * How messages and orders reach the studio.
 *
 * Contact notes and quote requests are saved in the database
 * (public.inquiries, through the submit_inquiry function). Saving fires the
 * "notify" server function, which alerts Saint on WhatsApp and by email once
 * those channels are switched on (see supabase/functions/notify).
 *
 * Nothing secret lives in the browser: no email or WhatsApp keys here.
 */
import { supabase } from '@/lib/supabase'

export interface Inquiry {
  /** Where it came from, so you can tell a contact note from a quote request. */
  kind: 'Contact' | 'Custom quote'
  name: string
  email: string
  phone?: string
  message: string
  /** Extra lines shown under the message, e.g. material and quantity. */
  details?: Record<string, string>
  /** Link to an uploaded STL, if there is one. */
  fileUrl?: string | null
}

/**
 * Saves a contact note or quote request. Throws when it cannot be saved, so
 * the form shows the WhatsApp route instead of pretending it arrived.
 */
export async function sendInquiry(inquiry: Inquiry): Promise<void> {
  const details = Object.fromEntries(
    Object.entries(inquiry.details ?? {}).filter(([, v]) => v)
  )
  const { error } = await supabase.rpc('submit_inquiry', {
    p_kind: inquiry.kind,
    p_name: inquiry.name,
    p_email: inquiry.email,
    p_phone: inquiry.phone ?? '',
    p_message: inquiry.message,
    p_details: details,
    p_file_url: inquiry.fileUrl ?? null,
  })
  if (error) throw new Error(error.message)
}
