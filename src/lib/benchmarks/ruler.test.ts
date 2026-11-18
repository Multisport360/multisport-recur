import { describe, expect, test } from "vitest";
import { naturalTickStep, rangeRuler, thresholdRuler } from "./ruler";
import { buildSets, findSets, type BenchmarkSet } from "./sets";
import {
  DASH_QUERY,
  DASH_ROWS,
  HEIGHT_QUERY,
  HEIGHT_ROWS,
  row,
  VELOCITY_QUERY,
  VELOCITY_ROWS,
} from "./test-fixtures";

const SETS = buildSets([...VELOCITY_ROWS, ...DASH_ROWS, ...HEIGHT_ROWS]);

function setFor(query: Parameters<typeof findSets>[1]): BenchmarkSet {
  const [set] = findSets(SETS, query);
  if (!set) throw new Error("fixture set not found");
  return set;
}

// Velocity fixture: JUCO 78, D2 82, D1 mid-major 88, D1 Power 4 92 (elite 98).
// A half-width lead-in plus four level bands: 4.5 shares in all.
const V = 4.5;
describe("thresholdRuler (higher is better)", () => {
  const velocity = setFor(VELOCITY_QUERY);
  const position = (value: number) => thresholdRuler(velocity, value).marker?.position;

  test("has a lead-in band plus one band per level, with stronger tints for higher levels", () => {
    const { bands } = thresholdRuler(velocity, null);

    expect(bands.map((band) => band.step?.levels[0]?.label ?? null)).toEqual([
      null,
      "JUCO",
      "D2",
      "D1 mid-major",
      "D1 Power 4",
    ]);
    const tints = bands.map((band) => band.tint);
    expect(tints[0]).toBe(0);
    expect([...tints].sort((a, b) => a - b)).toEqual(tints);
  });

  test("no value means no marker", () => {
    expect(thresholdRuler(velocity, null).marker).toBeNull();
  });

  test("a value exactly on an entry number sits on that band's left edge", () => {
    expect(position(78)).toBeCloseTo(0.5 / V);
    expect(position(82)).toBeCloseTo(1.5 / V);
    expect(position(88)).toBeCloseTo(2.5 / V);
    expect(position(92)).toBeCloseTo(3.5 / V);
  });

  test("a value between two entry numbers sits in proportion between them", () => {
    expect(position(85)).toBeCloseTo(2 / V);
    expect(position(80)).toBeCloseTo(1 / V);
  });

  test("the top band runs to the top level's elite mark", () => {
    expect(position(95)).toBeCloseTo(4 / V);
    expect(thresholdRuler(velocity, 98).marker).toEqual({ position: 1, offScale: null });
  });

  test("a value past either end is pinned to the edge and flagged", () => {
    expect(thresholdRuler(velocity, 120).marker).toEqual({ position: 1, offScale: "above" });
    expect(thresholdRuler(velocity, 40).marker).toEqual({ position: 0, offScale: "below" });
  });

  test("positions always rise as the value improves", () => {
    const positions = [70, 75, 78, 80, 82, 86, 88, 90, 92, 96, 99].map((value) => position(value) as number);
    expect([...positions].sort((a, b) => a - b)).toEqual(positions);
  });
});

// Dash fixture: JUCO 7.1, D2 6.95, D1 6.8 (elite 6.5). A half-width lead-in plus three bands: 3.5 shares.
const D = 3.5;
describe("thresholdRuler (lower is better)", () => {
  const dash = setFor(DASH_QUERY);
  const position = (value: number) => thresholdRuler(dash, value).marker?.position;

  test("faster times sit further right", () => {
    expect(position(7.1)).toBeCloseTo(0.5 / D);
    expect(position(6.95)).toBeCloseTo(1.5 / D);
    expect(position(6.8)).toBeCloseTo(2.5 / D);
    expect(position(6.65)).toBeCloseTo(3 / D);
    expect(position(7.4) as number).toBeLessThan(position(7.2) as number);
  });

  test("a very slow time is pinned to the left edge and a very fast one to the right", () => {
    expect(thresholdRuler(dash, 9).marker).toEqual({ position: 0, offScale: "below" });
    expect(thresholdRuler(dash, 6.0).marker).toEqual({ position: 1, offScale: "above" });
  });
});

describe("tick marks", () => {
  const velocity = setFor(VELOCITY_QUERY);

  test("sit at whole unit steps, so a band that covers more mph shows more ticks", () => {
    const { bands } = thresholdRuler(velocity, null);
    // JUCO 78-82 has ticks at 79, 80, 81. D2 82-88 has ticks at 83 to 87.
    expect(bands[1]?.ticks).toHaveLength(3);
    expect(bands[2]?.ticks).toHaveLength(5);
    expect(bands[1]?.ticks[0]).toBeCloseTo(0.25);
  });

  test("use the step a coach measures in, the same for every ruler of a metric", () => {
    expect(thresholdRuler(velocity, null).tickStep).toBe(1);
    expect(naturalTickStep("sec", 6.8)).toBe(0.1);
    expect(naturalTickStep("sec", 50.4)).toBe(1);
    expect(naturalTickStep("sec", 269)).toBe(5);
    expect(naturalTickStep("in", 30)).toBe(1);
    expect(naturalTickStep("in", 1873)).toBe(12);
    expect(naturalTickStep("lb", 300)).toBe(5);
  });

  test("never crowd a band", () => {
    for (const band of thresholdRuler(setFor(DASH_QUERY), null).bands) {
      expect(band.ticks.length).toBeLessThanOrEqual(10);
      for (const tick of band.ticks) {
        expect(tick).toBeGreaterThan(0);
        expect(tick).toBeLessThan(1);
      }
    }
  });
});

describe("thresholdRuler with a single level", () => {
  const [single] = buildSets([row({ level: "FBS (D1)", levelCode: "D1_HIGH", entry: 30, unit: "in", metric: "Vertical jump" })]);

  test("has a lead-in and one band, with the entry number where they meet", () => {
    const ruler = thresholdRuler(single as BenchmarkSet, 30);
    expect(ruler.bands).toHaveLength(2);
    expect(ruler.marker?.position).toBeCloseTo(0.5 / 1.5);
  });

  test("a near miss still lands on the ruler instead of off its end", () => {
    expect(thresholdRuler(single as BenchmarkSet, 26).marker?.offScale).toBeNull();
  });
});

// Height fixture: D3/NAIA 71-75, D2 72-75, FCS 73-76, FBS 74-78.
describe("rangeRuler", () => {
  const height = setFor(HEIGHT_QUERY);

  test("has one lane per level, highest level first, on one shared number line", () => {
    const { lanes } = rangeRuler(height, null);

    expect(lanes.map((lane) => lane.level.label)).toEqual(["FBS", "FCS", "D2", "D3/NAIA"]);
    for (const lane of lanes) {
      expect(lane.start).toBeGreaterThan(0);
      expect(lane.end).toBeLessThan(1);
      expect(lane.end).toBeGreaterThan(lane.start);
    }
    // FBS starts further right than D3/NAIA because its range starts taller.
    expect((lanes[0] as { start: number }).start).toBeGreaterThan((lanes[3] as { start: number }).start);
  });

  test("marks the lanes whose range contains the value, edges included", () => {
    const containing = (value: number) =>
      rangeRuler(height, value)
        .lanes.filter((lane) => lane.fit === "inside")
        .map((lane) => lane.level.label);

    expect(containing(74)).toEqual(["FBS", "FCS", "D2", "D3/NAIA"]);
    expect(containing(71)).toEqual(["D3/NAIA"]);
    expect(containing(78)).toEqual(["FBS"]);
    expect(containing(69)).toEqual([]);
  });

  test("says how far under or over each range the value is", () => {
    const fits = (value: number) => rangeRuler(height, value).lanes.map((lane) => [lane.level.label, lane.fit, lane.distance]);

    expect(fits(73)).toEqual([
      ["FBS", "under", 1],
      ["FCS", "inside", 0],
      ["D2", "inside", 0],
      ["D3/NAIA", "inside", 0],
    ]);
    expect(fits(77)).toEqual([
      ["FBS", "inside", 0],
      ["FCS", "over", 1],
      ["D2", "over", 2],
      ["D3/NAIA", "over", 2],
    ]);
    expect(rangeRuler(height, null).lanes.every((lane) => lane.fit === null)).toBe(true);
  });

  test("ticks are whole numbers inside the ruler, in order", () => {
    const { ticks } = rangeRuler(height, null);

    expect(ticks.length).toBeGreaterThanOrEqual(3);
    for (const tick of ticks) {
      expect(Number.isInteger(tick.value)).toBe(true);
      expect(tick.position).toBeGreaterThanOrEqual(0);
      expect(tick.position).toBeLessThanOrEqual(1);
    }
  });

  test("a value far outside the ranges is pinned to the edge and flagged", () => {
    expect(rangeRuler(height, 50).marker).toEqual({ position: 0, offScale: "below" });
    expect(rangeRuler(height, 95).marker).toEqual({ position: 1, offScale: "above" });
  });
});
