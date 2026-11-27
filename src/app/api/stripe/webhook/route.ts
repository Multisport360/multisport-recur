import { NextResponse, type NextRequest } from "next/server";
import { handleStripeEvent } from "@/lib/billing/events";
import { billingDeps, getStripe } from "@/lib/billing/stripe";
import { MissingEnvError, stripeWebhookEnv } from "@/lib/env";

/**
 * Stripe calls this when a subscription starts, changes, ends, or is about to renew.
 * The signature is checked before anything is read, so nobody else can fake an event.
 */
export async function POST(request: NextRequest) {
  const signature = request.headers.get("stripe-signature");
  if (!signature) return NextResponse.json({ error: "Missing Stripe signature." }, { status: 400 });

  let stripe;
  let secret: string;
  try {
    stripe = getStripe();
    secret = stripeWebhookEnv().STRIPE_WEBHOOK_SECRET;
  } catch (error) {
    const message = error instanceof MissingEnvError ? error.message : "Stripe is not configured.";
    console.error(`[stripe webhook] ${message}`);
    return NextResponse.json({ error: "Billing is not configured on this server." }, { status: 500 });
  }

  const payload = await request.text();
  let event;
  try {
    event = await stripe.webhooks.constructEventAsync(payload, signature, secret);
  } catch {
    return NextResponse.json({ error: "Invalid Stripe signature." }, { status: 400 });
  }

  try {
    const result = await handleStripeEvent(billingDeps(stripe), event);
    return NextResponse.json({ received: true, ...result });
  } catch (error) {
    // A 500 makes Stripe retry later, which is what we want if the database was briefly down.
    console.error(`[stripe webhook] ${event.type} failed: ${error instanceof Error ? error.message : String(error)}`);
    return NextResponse.json({ error: "Could not process the event." }, { status: 500 });
  }
}
