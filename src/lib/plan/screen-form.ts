import { z } from "zod";
import { MAX_TEAM_SESSIONS } from "./rules";
import type { ScreenAnswers } from "./types";

/**
 * Checks the parent's answers to the five plan questions. The throwing-arm question and the
 * "yearly break from throwing" season are baseball only, so they are refused for anyone else.
 * Errors say what to do, in plain words.
 */

const yesNo = (message: string) => z.enum(["yes", "no"], { error: message });

const SEASON_CHOICES = {
  off_season: "Off-season",
  pre_season: "Pre-season",
  in_season: "In-season",
  rest_period: "Their yearly break from throwing (baseball only)",
} as const;

export function seasonChoices(playsBaseball: boolean): { value: keyof typeof SEASON_CHOICES; label: string }[] {
  return Object.entries(SEASON_CHOICES)
    .filter(([value]) => playsBaseball || value !== "rest_period")
    .map(([value, label]) => ({ value: value as keyof typeof SEASON_CHOICES, label }));
}

/** 0 to 7 team practices or games a week; the last choice reads "7 or more". */
export function teamSessionChoices(): { value: string; label: string }[] {
  return Array.from({ length: MAX_TEAM_SESSIONS + 1 }, (_, count) => ({
    value: String(count),
    label: count === 0 ? "None" : count === MAX_TEAM_SESSIONS ? `${count} or more` : String(count),
  }));
}

const TEAM_SESSION_VALUES = teamSessionChoices().map((choice) => choice.value) as [string, ...string[]];

export function screenFormSchema(playsBaseball: boolean) {
  const seasons = seasonChoices(playsBaseball).map((choice) => choice.value) as [string, ...string[]];
  return z
    .object({
      painNow: yesNo("Choose yes or no for pain right now."),
      throwingArmPain: playsBaseball ? yesNo("Choose yes or no for throwing-arm pain.") : z.undefined({ error: "Only baseball players are asked about throwing-arm pain." }).optional(),
      trainingAge: yesNo("Choose yes or no for a year of coached strength training."),
      seasonPhase: z.enum(seasons, { error: "Choose where the athlete is in their season." }),
      teamSessions: z.enum(TEAM_SESSION_VALUES, { error: "Choose how many team practices or games there are in a typical week." }),
    })
    .transform(
      (values): ScreenAnswers => ({
        painNow: values.painNow === "yes",
        throwingArmPain: playsBaseball ? values.throwingArmPain === "yes" : null,
        hasTrainingAge: values.trainingAge === "yes",
        seasonPhase: values.seasonPhase as ScreenAnswers["seasonPhase"],
        teamSessionsPerWeek: Number(values.teamSessions),
      }),
    );
}
