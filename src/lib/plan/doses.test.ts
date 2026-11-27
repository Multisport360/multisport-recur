import { describe, expect, test } from "vitest";
import { isLeftOut, lowEndSets, sessionsPerWeek } from "./doses";

describe("lowEndSets", () => {
  test.each([
    ["2–3 × 8–10", "2 × 8–10"],
    ["1–2 × 3–5", "1 × 3–5"],
    ["5–6 × 10–15 m", "5 × 10–15 m"],
    ["3–5 reps", "3 reps"],
    ["3–4 days a week", "3 days a week"],
    ["3 × 6–8 each leg", "3 × 6–8 each leg"],
    ["15–20 quality reps", "15–20 quality reps"],
    ["2 × 20 s each side", "2 × 20 s each side"],
  ])("%s -> %s", (dose, expected) => {
    expect(lowEndSets(dose)).toBe(expected);
  });
});

test("'none' and a missing dose mean the item is left out of the tier", () => {
  expect(isLeftOut("none")).toBe(true);
  expect(isLeftOut(undefined)).toBe(true);
  expect(isLeftOut("2 × 5")).toBe(false);
});

describe("sessionsPerWeek", () => {
  test.each([
    ["2–3 × 20–30 min a week", 2, "20–30 min"],
    ["3 × 30–45 min a week", 3, "30–45 min"],
    ["1 × (6 × 200 m)", 1, "6 × 200 m"],
    ["1 × 15–20 min at a comfortably hard pace", 1, "15–20 min at a comfortably hard pace"],
    ["4 × 80 m after an easy run", 1, "4 × 80 m after an easy run"],
  ])("%s", (dose, count, each) => {
    expect(sessionsPerWeek(dose)).toEqual({ count, each });
  });
});
