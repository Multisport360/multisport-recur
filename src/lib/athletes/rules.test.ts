import { describe, expect, test } from "vitest";
import { athleteFormSchema, birthYearOptions, canHaveLogin, classLabel, gradYearOptions } from "./rules";

const NOVEMBER_2026 = new Date(2026, 10, 16);

const VALID = {
  firstName: "Sam",
  gradYear: "2029",
  birthYear: "2011",
  heightIn: "5'8",
  weightLb: "150",
  gender: "Male",
};

function errorsFor(input: Record<string, string>): Record<string, string> {
  const result = athleteFormSchema(NOVEMBER_2026).safeParse(input);
  if (result.success) return {};
  return Object.fromEntries(result.error.issues.map((issue) => [String(issue.path[0]), issue.message]));
}

describe("canHaveLogin", () => {
  test("an athlete who is certainly 13 or older can have a login", () => {
    expect(canHaveLogin(2012, NOVEMBER_2026)).toBe(true);
    expect(canHaveLogin(2008, NOVEMBER_2026)).toBe(true);
  });

  test("an athlete who turns 13 this year might still be 12, so no login yet", () => {
    expect(canHaveLogin(2013, NOVEMBER_2026)).toBe(false);
  });

  test("an athlete under 13 cannot have a login", () => {
    expect(canHaveLogin(2014, NOVEMBER_2026)).toBe(false);
    expect(canHaveLogin(2016, NOVEMBER_2026)).toBe(false);
  });
});

describe("form options", () => {
  test("graduation years cover grades 12 down to 8 for the current school year", () => {
    expect(gradYearOptions(NOVEMBER_2026)).toEqual([
      { gradYear: 2027, grade: 12 },
      { gradYear: 2028, grade: 11 },
      { gradYear: 2029, grade: 10 },
      { gradYear: 2030, grade: 9 },
      { gradYear: 2031, grade: 8 },
    ]);
  });

  test("birth years cover ages about 11 to 19", () => {
    const years = birthYearOptions(NOVEMBER_2026);
    expect(years[0]).toBe(2015);
    expect(years[years.length - 1]).toBe(2007);
  });

  test("classLabel names the grade and the class year", () => {
    expect(classLabel(2029, NOVEMBER_2026)).toBe("10th grade, class of 2029");
    expect(classLabel(2024, NOVEMBER_2026)).toBe("Class of 2024");
  });
});

describe("athleteFormSchema", () => {
  test("reads a valid form into numbers, with height in inches", () => {
    expect(athleteFormSchema(NOVEMBER_2026).parse(VALID)).toEqual({
      firstName: "Sam",
      gradYear: 2029,
      birthYear: 2011,
      heightIn: 68,
      weightLb: 150,
      gender: "Male",
    });
  });

  test("height and weight are optional", () => {
    const parsed = athleteFormSchema(NOVEMBER_2026).parse({ ...VALID, heightIn: "", weightLb: " " });
    expect(parsed.heightIn).toBeNull();
    expect(parsed.weightLb).toBeNull();
  });

  test("a missing first name says what to type", () => {
    expect(errorsFor({ ...VALID, firstName: "  " })).toEqual({ firstName: "Type your athlete's first name." });
  });

  test("a graduation year outside grades 8 to 12 is refused", () => {
    expect(errorsFor({ ...VALID, gradYear: "2035" }).gradYear).toContain("grades 8 to 12");
    expect(errorsFor({ ...VALID, gradYear: "" }).gradYear).toContain("Choose a graduation year");
  });

  test("a birth year outside the offered range is refused", () => {
    expect(errorsFor({ ...VALID, birthYear: "1990" })).toEqual({ birthYear: "Choose a birth year." });
  });

  test("an unreadable or impossible height or weight says how to type it", () => {
    expect(errorsFor({ ...VALID, heightIn: "tall" }).heightIn).toContain("like 5'8");
    expect(errorsFor({ ...VALID, heightIn: "9'9" }).heightIn).toContain("like 5'8");
    expect(errorsFor({ ...VALID, weightLb: "20" }).weightLb).toContain("like 150");
  });

  test("a birth year that doesn't fit the grade is refused, with the years that would", () => {
    expect(errorsFor({ ...VALID, gradYear: "2028", birthYear: "2014" })).toEqual({
      birthYear: "A student in the class of 2028 is usually born between 2009 and 2011. Check the birth year and the grade.",
    });
    expect(errorsFor({ ...VALID, gradYear: "2029", birthYear: "2010" })).toEqual({});
  });

  test("gender must be one the benchmarks cover", () => {
    expect(errorsFor({ ...VALID, gender: "" })).toEqual({ gender: "Choose who your athlete competes with." });
  });
});
