import Stripe from "stripe";
import { timeZoneOrDefault } from "@/lib/dates";
import { createAdminSupabase } from "@/lib/supabase/admin";
import { sendEmail } from "@/lib/email/send";
import { stripeEnv } from "@/lib/env";
import type { BillingDeps, BillingStore } from "./events";

/**
 * The Stripe client and the database store the billing code uses.
 * Server only: the store uses the service role, because parents may read their
 * subscription but never write it.
 */

/** Throws MissingEnvError naming STRIPE_SECRET_KEY when it is not set. */
export function getStripe(): Stripe {
  const { STRIPE_SECRET_KEY } = stripeEnv();
  if (!STRIPE_SECRET_KEY.startsWith("sk_test_") && process.env.VERCEL_ENV !== "production") {
    throw new Error("STRIPE_SECRET_KEY is a live key. Use a test-mode key (sk_test_...) outside production.");
  }
  return new Stripe(STRIPE_SECRET_KEY);
}

export function billingStore(): BillingStore {
  const admin = createAdminSupabase();
  return {
    async findByCustomer(customerId) {
      const { data, error } = await admin.from("subscriptions").select("*").eq("stripe_customer_id", customerId).maybeSingle();
      if (error) throw new Error(`Could not read subscription: ${error.message}`);
      return data;
    },
    async save(familyId, customerId, fields) {
      const before = await admin.from("subscriptions").select("*").eq("family_id", familyId).maybeSingle();
      if (before.error) throw new Error(`Could not read subscription: ${before.error.message}`);
      const saved = await admin
        .from("subscriptions")
        .upsert({ family_id: familyId, stripe_customer_id: customerId, ...fields }, { onConflict: "family_id" });
      if (saved.error) throw new Error(`Could not save subscription: ${saved.error.message}`);
      return before.data;
    },
    async markReminderSent(familyId, periodEnd) {
      const { error } = await admin.from("subscriptions").update({ renewal_reminder_sent_for: periodEnd }).eq("family_id", familyId);
      if (error) throw new Error(`Could not record the reminder: ${error.message}`);
    },
    async familyTimeZone(familyId) {
      const family = await admin.from("families").select("timezone").eq("id", familyId).maybeSingle();
      if (family.error) console.error(`[billing] could not read the family time zone: ${family.error.message}`);
      return timeZoneOrDefault(family.data?.timezone);
    },
    async guardianEmail(familyId) {
      const guardian = await admin.from("guardians").select("user_id").eq("family_id", familyId).order("created_at").limit(1).maybeSingle();
      if (guardian.error || !guardian.data) return null;
      const user = await admin.auth.admin.getUserById(guardian.data.user_id);
      return user.data.user?.email ?? null;
    },
  };
}

export function billingDeps(stripe: Stripe = getStripe()): BillingDeps {
  return {
    store: billingStore(),
    sendEmail,
    retrieveSubscription: (id) => stripe.subscriptions.retrieve(id),
  };
}
