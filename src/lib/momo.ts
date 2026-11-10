import { MOMO } from './site'

/**
 * Manual MTN MoMo payment helpers.
 *
 * There is no payment gateway yet. The customer pays from their own phone,
 * then pastes the transaction ID from MTN's SMS onto their order page, and
 * the owner marks the order paid in admin after checking his MoMo statement.
 */

/** False while the number in site.ts is still the placeholder. */
export const momoReady = MOMO.number !== '0780000000' && !MOMO.accountName.startsWith('Account name')

/**
 * The USSD string that opens MTN MoMo with the payee and amount filled in.
 * Merchant code (MoMo Pay) when there is one, otherwise pay-by-number.
 *
 * SAINT: dial this once from your own phone before launch to check MTN still
 * accepts this shortcut. If it does not, customers can still follow the
 * written steps shown under the button.
 */
export function momoDialCode(amount: number): string {
  const rwf = Math.round(amount)
  return MOMO.merchantCode
    ? `*182*8*1*${MOMO.merchantCode}*${rwf}#`
    : `*182*1*1*${MOMO.number}*${rwf}#`
}

/** tel: link for the dial code. A raw # ends the link, so it must be encoded. */
export function momoTelHref(amount: number): string {
  return 'tel:' + momoDialCode(amount).replace(/#/g, '%23')
}

/** Who the customer is paying, in words, for the written steps. */
export function momoPayeeLine(): string {
  return MOMO.merchantCode
    ? `MoMo Pay merchant code ${MOMO.merchantCode} (${MOMO.accountName})`
    : `MTN MoMo number ${MOMO.number} (${MOMO.accountName})`
}

/** Plain-text instructions, for emails and WhatsApp. */
export function momoInstructions(orderNumber: string, total: number): string {
  if (!momoReady) {
    return `We will send you payment details on WhatsApp for order ${orderNumber}.`
  }
  return [
    `Pay ${total.toLocaleString('en-US')} RWF with MTN MoMo to ${momoPayeeLine()}.`,
    `Dial ${momoDialCode(total)} or use the MoMo app.`,
    `Then open your order page and paste the transaction ID from MTN's SMS, so we can match your payment to order ${orderNumber}.`,
    `We start printing once the payment is in. Unpaid orders are released after ${MOMO.payWindowHours} hours.`,
  ].join('\n')
}
