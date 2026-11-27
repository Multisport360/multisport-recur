/**
 * Where an athlete is in their 6-week training blocks.
 *
 * The first block starts on the Monday of the week the parent first answered the plan
 * questions. Blocks follow each other: after week 6, a new block starts at week 1.
 * Days are the family's calendar days (their stored time zone), so an answer saved at 8 pm
 * Eastern on a Sunday belongs to that Sunday's week, whatever time zone the server runs in.
 */

import { calendarDay } from "@/lib/dates";

export const WEEKS_PER_BLOCK = 6;
const DAYS_PER_WEEK = 7;
const MS_PER_DAY = 24 * 60 * 60 * 1000;

export type BlockPosition = {
  /** YYYY-MM-DD, a Monday. */
  blockStart: string;
  /** 1 to 6. */
  week: number;
  /** 0 = Monday ... 6 = Sunday. */
  dayIndex: number;
  /** Counting from 1. */
  blockNumber: number;
};

/** The family's calendar day for that moment, as a UTC-midnight number so days can be counted. */
function localDay(moment: Date, timeZone: string): number {
  return Date.parse(`${calendarDay(moment, timeZone)}T00:00:00Z`);
}

/** Monday = 0 ... Sunday = 6. */
function weekdayIndex(dayMs: number): number {
  return (new Date(dayMs).getUTCDay() + 6) % DAYS_PER_WEEK;
}

function isoDay(dayMs: number): string {
  return new Date(dayMs).toISOString().slice(0, 10);
}

export function blockPosition(firstAnsweredAt: Date, today: Date, timeZone: string): BlockPosition {
  const startDay = localDay(firstAnsweredAt, timeZone);
  const firstMonday = startDay - weekdayIndex(startDay) * MS_PER_DAY;
  const daysIn = Math.max(0, Math.round((localDay(today, timeZone) - firstMonday) / MS_PER_DAY));
  const blockLength = WEEKS_PER_BLOCK * DAYS_PER_WEEK;
  const blockIndex = Math.floor(daysIn / blockLength);
  const dayInBlock = daysIn % blockLength;
  return {
    blockStart: isoDay(firstMonday + blockIndex * blockLength * MS_PER_DAY),
    week: Math.floor(dayInBlock / DAYS_PER_WEEK) + 1,
    dayIndex: dayInBlock % DAYS_PER_WEEK,
    blockNumber: blockIndex + 1,
  };
}

/** The key for one session in the set of sessions marked done. */
export function sessionKey(week: number, day: number): string {
  return `${week}-${day}`;
}

/** Week 6 is the retest week: the parent is asked to retest and log the new number. */
export function isRetestWeek(week: number): boolean {
  return week === WEEKS_PER_BLOCK;
}

/**
 * The line under "Week N of 6". It always starts with the week being shown, so it agrees with
 * the heading and the highlighted tab; when that isn't the calendar week, it says which one is.
 */
export function weekStatus(shownWeek: number, currentWeek: number): { text: string; isCurrent: boolean } {
  if (shownWeek === currentWeek) return { text: `This is week ${shownWeek}, the current week.`, isCurrent: true };
  return { text: `This is week ${shownWeek}. The block is on week ${currentWeek} now.`, isCurrent: false };
}

/** A week number from the address bar, or the current week when it is missing or not 1 to 6. */
export function weekToShow(requested: string | undefined, currentWeek: number): number {
  const week = Number(requested);
  return Number.isInteger(week) && week >= 1 && week <= WEEKS_PER_BLOCK ? week : currentWeek;
}
