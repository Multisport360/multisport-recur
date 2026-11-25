"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { findAthlete, requireGuardian, requireViewer } from "@/lib/auth/viewer";
import { loadPlanAccess } from "@/lib/billing/queries";
import { hasPlanAccess } from "@/lib/billing/subscription";
import { failed, fieldErrors, formValues, type FormState } from "@/lib/forms";
import { listAthleteSports } from "@/lib/report/queries";
import { createServerSupabase } from "@/lib/supabase/server";
import { WEEKS_PER_BLOCK } from "./block";
import { screenFormSchema } from "./screen-form";

/**
 * Saving the plan questions and "Mark this session done". Both need an active subscription:
 * no subscription, no plan. Row-level security also limits every write to the viewer's family.
 */

const SAVE_FAILED = "That didn't save. Wait a minute and try again.";
const NOT_SUBSCRIBED = "The training plan needs an active subscription. Subscribe from the training plan page first.";
const ISO_DAY = /^\d{4}-\d{2}-\d{2}$/;

/** A parent answers the five questions. Every change is a new row; the newest counts. */
export async function saveScreens(athleteId: string, _previous: FormState, form: FormData): Promise<FormState> {
  const viewer = await requireGuardian(`/plan/${athleteId}/questions`);
  const athlete = await findAthlete(athleteId);
  if (!athlete) redirect("/plan");
  const values = formValues(form, ["painNow", "throwingArmPain", "trainingAge", "seasonPhase", "teamSessions"]);

  const supabase = await createServerSupabase();
  const { access } = await loadPlanAccess(supabase, viewer.familyId);
  if (!hasPlanAccess(access)) return failed(NOT_SUBSCRIBED, values);

  const playsBaseball = (await listAthleteSports(supabase, athlete.id)).some((sport) => sport.sport === "Baseball");
  const parsed = screenFormSchema(playsBaseball).safeParse(values);
  if (!parsed.success) return { message: null, fields: fieldErrors(parsed.error), values };

  const { error } = await supabase.from("plan_screen_answers").insert({
    athlete_id: athlete.id,
    pain_now: parsed.data.painNow,
    throwing_arm_pain: parsed.data.throwingArmPain,
    has_training_age: parsed.data.hasTrainingAge,
    season_phase: parsed.data.seasonPhase,
    team_sessions_per_week: parsed.data.teamSessionsPerWeek,
  });
  if (error) {
    console.error(`[plan] could not save the plan answers: ${error.message}`);
    return failed(SAVE_FAILED, values);
  }
  redirect(`/plan/${athlete.id}?answers=saved`);
}

export type SessionDoneResult = { ok: true } | { ok: false; message: string };

/** Ticks or unticks one session. A parent or the athlete's own login can do this. */
export async function setSessionDone(athleteId: string, blockStart: string, week: number, day: number, done: boolean): Promise<SessionDoneResult> {
  const viewer = await requireViewer(`/plan/${athleteId}`);
  const isValid = ISO_DAY.test(blockStart) && Number.isInteger(week) && week >= 1 && week <= WEEKS_PER_BLOCK && Number.isInteger(day) && day >= 0 && day <= 6;
  if (!isValid) return { ok: false, message: "That session isn't in this plan. Reload the page and try again." };
  const athlete = await findAthlete(athleteId);
  if (!athlete) return { ok: false, message: "That athlete isn't in your family." };

  const supabase = await createServerSupabase();
  const { access } = await loadPlanAccess(supabase, viewer.familyId);
  if (!hasPlanAccess(access)) return { ok: false, message: NOT_SUBSCRIBED };

  const result = done
    ? await supabase.from("plan_session_completions").upsert({ athlete_id: athlete.id, block_start: blockStart, week, day }, { onConflict: "athlete_id,block_start,week,day", ignoreDuplicates: true })
    : await supabase.from("plan_session_completions").delete().match({ athlete_id: athlete.id, block_start: blockStart, week, day });
  if (result.error) {
    console.error(`[plan] could not mark the session: ${result.error.message}`);
    return { ok: false, message: SAVE_FAILED };
  }
  revalidatePath(`/plan/${athlete.id}`);
  return { ok: true };
}
