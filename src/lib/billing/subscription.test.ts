import type Stripe from "stripe";
import { describe, expect, test } from "vitest";
import { fieldsFromStripe, hasPlanAccess, planAccess } from "./subscription";

const DEC_17_2026 = Date.UTC(2026, 11, 17) / 1000;

function stripeSubscription(overrides: Partial<Stripe.Subscription> = {}): Stripe.Subscription {
  return {
    id: "sub_123",
    status: "active",
    cancel_at_period_end: false,
    cancel_at: null,
    canceled_at: null,
    items: {
      data: [{ current_period_end: DEC_17_2026, price: { unit_amount: 1200, recurring: { interval: "month" } } }],
    },
    ...overrides,
  } as unknown as Stripe.Subscription;
}

describe("fieldsFromStripe", () => {
  test("reads status, price, interval and the period end from the subscription item", () => {
    expect(fieldsFromStripe(stripeSubscription())).toEqual({
      stripe_subscription_id: "sub_123",
      status: "active",
      price_cents: 1200,
      billing_interval: "month",
      current_period_end: "2026-12-17T00:00:00.000Z",
      cancel_at_period_end: false,
      canceled_at: null,
    });
  });

  test("a scheduled cancel counts as ending at the period end", () => {
    expect(fieldsFromStripe(stripeSubscription({ cancel_at_period_end: true })).cancel_at_period_end).toBe(true);
    expect(fieldsFromStripe(stripeSubscription({ cancel_at: DEC_17_2026 })).cancel_at_period_end).toBe(true);
  });
});

describe("planAccess", () => {
  const row = (status: string, cancel = false) => ({
    status,
    current_period_end: "2026-12-17T00:00:00.000Z",
    cancel_at_period_end: cancel,
  });

  test("no row, or a checkout never finished, is no plan", () => {
    expect(planAccess(null)).toEqual({ state: "none" });
    expect(planAccess(row("incomplete"))).toEqual({ state: "none" });
  });

  test("active renews; active with a scheduled cancel is ending; both have access", () => {
    const active = planAccess(row("active"));
    const ending = planAccess(row("active", true));
    expect(active).toEqual({ state: "active", renewsOn: new Date("2026-12-17T00:00:00.000Z") });
    expect(ending).toEqual({ state: "ending", endsOn: new Date("2026-12-17T00:00:00.000Z") });
    expect(hasPlanAccess(active)).toBe(true);
    expect(hasPlanAccess(ending)).toBe(true);
  });

  test("past due and canceled have no access", () => {
    expect(planAccess(row("past_due"))).toEqual({ state: "payment_problem" });
    expect(planAccess(row("canceled"))).toEqual({ state: "ended" });
    expect(hasPlanAccess(planAccess(row("canceled")))).toBe(false);
  });
});
