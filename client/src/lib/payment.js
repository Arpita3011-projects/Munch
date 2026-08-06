/**
 * Payment method helpers.
 *
 * Demo portfolio app — no real payment gateway is used. The values below
 * are stored on the order and rendered across the customer + admin UI.
 */

export const PAYMENT_METHODS = [
  {
    id: 'Cash on Delivery',
    label: 'Cash on Delivery',
    shortLabel: 'COD',
    subtitle: 'Pay with cash when your order arrives',
  },
  {
    id: 'UPI',
    label: 'UPI',
    shortLabel: 'UPI',
    subtitle: 'Pay via GPay, PhonePe, Paytm & more',
  },
  {
    id: 'Card',
    label: 'Credit / Debit Card',
    shortLabel: 'Card',
    subtitle: 'Visa, Mastercard, RuPay, Amex',
  },
];

export const DEFAULT_PAYMENT_METHOD = 'Cash on Delivery';

/**
 * Map a stored paymentMethod value (including legacy values) to a
 * user-friendly display label.
 */
export function paymentLabel(value) {
  switch (value) {
    case 'Cash on Delivery':
    case 'cash':
    case 'mock':
      return 'Cash on Delivery';
    case 'UPI':
      return 'UPI';
    case 'Card':
    case 'card':
      return 'Credit / Debit Card';
    default:
      return value || 'Cash on Delivery';
  }
}

/**
 * Validate a UPI ID in the form name@bank (e.g. user@oksbi, demo@ybl).
 */
export function isValidUPI(upiId) {
  return /^[a-zA-Z0-9._-]{2,}@[a-zA-Z]{2,}$/.test(upiId.trim());
}

/**
 * Validate a 16-digit card number (spaces / dashes allowed).
 */
export function isValidCardNumber(number) {
  const digits = number.replace(/[\s-]/g, '');
  return /^\d{16}$/.test(digits);
}

/**
 * Validate expiry in MM/YY format and ensure it is not in the past.
 */
export function isValidExpiry(expiry) {
  const match = expiry.trim().match(/^(0[1-9]|1[0-2])\s*\/\s*(\d{2})$/);
  if (!match) return false;
  const month = Number(match[1]);
  const year = 2000 + Number(match[2]);
  const expDate = new Date(year, month, 0, 23, 59, 59);
  return expDate.getTime() >= Date.now();
}

/**
 * Validate a 3-digit CVV.
 */
export function isValidCVV(cvv) {
  return /^\d{3}$/.test(cvv.trim());
}

