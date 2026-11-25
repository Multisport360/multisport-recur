import { describe, expect, test } from "vitest";
import { blockPosition, isRetestWeek, weekStatus, weekToShow } from "./block";

// Wednesday 4 November 2026 (10 am Eastern). Its Monday is 2 November.
const ANSWERED = new Date("2026-11-04T15:00:00Z");
const EASTERN = "America/New_York";

describe("blockPosition", () => {
  test("the first block starts on the Monday of the week the questions were answered", () => {
    expect(blockPosition(ANSWERED, new Date("2026-11-04T18:00:00Z"), EASTERN)).toEqual({ blockStart: "2026-11-02", week: 1, dayIndex: 2, blockNumber: 1 });
  });

  test("counts weeks, and starts a new block after week 6", () => {
    expect(blockPosition(ANSWERED, new Date("2026-12-07T09:00:00Z"), EASTERN)).toMatchObject({ week: 6, dayIndex: 0, blockNumber: 1 });
    expect(blockPosition(ANSWERED, new Date("2026-12-14T04:30:00Z"), EASTERN)).toMatchObject({ week: 6, dayIndex: 6 });
    expect(blockPosition(ANSWERED, new Date("2026-12-14T05:30:00Z"), EASTERN)).toEqual({ blockStart: "2026-12-14", week: 1, dayIndex: 0, blockNumber: 2 });
  });

  test("a clock before the answers never gives a negative week", () => {
    expect(blockPosition(ANSWERED, new Date("2026-10-01T00:00:00Z"), EASTERN)).toMatchObject({ week: 1, blockNumber: 1 });
  });
});

describe("an answer saved at 8 pm Eastern", () => {
  // Sunday 29 November 2026, 8 pm Eastern = Monday 30 November, 1 am UTC.
  const SUNDAY_8PM_EASTERN = new Date("2026-11-30T01:00:00Z");

  test("belongs to Sunday's week for an Eastern family: the block starts Monday Nov 23", () => {
    expect(blockPosition(SUNDAY_8PM_EASTERN, SUNDAY_8PM_EASTERN, EASTERN)).toEqual({ blockStart: "2026-11-23", week: 1, dayIndex: 6, blockNumber: 1 });
  });

  test("the next morning is Monday of week 2, not week 1 of a later block", () => {
    expect(blockPosition(SUNDAY_8PM_EASTERN, new Date("2026-11-30T13:00:00Z"), EASTERN)).toMatchObject({ blockStart: "2026-11-23", week: 2, dayIndex: 0 });
  });

  test("worked out in UTC it would wrongly start a week later, which is what this fixes", () => {
    expect(blockPosition(SUNDAY_8PM_EASTERN, SUNDAY_8PM_EASTERN, "UTC")).toMatchObject({ blockStart: "2026-11-30", dayIndex: 0 });
  });

  test("Tuesday 8 pm Eastern is still Tuesday: day 2 of the week starting Monday Nov 23", () => {
    const tuesday = new Date("2026-11-25T01:00:00Z");
    expect(blockPosition(tuesday, tuesday, EASTERN)).toEqual({ blockStart: "2026-11-23", week: 1, dayIndex: 1, blockNumber: 1 });
  });
});

test("weeks stay 7 days long across the clocks going back on Nov 1", () => {
  const answered = new Date("2026-10-26T16:00:00Z"); // Monday Oct 26, noon Eastern summer time
  expect(blockPosition(answered, new Date("2026-11-02T05:30:00Z"), EASTERN)).toMatchObject({ week: 2, dayIndex: 0 });
  expect(blockPosition(answered, new Date("2026-11-02T04:30:00Z"), EASTERN)).toMatchObject({ week: 1, dayIndex: 6 });
});

describe("weekStatus: the line under the week heading always names the week being shown", () => {
  test("the current week", () => {
    expect(weekStatus(1, 1)).toEqual({ text: "This is week 1, the current week.", isCurrent: true });
  });

  test("looking ahead: week 2 shown while the block is on week 1 (the mismatch on localhost)", () => {
    expect(weekStatus(2, 1)).toEqual({ text: "This is week 2. The block is on week 1 now.", isCurrent: false });
  });

  test("looking back", () => {
    expect(weekStatus(3, 5)).toEqual({ text: "This is week 3. The block is on week 5 now.", isCurrent: false });
  });

  test("whatever week is shown, the line starts with that week's number", () => {
    for (let current = 1; current <= 6; current += 1) {
      for (let shown = 1; shown <= 6; shown += 1) expect(weekStatus(shown, current).text.startsWith(`This is week ${shown}`)).toBe(true);
    }
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
