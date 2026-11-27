import { lowestConfidence } from "./levels.ts";
import { findSets, type BenchmarkQuery, type BenchmarkSet, type LevelMark, type Step } from "./sets.ts";
import type { Confidence, Unit } from "./types.ts";

/**
 * The comparison engine. Plain functions, no database, no AI.
 *
 * higher / lower metrics
 *   A level is reached when the value meets its entry number (>= for higher, <= for lower).
 *   The level reached is the hardest entry number met. The next level is the first one not met.
 *   The gap is the distance from the value to the next level's entry number.
 *
 * range metrics (height, weight)
 *   entry..elite is the typical band for a level. The level reached is the highest level whose
 *   band contains the value. The next level is the nearest higher level whose band starts above it.
 */

export type Tier = "entry" | "mid" | "elite";

/** Where the value sits inside the level it reached (only worked out for the top level). */
export type TopLevelDetail = {
  /** The furthest mark of the top level the value has met. */
  reached: Tier;
  /** The next mark inside the top level, if the data has one. */
  nextMark: { tier: Exclude<Tier, "entry">; target: number; gap: number } | null;
};

export type Standing =
  /** Has not met the easiest entry number (or sits under every typical range). */
  | "below_lowest"
  /** Reached a level and there is a higher one to aim for. */
  | "in_level"
  /** Reached the highest level this source lists. */
  | "top_level"
  /** Range metrics only: above the typical range of every level. */
  | "above_range";

export type Comparison = {
  kind: "threshold" | "range";
  set: BenchmarkSet;
  value: number;
  /** The level reached. For tied levels this is the higher one. Null when below the lowest level. */
  reachedLevel: LevelMark | null;
  /** The next level up. Null at the top (or above every range). */
  nextLevel: LevelMark | null;
  /** Distance to the next level's entry number, in the metric's unit. Always positive. */
  gap: number | null;
  standing: Standing;
  /** The weakest confidence of the rows this result leans on. */
  confidence: Confidence;
  /** higher/lower only: the ruler steps reached and next (a step can hold tied levels). */
  reachedStep: Step | null;
  nextStep: Step | null;
  /** higher/lower only, and only at the top level. */
  topLevel: TopLevelDetail | null;
};

export type CompareInput = BenchmarkQuery & {
  value: number;
  unit: string;
};

export type CompareOutcome =
  /** One comparison per source, most trustworthy source first. */
  | { status: "ok"; comparisons: Comparison[] }
  | { status: "no_benchmark" }
  | { status: "unit_mismatch"; expected: Unit; received: string }
  | { status: "invalid_value" };

/** Subtracting decimals leaves dust like 0.15000000000000036. Round it away. */
const GAP_DECIMALS = 3;

function cleanGap(distance: number): number {
  const factor = 10 ** GAP_DECIMALS;
  return Math.round(Math.abs(distance) * factor) / factor;
}

function meets(better: "higher" | "lower", value: number, mark: number): boolean {
  return better === "higher" ? value >= mark : value <= mark;
}

function resultConfidence(set: BenchmarkSet, levels: readonly (LevelMark | null)[]): Confidence {
  const used = levels.filter((level): level is LevelMark => level !== null);
  return used.length > 0 ? lowestConfidence(used.map((level) => level.confidence)) : set.confidence;
}

function topLevelDetail(better: "higher" | "lower", value: number, level: LevelMark): TopLevelDetail {
  const marks: { tier: Exclude<Tier, "entry">; target: number }[] = [];
  if (level.mid !== null) marks.push({ tier: "mid", target: level.mid });
  if (level.elite !== null) marks.push({ tier: "elite", target: level.elite });

  let reached: Tier = "entry";
  for (const mark of marks) {
    if (!meets(better, value, mark.target)) {
      return { reached, nextMark: { ...mark, gap: cleanGap(mark.target - value) } };
    }
    reached = mark.tier;
  }
  return { reached, nextMark: null };
}

function compareThreshold(set: BenchmarkSet, value: number, better: "higher" | "lower"): Comparison {
  // Steps run easiest to hardest, so the steps met are always a prefix of the list.
  const metCount = set.steps.filter((step) => meets(better, value, step.entry)).length;
  const reachedStep = set.steps[metCount - 1] ?? null;
  const nextStep = set.steps[metCount] ?? null;
  const reachedLevel = reachedStep?.levels[0] ?? null;
  const nextLevel = nextStep?.levels[0] ?? null;

  const standing: Standing = !reachedStep ? "below_lowest" : nextStep ? "in_level" : "top_level";

  return {
    kind: "threshold",
    set,
    value,
    reachedLevel,
    nextLevel,
    gap: nextStep ? cleanGap(nextStep.entry - value) : null,
    standing,
    confidence: resultConfidence(set, [reachedLevel, nextLevel]),
    reachedStep,
    nextStep,
    topLevel: standing === "top_level" && reachedLevel ? topLevelDetail(better, value, reachedLevel) : null,
  };
}

function isInsideRange(level: LevelMark, value: number): boolean {
  return value >= level.entry && level.elite !== null && value <= level.elite;
}

function compareRange(set: BenchmarkSet, value: number): Comparison {
  // set.levels is highest level first.
  const reachedLevel = set.levels.find((level) => isInsideRange(level, value)) ?? null;
  const highestLevel = set.levels[0] ?? null;

  // Higher levels whose typical range starts above the value; the nearest one is the next target.
  const candidates = set.levels
    .filter((level) => (reachedLevel ? level.rank > reachedLevel.rank : true))
    .filter((level) => value < level.entry)
    .sort((a, b) => a.entry - b.entry || a.rank - b.rank);
  const nextLevel = candidates[0] ?? null;

  let standing: Standing;
  if (reachedLevel) {
    standing = reachedLevel === highestLevel ? "top_level" : "in_level";
  } else {
    standing = nextLevel ? "below_lowest" : "above_range";
  }

  return {
    kind: "range",
    set,
    value,
    reachedLevel,
    nextLevel,
    gap: nextLevel ? cleanGap(nextLevel.entry - value) : null,
    standing,
    confidence: resultConfidence(set, [reachedLevel, nextLevel]),
    reachedStep: null,
    nextStep: null,
    topLevel: null,
  };
}

/** Compare one value against one ruler. The value must already be in the set's unit. */
export function compareToSet(set: BenchmarkSet, value: number): Comparison {
  return set.better === "range" ? compareRange(set, value) : compareThreshold(set, value, set.better);
}

export function isValidValue(value: number): boolean {
  return Number.isFinite(value) && value > 0;
}

/**
 * Compare a value against every source that has benchmarks for the metric.
 * Units are never converted: a value in the wrong unit is reported, not guessed at.
 */
export function compare(sets: readonly BenchmarkSet[], input: CompareInput): CompareOutcome {
  if (!isValidValue(input.value)) return { status: "invalid_value" };

  const matching = findSets(sets, input);
  const first = matching[0];
  if (!first) return { status: "no_benchmark" };

  if (input.unit !== first.unit) {
    return { status: "unit_mismatch", expected: first.unit, received: input.unit };
  }

  return { status: "ok", comparisons: matching.map((set) => compareToSet(set, input.value)) };
}
