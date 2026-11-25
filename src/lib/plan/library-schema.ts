import { z } from "zod";

/**
 * The shape of data/plan_templates.draft.json: one versioned "template library" that the
 * plan builder picks from. Every field is checked, unknown keys are refused, and the checks
 * across fields (sources exist, screens are the four we know, no weighted-ball wording) run
 * too. The seed script and the app both use this, so a malformed library never reaches a family.
 *
 * Imports are relative with .ts extensions so `node scripts/seed-plan-templates.ts` can load it.
 */

const text = z.string().trim().min(1);
/** A dose like "2–3 × 8–10", or "none" when the item is left out of that tier. */
const dose = text;

export const REVIEW_STATUSES = ["draft", "approved"] as const;
export type ReviewStatus = (typeof REVIEW_STATUSES)[number];

export const TIER_IDS = ["foundation", "development"] as const;
export type TierId = (typeof TIER_IDS)[number];

export const SEASON_PHASES = ["off_season", "pre_season", "in_season", "rest_period"] as const;
export type SeasonPhase = (typeof SEASON_PHASES)[number];

export const SCREEN_IDS = ["pain_now", "throwing_arm_pain", "training_age", "season_phase"] as const;
export type ScreenId = (typeof SCREEN_IDS)[number];

export const STRENGTH_DAY_IDS = ["strength_a", "strength_b", "strength_c"] as const;
export type StrengthDayId = (typeof STRENGTH_DAY_IDS)[number];

export const MODULE_IDS = [
  "speed",
  "power",
  "agility",
  "upper_strength",
  "throwing_velocity",
  "catcher_pop",
  "rotational_power",
  "speed_endurance",
  "endurance",
] as const;
export type ModuleId = (typeof MODULE_IDS)[number];

const tierSchema = z.strictObject({
  label: text,
  who: text,
  strength_days_per_week: z.number().int().min(1).max(3),
  rules: z.array(text).min(1),
});

const screenSchema = z.strictObject({
  id: z.enum(SCREEN_IDS),
  question: text,
  if_yes: text.optional(),
  if_no: text.optional(),
});

const exerciseSchema = z.strictObject({
  name: text,
  /** Missing means the exercise is Development only (Strength C). */
  foundation: dose.optional(),
  development: dose,
  rest: text,
  cue: text,
});

const workItemSchema = z.strictObject({
  name: text,
  foundation: dose,
  development: dose,
  rest: text,
});

const moduleSchema = z.strictObject({
  id: z.enum(MODULE_IDS),
  name: text,
  for_stats: z.array(text).min(1),
  goal: text,
  added_to: text,
  work: z.array(workItemSchema).min(1),
  notes: z.array(text).min(1),
  evidence: z.array(text).min(1),
});

const sourceSchema = z.strictObject({ title: text, cite: text });

const baseSchema = z.strictObject({
  version: text,
  review_status: z.enum(REVIEW_STATUSES),
  review_note: text,
  /** Filled in when the strength coach signs off. Required once review_status is "approved". */
  reviewed_by: text.optional(),
  reviewed_on: z.iso.date().optional(),
  tiers: z.strictObject({ foundation: tierSchema, development: tierSchema }),
  block: z.strictObject({ weeks: z.literal(6), progression: text, retest: text }),
  season_phases: z.strictObject({ off_season: text, pre_season: text, in_season: text, rest_period: text }),
  screens: z.array(screenSchema).length(SCREEN_IDS.length),
  warmup: z.strictObject({
    id: z.literal("warmup"),
    name: text,
    items: z.array(z.strictObject({ name: text, dose: text })).min(1),
  }),
  strength_days: z.strictObject({
    strength_a: z.strictObject({ name: text, exercises: z.array(exerciseSchema).min(1) }),
    strength_b: z.strictObject({ name: text, exercises: z.array(exerciseSchema).min(1) }),
    strength_c: z.strictObject({ name: text, exercises: z.array(exerciseSchema).min(1) }),
  }),
  focus_modules: z.array(moduleSchema).length(MODULE_IDS.length),
  not_trainable: z.array(z.strictObject({ stat: z.enum(["Height", "Weight"]), message: text })).length(2),
  plan_rules: z.array(text).min(1),
  sources: z.record(z.string().regex(/^S\d+$/), sourceSchema),
});

export type TemplateLibrary = z.infer<typeof baseSchema>;
export type FocusModule = TemplateLibrary["focus_modules"][number];
export type WorkItem = FocusModule["work"][number];
export type Exercise = TemplateLibrary["strength_days"]["strength_a"]["exercises"][number];

/** Weighted, overload and plyo balls are never part of a plan (docs/training-research.md, S7). */
const BANNED_THROWING = /\b(weighted|overload|plyo)[\s-]balls?\b/i;
/** A sentence counts as a "no" sentence when it says no, never, not or don't. */
const NEGATION = /\b(no|never|not|don't|do not|without)\b/i;

/** Every string anywhere in the library, with where it was found. */
export function allTexts(value: unknown, at = "$"): { at: string; text: string }[] {
  if (typeof value === "string") return [{ at, text: value }];
  if (Array.isArray(value)) return value.flatMap((item, index) => allTexts(item, `${at}[${index}]`));
  if (typeof value === "object" && value !== null) {
    return Object.entries(value).flatMap(([key, item]) => allTexts(item, `${at}.${key}`));
  }
  return [];
}

/** Places where weighted/overload/plyo balls are mentioned outside a sentence that says no. */
export function bannedThrowingMentions(value: unknown): string[] {
  return allTexts(value).flatMap(({ at, text: whole }) =>
    whole
      .split(/(?<=[.!?:;])\s+/)
      .filter((sentence) => BANNED_THROWING.test(sentence) && !NEGATION.test(sentence))
      .map((sentence) => `${at}: "${sentence}"`),
  );
}

function crossFieldProblems(library: TemplateLibrary): string[] {
  const problems: string[] = [];
  const sourceIds = new Set(Object.keys(library.sources));

  if (library.review_status === "approved" && (!library.reviewed_by || !library.reviewed_on)) {
    problems.push("review_status is approved, so reviewed_by and reviewed_on must both be filled in");
  }

  const screenIds = library.screens.map((screen) => screen.id);
  for (const id of SCREEN_IDS) {
    if (screenIds.filter((found) => found === id).length !== 1) problems.push(`screens: ${id} must appear exactly once`);
  }

  const moduleIds = library.focus_modules.map((mod) => mod.id);
  for (const id of MODULE_IDS) {
    if (moduleIds.filter((found) => found === id).length !== 1) problems.push(`focus_modules: ${id} must appear exactly once`);
  }

  const seenStats = new Map<string, string>();
  for (const mod of library.focus_modules) {
    for (const stat of mod.for_stats) {
      const other = seenStats.get(stat);
      if (other) problems.push(`focus_modules: "${stat}" is in both ${other} and ${mod.id}`);
      seenStats.set(stat, mod.id);
    }
    for (const id of mod.evidence) {
      if (!sourceIds.has(id)) problems.push(`focus_modules.${mod.id}.evidence: ${id} is not in sources`);
    }
  }

  for (const [day, exercises] of [
    ["strength_a", library.strength_days.strength_a.exercises],
    ["strength_b", library.strength_days.strength_b.exercises],
  ] as const) {
    for (const exercise of exercises) {
      if (!exercise.foundation) problems.push(`strength_days.${day}: "${exercise.name}" needs a foundation dose`);
    }
  }
  if (library.tiers.foundation.strength_days_per_week !== 2) problems.push("tiers.foundation.strength_days_per_week must be 2");
  if (library.tiers.development.strength_days_per_week !== 3) problems.push("tiers.development.strength_days_per_week must be 3");

  return [...problems, ...bannedThrowingMentions(library).map((where) => `weighted/overload/plyo ball outside a "no" sentence at ${where}`)];
}

export class TemplateLibraryError extends Error {
  readonly problems: readonly string[];

  constructor(problems: readonly string[]) {
    super(`The plan template library is not valid:\n${problems.map((problem) => `  - ${problem}`).join("\n")}`);
    this.name = "TemplateLibraryError";
    this.problems = problems;
  }
}

/** Checks a library and returns it typed, or throws a TemplateLibraryError listing every problem. */
export function parseTemplateLibrary(input: unknown): TemplateLibrary {
  const parsed = baseSchema.safeParse(input);
  if (!parsed.success) {
    throw new TemplateLibraryError(parsed.error.issues.map((issue) => `${issue.path.join(".") || "(top level)"}: ${issue.message}`));
  }
  const problems = crossFieldProblems(parsed.data);
  if (problems.length > 0) throw new TemplateLibraryError(problems);
  return parsed.data;
}
