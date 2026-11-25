/**
 * Where an athlete is in their 6-week training blocks.
 *
 * The first block starts on the Monday of the week the parent first answered the plan
 * questions. Blocks follow each other: after week 6, a new block starts at week 1.
 * Dates are worked out in UTC so every server gives the same answer.
 */

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

function utcMidnight(date: Date): number {
  return Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate());
}

/** Monday = 0 ... Sunday = 6. */
function weekdayIndex(dayMs: number): number {
  return (new Date(dayMs).getUTCDay() + 6) % DAYS_PER_WEEK;
}

function isoDay(dayMs: number): string {
  return new Date(dayMs).toISOString().slice(0, 10);
}

export function blockPosition(firstAnsweredAt: Date, today: Date): BlockPosition {
  const startDay = utcMidnight(firstAnsweredAt);
  const firstMonday = startDay - weekdayIndex(startDay) * MS_PER_DAY;
  const daysIn = Math.max(0, Math.floor((utcMidnight(today) - firstMonday) / MS_PER_DAY));
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

/** Week 6 is the retest week: the parent is asked to retest and log the new number. */
export function isRetestWeek(week: number): boolean {
  return week === WEEKS_PER_BLOCK;
}

/** A week number from the address bar, or the current week when it is missing or not 1 to 6. */
export function weekToShow(requested: string | undefined, currentWeek: number): number {
  const week = Number(requested);
  return Number.isInteger(week) && week >= 1 && week <= WEEKS_PER_BLOCK ? week : currentWeek;
}
