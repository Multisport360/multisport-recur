import { readFileSync } from "node:fs";
import path from "node:path";
import type { Sport, Unit } from "../benchmarks/types.ts";
import { parseTemplateLibrary, type TemplateLibrary } from "./library-schema.ts";
import type { ScreenAnswers, StatGap } from "./types.ts";

/** For unit tests: the real draft template library, and small helpers to describe an athlete. */

export const DRAFT_PATH = path.resolve(import.meta.dirname, "../../../data/plan_templates.draft.json");

export function draftJson(): Record<string, unknown> {
  return JSON.parse(readFileSync(DRAFT_PATH, "utf8")) as Record<string, unknown>;
}

export function draftLibrary(): TemplateLibrary {
  return parseTemplateLibrary(draftJson());
}

export const SCREENS_OK: ScreenAnswers = { painNow: false, throwingArmPain: null, hasTrainingAge: false, seasonPhase: "off_season", teamSessionsPerWeek: 0 };

export function screens(overrides: Partial<ScreenAnswers> = {}): ScreenAnswers {
  return { ...SCREENS_OK, ...overrides };
}

/** A gap of `share` (0.05 = 5%) of a next-level number of 100. */
export function gap(metric: string, share: number, sport: Sport = "Baseball", positionOrEvent = "Pitcher", unit: Unit = "mph"): StatGap {
  return { sport, positionOrEvent, metric, unit, value: 100 - share * 100, nextLevelLabel: "D1", nextLevelEntry: 100, gap: share * 100 };
}
