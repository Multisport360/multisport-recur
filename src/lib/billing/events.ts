import type Stripe from "stripe";
import { formatLongDate, formatPrice, PLAN } from "@/config/billing";
import type { Email, SendResult } from "@/lib/email/send";
import { renewalReminderEmail, subscriptionCanceledEmail, subscriptionStartedEmail } from "@/lib/email/templates";
import type { SubscriptionRow } from "@/lib/supabase/database.types";
import { fieldsFromStripe, hasPlanAccess, planAccess, type SubscriptionFields } from "./subscription";

/**
 * Keeps our subscriptions table in step with Stripe and sends the three billing emails
 * CLAUDE.md asks for: signup confirmation, renewal reminder, and cancel confirmation.
 *
 * Every email is sent on a change of state (no plan -> plan, renewing -> cancelled), so a
 * Stripe event delivered twice, or a webhook and a page both syncing, never sends it twice.
 * The database, email and Stripe calls are passed in, so this is tested without any of them.
 */

export type BillingStore = {
  findByCustomer(customerId: string): Promise<SubscriptionRow | null>;
  /** Writes the Stripe fields onto the family's row and returns the row as it was before. */
  save(familyId: string, customerId: string, fields: SubscriptionFields): Promise<SubscriptionRow | null>;
  markReminderSent(familyId: string, periodEnd: string): Promise<void>;
  guardianEmail(familyId: string): Promise<string | null>;
  /** The family's IANA time zone, so dates in emails are their own calendar days. */
  familyTimeZone(familyId: string): Promise<string>;
};

export type BillingDeps = {
  store: BillingStore;
  sendEmail(email: Email): Promise<SendResult>;
  retrieveSubscription(id: string): Promise<Stripe.Subscription>;
};

export type HandledEvent = { handled: boolean; note: string };

function idOf(value: string | { id: string } | null | undefined): string | null {
  if (!value) return null;
  return typeof value === "string" ? value : value.id;
}

function familyIdFrom(subscription: Stripe.Subscription): string | null {
  return subscription.metadata?.family_id ?? null;
}

function priceText(fields: Pick<SubscriptionFields, "price_cents" | "billing_interval">): string {
  const cents = fields.price_cents ?? PLAN.priceCents;
  return `${formatPrice(cents)} a ${fields.billing_interval ?? PLAN.interval}`;
}

function dateText(iso: string | null, timeZone: string): string {
  return iso ? formatLongDate(new Date(iso), timeZone) : "the end of the current period";
}

async function emailFamily(deps: BillingDeps, familyId: string, content: Omit<Email, "to">): Promise<string> {
  const to = await deps.store.guardianEmail(familyId);
  if (!to) return "no parent email on file";
  const result = await deps.sendEmail({ to, ...content });
  return result.ok ? "email sent" : `email failed: ${result.reason}`;
}

/**
 * Save a subscription for a family and send whichever email its change of state calls for.
 * Used by the webhook and by the pages that sync straight after checkout or cancel.
 */
export async function applySubscription(
  deps: BillingDeps,
  familyId: string,
  customerId: string,
  subscription: Stripe.Subscription,
): Promise<HandledEvent> {
  const fields = fieldsFromStripe(subscription);
  const before = await deps.store.save(familyId, customerId, fields);
  const was = planAccess(before);
  const now = planAccess(fields);
  const timeZone = await deps.store.familyTimeZone(familyId);

  if (!hasPlanAccess(was) && now.state === "active") {
    const note = await emailFamily(deps, familyId, subscriptionStartedEmail({ price: priceText(fields), renewsOn: dateText(fields.current_period_end, timeZone) }));
    return { handled: true, note: `subscription started; ${note}` };
  }
  const isNewlyCancelled = was.state === "active" && (now.state === "ending" || now.state === "ended");
  if (isNewlyCancelled) {
    const accessUntil = now.state === "ending" ? dateText(fields.current_period_end, timeZone) : null;
    const note = await emailFamily(deps, familyId, subscriptionCanceledEmail({ accessUntil }));
    return { handled: true, note: `subscription cancelled; ${note}` };
  }
  return { handled: true, note: `subscription saved (${fields.status})` };
}

async function onSubscription(deps: BillingDeps, subscription: Stripe.Subscription): Promise<HandledEvent> {
  const customerId = idOf(subscription.customer);
  const familyId = familyIdFrom(subscription) ?? (customerId ? (await deps.store.findByCustomer(customerId))?.family_id : null);
  if (!customerId || !familyId) return { handled: false, note: "subscription is not linked to a family" };
  return applySubscription(deps, familyId, customerId, subscription);
}

async function onUpcomingInvoice(deps: BillingDeps, invoice: Stripe.Invoice): Promise<HandledEvent> {
  const customerId = idOf(invoice.customer);
  const row = customerId ? await deps.store.findByCustomer(customerId) : null;
  if (!row) return { handled: false, note: "invoice is not linked to a family" };
  if (planAccess(row).state !== "active" || !row.current_period_end) {
    return { handled: true, note: "no reminder: the plan is not set to renew" };
  }
  if (row.renewal_reminder_sent_for === row.current_period_end) {
    return { handled: true, note: "reminder already sent for this period" };
  }
  const amount = invoice.amount_due > 0 ? formatPrice(invoice.amount_due) : formatPrice(row.price_cents ?? PLAN.priceCents);
  const timeZone = await deps.store.familyTimeZone(row.family_id);
  const note = await emailFamily(deps, row.family_id, renewalReminderEmail({ amount, renewsOn: dateText(row.current_period_end, timeZone) }));
  if (note === "email sent") await deps.store.markReminderSent(row.family_id, row.current_period_end);
  return { handled: true, note: `renewal reminder: ${note}` };
}

export async function handleStripeEvent(deps: BillingDeps, event: Stripe.Event): Promise<HandledEvent> {
  switch (event.type) {
    case "checkout.session.completed": {
      const subscriptionId = idOf(event.data.object.subscription);
      if (!subscriptionId) return { handled: false, note: "checkout has no subscription" };
      return onSubscription(deps, await deps.retrieveSubscription(subscriptionId));
    }
    case "customer.subscription.created":
    case "customer.subscription.updated":
    case "customer.subscription.deleted":
      return onSubscription(deps, event.data.object);
    case "invoice.upcoming":
      return onUpcomingInvoice(deps, event.data.object);
    default:
      return { handled: false, note: `ignored ${event.type}` };
  }
}
