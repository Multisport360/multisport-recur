"use server";

import { redirect } from "next/navigation";
import { loadBenchmarkSets } from "@/lib/benchmarks/repository";
import { GENDERS, type Gender } from "@/lib/benchmarks/types";
import { findAthlete, requireViewer } from "@/lib/auth/viewer";
import { failed, fieldErrors, formValues, type FormState } from "@/lib/forms";
import { listAthleteSports } from "@/lib/report/queries";
import { createServerSupabase } from "@/lib/supabase/server";
import { sportFormSchema, statFormSchema } from "./rules";

/**
 * Adding a sport and entering a number. Parents and athlete logins can both do this;
 * row-level security makes sure it is only ever for an athlete the viewer can see.
 * A number is always a new row. Nothing is changed or overwritten.
 */

const SAVE_FAILED = "That didn't save. Wait a minute and try again.";
const UNIQUE_VIOLATION = "23505";
const BENCHMARKS_DOWN = "The benchmarks can't be loaded right now, so nothing was saved. Try again in a few minutes.";

async function athleteFor(athleteId: string) {
  await requireViewer(`/athletes/${athleteId}`);
  const athlete = await findAthlete(athleteId);
  if (!athlete) redirect("/athletes");
  if (!(GENDERS as readonly string[]).includes(athlete.gender)) throw new Error(`Athlete ${athleteId} has an unknown gender value.`);
  return { ...athlete, gender: athlete.gender as Gender };
}

export async function addSport(athleteId: string, _previous: FormState, form: FormData): Promise<FormState> {
  const athlete = await athleteFor(athleteId);
  const values = formValues(form, ["sport", "positionOrEvent"]);
  const benchmarks = await loadBenchmarkSets();
  if (benchmarks.status !== "ok") return failed(BENCHMARKS_DOWN, values);

  const parsed = sportFormSchema(benchmarks.sets, athlete.gender).safeParse(values);
  if (!parsed.success) return { message: null, fields: fieldErrors(parsed.error), values };

  const supabase = await createServerSupabase();
  const { error } = await supabase
    .from("athlete_sports")
    .insert({ athlete_id: athlete.id, sport: parsed.data.sport, position_or_event: parsed.data.positionOrEvent });
  if (error) {
    if (error.code === UNIQUE_VIOLATION) {
      return failed(`${athlete.first_name} already has ${parsed.data.sport}, ${parsed.data.positionOrEvent}.`, values);
    }
    console.error(`[sports] could not add: ${error.message}`);
    return failed(SAVE_FAILED, values);
  }
  redirect(`/athletes/${athlete.id}`);
}

export async function addStat(athleteId: string, athleteSportId: string, _previous: FormState, form: FormData): Promise<FormState> {
  const athlete = await athleteFor(athleteId);
  const values = formValues(form, ["metric", "value", "measuredOn", "howMeasured"]);

  const supabase = await createServerSupabase();
  const sport = (await listAthleteSports(supabase, athlete.id)).find((candidate) => candidate.id === athleteSportId);
  if (!sport) return failed(`Add the sport to ${athlete.first_name}'s report first.`, values);

  const benchmarks = await loadBenchmarkSets();
  if (benchmarks.status !== "ok") return failed(BENCHMARKS_DOWN, values);

  const parsed = statFormSchema({
    sets: benchmarks.sets,
    sport: sport.sport,
    positionOrEvent: sport.positionOrEvent,
    gender: athlete.gender,
    today: new Date(),
  }).safeParse(values);
  if (!parsed.success) return { message: null, fields: fieldErrors(parsed.error), values };

  const { error } = await supabase.from("stat_entries").insert({
    athlete_id: athlete.id,
    sport: sport.sport,
    metric: parsed.data.metric,
    value: parsed.data.value,
    unit: parsed.data.unit,
    measured_on: parsed.data.measuredOn,
    how_measured: parsed.data.howMeasured,
  });
  if (error) {
    console.error(`[stats] could not add: ${error.message}`);
    return failed(SAVE_FAILED, values);
  }
  redirect(`/athletes/${athlete.id}?saved=${encodeURIComponent(parsed.data.metric)}`);
}
