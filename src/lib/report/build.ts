import { compare, type Comparison } from "@/lib/benchmarks/compare";
import { LEVEL_RANK } from "@/lib/benchmarks/levels";
import { findSets, listMetrics, type BenchmarkSet } from "@/lib/benchmarks/sets";
import type { Gender, Sport, Unit } from "@/lib/benchmarks/types";

/**
 * Builds an athlete's gap report from their stat entries. Pure functions: no database,
 * no React. Every comparison goes through the benchmark engine; nothing is estimated here.
 */

export const HOW_MEASURED = ["self", "coach", "event"] as const;
export type HowMeasured = (typeof HOW_MEASURED)[number];

export type StatEntry = {
  id: string;
  sport: string;
  metric: string;
  value: number;
  unit: string;
  /** YYYY-MM-DD */
  measuredOn: string;
  howMeasured: HowMeasured;
  createdAt: string;
};

export type ProfileNumbers = { heightIn: number | null; weightLb: number | null };

/** Where the number a ruler shows came from. */
export type ValueSource = { kind: "entry"; entry: StatEntry } | { kind: "profile" };

export type HistoryRow = {
  entry: StatEntry;
  /** The level this entry reached on the main ruler, if any. */
  levelLabel: string | null;
  /** Change from the entry before, in the metric's unit. Positive means better. Null for the first. */
  improvement: number | null;
};

export type MetricReport = {
  metric: string;
  unit: Unit;
  sets: BenchmarkSet[];
  /** The number being shown, or null when nothing has been entered yet. */
  value: number | null;
  valueSource: ValueSource | null;
  /** One per ruler (per guide), most trustworthy first. Empty when there is no number. */
  comparisons: Comparison[];
  /** Oldest first. Only filled when there is more than one entry. */
  history: HistoryRow[];
};

export type SportReport = {
  sport: Sport;
  positionOrEvent: string;
  metrics: MetricReport[];
};

/** Profile height and weight stand in for a Height or Weight entry until one is entered. */
const PROFILE_METRICS: Record<string, keyof ProfileNumbers> = { Height: "heightIn", Weight: "weightLb" };

/** Newest measurement last. Ties on the same day keep the order they were entered. */
function byMeasuredDate(a: StatEntry, b: StatEntry): number {
  return a.measuredOn.localeCompare(b.measuredOn) || a.createdAt.localeCompare(b.createdAt);
}

function improvementBetween(before: StatEntry, after: StatEntry, set: BenchmarkSet | undefined): number | null {
  if (!set || set.better === "range") return null;
  const change = after.value - before.value;
  const rounded = Math.round(change * 1000) / 1000;
  return set.better === "lower" ? -rounded : rounded;
}

function levelFor(sets: readonly BenchmarkSet[], query: Parameters<typeof compare>[1]): string | null {
  const outcome = compare(sets, query);
  if (outcome.status !== "ok") return null;
  return outcome.comparisons[0]?.reachedLevel?.label ?? null;
}

function buildMetric(
  sets: readonly BenchmarkSet[],
  query: { sport: string; positionOrEvent: string; gender: string },
  option: { metric: string; unit: Unit },
  entries: readonly StatEntry[],
  profile: ProfileNumbers,
): MetricReport {
  const metricSets = findSets(sets, { ...query, metric: option.metric });
  const mine = entries.filter((entry) => entry.metric === option.metric && entry.unit === option.unit).sort(byMeasuredDate);
  const latest = mine[mine.length - 1];

  const profileKey = PROFILE_METRICS[option.metric];
  const profileValue = profileKey ? profile[profileKey] : null;

  const value = latest?.value ?? profileValue ?? null;
  const valueSource: ValueSource | null = latest ? { kind: "entry", entry: latest } : profileValue !== null ? { kind: "profile" } : null;

  const outcome = value === null ? null : compare(sets, { ...query, metric: option.metric, value, unit: option.unit });

  const history: HistoryRow[] =
    mine.length > 1
      ? mine.map((entry, index) => ({
          entry,
          levelLabel: levelFor(sets, { ...query, metric: option.metric, value: entry.value, unit: entry.unit }),
          improvement: index === 0 ? null : improvementBetween(mine[index - 1] as StatEntry, entry, metricSets[0]),
        }))
      : [];

  return {
    metric: option.metric,
    unit: option.unit,
    sets: metricSets,
    value,
    valueSource,
    comparisons: outcome?.status === "ok" ? outcome.comparisons : [],
    history,
  };
}

/** One sport's report: a ruler per metric that has benchmarks for the athlete's position and gender. */
export function buildSportReport(
  sets: readonly BenchmarkSet[],
  athleteSport: { sport: Sport; positionOrEvent: string },
  gender: Gender,
  entries: readonly StatEntry[],
  profile: ProfileNumbers,
): SportReport {
  const query = { sport: athleteSport.sport, positionOrEvent: athleteSport.positionOrEvent, gender };
  const sportEntries = entries.filter((entry) => entry.sport === athleteSport.sport);
  return {
    ...athleteSport,
    metrics: listMetrics(sets, query).map((option) => buildMetric(sets, query, option, sportEntries, profile)),
  };
}

export type Standout = {
  sport: Sport;
  positionOrEvent: string;
  metric: string;
  comparison: Comparison;
};

/** How far along one comparison is: the level reached first, then how close the next level is. */
function progressScore(comparison: Comparison): [number, number] {
  const rank = comparison.reachedLevel ? LEVEL_RANK[comparison.reachedLevel.levelCode] : 0;
  const nextEntry = comparison.nextStep?.entry ?? comparison.nextLevel?.entry;
  const relativeGap = comparison.gap !== null && nextEntry ? comparison.gap / nextEntry : 0;
  return [rank, -relativeGap];
}

function isAhead(a: Comparison, b: Comparison): boolean {
  const [rankA, closeA] = progressScore(a);
  const [rankB, closeB] = progressScore(b);
  return rankA !== rankB ? rankA > rankB : closeA > closeB;
}

/** The furthest-along number in one sport. Height and weight ranges are left out: they describe size, not level. */
export function standoutFor(report: SportReport): Standout | null {
  let best: Standout | null = null;
  for (const metric of report.metrics) {
    const comparison = metric.comparisons[0];
    if (!comparison || comparison.kind === "range") continue;
    if (!best || isAhead(comparison, best.comparison)) {
      best = { sport: report.sport, positionOrEvent: report.positionOrEvent, metric: metric.metric, comparison };
    }
  }
  return best;
}

/**
 * For an athlete with numbers in two or more sports: which sport's number reaches the
 * highest level, with ties broken by how close the next level is. Null otherwise.
 */
export function closestSport(reports: readonly SportReport[]): { leader: Standout; others: Standout[] } | null {
  const standouts = reports.map(standoutFor).filter((standout): standout is Standout => standout !== null);
  if (standouts.length < 2) return null;
  const sorted = [...standouts].sort((a, b) => (isAhead(a.comparison, b.comparison) ? -1 : isAhead(b.comparison, a.comparison) ? 1 : 0));
  const [leader, ...others] = sorted;
  return leader ? { leader, others } : null;
}
