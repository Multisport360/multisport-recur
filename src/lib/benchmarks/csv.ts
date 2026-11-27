import Papa from "papaparse";
import { z } from "zod";
import type { BenchmarkRow, Source } from "./types.ts";
import { BETTER, CONFIDENCE_ORDER, GENDERS, LEVEL_CODES, SPORTS, UNITS } from "./types.ts";

/**
 * Reads data/benchmarks.csv and checks every row.
 * A bad row is never skipped: the whole import fails and lists every problem with its line number.
 */

export const CSV_COLUMNS = [
  "sport",
  "position_or_event",
  "gender",
  "metric",
  "unit",
  "better",
  "level",
  "level_code",
  "entry",
  "mid",
  "elite",
  "source_id",
  "confidence",
  "notes",
  "source_name",
  "source_url",
] as const;

const NUMBER_PATTERN = /^\d+(\.\d+)?$/;

const requiredText = z.string().trim().min(1, "is empty");
const requiredNumber = z
  .string()
  .trim()
  .regex(NUMBER_PATTERN, "must be a positive number")
  .transform(Number);
const optionalNumber = z
  .string()
  .trim()
  .refine((raw) => raw === "" || NUMBER_PATTERN.test(raw), "must be a positive number or blank")
  .transform((raw) => (raw === "" ? null : Number(raw)));

export const csvRowSchema = z
  .strictObject({
    sport: z.enum(SPORTS),
    position_or_event: requiredText,
    gender: z.enum(GENDERS),
    metric: requiredText,
    unit: z.enum(UNITS),
    better: z.enum(BETTER),
    level: requiredText,
    level_code: z.enum(LEVEL_CODES),
    entry: requiredNumber,
    mid: optionalNumber,
    elite: optionalNumber,
    source_id: requiredText,
    confidence: z.enum(CONFIDENCE_ORDER),
    notes: z.string().trim(),
    source_name: requiredText,
    source_url: z.url({ protocol: /^https?$/ }),
  })
  .superRefine((row, ctx) => {
    const problem = orderingProblem(row.better, row.entry, row.mid, row.elite);
    if (problem) {
      ctx.addIssue({ code: "custom", message: problem, path: ["entry"] });
    }
  });

type CsvRow = z.infer<typeof csvRowSchema>;

/** entry / mid / elite must run in the direction that `better` says. */
function orderingProblem(
  better: CsvRow["better"],
  entry: number,
  mid: number | null,
  elite: number | null,
): string | null {
  if (better === "range") {
    if (elite === null) return "a range row needs elite (the top of the range)";
    if (mid !== null) return "a range row must leave mid blank";
    if (elite < entry) return `range runs backwards: entry ${entry} is above elite ${elite}`;
    return null;
  }
  const marks = [entry, mid, elite].filter((mark): mark is number => mark !== null);
  for (let i = 1; i < marks.length; i += 1) {
    const previous = marks[i - 1] as number;
    const current = marks[i] as number;
    const isBackwards = better === "higher" ? current < previous : current > previous;
    if (isBackwards) {
      return `entry, mid, elite must get ${better === "higher" ? "bigger" : "smaller"} in that order (got ${marks.join(", ")})`;
    }
  }
  return null;
}

export class BenchmarkCsvError extends Error {
  readonly problems: readonly string[];

  constructor(problems: readonly string[]) {
    super(`benchmarks.csv has ${problems.length} problem${problems.length === 1 ? "" : "s"}:\n${problems.join("\n")}`);
    this.name = "BenchmarkCsvError";
    this.problems = problems;
  }
}

export type ParsedBenchmarks = {
  rows: BenchmarkRow[];
  sources: Source[];
};

function toBenchmarkRow(row: CsvRow): BenchmarkRow {
  return {
    sport: row.sport,
    positionOrEvent: row.position_or_event,
    gender: row.gender,
    metric: row.metric,
    unit: row.unit,
    better: row.better,
    level: row.level,
    levelCode: row.level_code,
    entry: row.entry,
    mid: row.mid,
    elite: row.elite,
    confidence: row.confidence,
    notes: row.notes,
    source: { id: row.source_id, name: row.source_name, url: row.source_url },
  };
}

/** Rows for one metric: same sport, position, gender and metric. */
function metricKey(row: BenchmarkRow): string {
  return [row.sport, row.positionOrEvent, row.gender, row.metric].join("|");
}

/** Problems that only show up when rows are compared with each other. */
function crossRowProblems(rows: readonly { line: number; row: BenchmarkRow }[]): string[] {
  const problems: string[] = [];
  const seenLevels = new Map<string, number>();
  const setShape = new Map<string, { line: number; unit: string; better: string }>();
  const sourceDetails = new Map<string, { line: number; name: string; url: string }>();

  for (const { line, row } of rows) {
    const setKey = metricKey(row);

    const levelKey = `${setKey}|${row.source.id}|${row.levelCode}`;
    const firstLine = seenLevels.get(levelKey);
    if (firstLine !== undefined) {
      problems.push(`line ${line}: duplicate of line ${firstLine} (same sport, position, gender, metric, level and source)`);
    } else {
      seenLevels.set(levelKey, line);
    }

    const shape = setShape.get(setKey);
    if (!shape) {
      setShape.set(setKey, { line, unit: row.unit, better: row.better });
    } else if (shape.unit !== row.unit || shape.better !== row.better) {
      problems.push(
        `line ${line}: unit/better (${row.unit}, ${row.better}) does not match line ${shape.line} (${shape.unit}, ${shape.better}) for the same metric`,
      );
    }

    const source = sourceDetails.get(row.source.id);
    if (!source) {
      sourceDetails.set(row.source.id, { line, name: row.source.name, url: row.source.url });
    } else if (source.name !== row.source.name || source.url !== row.source.url) {
      problems.push(`line ${line}: source ${row.source.id} has a different name or URL than on line ${source.line}`);
    }
  }
  return problems;
}

/**
 * Parse and validate the whole file.
 * @throws BenchmarkCsvError listing every problem, if there is even one.
 */
export function parseBenchmarkCsv(csvText: string): ParsedBenchmarks {
  const parsed = Papa.parse<Record<string, string>>(csvText, { header: true, skipEmptyLines: "greedy" });
  const problems: string[] = parsed.errors.map(
    (error) => `line ${(error.row ?? 0) + 2}: ${error.message}`,
  );

  const header = parsed.meta.fields ?? [];
  const missing = CSV_COLUMNS.filter((column) => !header.includes(column));
  const unexpected = header.filter((column) => !(CSV_COLUMNS as readonly string[]).includes(column));
  if (missing.length > 0) problems.push(`header: missing column(s) ${missing.join(", ")}`);
  if (unexpected.length > 0) problems.push(`header: unexpected column(s) ${unexpected.join(", ")}`);
  if (problems.length > 0) throw new BenchmarkCsvError(problems);

  if (parsed.data.length === 0) {
    throw new BenchmarkCsvError(["the file has a header but no rows"]);
  }

  const valid: { line: number; row: BenchmarkRow }[] = [];
  parsed.data.forEach((raw, index) => {
    const line = index + 2; // line 1 is the header
    const result = csvRowSchema.safeParse(raw);
    if (result.success) {
      valid.push({ line, row: toBenchmarkRow(result.data) });
      return;
    }
    for (const issue of result.error.issues) {
      const column = issue.path.join(".") || "row";
      problems.push(`line ${line}: ${column} ${issue.message}`);
    }
  });

  problems.push(...crossRowProblems(valid));
  if (problems.length > 0) throw new BenchmarkCsvError(problems);

  const sources = new Map<string, Source>();
  for (const { row } of valid) sources.set(row.source.id, row.source);

  return { rows: valid.map(({ row }) => row), sources: [...sources.values()] };
}
