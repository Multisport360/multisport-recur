import { z } from "zod";
import type { ScreenAnswers } from "./types";

/**
 * Checks the parent's answers to the four plan questions. The throwing-arm question and the
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

export function screenFormSchema(playsBaseball: boolean) {
  const seasons = seasonChoices(playsBaseball).map((choice) => choice.value) as [string, ...string[]];
  return z
    .object({
      painNow: yesNo("Choose yes or no for pain right now."),
      throwingArmPain: playsBaseball ? yesNo("Choose yes or no for throwing-arm pain.") : z.undefined({ error: "Only baseball players are asked about throwing-arm pain." }).optional(),
      trainingAge: yesNo("Choose yes or no for a year of coached strength training."),
      seasonPhase: z.enum(seasons, { error: "Choose where the athlete is in their season." }),
    })
    .transform(
      (values): ScreenAnswers => ({
        painNow: values.painNow === "yes",
        throwingArmPain: playsBaseball ? values.throwingArmPain === "yes" : null,
        hasTrainingAge: values.trainingAge === "yes",
        seasonPhase: values.seasonPhase as ScreenAnswers["seasonPhase"],
      }),
    );
}
