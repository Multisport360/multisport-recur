import { describe, expect, test } from "vitest";
import { compareToSet } from "./compare";
import { headline, keepUnitsTogether, screenReaderText } from "./describe";
import { buildSets, findSets } from "./sets";
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

function result(query: Parameters<typeof findSets>[1], value: number) {
  const [set] = findSets(SETS, query);
  if (!set) throw new Error("fixture set not found");
  return compareToSet(set, value);
}

describe("headline", () => {
  test("in a level: names the level and the gap to the next", () => {
    expect(headline(result(VELOCITY_QUERY, 84))).toBe("You're in D2 range. 4 mph to D1 mid-major.");
  });

  test("below the lowest level: says how far short", () => {
    expect(headline(result(VELOCITY_QUERY, 70))).toBe("You're 8 mph short of JUCO range.");
  });

  test("at the top level: says it is the top level and where its numbers run to", () => {
    expect(headline(result(VELOCITY_QUERY, 93))).toBe(
      "You're in D1 Power 4 range. D1 Power 4 is the top level in this guide. This guide's D1 Power 4 numbers run from 92 to 98 mph.",
    );
  });

  test("at the top level with no upper number: just says it is the top level", () => {
    const [set] = buildSets([row({ level: "Division 1", levelCode: "D1", entry: 84 })]);
    if (!set) throw new Error("fixture set not found");
    expect(headline(compareToSet(set, 90))).toBe("You're in D1 range. D1 is the top level in this guide.");
  });

  test("times use the same wording", () => {
    expect(headline(result(DASH_QUERY, 6.95))).toBe("You're in D2 range. 0.15 sec to D1.");
  });

  test("uses the athlete's first name when given", () => {
    expect(headline(result(VELOCITY_QUERY, 84), { firstName: "Sam" })).toBe(
      "Sam is in D2 range. 4 mph to D1 mid-major.",
    );
  });

  test("ranges say inside, under or above the typical range", () => {
    expect(headline(result(HEIGHT_QUERY, 75))).toBe("You're inside the typical FBS range (6' 2\" to 6' 6\").");
    expect(headline(result(HEIGHT_QUERY, 73))).toBe(
      "You're inside the typical FCS range (6' 1\" to 6' 4\"). 1 inch under the typical FBS range (6' 2\" to 6' 6\").",
    );
    expect(headline(result(HEIGHT_QUERY, 69))).toBe(
      "You're 2 inches under the typical D3/NAIA range (5' 11\" to 6' 3\").",
    );
    expect(headline(result(HEIGHT_QUERY, 80))).toBe("You're above the typical range for every level listed.");
  });
});

describe("screenReaderText", () => {
  test("reads value, level, then gap", () => {
    expect(screenReaderText(result(VELOCITY_QUERY, 84))).toBe("84 mph, D2 range, 4 mph short of D1 mid-major");
  });

  test("below the lowest level", () => {
    expect(screenReaderText(result(VELOCITY_QUERY, 70))).toBe("70 mph, below JUCO range, 8 mph short of JUCO");
  });

  test("at the top level", () => {
    expect(screenReaderText(result(VELOCITY_QUERY, 96))).toBe("96 mph, D1 Power 4 range, the top level in this guide");
  });

  test("times are spoken in seconds", () => {
    expect(screenReaderText(result(DASH_QUERY, 7))).toBe("7 seconds, JUCO range, 0.05 seconds short of D2");
  });

  test("ranges are spoken with both ends", () => {
    expect(screenReaderText(result(HEIGHT_QUERY, 73))).toBe(
      "6 feet 1 inch, inside the typical FCS range of 6 feet 1 inch to 6 feet 4 inches, 1 inch under the typical FBS range",
    );
    expect(screenReaderText(result(HEIGHT_QUERY, 80))).toBe(
      "6 feet 8 inches, above the typical range for every level listed",
    );
  });

  test("low-confidence results end with rough guide", () => {
    const [set] = buildSets([
      row({ level: "Junior College", levelCode: "JUCO", entry: 78, confidence: "Low" }),
      row({ level: "Division 2", levelCode: "D2", entry: 82, confidence: "Low" }),
    ]);
    if (!set) throw new Error("fixture set not found");
    expect(screenReaderText(compareToSet(set, 80))).toBe("80 mph, JUCO range, 2 mph short of D2, rough guide");
  });
});

describe("keepUnitsTogether", () => {
  test("joins numbers to their units with a non-breaking space", () => {
    expect(keepUnitsTogether("You're in D2 range. 6 mph to D1.")).toBe("You're in D2 range. 6\u00a0mph to D1.");
    expect(keepUnitsTogether("(6' 1\" to 6' 4\"). 1 inch under")).toBe("(6'\u00a01\"\u00a0to\u00a06'\u00a04\"). 1\u00a0inch under");
    expect(keepUnitsTogether("(290 to 325 lb)")).toBe("(290\u00a0to\u00a0325\u00a0lb)");
  });

  test("leaves other spaces alone", () => {
    expect(keepUnitsTogether("84 consistently in games")).toBe("84 consistently in games");
  });
});
