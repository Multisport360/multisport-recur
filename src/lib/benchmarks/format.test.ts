import { describe, expect, test } from "vitest";
import { formatGap, formatValue, parseValueInput, spokenValue } from "./format";

describe("formatValue", () => {
  test("speeds and weights drop needless decimals", () => {
    expect(formatValue(84, "mph")).toBe("84 mph");
    expect(formatValue(84.5, "mph")).toBe("84.5 mph");
    expect(formatValue(185, "lb")).toBe("185 lb");
  });

  test("times under a minute always show a decimal place", () => {
    expect(formatValue(7, "sec")).toBe("7.0 sec");
    expect(formatValue(6.8, "sec")).toBe("6.8 sec");
    expect(formatValue(1.95, "sec")).toBe("1.95 sec");
  });

  test("times of a minute or more read as minutes and seconds", () => {
    expect(formatValue(60, "sec")).toBe("1:00.0");
    expect(formatValue(118, "sec")).toBe("1:58.0");
    expect(formatValue(269.45, "sec")).toBe("4:29.45");
    expect(formatValue(119.999, "sec")).toBe("2:00.0");
  });

  test("short lengths stay in inches and long ones read as feet and inches", () => {
    expect(formatValue(30, "in")).toBe("30 in");
    expect(formatValue(74, "in")).toBe("6' 2\"");
    expect(formatValue(260, "in")).toBe("21' 8\"");
    expect(formatValue(72, "in")).toBe("6' 0\"");
    expect(formatValue(260.5, "in")).toBe("21' 8.5\"");
  });
});

describe("formatGap", () => {
  test("gaps are plain amounts in the metric's unit", () => {
    expect(formatGap(6, "mph")).toBe("6 mph");
    expect(formatGap(0.15, "sec")).toBe("0.15 sec");
    expect(formatGap(12, "sec")).toBe("12 sec");
    expect(formatGap(3, "in")).toBe("3 in");
    expect(formatGap(10, "lb")).toBe("10 lb");
  });

  test("long length gaps read as feet and inches", () => {
    expect(formatGap(114, "in")).toBe("9' 6\"");
  });
});

describe("spokenValue", () => {
  test("spells units out for screen readers", () => {
    expect(spokenValue(84, "mph")).toBe("84 mph");
    expect(spokenValue(6.95, "sec")).toBe("6.95 seconds");
    expect(spokenValue(1, "sec")).toBe("1 second");
    expect(spokenValue(269, "sec")).toBe("4 minutes 29 seconds");
    expect(spokenValue(74, "in")).toBe("6 feet 2 inches");
    expect(spokenValue(1, "in")).toBe("1 inch");
    expect(spokenValue(185, "lb")).toBe("185 pounds");
  });
});

describe("parseValueInput", () => {
  test("reads plain numbers, with spaces around them", () => {
    expect(parseValueInput(" 84 ", "mph")).toEqual({ ok: true, value: 84 });
    expect(parseValueInput("6.95", "sec")).toEqual({ ok: true, value: 6.95 });
    expect(parseValueInput(".5", "sec")).toEqual({ ok: true, value: 0.5 });
  });

  test("reads minutes and seconds for times", () => {
    expect(parseValueInput("4:29", "sec")).toEqual({ ok: true, value: 269 });
    expect(parseValueInput("1:58.5", "sec")).toEqual({ ok: true, value: 118.5 });
  });

  test("reads feet and inches for lengths", () => {
    expect(parseValueInput("6'2", "in")).toEqual({ ok: true, value: 74 });
    expect(parseValueInput("6' 2\"", "in")).toEqual({ ok: true, value: 74 });
    expect(parseValueInput("21-8", "in")).toEqual({ ok: true, value: 260 });
    expect(parseValueInput("6 ft 2 in", "in")).toEqual({ ok: true, value: 74 });
    expect(parseValueInput("6ft", "in")).toEqual({ ok: true, value: 72 });
  });

  test("does not read minutes for a speed or feet for a time", () => {
    expect(parseValueInput("4:29", "mph").ok).toBe(false);
    expect(parseValueInput("6'2", "sec").ok).toBe(false);
  });

  test("rejects seconds of 60 or more and inches of 12 or more in the split forms", () => {
    expect(parseValueInput("4:75", "sec").ok).toBe(false);
    expect(parseValueInput("6'14", "in").ok).toBe(false);
  });

  test("an empty field says how to type the value", () => {
    expect(parseValueInput("", "mph")).toEqual({ ok: false, message: "Type the speed in mph, like 84." });
  });

  test("text, negatives and zero are errors that say how to fix it", () => {
    for (const raw of ["fast", "-84", "0", "84mph", "8 4"]) {
      const parsed = parseValueInput(raw, "mph");
      expect(parsed.ok).toBe(false);
      if (!parsed.ok) expect(parsed.message).toContain("like 84");
    }
  });

  test("a number far too big is an error", () => {
    const parsed = parseValueInput("840", "mph");
    expect(parsed).toEqual({
      ok: false,
      message: "840 mph is higher than this field accepts. Check the number and type it again.",
    });
  });
});
