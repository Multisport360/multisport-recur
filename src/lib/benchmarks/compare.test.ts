import { describe, expect, test } from "vitest";
import { compare, compareToSet, type Comparison } from "./compare";
import { buildSets, findSets, sourceIds, type BenchmarkSet } from "./sets";
import {
  DASH_QUERY,
  DASH_ROWS,
  HEIGHT_QUERY,
  HEIGHT_ROWS,
  row,
  SECOND_SOURCE,
  VELOCITY_QUERY,
  VELOCITY_ROWS,
} from "./test-fixtures";

const ALL_SETS = buildSets([...VELOCITY_ROWS, ...DASH_ROWS, ...HEIGHT_ROWS]);

function onlySet(query: Parameters<typeof findSets>[1], sets: readonly BenchmarkSet[] = ALL_SETS): BenchmarkSet {
  const [set] = findSets(sets, query);
  if (!set) throw new Error("fixture set not found");
  return set;
}

function summary(comparison: Comparison) {
  return {
    reached: comparison.reachedLevel?.label ?? null,
    next: comparison.nextLevel?.label ?? null,
    gap: comparison.gap,
    standing: comparison.standing,
  };
}

describe("higher is better", () => {
  const velocity = (value: number) => summary(compareToSet(onlySet(VELOCITY_QUERY), value));

  test("a value between two entry numbers reaches the lower level and reports the gap to the next", () => {
    expect(velocity(84)).toEqual({ reached: "D2", next: "D1 mid-major", gap: 4, standing: "in_level" });
  });

  test("a value exactly on an entry number reaches that level", () => {
    expect(velocity(82)).toEqual({ reached: "D2", next: "D1 mid-major", gap: 6, standing: "in_level" });
  });

  test("a value just under an entry number does not reach that level", () => {
    expect(velocity(81.9)).toEqual({ reached: "JUCO", next: "D2", gap: 0.1, standing: "in_level" });
  });

  test("a value exactly on the lowest entry number reaches the lowest level", () => {
    expect(velocity(78)).toEqual({ reached: "JUCO", next: "D2", gap: 4, standing: "in_level" });
  });

  test("a value below the lowest level reaches nothing and the gap is to the lowest level", () => {
    expect(velocity(70)).toEqual({ reached: null, next: "JUCO", gap: 8, standing: "below_lowest" });
  });

  test("a value exactly on the highest entry number reaches the top level with no next level", () => {
    expect(velocity(92)).toEqual({ reached: "D1 Power 4", next: null, gap: null, standing: "top_level" });
  });

  test("a value above the highest level still reports the top level", () => {
    expect(velocity(120)).toEqual({ reached: "D1 Power 4", next: null, gap: null, standing: "top_level" });
  });

  test("inside the top level, the next mark is mid, then elite", () => {
    const set = onlySet(VELOCITY_QUERY);
    expect(compareToSet(set, 93).topLevel).toEqual({
      reached: "entry",
      nextMark: { tier: "mid", target: 95, gap: 2 },
    });
    expect(compareToSet(set, 95).topLevel).toEqual({
      reached: "mid",
      nextMark: { tier: "elite", target: 98, gap: 3 },
    });
  });

  test("a value exactly on elite has reached elite and has no next mark", () => {
    expect(compareToSet(onlySet(VELOCITY_QUERY), 98).topLevel).toEqual({ reached: "elite", nextMark: null });
  });

  test("a value just under elite has not reached elite", () => {
    expect(compareToSet(onlySet(VELOCITY_QUERY), 97.9).topLevel).toEqual({
      reached: "mid",
      nextMark: { tier: "elite", target: 98, gap: 0.1 },
    });
  });

  test("top-level detail is only given at the top level", () => {
    expect(compareToSet(onlySet(VELOCITY_QUERY), 84).topLevel).toBeNull();
  });
});

describe("lower is better", () => {
  const dash = (value: number) => summary(compareToSet(onlySet(DASH_QUERY), value));

  test("a time between two entry numbers reaches the slower level", () => {
    expect(dash(7.0)).toEqual({ reached: "JUCO", next: "D2", gap: 0.05, standing: "in_level" });
  });

  test("a time exactly on an entry number reaches that level", () => {
    expect(dash(6.95)).toEqual({ reached: "D2", next: "D1", gap: 0.15, standing: "in_level" });
  });

  test("a time just slower than an entry number does not reach that level", () => {
    expect(dash(6.96)).toEqual({ reached: "JUCO", next: "D2", gap: 0.01, standing: "in_level" });
  });

  test("a time slower than the lowest level reaches nothing", () => {
    expect(dash(7.4)).toEqual({ reached: null, next: "JUCO", gap: 0.3, standing: "below_lowest" });
  });

  test("a time exactly on the highest entry number reaches the top level", () => {
    expect(dash(6.8)).toEqual({ reached: "D1", next: null, gap: null, standing: "top_level" });
  });

  test("a time faster than the highest level still reports the top level", () => {
    expect(dash(6.2)).toEqual({ reached: "D1", next: null, gap: null, standing: "top_level" });
  });

  test("a time exactly on elite has reached elite", () => {
    expect(compareToSet(onlySet(DASH_QUERY), 6.5).topLevel).toEqual({ reached: "elite", nextMark: null });
  });

  test("a time between entry and elite at the top level reports the gap to elite", () => {
    expect(compareToSet(onlySet(DASH_QUERY), 6.7).topLevel).toEqual({
      reached: "entry",
      nextMark: { tier: "elite", target: 6.5, gap: 0.2 },
    });
  });

  test("gaps do not carry floating-point dust", () => {
    // 6.95 - 6.8 is 0.15000000000000036 in floating point.
    expect(dash(6.95).gap).toBe(0.15);
  });
});

describe("range (height and weight)", () => {
  const height = (value: number) => summary(compareToSet(onlySet(HEIGHT_QUERY), value));

  test("a value inside every range reaches the highest level", () => {
    expect(height(75)).toEqual({ reached: "FBS", next: null, gap: null, standing: "top_level" });
  });

  test("a value exactly on the low end of a range is inside it", () => {
    expect(height(74)).toEqual({ reached: "FBS", next: null, gap: null, standing: "top_level" });
  });

  test("a value exactly on the high end of a range is inside it", () => {
    expect(height(78)).toEqual({ reached: "FBS", next: null, gap: null, standing: "top_level" });
  });

  test("a value inside a lower range reports the gap to the next range up", () => {
    expect(height(73)).toEqual({ reached: "FCS", next: "FBS", gap: 1, standing: "in_level" });
    expect(height(71)).toEqual({ reached: "D3/NAIA", next: "D2", gap: 1, standing: "in_level" });
  });

  test("a value below every range reaches nothing and the gap is to the nearest range", () => {
    expect(height(69)).toEqual({ reached: null, next: "D3/NAIA", gap: 2, standing: "below_lowest" });
  });

  test("a value above every range is reported as above the range, with no level and no gap", () => {
    expect(height(80)).toEqual({ reached: null, next: null, gap: null, standing: "above_range" });
  });

  test("range results carry no ruler steps", () => {
    const comparison = compareToSet(onlySet(HEIGHT_QUERY), 75);
    expect(comparison.kind).toBe("range");
    expect(comparison.reachedStep).toBeNull();
    expect(comparison.topLevel).toBeNull();
  });
});

describe("levels that share or swap entry numbers", () => {
  test("levels with the same entry number share a step and the higher level is named first", () => {
    const sets = buildSets([
      row({ level: "Junior College", levelCode: "JUCO", entry: 78 }),
      row({ level: "Division 3 / NAIA", levelCode: "D3_NAIA", entry: 80 }),
      row({ level: "Division 2", levelCode: "D2", entry: 80 }),
      row({ level: "Division 1", levelCode: "D1", entry: 87 }),
    ]);
    const comparison = compareToSet(onlySet(VELOCITY_QUERY, sets), 81);

    expect(comparison.reachedStep?.levels.map((level) => level.label)).toEqual(["D2", "D3/NAIA"]);
    expect(comparison.reachedLevel?.label).toBe("D2");
    expect(comparison.nextLevel?.label).toBe("D1");
    expect(comparison.gap).toBe(6);
  });

  test("when a lower level has a harder entry number, steps still run easiest to hardest", () => {
    // The real data has cases like this (JUCO pitcher 80 mph vs D3/NAIA 77 mph).
    const sets = buildSets([
      row({ level: "Junior College", levelCode: "JUCO", entry: 80 }),
      row({ level: "Division 3 / NAIA", levelCode: "D3_NAIA", entry: 77 }),
      row({ level: "Division 2", levelCode: "D2", entry: 82 }),
    ]);
    const set = onlySet(VELOCITY_QUERY, sets);

    expect(set.steps.map((step) => step.entry)).toEqual([77, 80, 82]);
    expect(summary(compareToSet(set, 78))).toEqual({ reached: "D3/NAIA", next: "JUCO", gap: 2, standing: "in_level" });
    expect(summary(compareToSet(set, 81))).toEqual({ reached: "JUCO", next: "D2", gap: 1, standing: "in_level" });
  });
});

describe("confidence", () => {
  test("the result takes the weakest confidence of the reached and next levels", () => {
    const sets = buildSets([
      row({ level: "Junior College", levelCode: "JUCO", entry: 78, confidence: "Low" }),
      row({ level: "Division 2", levelCode: "D2", entry: 82, confidence: "Medium" }),
      row({ level: "Division 1", levelCode: "D1", entry: 88, confidence: "Medium-High" }),
    ]);
    const set = onlySet(VELOCITY_QUERY, sets);

    expect(compareToSet(set, 79).confidence).toBe("Low");
    expect(compareToSet(set, 84).confidence).toBe("Medium");
    expect(compareToSet(set, 90).confidence).toBe("Medium-High");
    expect(compareToSet(set, 70).confidence).toBe("Low");
  });
});

describe("compare", () => {
  const input = { ...VELOCITY_QUERY, value: 84, unit: "mph" };

  test("returns the level reached, the next level, the gap and the confidence", () => {
    const outcome = compare(ALL_SETS, input);

    expect(outcome.status).toBe("ok");
    if (outcome.status !== "ok") return;
    expect(outcome.comparisons).toHaveLength(1);
    expect(summary(outcome.comparisons[0] as Comparison)).toEqual({
      reached: "D2",
      next: "D1 mid-major",
      gap: 4,
      standing: "in_level",
    });
    expect(outcome.comparisons[0]?.confidence).toBe("Medium");
  });

  test("reports a unit mismatch instead of converting", () => {
    expect(compare(ALL_SETS, { ...input, unit: "kph" })).toEqual({
      status: "unit_mismatch",
      expected: "mph",
      received: "kph",
    });
    expect(compare(ALL_SETS, { ...DASH_QUERY, value: 7, unit: "mph" })).toEqual({
      status: "unit_mismatch",
      expected: "sec",
      received: "mph",
    });
  });

  test("reports a missing benchmark for an unknown metric, position, sport or gender", () => {
    expect(compare(ALL_SETS, { ...input, metric: "Spin rate" })).toEqual({ status: "no_benchmark" });
    expect(compare(ALL_SETS, { ...input, positionOrEvent: "Catcher" })).toEqual({ status: "no_benchmark" });
    expect(compare(ALL_SETS, { ...input, sport: "Football" })).toEqual({ status: "no_benchmark" });
    expect(compare(ALL_SETS, { ...input, gender: "Female" })).toEqual({ status: "no_benchmark" });
    expect(compare([], input)).toEqual({ status: "no_benchmark" });
  });

  test("rejects values that are not positive numbers", () => {
    for (const value of [Number.NaN, Number.POSITIVE_INFINITY, 0, -5]) {
      expect(compare(ALL_SETS, { ...input, value })).toEqual({ status: "invalid_value" });
    }
  });

  test("with two sources, returns one comparison per source, most trustworthy first", () => {
    const sets = buildSets([
      ...VELOCITY_ROWS.map((r) => ({ ...r, confidence: "Low" as const, source: SECOND_SOURCE })),
      row({ level: "Division 2", levelCode: "D2", entry: 83 }),
      row({ level: "Division 1", levelCode: "D1", entry: 86 }),
    ]);
    const outcome = compare(sets, input);

    expect(outcome.status).toBe("ok");
    if (outcome.status !== "ok") return;
    expect(outcome.comparisons.map((c) => [sourceIds(c.set), c.confidence, c.gap])).toEqual([
      ["TEST", "Medium", 2],
      ["TEST-2", "Low", 4],
    ]);
  });

  test("sources that cover different levels share one ruler", () => {
    // Track & field data has one source per division.
    const sets = buildSets([
      row({ level: "Division 1", levelCode: "D1", entry: 88 }),
      row({ level: "Division 2", levelCode: "D2", entry: 82, source: SECOND_SOURCE }),
    ]);

    expect(sets).toHaveLength(1);
    expect(sourceIds(sets[0] as BenchmarkSet)).toBe("TEST+TEST-2");
    expect(sets[0]?.levels.map((level) => [level.label, level.source.id])).toEqual([
      ["D1", "TEST"],
      ["D2", "TEST-2"],
    ]);
  });

  test("a combined level keeps a source off a ruler that already covers part of it", () => {
    const sets = buildSets([
      row({ level: "Division 3", levelCode: "D3", entry: 76 }),
      row({ level: "D3 / NAIA / JUCO", levelCode: "D3_NAIA_JUCO", entry: 78, source: SECOND_SOURCE }),
    ]);
    expect(sets).toHaveLength(2);
  });
});
