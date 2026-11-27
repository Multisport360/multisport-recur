import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { supabaseServiceEnv } from "@/lib/env";
import type { Database } from "./database.types";

/**
 * The service-role client. It BYPASSES row-level security, so it is used only on the
 * server and only for the few jobs a visitor's own session cannot do:
 * inviting an athlete login, and keeping subscriptions in step with Stripe.
 *
 * Always check that the caller is allowed to do the thing (with their own session) first.
 */
export function createAdminSupabase(): SupabaseClient<Database> {
  const env = supabaseServiceEnv();
  return createClient<Database>(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
