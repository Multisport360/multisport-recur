/**
 * Shapes shared by the benchmark importer, the comparison engine and the ruler.
 * Benchmark numbers only ever come from the benchmarks table (loaded from data/benchmarks.csv).
 */

export const SPORTS = ["Baseball", "Football", "Track & Field"] as const;
export type Sport = (typeof SPORTS)[number];

export const GENDERS = ["Male", "Female"] as const;
export type Gender = (typeof GENDERS)[number];

export const UNITS = ["mph", "sec", "in", "lb"] as const;
export type Unit = (typeof UNITS)[number];

/**
 * Which direction is good.
 * - higher: bigger is better (velocity, distance)
 * - lower: smaller is better (times)
 * - range: a typical band (height, weight); entry is the low end, elite the high end
 */
export const BETTER = ["higher", "lower", "range"] as const;
export type Better = (typeof BETTER)[number];

/** Weakest first. A "Low" row is shown as a "rough guide". */
export const CONFIDENCE_ORDER = ["Low", "Medium", "Medium-High", "High"] as const;
export type Confidence = (typeof CONFIDENCE_ORDER)[number];

export const LEVEL_CODES = [
  "JUCO",
  "D3_NAIA_JUCO",
  "D3",
  "D3_NAIA",
  "NAIA",
  "D2",
  "D1_LOW",
  "D1",
  "D1_HIGH",
] as const;
export type LevelCode = (typeof LEVEL_CODES)[number];

export type Source = {
  id: string;
  name: string;
  url: string;
};

/** One row of the benchmarks table. */
export type BenchmarkRow = {
  sport: Sport;
  positionOrEvent: string;
  gender: Gender;
  metric: string;
  unit: Unit;
  better: Better;
  level: string;
  levelCode: LevelCode;
  entry: number;
  mid: number | null;
  elite: number | null;
  confidence: Confidence;
  notes: string;
  source: Source;
};
