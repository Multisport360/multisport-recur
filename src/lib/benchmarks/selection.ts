import { listGenders, listMetrics, listPositions, listSports, type BenchmarkSet, type MetricOption } from "./sets.ts";
import type { Gender, Sport } from "./types.ts";

/**
 * Keeps the sport / gender / position / metric pickers in step with each other.
 * Whatever is asked for, the result is always a combination that has benchmarks.
 */

export type Selection = {
  sport: Sport;
  gender: Gender;
  positionOrEvent: string;
  metric: string;
};

export type SelectionOptions = {
  sports: Sport[];
  genders: Gender[];
  positions: string[];
  metrics: MetricOption[];
};

function keepOrFirst<T>(wanted: T | undefined, options: readonly T[]): T | undefined {
  return wanted !== undefined && options.includes(wanted) ? wanted : options[0];
}

function positionsFor(sets: readonly BenchmarkSet[], sport: Sport, gender: Gender): string[] {
  return listPositions(sets, sport)
    .filter((position) => position.genders.includes(gender))
    .map((position) => position.positionOrEvent);
}

/** The choices each picker should offer for the current selection. */
export function optionsFor(sets: readonly BenchmarkSet[], selection: Selection): SelectionOptions {
  return {
    sports: listSports(sets),
    genders: listGenders(sets, selection.sport),
    positions: positionsFor(sets, selection.sport, selection.gender),
    metrics: listMetrics(sets, selection),
  };
}

/**
 * Turn a wished-for selection into a valid one. Each wish is kept when it has benchmarks;
 * otherwise the first available choice is used. Returns null only when there are no benchmarks at all.
 */
export function resolveSelection(sets: readonly BenchmarkSet[], wanted: Partial<Selection>): Selection | null {
  const sport = keepOrFirst(wanted.sport, listSports(sets));
  if (!sport) return null;

  const gender = keepOrFirst(wanted.gender, listGenders(sets, sport));
  if (!gender) return null;

  const positionOrEvent = keepOrFirst(wanted.positionOrEvent, positionsFor(sets, sport, gender));
  if (!positionOrEvent) return null;

  const metrics = listMetrics(sets, { sport, gender, positionOrEvent }).map((option) => option.metric);
  const metric = keepOrFirst(wanted.metric, metrics);
  if (!metric) return null;

  return { sport, gender, positionOrEvent, metric };
}

export function isSameSelection(a: Selection, b: Selection): boolean {
  return a.sport === b.sport && a.gender === b.gender && a.positionOrEvent === b.positionOrEvent && a.metric === b.metric;
}
