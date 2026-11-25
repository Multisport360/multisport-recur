import type { Sport, Unit } from "../benchmarks/types.ts";
import type { ModuleId, SeasonPhase, StrengthDayId, TierId } from "./library-schema.ts";

/** The parent's answers to the five plan questions. */
export type ScreenAnswers = {
  painNow: boolean;
  /** Baseball only. Null when the athlete plays no baseball, so the question was not asked. */
  throwingArmPain: boolean | null;
  /** At least a year of strength training with a coach watching technique. */
  hasTrainingAge: boolean;
  seasonPhase: SeasonPhase;
  /** Team practices or games in a typical week, 0 to MAX_TEAM_SESSIONS. Each counts as a hard day. */
  teamSessionsPerWeek: number;
};

/** One stat on the gap report with a next level still to reach. */
export type StatGap = {
  sport: Sport;
  positionOrEvent: string;
  metric: string;
  unit: Unit;
  value: number;
  nextLevelLabel: string;
  /** The next level's number. Gaps are compared as a share of this, since the units differ. */
  nextLevelEntry: number;
  /** Distance to the next level, in the metric's unit. Always positive. */
  gap: number;
};

export type AthleteSportRef = { sport: Sport; positionOrEvent: string };

export type PlanInput = {
  grade: number;
  sports: readonly AthleteSportRef[];
  gaps: readonly StatGap[];
  screens: ScreenAnswers;
};

/** One line of a session: an exercise or drill with its dose. */
export type PlanItem = {
  name: string;
  /** Sets × reps, distance or time, exactly as the template words it (low end where the rules say so). */
  dose: string;
  rest: string | null;
  cue: string | null;
};

export type SessionBlockKind = "warmup" | "focus" | "strength" | "throwing" | "running";

export type SessionBlock = { kind: SessionBlockKind; heading: string; items: PlanItem[] };

export type Session = {
  title: string;
  /** Counts toward the tier's hard-day limit (strength, sprint, throwing at intent, interval or tempo runs). */
  isHard: boolean;
  strengthDay: StrengthDayId | null;
  blocks: SessionBlock[];
};

/** 0 = Monday ... 6 = Sunday. */
export type DayIndex = 0 | 1 | 2 | 3 | 4 | 5 | 6;

export type PlanDay = { day: DayIndex; session: Session | null };

export type PlanWeek = { week: number; note: string; days: PlanDay[] };

export type ChosenModule = {
  id: ModuleId;
  name: string;
  goal: string;
  addedTo: string;
  /** The stats that picked this module, biggest gap first. */
  gaps: StatGap[];
  /** Gap to the next level as a share of that level's number (0.07 = 7%). */
  gapShare: number;
};

export type BuiltPlan = {
  kind: "plan";
  tier: TierId;
  tierLabel: string;
  tierRules: string[];
  seasonPhase: SeasonPhase;
  seasonText: string;
  progression: string;
  retest: string;
  modules: ChosenModule[];
  weeks: PlanWeek[];
  /** Shown at the top of the plan: module notes plus the pain line. */
  safetyNotes: string[];
  /** Screen messages (throwing removed) and not-trainable messages for height and weight. */
  messages: string[];
  hardDayLimit: number;
  /** Team practices or games a week, counted toward hardDayLimit. */
  teamSessionsPerWeek: number;
  /** Work the schedule could not fit without breaking a rule, in plain words. */
  leftOut: string[];
};

export type StoppedPlan = { kind: "stopped"; message: string };

export type PlanResult = BuiltPlan | StoppedPlan;
