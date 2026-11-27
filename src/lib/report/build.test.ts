import { describe, expect, test } from "vitest";
import { buildSets } from "@/lib/benchmarks/sets";
import { DASH_ROWS, HEIGHT_ROWS, row, VELOCITY_ROWS } from "@/lib/benchmarks/test-fixtures";
import { buildSportReport, closestSport, type StatEntry } from "./build";

const TRACK = { sport: "Track & Field", positionOrEvent: "100m", metric: "100m", unit: "sec", better: "lower" } as const;
const SETS = buildSets([
  ...VELOCITY_ROWS,
  ...DASH_ROWS,
  ...HEIGHT_ROWS,
  row({ ...TRACK, level: "Division 2", levelCode: "D2", entry: 11.3 }),
  row({ ...TRACK, level: "Division 1", levelCode: "D1", entry: 10.9 }),
]);
const NO_PROFILE = { heightIn: null, weightLb: null };
const PITCHER = { sport: "Baseball", positionOrEvent: "Pitcher" } as const;

let nextId = 0;
function entry(overrides: Partial<StatEntry>): StatEntry {
  nextId += 1;
  return {
    id: `e${nextId}`,
    sport: "Baseball",
    metric: "Fastball velocity",
    value: 80,
    unit: "mph",
    measuredOn: "2026-09-01",
    howMeasured: "self",
    createdAt: `2026-09-01T00:00:0${nextId % 10}Z`,
    ...overrides,
  };
}

describe("buildSportReport", () => {
  test("has a metric for every benchmark of the position, empty until something is entered", () => {
    const report = buildSportReport(SETS, PITCHER, "Male", [], NO_PROFILE);
    expect(report.metrics.map((metric) => [metric.metric, metric.value, metric.comparisons.length])).toEqual([
      ["Fastball velocity", null, 0],
      ["60-yard dash", null, 0],
    ]);
  });

  test("uses the most recent measurement, not the most recently typed one", () => {
    const entries = [
      entry({ value: 84, measuredOn: "2026-10-01" }),
      entry({ value: 79, measuredOn: "2026-05-01" }), // typed later, measured earlier
    ];
    const metric = buildSportReport(SETS, PITCHER, "Male", entries, NO_PROFILE).metrics[0];
    expect(metric?.value).toBe(84);
    expect(metric?.comparisons[0]?.reachedLevel?.label).toBe("D2");
  });

  test("history lists every entry oldest first with the level reached and the change", () => {
    const entries = [
      entry({ value: 83, measuredOn: "2026-10-01" }),
      entry({ value: 77, measuredOn: "2026-03-01" }),
      entry({ value: 80, measuredOn: "2026-06-01" }),
    ];
    const metric = buildSportReport(SETS, PITCHER, "Male", entries, NO_PROFILE).metrics[0];
    expect(metric?.history.map((row) => [row.entry.measuredOn, row.levelLabel, row.improvement])).toEqual([
      ["2026-03-01", null, null],
      ["2026-06-01", "JUCO", 3],
      ["2026-10-01", "D2", 3],
    ]);
  });

  test("for times, a faster time counts as an improvement", () => {
    const entries = [
      entry({ metric: "60-yard dash", unit: "sec", value: 7.2, measuredOn: "2026-03-01" }),
      entry({ metric: "60-yard dash", unit: "sec", value: 7.0, measuredOn: "2026-06-01" }),
    ];
    const metric = buildSportReport(SETS, PITCHER, "Male", entries, NO_PROFILE).metrics[1];
    expect(metric?.history[1]?.improvement).toBe(0.2);
  });

  test("a single entry has no history", () => {
    const metric = buildSportReport(SETS, PITCHER, "Male", [entry({ value: 84 })], NO_PROFILE).metrics[0];
    expect(metric?.history).toEqual([]);
  });

  test("entries from another sport are ignored", () => {
    const metric = buildSportReport(SETS, PITCHER, "Male", [entry({ sport: "Football" })], NO_PROFILE).metrics[0];
    expect(metric?.value).toBeNull();
  });

  test("profile height fills in until a height is entered, and says so", () => {
    const qb = { sport: "Football", positionOrEvent: "QB" } as const;
    const fromProfile = buildSportReport(SETS, qb, "Male", [], { heightIn: 73, weightLb: null }).metrics[0];
    expect(fromProfile?.valueSource).toEqual({ kind: "profile" });
    expect(fromProfile?.comparisons[0]?.reachedLevel?.label).toBe("FCS");

    const entered = entry({ sport: "Football", metric: "Height", unit: "in", value: 74 });
    const fromEntry = buildSportReport(SETS, qb, "Male", [entered], { heightIn: 73, weightLb: null }).metrics[0];
    expect(fromEntry?.value).toBe(74);
    expect(fromEntry?.valueSource?.kind).toBe("entry");
  });
});

describe("closestSport", () => {
  const baseball = (value: number) => buildSportReport(SETS, PITCHER, "Male", [entry({ value })], NO_PROFILE);
  const track = (value: number) =>
    buildSportReport(SETS, { sport: "Track & Field", positionOrEvent: "100m" }, "Male", [
      entry({ sport: "Track & Field", metric: "100m", unit: "sec", value }),
    ], NO_PROFILE);

  test("names the sport whose number reaches the higher level", () => {
    const result = closestSport([baseball(83), track(10.8)]);
    expect(result?.leader.sport).toBe("Track & Field");
    expect(result?.leader.comparison.reachedLevel?.label).toBe("D1");
    expect(result?.others.map((other) => other.sport)).toEqual(["Baseball"]);
  });

  test("on the same level, the one closer to the next level leads", () => {
    // Both D2. Baseball is 1 mph of 88 short (about 1%); track is 0.3 of 10.9 short (about 3%).
    const result = closestSport([track(11.2), baseball(87)]);
    expect(result?.leader.sport).toBe("Baseball");
  });

  test("needs numbers in at least two sports", () => {
    expect(closestSport([baseball(83)])).toBeNull();
    expect(closestSport([baseball(83), buildSportReport(SETS, { sport: "Track & Field", positionOrEvent: "100m" }, "Male", [], NO_PROFILE)])).toBeNull();
  });

  test("height and weight do not count towards the summary", () => {
    const qb = buildSportReport(SETS, { sport: "Football", positionOrEvent: "QB" }, "Male", [], { heightIn: 76, weightLb: null });
    expect(closestSport([baseball(83), qb])).toBeNull();
  });
});
