import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { supabasePublicEnv } from "@/lib/env";
import type { Database } from "./database.types";

/**
 * A signed-out Supabase client for public, read-only data (benchmarks and sources).
 * It carries no cookies, so pages that use only this client can be cached.
 */
export function createPublicSupabase(): SupabaseClient<Database> {
  const env = supabasePublicEnv();
  return createClient<Database>(env.NEXT_PUBLIC_SUPABASE_URL, env.NEXT_PUBLIC_SUPABASE_ANON_KEY, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
