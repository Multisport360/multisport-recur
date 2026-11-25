import { describe, expect, test } from "vitest";
import { buildSets } from "@/lib/benchmarks/sets";
import { DASH_ROWS, row, VELOCITY_ROWS } from "@/lib/benchmarks/test-fixtures";
import { sportFormSchema, statFormSchema } from "./rules";

const SETS = buildSets([
  ...VELOCITY_ROWS,
  ...DASH_ROWS,
  row({ sport: "Track & Field", positionOrEvent: "100m hurdles", metric: "100m hurdles", unit: "sec", better: "lower", gender: "Female", level: "Division 1", levelCode: "D1", entry: 15.2 }),
]);
const TODAY = "2026-11-17";
const context = { sets: SETS, sport: "Baseball", positionOrEvent: "Pitcher", gender: "Male" as const, today: TODAY };
const VALID = { metric: "Fastball velocity", value: "84", measuredOn: "2026-11-01", howMeasured: "coach" };

function problems(input: Record<string, string>) {
  const result = statFormSchema(context).safeParse(input);
  return result.success ? {} : Object.fromEntries(result.error.issues.map((issue) => [String(issue.path[0]), issue.message]));
}

describe("statFormSchema", () => {
  test("reads a valid entry, with the unit taken from the benchmarks", () => {
    expect(statFormSchema(context).parse(VALID)).toEqual({
      metric: "Fastball velocity",
      unit: "mph",
      value: 84,
      measuredOn: "2026-11-01",
      howMeasured: "coach",
    });
  });

  test("a metric with no benchmark for this position is refused", () => {
    expect(problems({ ...VALID, metric: "Spin rate" })).toEqual({ metric: "Choose what was measured from the list." });
  });

  test("an unreadable number says how to type it", () => {
    expect(problems({ ...VALID, value: "fast" }).value).toContain("like 84");
  });

  test("a date in the future or before 2015 is refused", () => {
    expect(problems({ ...VALID, measuredOn: "2026-11-18" })).toEqual({ measuredOn: "The date can't be in the future." });
    expect(problems({ ...VALID, measuredOn: "2014-12-31" })).toEqual({ measuredOn: "Choose a date in 2015 or later." });
    expect(problems({ ...VALID, measuredOn: TODAY })).toEqual({});
  });

  test("reports every problem at once, not one at a time", () => {
    expect(problems({ metric: "Fastball velocity", value: "fast", measuredOn: "", howMeasured: "" })).toEqual({
      value: "That isn't a number we can read. Type the speed in mph, like 84.",
      measuredOn: "Choose the date it was measured.",
      howMeasured: "Choose who measured it.",
    });
  });

  test("who measured it is required", () => {
    expect(problems({ ...VALID, howMeasured: "" })).toEqual({ howMeasured: "Choose who measured it." });
  });
});

describe("sportFormSchema", () => {
  test("accepts a position that has benchmarks for the athlete's gender", () => {
    expect(sportFormSchema(SETS, "Male").parse({ sport: "Baseball", positionOrEvent: "Pitcher" })).toEqual({
      sport: "Baseball",
      positionOrEvent: "Pitcher",
    });
  });

  test("refuses an event with no benchmarks for the athlete's gender", () => {
    const result = sportFormSchema(SETS, "Male").safeParse({ sport: "Track & Field", positionOrEvent: "100m hurdles" });
    expect(result.success).toBe(false);
  });
});
