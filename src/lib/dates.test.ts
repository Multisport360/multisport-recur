import { describe, expect, test } from "vitest";
import { calendarDay, DEFAULT_TIME_ZONE, formatDayIn, formatLongDateIn, timeZoneOrDefault } from "./dates";

// 8 pm Eastern on Tuesday Nov 24, 2026 is already 1 am Wednesday Nov 25 in UTC.
const EIGHT_PM_EASTERN = new Date("2026-11-25T01:00:00Z");

describe("calendar days in the family's time zone", () => {
  test("an answer saved at 8 pm Eastern is on Nov 24 for an Eastern family, not Nov 25", () => {
    expect(calendarDay(EIGHT_PM_EASTERN, "America/New_York")).toBe("2026-11-24");
    expect(formatDayIn(EIGHT_PM_EASTERN, "America/New_York")).toBe("Nov 24, 2026");
    expect(formatLongDateIn(EIGHT_PM_EASTERN, "America/New_York")).toBe("November 24, 2026");
  });

  test("the same moment is Nov 25 for a family in UTC, and Nov 24 on the west coast", () => {
    expect(calendarDay(EIGHT_PM_EASTERN, "UTC")).toBe("2026-11-25");
    expect(calendarDay(EIGHT_PM_EASTERN, "America/Los_Angeles")).toBe("2026-11-24");
  });

  test("summer time is handled: 8 pm Eastern in July is midnight UTC the next day", () => {
    expect(calendarDay(new Date("2026-07-15T00:00:00Z"), "America/New_York")).toBe("2026-07-14");
  });
});

describe("the stored time zone", () => {
  test("a real IANA name is kept", () => {
    expect(timeZoneOrDefault("America/Chicago")).toBe("America/Chicago");
    expect(timeZoneOrDefault("UTC")).toBe("UTC");
  });

  test("anything missing or made up falls back to America/New_York", () => {
    expect(DEFAULT_TIME_ZONE).toBe("America/New_York");
    for (const bad of [undefined, null, "", "Mars/Olympus", "EST; drop table", "x".repeat(200)]) {
      expect(timeZoneOrDefault(bad)).toBe("America/New_York");
    }
  });
});
