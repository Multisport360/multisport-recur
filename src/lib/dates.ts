/**
 * Dates in the family's own time zone.
 *
 * Each family stores an IANA time zone (taken from the parent's browser at sign-up, America/New_York
 * for families that existed before). A moment such as "answered at 01:00 UTC" is turned into the
 * calendar day the family was living in at that moment. Calendar dates that are already days
 * (a stat's measured_on) are not moments and never go through here.
 */

export const DEFAULT_TIME_ZONE = "America/New_York";
/** IANA names are short; anything longer is not one. Matches the database check. */
const MAX_TIME_ZONE_LENGTH = 64;

const SHORT_MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const LONG_MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

export function isValidTimeZone(value: string): boolean {
  if (value.length === 0 || value.length > MAX_TIME_ZONE_LENGTH) return false;
  try {
    new Intl.DateTimeFormat("en-US", { timeZone: value });
    return true;
  } catch {
    return false;
  }
}

/** The time zone to store or use: the given one if it is a real IANA name, otherwise America/New_York. */
export function timeZoneOrDefault(value: string | null | undefined): string {
  const trimmed = value?.trim() ?? "";
  return isValidTimeZone(trimmed) ? trimmed : DEFAULT_TIME_ZONE;
}

/** "YYYY-MM-DD": the calendar day it was in `timeZone` at that moment. */
export function calendarDay(moment: Date, timeZone: string): string {
  const parts = new Intl.DateTimeFormat("en-US", { timeZone, year: "numeric", month: "2-digit", day: "2-digit" }).formatToParts(moment);
  const part = (type: Intl.DateTimeFormatPartTypes) => parts.find((entry) => entry.type === type)?.value ?? "";
  return `${part("year")}-${part("month")}-${part("day")}`;
}

function dayParts(isoDay: string): [number, number, number] {
  const [year = 1970, month = 1, day = 1] = isoDay.split("-").map(Number);
  return [year, month, day];
}

/** "Nov 24, 2026" for that moment in the family's time zone. */
export function formatDayIn(moment: Date, timeZone: string): string {
  const [year, month, day] = dayParts(calendarDay(moment, timeZone));
  return `${SHORT_MONTHS[month - 1]} ${day}, ${year}`;
}

/** "November 24, 2026" for that moment in the family's time zone. */
export function formatLongDateIn(moment: Date, timeZone: string): string {
  const [year, month, day] = dayParts(calendarDay(moment, timeZone));
  return `${LONG_MONTHS[month - 1]} ${day}, ${year}`;
}
