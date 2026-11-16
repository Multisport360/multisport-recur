import { describe, expect, test } from "vitest";
import { compareToSet } from "./compare";
import { headline, screenReaderText } from "./describe";
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

  test("at the top level: says it is the highest listed and gives the next mark inside it", () => {
    expect(headline(result(VELOCITY_QUERY, 93))).toBe(
      "You're in D1 Power 4 range, the highest level this source lists. 2 mph to the middle of D1 Power 4 range.",
    );
    expect(headline(result(VELOCITY_QUERY, 99))).toBe(
      "You're in D1 Power 4 range, the highest level this source lists.",
    );
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
      "You're inside the typical FCS range (6' 1\" to 6' 4\"). 1 in under the typical FBS range (6' 2\" to 6' 6\").",
    );
    expect(headline(result(HEIGHT_QUERY, 69))).toBe(
      "You're 2 in under the typical D3/NAIA range (5' 11\" to 6' 3\").",
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
    expect(screenReaderText(result(VELOCITY_QUERY, 96))).toBe("96 mph, D1 Power 4 range, the highest level listed");
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
