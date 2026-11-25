import { describe, expect, test } from "vitest";
import { buildSets } from "@/lib/benchmarks/sets";
import { DASH_ROWS, HEIGHT_ROWS, VELOCITY_ROWS } from "@/lib/benchmarks/test-fixtures";
import { buildSportReport, type StatEntry } from "@/lib/report/build";
import { gapsFromReports } from "./gaps";

const sets = buildSets([...VELOCITY_ROWS, ...DASH_ROWS, ...HEIGHT_ROWS]);
const entry = (metric: string, value: number, unit: string): StatEntry => ({
  id: metric,
  sport: "Baseball",
  metric,
  value,
  unit,
  measuredOn: "2026-10-01",
  howMeasured: "coach",
  createdAt: "2026-10-01T00:00:00Z",
});

describe("gapsFromReports", () => {
  test("takes the gap to the next level from the gap report, and skips numbers at the top or not entered", () => {
    const report = buildSportReport(sets, { sport: "Baseball", positionOrEvent: "Pitcher" }, "Male", [entry("Fastball velocity", 84, "mph"), entry("60-yard dash", 6.7, "sec")], {
      heightIn: null,
      weightLb: null,
    });
    expect(gapsFromReports([report])).toEqual([
      { sport: "Baseball", positionOrEvent: "Pitcher", metric: "Fastball velocity", unit: "mph", value: 84, nextLevelLabel: "D1 mid-major", nextLevelEntry: 88, gap: 4 },
    ]);
  });

  test("height comes from the profile when no height was entered", () => {
    const report = buildSportReport(sets, { sport: "Football", positionOrEvent: "QB" }, "Male", [], { heightIn: 70, weightLb: null });
    expect(gapsFromReports([report]).map((gap) => [gap.metric, gap.gap])).toEqual([["Height", 1]]);
  });
});
