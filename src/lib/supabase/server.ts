import { createServerClient } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";
import { supabasePublicEnv } from "@/lib/env";
import type { Database } from "./database.types";

/**
 * A Supabase client for the signed-in visitor, for Server Components, Server Actions
 * and Route Handlers. It reads the session from cookies, so row-level security applies
 * to every query: the visitor only ever gets their own family's rows.
 */
export async function createServerSupabase(): Promise<SupabaseClient<Database>> {
  const env = supabasePublicEnv();
  const cookieStore = await cookies();

  return createServerClient<Database>(env.NEXT_PUBLIC_SUPABASE_URL, env.NEXT_PUBLIC_SUPABASE_ANON_KEY, {
    cookies: {
      getAll: () => cookieStore.getAll(),
      setAll: (cookiesToSet) => {
        try {
          for (const { name, value, options } of cookiesToSet) {
            cookieStore.set(name, value, options);
          }
        } catch {
          // Server Components cannot set cookies. That is expected: src/proxy.ts refreshes
          // the session cookie on every request, so nothing is lost here.
        }
      },
    },
  });
}
