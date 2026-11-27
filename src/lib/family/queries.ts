import type { SupabaseClient } from "@supabase/supabase-js";
import { CONSENT_VERSION } from "@/config/consent";
import type { AthleteRow, Database } from "@/lib/supabase/database.types";

type Client = SupabaseClient<Database>;

/** True when the family has a consent record, for the current wording, not yet tied to an athlete. */
export async function hasUnusedConsent(supabase: Client, familyId: string): Promise<boolean> {
  const { data, error } = await supabase
    .from("consents")
    .select("id")
    .eq("family_id", familyId)
    .eq("consent_version", CONSENT_VERSION)
    .is("athlete_id", null)
    .limit(1);
  if (error) throw new Error(`Could not check consent: ${error.message}`);
  return data.length > 0;
}

/** The athletes the viewer can see, oldest entry first. Row-level security limits this to their family. */
export async function listAthletes(supabase: Client): Promise<AthleteRow[]> {
  const { data, error } = await supabase.from("athletes").select("*").order("created_at");
  if (error) throw new Error(`Could not load athletes: ${error.message}`);
  return data;
}
