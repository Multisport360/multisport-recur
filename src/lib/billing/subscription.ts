import type Stripe from "stripe";
import type { SubscriptionRow } from "@/lib/supabase/database.types";

/**
 * Turning Stripe subscriptions into our subscriptions row, and our row into a plain state.
 * Pure functions, so they are tested without Stripe.
 */

/** Statuses that give access to the training plan. Matches the database policy. */
export const ACTIVE_STATUSES = ["active", "trialing"] as const;

export type SubscriptionFields = Pick<
  SubscriptionRow,
  | "stripe_subscription_id"
  | "status"
  | "price_cents"
  | "billing_interval"
  | "current_period_end"
  | "cancel_at_period_end"
  | "canceled_at"
>;

function isoFromSeconds(seconds: number | null | undefined): string | null {
  return seconds ? new Date(seconds * 1000).toISOString() : null;
}

/**
 * Our row's fields from a Stripe subscription. In current Stripe API versions the billing
 * period lives on each subscription item, so the latest item end is used.
 */
export function fieldsFromStripe(subscription: Stripe.Subscription): SubscriptionFields {
  const items = subscription.items.data;
  const periodEnd = items.length > 0 ? Math.max(...items.map((item) => item.current_period_end)) : null;
  const price = items[0]?.price;
  return {
    stripe_subscription_id: subscription.id,
    status: subscription.status,
    price_cents: price?.unit_amount ?? null,
    billing_interval: price?.recurring?.interval ?? null,
    current_period_end: isoFromSeconds(periodEnd),
    cancel_at_period_end: subscription.cancel_at_period_end || subscription.cancel_at !== null,
    canceled_at: isoFromSeconds(subscription.canceled_at),
  };
}

export type PlanAccess =
  | { state: "none" }
  | { state: "active"; renewsOn: Date | null }
  | { state: "ending"; endsOn: Date | null }
  | { state: "payment_problem" }
  | { state: "ended" };

type AccessFields = Pick<SubscriptionRow, "status" | "current_period_end" | "cancel_at_period_end">;

/** What the family's subscription means for them right now. */
export function planAccess(row: AccessFields | null): PlanAccess {
  if (!row || row.status === "incomplete" || row.status === "incomplete_expired") return { state: "none" };
  const periodEnd = row.current_period_end ? new Date(row.current_period_end) : null;
  if ((ACTIVE_STATUSES as readonly string[]).includes(row.status)) {
    return row.cancel_at_period_end ? { state: "ending", endsOn: periodEnd } : { state: "active", renewsOn: periodEnd };
  }
  if (row.status === "past_due" || row.status === "unpaid") return { state: "payment_problem" };
  return { state: "ended" };
}

export function hasPlanAccess(access: PlanAccess): boolean {
  return access.state === "active" || access.state === "ending";
}
