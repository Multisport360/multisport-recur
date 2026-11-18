import type { SupabaseClient } from "@supabase/supabase-js";
import { SPORTS, type Sport } from "@/lib/benchmarks/types";
import type { Database } from "@/lib/supabase/database.types";
import { HOW_MEASURED, type HowMeasured, type StatEntry } from "./build";

type Client = SupabaseClient<Database>;

export type AthleteSport = { id: string; sport: Sport; positionOrEvent: string };

function isSport(value: string): value is Sport {
  return (SPORTS as readonly string[]).includes(value);
}

function isHowMeasured(value: string): value is HowMeasured {
  return (HOW_MEASURED as readonly string[]).includes(value);
}

/** The athlete's sports, in the order they were added. Row-level security limits this to the viewer's family. */
export async function listAthleteSports(supabase: Client, athleteId: string): Promise<AthleteSport[]> {
  const { data, error } = await supabase
    .from("athlete_sports")
    .select("id, sport, position_or_event")
    .eq("athlete_id", athleteId)
    .order("created_at");
  if (error) throw new Error(`Could not load sports: ${error.message}`);
  return data
    .filter((row) => isSport(row.sport))
    .map((row) => ({ id: row.id, sport: row.sport as Sport, positionOrEvent: row.position_or_event }));
}

/** Every number entered for the athlete. Nothing is ever overwritten, so this is the full history. */
export async function listStatEntries(supabase: Client, athleteId: string): Promise<StatEntry[]> {
  const { data, error } = await supabase
    .from("stat_entries")
    .select("id, sport, metric, value, unit, measured_on, how_measured, created_at")
    .eq("athlete_id", athleteId)
    .order("measured_on")
    .order("created_at");
  if (error) throw new Error(`Could not load numbers: ${error.message}`);
  return data.map((row) => ({
    id: row.id,
    sport: row.sport,
    metric: row.metric,
    // Postgres numeric can arrive as a string; turn it back into a number.
    value: Number(row.value),
    unit: row.unit,
    measuredOn: row.measured_on,
    howMeasured: isHowMeasured(row.how_measured) ? row.how_measured : "self",
    createdAt: row.created_at,
  }));
}
