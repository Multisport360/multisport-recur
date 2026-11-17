/**
 * Training plan price and billing interval.
 *
 * PLACEHOLDER: $12 a month has NOT been decided. Kai sets the real price and interval.
 * Change it here only; every page, the checkout and the emails read from this file.
 */
export const PLAN = {
  name: "Training plan",
  priceCents: 1200,
  currency: "usd",
  interval: "month",
} as const;

export type BillingInterval = typeof PLAN.interval;

/** "$12" or "$12.50". */
export function formatPrice(cents: number): string {
  const dollars = cents / 100;
  return Number.isInteger(dollars) ? `$${dollars}` : `$${dollars.toFixed(2)}`;
}

/** "$12 a month". */
export function priceWithInterval(): string {
  return `${formatPrice(PLAN.priceCents)} a ${PLAN.interval}`;
}
