import type { ModuleId, ScreenId, StrengthDayId, TemplateLibrary, TierId } from "./library-schema.ts";

/**
 * The fixed rules the plan builder follows, read from `plan_rules`, `tiers`, `season_phases`
 * and each module's `added_to` in data/plan_templates.draft.json. Every item name here is
 * checked against the template file by a unit test, so a renamed item fails loudly.
 */

/** From plan_rules: "never exceed 4 in Foundation or 5 in Development". */
export const HARD_DAY_LIMIT: Readonly<Record<TierId, number>> = { foundation: 4, development: 5 };

/**
 * From plan_rules: "...counting team practices the family enters". The team_sessions screen
 * offers 0 to 7, where 7 means "7 or more"; each practice or game counts as one hard day.
 */
export const MAX_TEAM_SESSIONS = 7;

/** "1 team practice or game", "3 team practices or games". */
export function teamSessionsText(count: number): string {
  return count === 1 ? "1 team practice or game" : `${count} team practices or games`;
}

/** How many hard days the plan itself may add once the team's practices and games are counted. */
export function planHardDayBudget(tier: TierId, teamSessionsPerWeek: number): number {
  return Math.max(0, HARD_DAY_LIMIT[tier] - teamSessionsPerWeek);
}

/** From plan_rules. Shown at the top of every plan. */
export const PAIN_LINE = "Stop and tell a parent or coach about any pain. Pain is not part of training.";

/** Below this grade, throwing work carries extra caution (CLAUDE.md legal rules). */
export const THROWING_CAUTION_BELOW_GRADE = 11;
export const THROWING_CAUTION =
  "Extra caution for younger throwers: arms are still growing. Follow pitch-count and rest-day limits for your athlete's age, stop any throwing that causes pain in the elbow or shoulder, and check with a coach or doctor before adding velocity work.";

/** Strength days sit on these weekdays (0 = Monday) so no two are on consecutive days. */
export const STRENGTH_DAY_POSITIONS: Readonly<Record<1 | 2 | 3, readonly number[]>> = {
  1: [0],
  2: [0, 3],
  3: [0, 2, 4],
};

/** Throwing days: 3 a week ("3–4 days a week", low end) with a day between each. */
export const THROWING_DAY_POSITIONS: readonly number[] = [0, 2, 4];

/** Which strength days a module's focus work goes on ("added_to" in the template). */
export const FOCUS_ON_STRENGTH_DAYS: Readonly<Partial<Record<ModuleId, readonly StrengthDayId[]>>> = {
  speed: ["strength_a", "strength_b", "strength_c"], // "The start of every strength day"
  power: ["strength_a", "strength_b"], // "Strength A and Strength B, before the lifts"
  agility: ["strength_a", "strength_b"],
  rotational_power: ["strength_a", "strength_b"],
  throwing_velocity: ["strength_a", "strength_b", "strength_c"], // "Medicine ball work on strength days"
};

/**
 * Modules whose "added_to" brings in another module's work too:
 *   speed_endurance: "plus the sprint speed module on strength days"
 *   catcher_pop: "plus the throwing velocity strength and medicine ball work"
 * The companion is not counted as a second focus module.
 */
export const COMPANION_MODULE: Readonly<Partial<Record<ModuleId, ModuleId>>> = {
  speed_endurance: "speed",
  catcher_pop: "throwing_velocity",
};

/** upper_strength "Replaces the pressing exercise on strength days". The press on each day: */
export const PRESS_EXERCISE: Readonly<Record<StrengthDayId, string>> = {
  strength_a: "Push-up (Foundation) / dumbbell bench press (Development)",
  strength_b: "Half-kneeling one-arm dumbbell press",
  strength_c: "Dumbbell incline press",
};

/** The interval throwing program goes on throwing days; the rest of throwing_velocity on strength days. */
export const INTERVAL_THROWING = "Interval throwing program with a regular 5 oz baseball, distance building over the weeks";

/**
 * Items that are throwing work. Removed when the throwing-arm pain screen is yes, or in the
 * baseball rest period ("The throwing parts of every plan are removed"). The step-behind medicine
 * ball throw uses the throwing motion, so it is treated as throwing (a question for the coach).
 */
export const THROWING_ITEMS: readonly string[] = [
  INTERVAL_THROWING,
  "Full throws to second base",
  "Step-behind medicine ball throw (2–3 kg)",
];

/** In season: "No added throwing volume for pitchers." */
export const ADDED_THROWING_VOLUME: readonly string[] = [INTERVAL_THROWING, "Full throws to second base"];

/** Roles of the distance-running items, so the schedule knows which are hard days. */
export const ENDURANCE_ROLES: Readonly<Record<string, "easy" | "tempo" | "intervals" | "strides">> = {
  "Easy runs at conversation pace": "easy",
  "Steady tempo run": "tempo",
  "Intervals at goal race pace": "intervals",
  Strides: "strides",
};

/** speed_endurance items marked for hurdlers only. */
export const HURDLE_ONLY = "(hurdle events only)";

/** The message a screen shows, taken from the quoted text in its if_yes ("... show: '...'"). */
export function screenMessage(library: TemplateLibrary, id: ScreenId): string {
  const screen = library.screens.find((candidate) => candidate.id === id);
  const quoted = screen?.if_yes ? /show: '([^']+)'/i.exec(screen.if_yes)?.[1] : undefined;
  if (!quoted) throw new Error(`The ${id} screen in the template library has no quoted message to show.`);
  return quoted;
}
