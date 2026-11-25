import { describe, expect, test } from "vitest";
import { blockPosition, isRetestWeek, weekToShow } from "./block";

// Wednesday 4 November 2026. Its Monday is 2 November.
const ANSWERED = new Date("2026-11-04T15:00:00Z");

describe("blockPosition", () => {
  test("the first block starts on the Monday of the week the questions were answered", () => {
    expect(blockPosition(ANSWERED, new Date("2026-11-04T18:00:00Z"))).toEqual({ blockStart: "2026-11-02", week: 1, dayIndex: 2, blockNumber: 1 });
  });

  test("counts weeks, and starts a new block after week 6", () => {
    expect(blockPosition(ANSWERED, new Date("2026-12-07T09:00:00Z"))).toMatchObject({ week: 6, dayIndex: 0, blockNumber: 1 });
    expect(blockPosition(ANSWERED, new Date("2026-12-13T23:00:00Z"))).toMatchObject({ week: 6, dayIndex: 6 });
    expect(blockPosition(ANSWERED, new Date("2026-12-14T00:30:00Z"))).toEqual({ blockStart: "2026-12-14", week: 1, dayIndex: 0, blockNumber: 2 });
  });

  test("a clock before the answers never gives a negative week", () => {
    expect(blockPosition(ANSWERED, new Date("2026-10-01T00:00:00Z"))).toMatchObject({ week: 1, blockNumber: 1 });
  });
});

test("week 6 is the retest week", () => {
  expect([1, 2, 3, 4, 5, 6].filter(isRetestWeek)).toEqual([6]);
});

test("weekToShow accepts 1 to 6 from the address bar, else the current week", () => {
  expect(weekToShow("3", 5)).toBe(3);
  expect(weekToShow(undefined, 5)).toBe(5);
  expect(weekToShow("7", 2)).toBe(2);
  expect(weekToShow("2.5", 2)).toBe(2);
  expect(weekToShow("abc", 4)).toBe(4);
});
