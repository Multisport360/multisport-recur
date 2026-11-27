import type { SupabaseClient } from "@supabase/supabase-js";
import { loadBenchmarkSets } from "@/lib/benchmarks/repository";
import type { Gender } from "@/lib/benchmarks/types";
import { buildSportReport } from "@/lib/report/build";
import { listAthleteSports, listStatEntries, type AthleteSport } from "@/lib/report/queries";
import { createAdminSupabase } from "@/lib/supabase/admin";
import type { AthleteRow, Database } from "@/lib/supabase/database.types";
import { sessionKey } from "./block";
import { gapsFromReports } from "./gaps";
import { draftPlansAllowed, libraryFromRecord, pickLibrary, type LoadedLibrary, type PlanTemplateRecord } from "./library";
import { SEASON_PHASES, type SeasonPhase } from "./library-schema";
import type { ScreenAnswers, StatGap } from "./types";

type Client = SupabaseClient<Database>;

const RECORD_COLUMNS = "version, review_status, reviewed_by, reviewed_on, content";

/**
 * The template library plans are built from.
 *   - Approved: read as the signed-in family, so row-level security also requires an active subscription.
 *   - Draft: only when draftPlansAllowed() (never in a production build). Drafts are invisible to every
 *     signed-in user by row-level security, so the server reads them with the service role.
 * A library that fails its checks is logged and treated as missing: families see "your plan is coming".
 */
export async function loadPlanLibrary(supabase: Client): Promise<LoadedLibrary | null> {
  const approved = await supabase
    .from("plan_templates")
    .select(RECORD_COLUMNS)
    .eq("review_status", "approved")
    .order("reviewed_on", { ascending: false })
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (approved.error) throw new Error(`Could not load plan templates: ${approved.error.message}`);

  const allowDrafts = draftPlansAllowed();
  let draft: PlanTemplateRecord | null = null;
  if (allowDrafts && !approved.data) {
    const result = await createAdminSupabase()
      .from("plan_templates")
      .select(RECORD_COLUMNS)
      .eq("review_status", "draft")
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();
    if (result.error) throw new Error(`Could not load draft plan templates: ${result.error.message}`);
    draft = result.data as PlanTemplateRecord | null;
  }

  const picked = pickLibrary(approved.data as PlanTemplateRecord | null, draft, allowDrafts);
  if (!picked) return null;
  try {
    return libraryFromRecord(picked);
  } catch (error) {
    console.error(`[plan] template library ${picked.version} failed its checks and is not used: ${error instanceof Error ? error.message : String(error)}`);
    return null;
  }
}

/** Saved answers. teamSessionsPerWeek is null on answers saved before that question was asked. */
export type SavedAnswers = Omit<ScreenAnswers, "teamSessionsPerWeek"> & { teamSessionsPerWeek: number | null };

export type SavedScreens = {
  answers: SavedAnswers;
  answeredAt: Date;
  /** When the questions were first answered: the training blocks count from here. */
  firstAnsweredAt: Date;
};

/** The answers the builder needs, or null when one is still missing (the practice count on older answers). */
export function completeAnswers(answers: SavedAnswers): ScreenAnswers | null {
  const { teamSessionsPerWeek } = answers;
  return teamSessionsPerWeek === null ? null : { ...answers, teamSessionsPerWeek };
}

function isSeasonPhase(value: string): value is SeasonPhase {
  return (SEASON_PHASES as readonly string[]).includes(value);
}

/** The newest answers to the plan questions, or null if a parent has not answered them yet. */
export async function loadScreens(supabase: Client, athleteId: string): Promise<SavedScreens | null> {
  const { data, error } = await supabase
    .from("plan_screen_answers")
    .select("pain_now, throwing_arm_pain, has_training_age, season_phase, team_sessions_per_week, answered_at")
    .eq("athlete_id", athleteId)
    .order("answered_at", { ascending: true });
  if (error) throw new Error(`Could not load the plan answers: ${error.message}`);
  const first = data[0];
  const latest = data[data.length - 1];
  if (!first || !latest) return null;
  if (!isSeasonPhase(latest.season_phase)) throw new Error(`Unknown season phase "${latest.season_phase}" for athlete ${athleteId}.`);
  return {
    answers: {
      painNow: latest.pain_now,
      throwingArmPain: latest.throwing_arm_pain,
      hasTrainingAge: latest.has_training_age,
      seasonPhase: latest.season_phase,
      teamSessionsPerWeek: latest.team_sessions_per_week,
    },
    answeredAt: new Date(latest.answered_at),
    firstAnsweredAt: new Date(first.answered_at),
  };
}

/** Sessions marked done in one block, as "week-day" keys, and how many in all. */
export async function loadCompletions(supabase: Client, athleteId: string, blockStart: string): Promise<Set<string>> {
  const { data, error } = await supabase
    .from("plan_session_completions")
    .select("week, day")
    .eq("athlete_id", athleteId)
    .eq("block_start", blockStart);
  if (error) throw new Error(`Could not load finished sessions: ${error.message}`);
  return new Set(data.map((row) => sessionKey(row.week, row.day)));
}

export type AthletePlanData = { sports: AthleteSport[]; gaps: StatGap[]; benchmarksDown: boolean };

/** The athlete's sports and the gaps on their gap report, built the same way as the report page. */
export async function loadAthleteGaps(supabase: Client, athlete: AthleteRow): Promise<AthletePlanData> {
  const [sports, entries, benchmarks] = await Promise.all([listAthleteSports(supabase, athlete.id), listStatEntries(supabase, athlete.id), loadBenchmarkSets()]);
  if (benchmarks.status !== "ok") return { sports, gaps: [], benchmarksDown: true };
  const profile = {
    heightIn: athlete.height_in === null ? null : Number(athlete.height_in),
    weightLb: athlete.weight_lb === null ? null : Number(athlete.weight_lb),
  };
  const reports = sports.map((sport) => buildSportReport(benchmarks.sets, sport, athlete.gender as Gender, entries, profile));
  return { sports, gaps: gapsFromReports(reports), benchmarksDown: false };
}
