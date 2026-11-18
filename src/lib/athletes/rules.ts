import { z } from "zod";
import { parseValueInput } from "@/lib/benchmarks/format";
import { GENDERS } from "@/lib/benchmarks/types";
import { gradeFromGradYear, gradYearFromGrade, MAX_GRADE, MIN_GRADE } from "@/lib/grade";

/**
 * Rules for athlete profiles. The database enforces the important ones too
 * (see supabase/migrations); these give people a clear message before it gets that far.
 *
 * Collected: first name, graduation year, birth YEAR, height, weight, gender. Nothing else.
 */

/**
 * An athlete can have a login only when this year minus their birth year is at least this.
 * Only the birth year is stored, so this assumes the birthday has not happened yet this
 * year: a 14-year gap guarantees the athlete is already 13.
 */
export const LOGIN_MIN_YEAR_GAP = 14;

/** Birth years offered when adding an athlete: ages about 11 to 19. */
const YOUNGEST_YEAR_GAP = 11;
const OLDEST_YEAR_GAP = 19;

export const HEIGHT_IN = { min: 36, max: 96 } as const;
export const WEIGHT_LB = { min: 50, max: 450 } as const;
export const FIRST_NAME_MAX = 40;

/** Graduation year minus birth year for a typical high school graduate (17 to 19 at graduation). */
export const GRAD_AGE = { min: 17, max: 19 } as const;

/** The first calendar year an athlete can have their own login. */
export function firstLoginYear(birthYear: number): number {
  return birthYear + LOGIN_MIN_YEAR_GAP;
}

/** True when the athlete is certainly 13 or older. */
export function canHaveLogin(birthYear: number, today: Date): boolean {
  return today.getFullYear() - birthYear >= LOGIN_MIN_YEAR_GAP;
}

/** Graduation years for grades 8 to 12 this school year, seniors first. */
export function gradYearOptions(today: Date): { gradYear: number; grade: number }[] {
  const options: { gradYear: number; grade: number }[] = [];
  for (let grade = MAX_GRADE; grade >= MIN_GRADE; grade -= 1) {
    options.push({ gradYear: gradYearFromGrade(grade, today), grade });
  }
  return options;
}

/** Birth years a middle or high school athlete could have, youngest first. */
export function birthYearOptions(today: Date): number[] {
  const thisYear = today.getFullYear();
  const years: number[] = [];
  for (let gap = YOUNGEST_YEAR_GAP; gap <= OLDEST_YEAR_GAP; gap += 1) years.push(thisYear - gap);
  return years;
}

export type AthleteInput = {
  firstName: string;
  gradYear: number;
  birthYear: number;
  heightIn: number | null;
  weightLb: number | null;
  gender: (typeof GENDERS)[number];
};

/** Height typed as 5'8, 5-8 or 68. Blank is allowed. */
const optionalHeight = z
  .string()
  .trim()
  .transform((raw, ctx) => {
    if (raw === "") return null;
    const parsed = parseValueInput(raw, "in");
    if (!parsed.ok || parsed.value < HEIGHT_IN.min || parsed.value > HEIGHT_IN.max) {
      ctx.addIssue({ code: "custom", message: "Type height as feet and inches, like 5'8, or leave it blank." });
      return z.NEVER;
    }
    return parsed.value;
  });

const optionalWeight = z
  .string()
  .trim()
  .transform((raw, ctx) => {
    if (raw === "") return null;
    const parsed = parseValueInput(raw, "lb");
    if (!parsed.ok || parsed.value < WEIGHT_LB.min || parsed.value > WEIGHT_LB.max) {
      ctx.addIssue({ code: "custom", message: "Type weight in pounds, like 150, or leave it blank." });
      return z.NEVER;
    }
    return parsed.value;
  });

/** Checks the add-athlete form. `today` decides which grades and birth years are allowed. */
export function athleteFormSchema(today: Date) {
  const gradYears = gradYearOptions(today).map((option) => option.gradYear);
  const birthYears = birthYearOptions(today);

  return z
    .object({
    firstName: z
      .string()
      .trim()
      .min(1, "Type your athlete's first name.")
      .max(FIRST_NAME_MAX, `Keep the first name to ${FIRST_NAME_MAX} letters or fewer.`),
    gradYear: z.coerce
      .number()
      .refine((year) => gradYears.includes(year), "Choose a graduation year. This site covers grades 8 to 12."),
    birthYear: z.coerce.number().refine((year) => birthYears.includes(year), "Choose a birth year."),
    heightIn: optionalHeight,
    weightLb: optionalWeight,
    gender: z.enum(GENDERS, "Choose who your athlete competes with."),
  })
    .superRefine((input, ctx) => {
      // Only compare the two when each is a valid choice on its own; otherwise its own message is enough.
      if (!gradYears.includes(input.gradYear) || !birthYears.includes(input.birthYear)) return;
      const gap = input.gradYear - input.birthYear;
      if (gap < GRAD_AGE.min || gap > GRAD_AGE.max) {
        ctx.addIssue({
          code: "custom",
          path: ["birthYear"],
          message: `A student in the class of ${input.gradYear} is usually born between ${input.gradYear - GRAD_AGE.max} and ${input.gradYear - GRAD_AGE.min}. Check the birth year and the grade.`,
        });
      }
    });
}

/** "10th grade, class of 2029". */
export function classLabel(gradYear: number, today: Date): string {
  const grade = gradeFromGradYear(gradYear, today);
  const inRange = grade >= MIN_GRADE && grade <= MAX_GRADE;
  return inRange ? `${grade}th grade, class of ${gradYear}` : `Class of ${gradYear}`;
}
