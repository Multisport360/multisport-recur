import { describe, expect, test } from "vitest";
import {
  gradYearFromGrade,
  gradeFromGradYear,
  needsSeniorTargetsNote,
  schoolYearEnding,
} from "./grade";

const NOVEMBER_2026 = new Date(2026, 10, 16);
const MAY_2027 = new Date(2027, 4, 1);
const JULY_31_2027 = new Date(2027, 6, 31);
const AUGUST_1_2027 = new Date(2027, 7, 1);

describe("schoolYearEnding", () => {
  test("autumn belongs to the school year that ends next spring", () => {
    expect(schoolYearEnding(NOVEMBER_2026)).toBe(2027);
  });

  test("spring belongs to the school year that ends this year", () => {
    expect(schoolYearEnding(MAY_2027)).toBe(2027);
  });

  test("rolls over on August 1", () => {
    expect(schoolYearEnding(JULY_31_2027)).toBe(2027);
    expect(schoolYearEnding(AUGUST_1_2027)).toBe(2028);
  });
});

describe("gradeFromGradYear", () => {
  test("class of 2027 is in 12th grade in November 2026", () => {
    expect(gradeFromGradYear(2027, NOVEMBER_2026)).toBe(12);
  });

  test("class of 2031 is in 8th grade in November 2026", () => {
    expect(gradeFromGradYear(2031, NOVEMBER_2026)).toBe(8);
  });

  test("is the inverse of gradYearFromGrade", () => {
    for (const grade of [8, 9, 10, 11, 12]) {
      expect(gradeFromGradYear(gradYearFromGrade(grade, NOVEMBER_2026), NOVEMBER_2026)).toBe(grade);
    }
  });
});

describe("needsSeniorTargetsNote", () => {
  test("grades 8 to 11 see the senior-year targets note", () => {
    for (const grade of [8, 9, 10, 11]) {
      expect(needsSeniorTargetsNote(grade)).toBe(true);
    }
  });

  test("seniors do not see the note", () => {
    expect(needsSeniorTargetsNote(12)).toBe(false);
  });

  test("an unknown grade sees the note", () => {
    expect(needsSeniorTargetsNote(null)).toBe(true);
  });
});
