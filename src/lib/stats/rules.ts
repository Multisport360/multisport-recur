import { z } from "zod";
import { parseValueInput } from "@/lib/benchmarks/format";
import { listMetrics, listPositions, type BenchmarkSet } from "@/lib/benchmarks/sets";
import { SPORTS, type Gender } from "@/lib/benchmarks/types";
import { HOW_MEASURED, type HowMeasured } from "@/lib/report/build";

/** Rules for adding a sport and entering a number. Messages say what to fix. */

/** The earliest measurement date accepted. Matches the database check. */
export const EARLIEST_MEASURED_ON = "2015-01-01";

export const HOW_MEASURED_LABELS: Record<HowMeasured, string> = {
  self: "We measured it ourselves",
  coach: "A coach measured it",
  event: "At a showcase, combine or meet",
};

/** YYYY-MM-DD in the server's local time. */
export function isoDate(date: Date): string {
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${date.getFullYear()}-${month}-${day}`;
}

/** Checks the add-a-sport form against the positions or events that have benchmarks for the athlete's gender. */
export function sportFormSchema(sets: readonly BenchmarkSet[], gender: Gender) {
  return z
    .object({
      sport: z.enum(SPORTS, "Choose a sport."),
      positionOrEvent: z.string().trim().min(1, "Choose a position or event."),
    })
    .superRefine((input, ctx) => {
      const positions = listPositions(sets, input.sport).filter((position) => position.genders.includes(gender));
      if (!positions.some((position) => position.positionOrEvent === input.positionOrEvent)) {
        ctx.addIssue({ code: "custom", path: ["positionOrEvent"], message: "Choose a position or event from the list." });
      }
    });
}

type StatContext = {
  sets: readonly BenchmarkSet[];
  sport: string;
  positionOrEvent: string;
  gender: Gender;
  today: Date;
};

/**
 * Checks the enter-a-number form. The metric must have benchmarks for the athlete's sport,
 * position and gender, and the number is read in that metric's unit.
 */
export function statFormSchema({ sets, sport, positionOrEvent, gender, today }: StatContext) {
  const metrics = listMetrics(sets, { sport, positionOrEvent, gender });
  const latestAllowed = isoDate(today);

  const howOptions: readonly string[] = HOW_MEASURED;

  // Every field is checked on every submit, so the person sees all problems at once.
  return z
    .object({ metric: z.string(), value: z.string(), measuredOn: z.string(), howMeasured: z.string() })
    .transform((input, ctx) => {
      const problem = (path: string, message: string) => ctx.addIssue({ code: "custom", path: [path], message });

      const option = metrics.find((candidate) => candidate.metric === input.metric.trim());
      if (!option) problem("metric", input.metric.trim() ? "Choose what was measured from the list." : "Choose what was measured.");

      let value: number | null = null;
      if (option) {
        const typical = sets.find((set) => set.sport === sport && set.positionOrEvent === positionOrEvent && set.metric === option.metric)?.levels[0]?.entry;
        const parsed = parseValueInput(input.value, option.unit, typical);
        if (parsed.ok) value = parsed.value;
        else problem("value", parsed.message);
      }

      const date = input.measuredOn;
      if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) problem("measuredOn", "Choose the date it was measured.");
      else if (date < EARLIEST_MEASURED_ON) problem("measuredOn", "Choose a date in 2015 or later.");
      else if (date > latestAllowed) problem("measuredOn", "The date can't be in the future.");

      if (!howOptions.includes(input.howMeasured)) problem("howMeasured", "Choose who measured it.");

      if (!option || value === null || ctx.issues.length > 0) return z.NEVER;
      return {
        metric: option.metric,
        unit: option.unit,
        value,
        measuredOn: date,
        howMeasured: input.howMeasured as HowMeasured,
      };
    });
}
