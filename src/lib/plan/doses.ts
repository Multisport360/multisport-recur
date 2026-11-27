/**
 * Reading the dose text in the templates ("2–3 × 8–10", "3–4 days a week", "1 × (6 × 200 m)").
 * The builder never invents a number: it only picks the low end of a range the template wrote.
 */

/** A leading "a–b" count followed by ×, reps, runs or days. */
const LEADING_RANGE = /^(\d+)–\d+(?=\s*(?:×|reps\b|runs\b|days\b))/;

/** "2–3 × 8–10" becomes "2 × 8–10"; "3–4 runs" becomes "3 runs". Anything else is unchanged. */
export function lowEndSets(dose: string): string {
  return dose.replace(LEADING_RANGE, "$1");
}

/** True when the template leaves this item out of the tier. */
export function isLeftOut(dose: string | undefined): boolean {
  return dose === undefined || dose.trim().toLowerCase() === "none";
}

/**
 * Splits a weekly running dose into how many sessions and what each one is:
 *   "2–3 × 20–30 min a week" -> { count: 2, each: "20–30 min" }   (low end of the count)
 *   "1 × (6 × 200 m)"         -> { count: 1, each: "6 × 200 m" }
 *   "4 × 80 m after an easy run" -> { count: 1, each: "4 × 80 m after an easy run" }  (not a count of sessions)
 */
export function sessionsPerWeek(dose: string): { count: number; each: string } {
  const perWeek = /^(\d+)(?:–\d+)? × (.+?) a week$/.exec(dose);
  if (perWeek) return { count: Number(perWeek[1]), each: (perWeek[2] as string).trim() };
  const single = /^1 × \((.+)\)$/.exec(dose) ?? /^1 × (.+)$/.exec(dose);
  if (single) return { count: 1, each: (single[1] as string).trim() };
  return { count: 1, each: dose };
}
