/**
 * School grade worked out from graduation year.
 *
 * A school year runs August to July. A student who graduates in spring 2028 is a
 * 12th grader from August 2027 through July 2028.
 */

/** Month (1-12) when the school year rolls over to the next grade. */
export const SCHOOL_YEAR_START_MONTH = 8;

/** Grades the product is built for. */
export const MIN_GRADE = 8;
export const MAX_GRADE = 12;

/** The spring year the current school year ends in. November 2026 -> 2027. */
export function schoolYearEnding(today: Date): number {
  const month = today.getMonth() + 1;
  return month >= SCHOOL_YEAR_START_MONTH ? today.getFullYear() + 1 : today.getFullYear();
}

/** Grade number for a graduation year. Can fall outside 8-12 for very young or graduated athletes. */
export function gradeFromGradYear(gradYear: number, today: Date): number {
  return MAX_GRADE - (gradYear - schoolYearEnding(today));
}

/** Graduation year for a grade number in the current school year. */
export function gradYearFromGrade(grade: number, today: Date): number {
  return schoolYearEnding(today) + (MAX_GRADE - grade);
}

/**
 * Benchmarks are senior-year targets. Until on-pace targets exist, everyone who is not
 * yet a senior is told so. An unknown grade gets the note too, because that is the safe side.
 */
export function needsSeniorTargetsNote(grade: number | null): boolean {
  return grade === null || grade < MAX_GRADE;
}

/** "9th", "12th". */
export function gradeLabel(grade: number): string {
  return `${grade}th`;
}
