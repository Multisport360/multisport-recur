"use server";

import { redirect } from "next/navigation";
import { PLAN, RENEWAL_TERMS_VERSION } from "@/config/billing";
import { requireGuardian } from "@/lib/auth/viewer";
import { MissingEnvError, siteUrl } from "@/lib/env";
import { failed, type FormState } from "@/lib/forms";
import { createAdminSupabase } from "@/lib/supabase/admin";
import { createServerSupabase } from "@/lib/supabase/server";
import { applySubscription } from "./events";
import { billingDeps, getStripe } from "./stripe";
import { hasPlanAccess, planAccess } from "./subscription";

/** Starting a subscription and cancelling it. Parents only. */

const PAYMENTS_NOT_SET_UP = "Payments aren't switched on yet, so you can't subscribe right now. Nothing was charged.";
const STRIPE_FAILED = "We couldn't reach the payment service, so nothing was charged. Try again in a few minutes.";

async function familySubscription(familyId: string) {
  const supabase = await createServerSupabase();
  const { data, error } = await supabase.from("subscriptions").select("*").eq("family_id", familyId).maybeSingle();
  if (error) throw new Error(`Could not read subscription: ${error.message}`);
  return data;
}

/**
 * The parent has seen the price, renewal, next charge date and how to cancel, and ticked
 * the renewal-terms box. Create (or reuse) their Stripe customer and send them to Checkout.
 */
export async function startCheckout(_previous: FormState, form: FormData): Promise<FormState> {
  const viewer = await requireGuardian("/plan/subscribe");
  if (form.get("agreesToRenewal") !== "on") {
    return { message: null, fields: { agreesToRenewal: "Tick the box to agree to the renewal terms before you continue." }, values: {} };
  }

  const existing = await familySubscription(viewer.familyId);
  if (hasPlanAccess(planAccess(existing))) redirect("/plan");

  let checkoutUrl: string;
  try {
    const stripe = getStripe();
    let customerId = existing?.stripe_customer_id;
    if (!customerId) {
      const customer = await stripe.customers.create({ email: viewer.email, metadata: { family_id: viewer.familyId } });
      customerId = customer.id;
      const saved = await createAdminSupabase()
        .from("subscriptions")
        .insert({ family_id: viewer.familyId, stripe_customer_id: customerId, status: "incomplete" });
      if (saved.error) throw new Error(`Could not save the customer: ${saved.error.message}`);
    }

    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      customer: customerId,
      client_reference_id: viewer.familyId,
      line_items: [
        {
          quantity: 1,
          price_data: {
            currency: PLAN.currency,
            unit_amount: PLAN.priceCents,
            recurring: { interval: PLAN.interval },
            product_data: { name: PLAN.name },
          },
        },
      ],
      subscription_data: { metadata: { family_id: viewer.familyId, renewal_terms_version: RENEWAL_TERMS_VERSION } },
      success_url: `${siteUrl()}/plan?checkout=done&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${siteUrl()}/plan/subscribe?checkout=stopped`,
    });
    if (!session.url) throw new Error("Stripe returned a checkout session without a URL.");
    checkoutUrl = session.url;
  } catch (error) {
    if (error instanceof MissingEnvError) {
      console.error(`[billing] ${error.message}`);
      return failed(PAYMENTS_NOT_SET_UP);
    }
    console.error(`[billing] checkout failed: ${error instanceof Error ? error.message : String(error)}`);
    return failed(STRIPE_FAILED);
  }
  redirect(checkoutUrl);
}

/**
 * Called when Stripe sends the parent back from Checkout. Saves the subscription straight
 * away so the plan page is right even before the webhook arrives. The webhook does the same
 * work, and the confirmation email is only ever sent once.
 */
export async function syncCheckout(sessionId: string, familyId: string): Promise<void> {
  if (!/^cs_[A-Za-z0-9_]+$/.test(sessionId)) return;
  const stripe = getStripe();
  const session = await stripe.checkout.sessions.retrieve(sessionId);
  const subscriptionId = typeof session.subscription === "string" ? session.subscription : session.subscription?.id;
  const customerId = typeof session.customer === "string" ? session.customer : session.customer?.id;
  // Only sync a checkout that belongs to the family that is looking at the page.
  if (!subscriptionId || !customerId || session.client_reference_id !== familyId) return;
  const deps = billingDeps(stripe);
  await applySubscription(deps, familyId, customerId, await deps.retrieveSubscription(subscriptionId));
}

/** Second click of the two-click cancel on the Account page. Stops renewal at the end of the paid period. */
export async function cancelSubscription(): Promise<void> {
  const viewer = await requireGuardian("/account");
  const row = await familySubscription(viewer.familyId);
  if (!row?.stripe_subscription_id || planAccess(row).state !== "active") redirect("/account");

  let problem: string | null = null;
  try {
    const stripe = getStripe();
    const updated = await stripe.subscriptions.update(row.stripe_subscription_id, { cancel_at_period_end: true });
    await applySubscription(billingDeps(stripe), viewer.familyId, row.stripe_customer_id, updated);
  } catch (error) {
    console.error(`[billing] cancel failed: ${error instanceof Error ? error.message : String(error)}`);
    problem = error instanceof MissingEnvError ? "payments" : "stripe";
  }
  redirect(problem ? `/account?cancel_problem=${problem}` : "/account?cancelled=1");
}
