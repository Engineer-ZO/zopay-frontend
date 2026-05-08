/**
 * Hosted checkout sessions use a UUID `id` in `/pay/:id`.
 * Payment links use an opaque `slug` (not a UUID) with `/public/v1/payment-links/:slug`.
 * Use this to choose which public API to call and avoid hitting checkout for payment-link slugs.
 */
const CHECKOUT_SESSION_UUID =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export function isCheckoutSessionId(value: string): boolean {
  const v = value.trim();
  return v.length > 0 && CHECKOUT_SESSION_UUID.test(v);
}
