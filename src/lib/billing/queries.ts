import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database, SubscriptionRow } from "@/lib/supabase/database.types";
import { planAccess, type PlanAccess } from "./subscription";

/** The viewer's family subscription. Row-level security returns only their own family's row. */
export async function loadPlanAccess(
  supabase: SupabaseClient<Database>,
  familyId: string,
): Promise<{ row: SubscriptionRow | null; access: PlanAccess }> {
  const { data, error } = await supabase.from("subscriptions").select("*").eq("family_id", familyId).maybeSingle();
  if (error) throw new Error(`Could not read subscription: ${error.message}`);
  return { row: data, access: planAccess(data) };
}
