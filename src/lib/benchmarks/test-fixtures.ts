import type { BenchmarkRow, Source } from "./types.ts";

/** Small hand-made benchmark rows for unit tests. Not real benchmarks. */

export const TEST_SOURCE: Source = { id: "TEST", name: "Test source", url: "https://example.com/test" };
export const SECOND_SOURCE: Source = { id: "TEST-2", name: "Second test source", url: "https://example.com/two" };

export function row(overrides: Partial<BenchmarkRow>): BenchmarkRow {
  return {
    sport: "Baseball",
    positionOrEvent: "Pitcher",
    gender: "Male",
    metric: "Fastball velocity",
    unit: "mph",
    better: "higher",
    level: "Division 2",
    levelCode: "D2",
    entry: 82,
    mid: null,
    elite: null,
    confidence: "Medium",
    notes: "",
    source: TEST_SOURCE,
    ...overrides,
  };
}

/** higher is better: JUCO 78, D2 82, D1 mid-major 88, D1 Power 4 92 (mid 95, elite 98). */
export const VELOCITY_ROWS: BenchmarkRow[] = [
  row({ level: "Junior College", levelCode: "JUCO", entry: 78 }),
  row({ level: "Division 2", levelCode: "D2", entry: 82 }),
  row({ level: "D1 Mid-Major", levelCode: "D1_LOW", entry: 88 }),
  row({ level: "D1 Power 4", levelCode: "D1_HIGH", entry: 92, mid: 95, elite: 98 }),
];

const DASH = { metric: "60-yard dash", unit: "sec", better: "lower" } as const;

/** lower is better: JUCO 7.1, D2 6.95, D1 6.8 (elite 6.5). */
export const DASH_ROWS: BenchmarkRow[] = [
  row({ ...DASH, level: "Junior College", levelCode: "JUCO", entry: 7.1 }),
  row({ ...DASH, level: "Division 2", levelCode: "D2", entry: 6.95 }),
  row({ ...DASH, level: "Division 1", levelCode: "D1", entry: 6.8, elite: 6.5 }),
];

const HEIGHT = { sport: "Football", positionOrEvent: "QB", metric: "Height", unit: "in", better: "range" } as const;

/** range: D3/NAIA 71-75, D2 72-75, FCS 73-76, FBS 74-78. */
export const HEIGHT_ROWS: BenchmarkRow[] = [
  row({ ...HEIGHT, level: "FBS (D1)", levelCode: "D1_HIGH", entry: 74, elite: 78 }),
  row({ ...HEIGHT, level: "FCS (D1)", levelCode: "D1_LOW", entry: 73, elite: 76 }),
  row({ ...HEIGHT, level: "Division 2", levelCode: "D2", entry: 72, elite: 75 }),
  row({ ...HEIGHT, level: "Division 3 / NAIA", levelCode: "D3_NAIA", entry: 71, elite: 75 }),
];

export const VELOCITY_QUERY = {
  sport: "Baseball",
  positionOrEvent: "Pitcher",
  gender: "Male",
  metric: "Fastball velocity",
} as const;

export const DASH_QUERY = { ...VELOCITY_QUERY, metric: "60-yard dash" } as const;

export const HEIGHT_QUERY = {
  sport: "Football",
  positionOrEvent: "QB",
  gender: "Male",
  metric: "Height",
} as const;
