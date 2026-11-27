/**
 * Training plan price and billing interval.
 *
 * PLACEHOLDER: $12 a month has NOT been decided. Kai sets the real price and interval.
 * Change it here only; every page, the checkout and the emails read from this file.
 */

import { formatLongDateIn } from "@/lib/dates";

export const PLAN = {
  name: "Multi-Sport Recur training plan",
  priceCents: 1200,
  currency: "usd",
  interval: "month",
} as const;

export type BillingInterval = typeof PLAN.interval;

/** Identifies the renewal wording a parent agreed to. Stored on the Stripe subscription. Bump it when the words change. */
export const RENEWAL_TERMS_VERSION = "2026-11-draft-1";

/** "$12" or "$12.50". */
export function formatPrice(cents: number): string {
  const dollars = cents / 100;
  return Number.isInteger(dollars) ? `$${dollars}` : `$${dollars.toFixed(2)}`;
}

/** "$12 a month". */
export function priceWithInterval(): string {
  return `${formatPrice(PLAN.priceCents)} a ${PLAN.interval}`;
}

/**
 * The same day next month, or the last day of next month when that day doesn't exist
 * (Jan 31 -> Feb 28). This is how Stripe moves monthly billing dates.
 */
export function addOneMonth(date: Date): Date {
  const year = date.getUTCFullYear();
  const nextMonth = date.getUTCMonth() + 1;
  const lastDayOfNextMonth = new Date(Date.UTC(year, nextMonth + 1, 0)).getUTCDate();
  return new Date(
    Date.UTC(year, nextMonth, Math.min(date.getUTCDate(), lastDayOfNextMonth), date.getUTCHours(), date.getUTCMinutes()),
  );
}

/** "December 17, 2026": the calendar day that moment falls on in the family's time zone. */
export function formatLongDate(date: Date, timeZone: string): string {
  return formatLongDateIn(date, timeZone);
}

export type CheckoutTerms = {
  firstCharge: string;
  renewal: string;
  nextCharge: string;
  howToCancel: string;
  agreement: string;
};

/** Everything a parent must see before checkout (CLAUDE.md billing rules). */
export function checkoutTerms(today: Date, timeZone: string): CheckoutTerms {
  const price = formatPrice(PLAN.priceCents);
  return {
    firstCharge: `You pay ${price} today.`,
    renewal: `It renews every ${PLAN.interval} until you cancel.`,
    nextCharge: `Your next charge is ${price} on ${formatLongDate(addOneMonth(today), timeZone)}.`,
    howToCancel:
      "Cancel any time from your Account page in two clicks. You keep the plan until the end of the month you've paid for, and you won't be charged again.",
    agreement: `I understand this subscription renews automatically at ${price} every ${PLAN.interval} until I cancel.`,
  };
}
