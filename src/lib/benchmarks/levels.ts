// Files in this folder import each other with the .ts ending so the seed script can run them in plain Node.
import type { Confidence, LevelCode } from "./types.ts";
import { CONFIDENCE_ORDER } from "./types.ts";

/**
 * The usual order of college levels, lowest first.
 *
 * This is NOT a benchmark. It is only used to:
 *  - name the higher level first when two levels share the same entry number
 *  - pick the level for height/weight ranges, which overlap
 *  - say which sport an athlete is "closest to" across sports
 *
 * The order follows the ruler sketch in CLAUDE.md (JUCO, D3/NAIA, D2, D1 mid-major, D1 Power 4).
 * NAIA sits above D3 because the track data's NAIA entry marks are harder than its D3 marks.
 */
export const LEVEL_RANK: Record<LevelCode, number> = {
  JUCO: 10,
  D3_NAIA_JUCO: 15,
  D3: 20,
  D3_NAIA: 22,
  NAIA: 25,
  D2: 30,
  D1_LOW: 40,
  D1: 45,
  D1_HIGH: 50,
};

/**
 * The basic college levels each level code covers.
 *
 * Used to decide which sources can share one ruler. Track & field has one source per
 * division, each covering a different level, so they belong on one ruler. The two
 * pitcher-velocity sources both cover D1 through JUCO, so each gets its own ruler.
 */
export const LEVEL_COVERAGE: Record<LevelCode, readonly string[]> = {
  JUCO: ["JUCO"],
  D3_NAIA_JUCO: ["D3", "NAIA", "JUCO"],
  D3: ["D3"],
  D3_NAIA: ["D3", "NAIA"],
  NAIA: ["NAIA"],
  D2: ["D2"],
  D1_LOW: ["D1"],
  D1: ["D1"],
  D1_HIGH: ["D1"],
};

/** Short names for the ruler. Anything not listed is shown exactly as the data has it. */
const SHORT_LEVEL_LABELS: Record<string, string> = {
  "Division 1": "D1",
  "Division 2": "D2",
  "Division 3": "D3",
  "Division 3 / NAIA": "D3/NAIA",
  "Junior College": "JUCO",
  "D1 Power 4 / Top 25": "D1 Power 4",
  "D1 Power 4": "D1 Power 4",
  "D1 Mid-Major": "D1 mid-major",
  "D3 / NAIA / JUCO": "D3/NAIA/JUCO",
  "FBS (D1)": "FBS",
  "FCS (D1)": "FCS",
  NAIA: "NAIA",
};

export function shortLevelLabel(level: string): string {
  return SHORT_LEVEL_LABELS[level] ?? level;
}

export function confidenceRank(confidence: Confidence): number {
  return CONFIDENCE_ORDER.indexOf(confidence);
}

/** The weakest confidence in a list. */
export function lowestConfidence(values: readonly Confidence[]): Confidence {
  return values.reduce<Confidence>(
    (lowest, value) => (confidenceRank(value) < confidenceRank(lowest) ? value : lowest),
    "High",
  );
}

/** Low-confidence benchmarks are labelled "rough guide" wherever they are shown. */
export function isRoughGuide(confidence: Confidence): boolean {
  return confidence === "Low";
}
