import { describe, expect, test } from "vitest";
import { optionsFor, resolveSelection } from "./selection";
import { buildSets } from "./sets";
import { DASH_ROWS, HEIGHT_ROWS, row, VELOCITY_ROWS } from "./test-fixtures";

const TRACK = { sport: "Track & Field", positionOrEvent: "100m", metric: "100m", unit: "sec", better: "lower" } as const;

const SETS = buildSets([
  ...VELOCITY_ROWS,
  ...DASH_ROWS,
  ...HEIGHT_ROWS,
  row({ ...TRACK, gender: "Male", level: "Division 1", levelCode: "D1", entry: 10.9 }),
  row({ ...TRACK, gender: "Female", level: "Division 1", levelCode: "D1", entry: 12.5 }),
  row({
    ...TRACK,
    positionOrEvent: "100m hurdles",
    metric: "100m hurdles",
    gender: "Female",
    level: "Division 1",
    levelCode: "D1",
    entry: 15.2,
  }),
]);

describe("resolveSelection", () => {
  test("with no wishes, picks the first sport, gender, position and metric", () => {
    expect(resolveSelection(SETS, {})).toEqual({
      sport: "Baseball",
      gender: "Male",
      positionOrEvent: "Pitcher",
      metric: "Fastball velocity",
    });
  });

  test("keeps every wish that has benchmarks", () => {
    const wanted = { sport: "Baseball", gender: "Male", positionOrEvent: "Pitcher", metric: "60-yard dash" } as const;
    expect(resolveSelection(SETS, wanted)).toEqual(wanted);
  });

  test("changing sport drops a position and metric the new sport does not have", () => {
    expect(
      resolveSelection(SETS, { sport: "Football", gender: "Male", positionOrEvent: "Pitcher", metric: "Fastball velocity" }),
    ).toEqual({ sport: "Football", gender: "Male", positionOrEvent: "QB", metric: "Height" });
  });

  test("a gender the sport has no benchmarks for falls back to one it has", () => {
    expect(resolveSelection(SETS, { sport: "Baseball", gender: "Female" })?.gender).toBe("Male");
  });

  test("changing gender drops an event that gender does not have", () => {
    expect(
      resolveSelection(SETS, { sport: "Track & Field", gender: "Male", positionOrEvent: "100m hurdles", metric: "100m hurdles" }),
    ).toEqual({ sport: "Track & Field", gender: "Male", positionOrEvent: "100m", metric: "100m" });
  });

  test("returns null when there are no benchmarks at all", () => {
    expect(resolveSelection([], {})).toBeNull();
  });
});

describe("optionsFor", () => {
  test("offers only choices that have benchmarks for the current selection", () => {
    const selection = resolveSelection(SETS, { sport: "Track & Field", gender: "Female" });
    if (!selection) throw new Error("expected a selection");
    const options = optionsFor(SETS, selection);

    expect(options.sports).toEqual(["Baseball", "Football", "Track & Field"]);
    expect(options.genders).toEqual(["Male", "Female"]);
    expect(options.positions).toEqual(["100m", "100m hurdles"]);
    expect(options.metrics).toEqual([{ metric: "100m", unit: "sec", better: "lower" }]);
  });

  test("a sport with one gender offers one gender", () => {
    const selection = resolveSelection(SETS, { sport: "Baseball" });
    if (!selection) throw new Error("expected a selection");
    expect(optionsFor(SETS, selection).genders).toEqual(["Male"]);
  });
});
