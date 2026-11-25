import type Stripe from "stripe";
import { beforeEach, describe, expect, test } from "vitest";
import type { Email } from "@/lib/email/send";
import type { SubscriptionRow } from "@/lib/supabase/database.types";
import { applySubscription, handleStripeEvent, type BillingDeps } from "./events";

const FAMILY = "family-1";
const CUSTOMER = "cus_1";
// Noon Eastern, so the date reads the same in UTC and Eastern; the 8 pm cases are tested on their own.
const DEC_17_2026 = Date.UTC(2026, 11, 17, 17) / 1000;

function subscription(overrides: Partial<Stripe.Subscription> = {}): Stripe.Subscription {
  return {
    id: "sub_1",
    status: "active",
    customer: CUSTOMER,
    metadata: { family_id: FAMILY },
    cancel_at_period_end: false,
    cancel_at: null,
    canceled_at: null,
    items: { data: [{ current_period_end: DEC_17_2026, price: { unit_amount: 1200, recurring: { interval: "month" } } }] },
    ...overrides,
  } as unknown as Stripe.Subscription;
}

function event<T extends Stripe.Event["type"]>(type: T, object: unknown): Stripe.Event {
  return { type, data: { object } } as unknown as Stripe.Event;
}

/** An in-memory store and outbox standing in for the database and Resend. */
function fakeDeps(initial: SubscriptionRow | null = null) {
  let row = initial;
  const sent: Email[] = [];
  const deps: BillingDeps = {
    store: {
      findByCustomer: async (customerId) => (row?.stripe_customer_id === customerId ? row : null),
      save: async (familyId, customerId, fields) => {
        const before = row;
        row = {
          id: "row-1",
          family_id: familyId,
          stripe_customer_id: customerId,
          renewal_reminder_sent_for: before?.renewal_reminder_sent_for ?? null,
          created_at: "",
          updated_at: "",
          ...fields,
        };
        return before;
      },
      markReminderSent: async (_familyId, periodEnd) => {
        if (row) row = { ...row, renewal_reminder_sent_for: periodEnd };
      },
      guardianEmail: async () => "parent@example.com",
      familyTimeZone: async () => "America/New_York",
    },
    sendEmail: async (email) => {
      sent.push(email);
      return { ok: true };
    },
    retrieveSubscription: async () => subscription(),
  };
  return { deps, sent, current: () => row };
}

let fake: ReturnType<typeof fakeDeps>;
beforeEach(() => {
  fake = fakeDeps();
});

describe("signup confirmation", () => {
  test("a completed checkout saves the subscription and sends one confirmation email", async () => {
    const result = await handleStripeEvent(fake.deps, event("checkout.session.completed", { subscription: "sub_1" }));

    expect(result.note).toBe("subscription started; email sent");
    expect(fake.current()).toMatchObject({ family_id: FAMILY, status: "active", current_period_end: "2026-12-17T17:00:00.000Z" });
    expect(fake.sent).toHaveLength(1);
    expect(fake.sent[0]?.subject).toBe("Your Multi-Sport Recur training plan subscription has started");
    expect(fake.sent[0]?.text).toContain("You pay $12 a month. It renews automatically, and the next charge is on December 17, 2026.");
    expect(fake.sent[0]?.text).toContain("two clicks");
  });

  test("the same event delivered twice sends the email once", async () => {
    await handleStripeEvent(fake.deps, event("checkout.session.completed", { subscription: "sub_1" }));
    await handleStripeEvent(fake.deps, event("customer.subscription.updated", subscription()));
    expect(fake.sent).toHaveLength(1);
  });

  test("an unfinished checkout sends nothing", async () => {
    await handleStripeEvent(fake.deps, event("customer.subscription.created", subscription({ status: "incomplete" })));
    expect(fake.sent).toEqual([]);
  });
});

describe("cancel confirmation", () => {
  beforeEach(async () => {
    await applySubscription(fake.deps, FAMILY, CUSTOMER, subscription());
    fake.sent.length = 0;
  });

  test("cancelling sends one email that says when access ends", async () => {
    await handleStripeEvent(fake.deps, event("customer.subscription.updated", subscription({ cancel_at_period_end: true })));
    await handleStripeEvent(fake.deps, event("customer.subscription.updated", subscription({ cancel_at_period_end: true })));

    expect(fake.sent).toHaveLength(1);
    expect(fake.sent[0]?.subject).toBe("Your Multi-Sport Recur training plan is cancelled");
    expect(fake.sent[0]?.text).toContain("You can still use the plan until December 17, 2026.");
  });

  test("the subscription ending at the period end after a cancel sends nothing more", async () => {
    await handleStripeEvent(fake.deps, event("customer.subscription.updated", subscription({ cancel_at_period_end: true })));
    await handleStripeEvent(fake.deps, event("customer.subscription.deleted", subscription({ status: "canceled" })));
    expect(fake.sent).toHaveLength(1);
    expect(fake.current()?.status).toBe("canceled");
  });
});

describe("renewal reminder", () => {
  beforeEach(async () => {
    await applySubscription(fake.deps, FAMILY, CUSTOMER, subscription());
    fake.sent.length = 0;
  });

  test("an upcoming invoice sends one reminder per billing period", async () => {
    const upcoming = event("invoice.upcoming", { customer: CUSTOMER, amount_due: 1200 });
    expect((await handleStripeEvent(fake.deps, upcoming)).note).toBe("renewal reminder: email sent");
    expect((await handleStripeEvent(fake.deps, upcoming)).note).toBe("reminder already sent for this period");

    expect(fake.sent).toHaveLength(1);
    expect(fake.sent[0]?.subject).toBe("Your Multi-Sport Recur training plan renews on December 17, 2026");
    expect(fake.sent[0]?.text).toContain("you'll be charged $12");
  });

  test("a period ending 8 pm Eastern on Dec 17 (1 am UTC Dec 18) is dated Dec 17 for an Eastern family", async () => {
    const eightPmEastern = Date.UTC(2026, 11, 18, 1) / 1000;
    const late = subscription({ items: { data: [{ current_period_end: eightPmEastern, price: { unit_amount: 1200, recurring: { interval: "month" } } }] } } as never);
    await applySubscription(fake.deps, FAMILY, CUSTOMER, late);
    await handleStripeEvent(fake.deps, event("invoice.upcoming", { customer: CUSTOMER, amount_due: 1200 }));
    expect(fake.sent.at(-1)?.subject).toBe("Your Multi-Sport Recur training plan renews on December 17, 2026");
  });

  test("no reminder for a plan that is set to cancel", async () => {
    await applySubscription(fake.deps, FAMILY, CUSTOMER, subscription({ cancel_at_period_end: true }));
    fake.sent.length = 0;
    const result = await handleStripeEvent(fake.deps, event("invoice.upcoming", { customer: CUSTOMER, amount_due: 1200 }));
    expect(result.note).toBe("no reminder: the plan is not set to renew");
    expect(fake.sent).toEqual([]);
  });
});

test("events for unknown customers and other event types are ignored", async () => {
  expect((await handleStripeEvent(fake.deps, event("invoice.upcoming", { customer: "cus_other", amount_due: 1 }))).handled).toBe(false);
  expect((await handleStripeEvent(fake.deps, event("charge.succeeded", {}))).note).toBe("ignored charge.succeeded");
});
