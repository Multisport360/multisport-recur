import { confidenceRank, LEVEL_COVERAGE, LEVEL_RANK, lowestConfidence, shortLevelLabel } from "./levels.ts";
import type { BenchmarkRow, Better, Confidence, Gender, LevelCode, Source, Sport, Unit } from "./types.ts";

/** One college level's numbers for one metric. */
export type LevelMark = {
  level: string;
  levelCode: LevelCode;
  /** Short name for the ruler: "D2", "D1 mid-major". */
  label: string;
  /** Usual order of levels, bigger = higher level. Not a benchmark. */
  rank: number;
  entry: number;
  mid: number | null;
  elite: number | null;
  confidence: Confidence;
  notes: string;
  /** Where this level's numbers come from. Shown as a link wherever the numbers are shown. */
  source: Source;
};

/**
 * One mark on the ruler: an entry number and the level(s) that start there.
 * Two levels share a step when the source gives them the same entry number.
 */
export type Step = {
  entry: number;
  /** Highest level first. */
  levels: LevelMark[];
};

/**
 * One ruler: the levels for one metric and position.
 * Usually one source. Several sources share a ruler only when each covers different levels.
 */
export type BenchmarkSet = {
  id: string;
  sport: Sport;
  positionOrEvent: string;
  gender: Gender;
  metric: string;
  unit: Unit;
  better: Better;
  /** Every source behind this ruler, in the order the data lists them. */
  sources: Source[];
  /** Highest level first. */
  levels: LevelMark[];
  /** higher/lower metrics only: entry marks from easiest to hardest. Empty for range metrics. */
  steps: Step[];
  /** The weakest confidence of any row in the set. */
  confidence: Confidence;
};

export type BenchmarkQuery = {
  sport: string;
  positionOrEvent: string;
  gender: string;
  metric: string;
};

function metricKey(row: BenchmarkRow): string {
  return [row.sport, row.positionOrEvent, row.gender, row.metric].join("|");
}

function groupBy<T>(items: readonly T[], keyOf: (item: T) => string): Map<string, T[]> {
  const groups = new Map<string, T[]>();
  for (const item of items) {
    const key = keyOf(item);
    groups.set(key, [...(groups.get(key) ?? []), item]);
  }
  return groups;
}

function coverageOf(rows: readonly BenchmarkRow[]): Set<string> {
  return new Set(rows.flatMap((row) => LEVEL_COVERAGE[row.levelCode]));
}

function overlaps(a: ReadonlySet<string>, b: ReadonlySet<string>): boolean {
  return [...a].some((level) => b.has(level));
}

/**
 * Split one metric's rows into rulers. Rows from one source always stay together.
 * A source joins an earlier ruler only if it covers none of the levels already on it.
 */
function splitIntoRulers(rows: readonly BenchmarkRow[]): BenchmarkRow[][] {
  const bySource = [...groupBy(rows, (row) => row.source.id).values()];
  return bySource.reduce<BenchmarkRow[][]>((rulers, sourceRows) => {
    const coverage = coverageOf(sourceRows);
    const fit = rulers.findIndex((ruler) => !overlaps(coverageOf(ruler), coverage));
    if (fit === -1) return [...rulers, sourceRows];
    return rulers.map((ruler, index) => (index === fit ? [...ruler, ...sourceRows] : ruler));
  }, []);
}

function toLevelMark(row: BenchmarkRow): LevelMark {
  return {
    level: row.level,
    levelCode: row.levelCode,
    label: shortLevelLabel(row.level),
    rank: LEVEL_RANK[row.levelCode],
    entry: row.entry,
    mid: row.mid,
    elite: row.elite,
    confidence: row.confidence,
    notes: row.notes,
    source: row.source,
  };
}

function uniqueSources(rows: readonly BenchmarkRow[]): Source[] {
  const byId = new Map(rows.map((row) => [row.source.id, row.source] as const));
  return [...byId.values()];
}

/** Entry marks from easiest to hardest, with tied levels sharing a step. */
function buildSteps(levels: readonly LevelMark[], better: Better): Step[] {
  if (better === "range") return [];
  const byEntry = new Map<number, LevelMark[]>();
  for (const level of levels) {
    byEntry.set(level.entry, [...(byEntry.get(level.entry) ?? []), level]);
  }
  return [...byEntry.entries()]
    .sort(([a], [b]) => (better === "higher" ? a - b : b - a))
    .map(([entry, tied]) => ({ entry, levels: [...tied].sort((a, b) => b.rank - a.rank) }));
}

/** Group benchmark rows into rulers. */
export function buildSets(rows: readonly BenchmarkRow[]): BenchmarkSet[] {
  const rulers = [...groupBy(rows, metricKey).values()].flatMap(splitIntoRulers);

  return rulers.map((groupRows) => {
    const first = groupRows[0] as BenchmarkRow;
    const levels = groupRows.map(toLevelMark).sort((a, b) => b.rank - a.rank);
    const sources = uniqueSources(groupRows);
    return {
      id: [metricKey(first), sources.map((source) => source.id).join("+")].join("|"),
      sport: first.sport,
      positionOrEvent: first.positionOrEvent,
      gender: first.gender,
      metric: first.metric,
      unit: first.unit,
      better: first.better,
      sources,
      levels,
      steps: buildSteps(levels, first.better),
      confidence: lowestConfidence(levels.map((level) => level.confidence)),
    };
  });
}

/**
 * The rulers for one metric, most trustworthy source first.
 * More than one comes back when two sources cover the same metric.
 */
export function findSets(sets: readonly BenchmarkSet[], query: BenchmarkQuery): BenchmarkSet[] {
  return sets
    .filter(
      (set) =>
        set.sport === query.sport &&
        set.positionOrEvent === query.positionOrEvent &&
        set.gender === query.gender &&
        set.metric === query.metric,
    )
    .sort(
      (a, b) =>
        confidenceRank(b.confidence) - confidenceRank(a.confidence) ||
        b.levels.length - a.levels.length ||
        a.id.localeCompare(b.id),
    );
}

/** A metric that can be entered for a sport + position + gender. */
export type MetricOption = {
  metric: string;
  unit: Unit;
  better: Better;
};

export type PositionOption = {
  positionOrEvent: string;
  genders: Gender[];
};

function unique<T>(values: readonly T[]): T[] {
  return [...new Set(values)];
}

/** Sports that have benchmarks, in the order the data lists them. */
export function listSports(sets: readonly BenchmarkSet[]): Sport[] {
  return unique(sets.map((set) => set.sport));
}

/** Positions or events for a sport, with the genders each has benchmarks for. */
export function listPositions(sets: readonly BenchmarkSet[], sport: string): PositionOption[] {
  const inSport = sets.filter((set) => set.sport === sport);
  return unique(inSport.map((set) => set.positionOrEvent)).map((positionOrEvent) => ({
    positionOrEvent,
    genders: unique(
      inSport.filter((set) => set.positionOrEvent === positionOrEvent).map((set) => set.gender),
    ),
  }));
}

/** Genders that have any benchmark for a sport. */
export function listGenders(sets: readonly BenchmarkSet[], sport: string): Gender[] {
  return unique(sets.filter((set) => set.sport === sport).map((set) => set.gender));
}

/** Metrics that have benchmarks for a sport + position + gender. */
export function listMetrics(
  sets: readonly BenchmarkSet[],
  query: Omit<BenchmarkQuery, "metric">,
): MetricOption[] {
  const matching = sets.filter(
    (set) =>
      set.sport === query.sport &&
      set.positionOrEvent === query.positionOrEvent &&
      set.gender === query.gender,
  );
  return unique(matching.map((set) => set.metric)).map((metric) => {
    const set = matching.find((candidate) => candidate.metric === metric) as BenchmarkSet;
    return { metric, unit: set.unit, better: set.better };
  });
}

/** "NCSA-BB", or "RC-D1+RC-D2" when several sources share the ruler. */
export function sourceIds(set: BenchmarkSet): string {
  return set.sources.map((source) => source.id).join("+");
}

/** "D2" or, when levels share an entry number, "D2 and D3/NAIA". */
export function stepLabel(step: Step): string {
  return step.levels.map((level) => level.label).join(" and ");
}
