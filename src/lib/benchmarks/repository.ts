import { unstable_cache } from "next/cache";
import { z } from "zod";
import { createPublicSupabase } from "@/lib/supabase/public";
import { buildSets, type BenchmarkSet } from "./sets";
import { BETTER, CONFIDENCE_ORDER, GENDERS, LEVEL_CODES, SPORTS, UNITS, type BenchmarkRow, type Source } from "./types";

/**
 * Reads benchmarks from the benchmarks table. This is the only place the app gets
 * benchmark numbers from. Rows are checked again on the way out of the database.
 */

const PAGE_SIZE = 1000;
/** How long a loaded copy of the benchmarks is reused before asking the database again. */
const CACHE_SECONDS = 300;
export const BENCHMARKS_CACHE_TAG = "benchmarks";

const numeric = z.union([z.number(), z.string().regex(/^\d+(\.\d+)?$/).transform(Number)]);

const dbRowSchema = z.object({
  sport: z.enum(SPORTS),
  position_or_event: z.string().min(1),
  gender: z.enum(GENDERS),
  metric: z.string().min(1),
  unit: z.enum(UNITS),
  better: z.enum(BETTER),
  level: z.string().min(1),
  level_code: z.enum(LEVEL_CODES),
  entry: numeric,
  mid: numeric.nullable(),
  elite: numeric.nullable(),
  confidence: z.enum(CONFIDENCE_ORDER),
  notes: z.string(),
  source_id: z.string().min(1),
});

const sourceSchema = z.object({ id: z.string().min(1), name: z.string().min(1), url: z.url() });

export type BenchmarkLoad =
  | { status: "ok"; sets: BenchmarkSet[] }
  /** The table could not be read or is empty. `detail` is for logs, not for visitors. */
  | { status: "unavailable"; detail: string };

async function fetchRows(): Promise<BenchmarkRow[]> {
  const supabase = createPublicSupabase();

  const sourcesResult = await supabase.from("sources").select("id, name, url");
  if (sourcesResult.error) throw new Error(`sources: ${sourcesResult.error.message}`);
  const sources = new Map<string, Source>(
    z.array(sourceSchema).parse(sourcesResult.data).map((source) => [source.id, source]),
  );

  const rows: BenchmarkRow[] = [];
  for (let from = 0; ; from += PAGE_SIZE) {
    const page = await supabase
      .from("benchmarks")
      .select("*")
      .order("id")
      .range(from, from + PAGE_SIZE - 1);
    if (page.error) throw new Error(`benchmarks: ${page.error.message}`);

    for (const raw of z.array(dbRowSchema).parse(page.data)) {
      const source = sources.get(raw.source_id);
      if (!source) throw new Error(`benchmarks: row points at unknown source ${raw.source_id}`);
      rows.push({
        sport: raw.sport,
        positionOrEvent: raw.position_or_event,
        gender: raw.gender,
        metric: raw.metric,
        unit: raw.unit,
        better: raw.better,
        level: raw.level,
        levelCode: raw.level_code,
        entry: raw.entry,
        mid: raw.mid,
        elite: raw.elite,
        confidence: raw.confidence,
        notes: raw.notes,
        source,
      });
    }
    if (page.data.length < PAGE_SIZE) break;
  }

  // An empty table is a set-up problem, not a result worth caching.
  if (rows.length === 0) throw new Error("benchmarks: the table is empty. Run `npm run db:seed`.");
  return rows;
}

// Only successful loads are cached: a failure throws, and thrown results are not stored.
const fetchRowsCached = unstable_cache(fetchRows, ["benchmark-rows"], {
  revalidate: CACHE_SECONDS,
  tags: [BENCHMARKS_CACHE_TAG],
});

/** Every ruler in the benchmarks table, or a clear "unavailable" result. Never throws. */
export async function loadBenchmarkSets(): Promise<BenchmarkLoad> {
  try {
    return { status: "ok", sets: buildSets(await fetchRowsCached()) };
  } catch (error) {
    const detail = error instanceof Error ? error.message : String(error);
    console.error(`[benchmarks] could not load: ${detail}`);
    return { status: "unavailable", detail };
  }
}
