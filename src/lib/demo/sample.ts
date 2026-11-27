import { calendarDay } from "@/lib/dates";
import type { HowMeasured, StatEntry } from "@/lib/report/build";
import type { AthleteSport } from "@/lib/report/queries";
import type { ScreenAnswers } from "@/lib/plan/types";

/**
 * The demo's made-up family. Nothing here is a real person, and none of it is ever saved.
 * Dates are counted back from "today", so the progress history always covers the last few months.
 * These are an athlete's own numbers, not benchmarks: the rulers still come only from the benchmark data.
 */

export const DEMO_TIME_ZONE = "America/New_York";
const MS_PER_DAY = 24 * 60 * 60 * 1000;

export const DEMO_PARENT = { name: "Demo Parent" } as const;

export const DEMO_ATHLETE = {
  id: "demo-jordan",
  firstName: "Jordan",
  gradYear: 2028,
  gender: "Male",
  heightIn: 71,
  weightLb: 172,
} as const;

export const DEMO_SPORTS: readonly AthleteSport[] = [
  { id: "demo-baseball-pitcher", sport: "Baseball", positionOrEvent: "Pitcher" },
  { id: "demo-football-wr", sport: "Football", positionOrEvent: "WR" },
];

/** [metric, unit, sport, [days ago, value, how measured][]] */
const HISTORY: readonly (readonly [string, string, string, readonly (readonly [number, number, HowMeasured])[]])[] = [
  ["Fastball velocity", "mph", "Baseball", [[150, 77, "coach"], [85, 79, "event"], [20, 81, "coach"]]],
  ["40-yard dash", "sec", "Football", [[140, 4.95, "self"], [70, 4.86, "coach"], [15, 4.78, "event"]]],
  ["Vertical jump", "in", "Football", [[120, 26, "coach"], [30, 28, "coach"]]],
  ["Bench press (1RM)", "lb", "Football", [[110, 165, "coach"], [25, 185, "coach"]]],
];

function daysAgo(today: Date, days: number): Date {
  return new Date(today.getTime() - days * MS_PER_DAY);
}

/** Jordan's numbers, oldest first, dated back from today in the family's time zone. */
export function demoEntries(today: Date): StatEntry[] {
  return HISTORY.flatMap(([metric, unit, sport, points]) =>
    points.map(([ago, value, howMeasured]) => {
      const measured = daysAgo(today, ago);
      return {
        id: `demo-${metric}-${ago}`,
        sport,
        metric,
        value,
        unit,
        measuredOn: calendarDay(measured, DEMO_TIME_ZONE),
        howMeasured,
        createdAt: measured.toISOString(),
      };
    }),
  ).sort((a, b) => a.measuredOn.localeCompare(b.measuredOn));
}

/** The plan questions, answered: no pain, a year of coached training, off-season, 2 team practices or games. */
export const DEMO_SCREENS: ScreenAnswers = {
  painNow: false,
  throwingArmPain: false,
  hasTrainingAge: true,
  seasonPhase: "off_season",
  teamSessionsPerWeek: 2,
};

/** Answered 10 days ago, so the plan is in week 2 of its first block. */
export function demoAnsweredAt(today: Date): Date {
  return daysAgo(today, 10);
}

/** The subscription renews 18 days from today. */
export function demoRenewsOn(today: Date): Date {
  return daysAgo(today, -18);
}
