import { describe, expect, test } from "vitest";
import { changeWords, formatDay, measuredBy } from "./words";

describe("report words", () => {
  test("formatDay reads a calendar date without shifting it", () => {
    expect(formatDay("2026-11-01")).toBe("Nov 1, 2026");
    expect(formatDay("2026-01-31")).toBe("Jan 31, 2026");
  });

  test("changeWords says better or faster in plain words", () => {
    expect(changeWords(3, "mph", "higher")).toBe("3 mph better");
    expect(changeWords(-2, "mph", "higher")).toBe("2 mph worse");
    expect(changeWords(0.2, "sec", "lower")).toBe("0.2 sec faster");
    expect(changeWords(-0.15, "sec", "lower")).toBe("0.15 sec slower");
    expect(changeWords(0, "mph", "higher")).toBe("No change");
  });

  test("measuredBy", () => {
    expect(measuredBy("coach")).toBe("measured by a coach");
  });
});
