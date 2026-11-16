/**
 * Loads data/benchmarks.csv into the benchmarks and sources tables.
 *
 *   npm run db:check   validate the file and list rows that look wrong (no database needed)
 *   npm run db:seed    validate, then make the tables match the file exactly
 *
 * Every row is checked first. If even one row is bad, nothing is written and the
 * script exits with an error that lists every problem.
 */
import { readFileSync } from "node:fs";
import path from "node:path";
import { createClient } from "@supabase/supabase-js";
import { findAnomalies, findSingleLevelSets } from "../src/lib/benchmarks/anomalies.ts";
import { BenchmarkCsvError, parseBenchmarkCsv, type ParsedBenchmarks } from "../src/lib/benchmarks/csv.ts";
import { buildSets } from "../src/lib/benchmarks/sets.ts";
import type { BenchmarkRow } from "../src/lib/benchmarks/types.ts";

const CSV_PATH = path.resolve(import.meta.dirname, "../data/benchmarks.csv");
const CHECK_ONLY = process.argv.includes("--check");
const UPSERT_CHUNK = 200;
const PAGE_SIZE = 1000;
const CONFLICT_COLUMNS = "sport,position_or_event,gender,metric,level_code,source_id";

function fail(message: string): never {
  console.error(`\nSeed failed: ${message}`);
  process.exit(1);
}

function readCsv(): ParsedBenchmarks {
  try {
    return parseBenchmarkCsv(readFileSync(CSV_PATH, "utf8"));
  } catch (error) {
    if (error instanceof BenchmarkCsvError) fail(error.message);
    throw error;
  }
}

function toDbRow(row: BenchmarkRow) {
  return {
    sport: row.sport,
    position_or_event: row.positionOrEvent,
    gender: row.gender,
    metric: row.metric,
    unit: row.unit,
    better: row.better,
    level: row.level,
    level_code: row.levelCode,
    entry: row.entry,
    mid: row.mid,
    elite: row.elite,
    confidence: row.confidence,
    notes: row.notes,
    source_id: row.source.id,
  };
}

function dbKey(row: { sport: string; position_or_event: string; gender: string; metric: string; level_code: string; source_id: string }): string {
  return [row.sport, row.position_or_event, row.gender, row.metric, row.level_code, row.source_id].join("|");
}

function report(parsed: ParsedBenchmarks): void {
  const sets = buildSets(parsed.rows);
  console.log(`benchmarks.csv: ${parsed.rows.length} rows, ${parsed.sources.length} sources, ${sets.length} rulers. Every row passed validation.`);

  const anomalies = findAnomalies(sets);
  console.log(`\nRows that look wrong (${anomalies.length}). Nothing is changed; check these against the source:`);
  for (const line of anomalies) console.log(`  - ${line}`);

  const singles = findSingleLevelSets(sets);
  console.log(`\nMetrics with only one level, so there is no next level to show (${singles.length}):`);
  for (const line of singles) console.log(`  - ${line}`);
}

async function seed(parsed: ParsedBenchmarks): Promise<void> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceKey) {
    fail("NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set in .env.local.");
  }
  const supabase = createClient(url, serviceKey, { auth: { persistSession: false } });

  const sources = await supabase.from("sources").upsert(parsed.sources, { onConflict: "id" });
  if (sources.error) fail(`could not write sources: ${sources.error.message}`);

  const dbRows = parsed.rows.map(toDbRow);
  for (let start = 0; start < dbRows.length; start += UPSERT_CHUNK) {
    const chunk = dbRows.slice(start, start + UPSERT_CHUNK);
    const result = await supabase.from("benchmarks").upsert(chunk, { onConflict: CONFLICT_COLUMNS });
    if (result.error) fail(`could not write benchmark rows ${start + 1}-${start + chunk.length}: ${result.error.message}`);
  }

  // Remove anything in the table that is no longer in the file, so the table mirrors the file.
  const wanted = new Set(dbRows.map(dbKey));
  const stale: number[] = [];
  let total = 0;
  for (let from = 0; ; from += PAGE_SIZE) {
    const page = await supabase
      .from("benchmarks")
      .select("id, sport, position_or_event, gender, metric, level_code, source_id")
      .order("id")
      .range(from, from + PAGE_SIZE - 1);
    if (page.error) fail(`could not read benchmarks back: ${page.error.message}`);
    total += page.data.length;
    for (const existing of page.data) {
      if (!wanted.has(dbKey(existing))) stale.push(existing.id);
    }
    if (page.data.length < PAGE_SIZE) break;
  }
  if (stale.length > 0) {
    const removed = await supabase.from("benchmarks").delete().in("id", stale);
    if (removed.error) fail(`could not remove ${stale.length} old rows: ${removed.error.message}`);
  }

  const finalCount = total - stale.length;
  if (finalCount !== dbRows.length) {
    fail(`the table has ${finalCount} rows but the file has ${dbRows.length}.`);
  }

  const usedSources = new Set(parsed.sources.map((source) => source.id));
  const allSources = await supabase.from("sources").select("id");
  if (allSources.error) fail(`could not read sources back: ${allSources.error.message}`);
  const staleSources = allSources.data.map((source) => source.id).filter((id) => !usedSources.has(id));
  if (staleSources.length > 0) {
    const removed = await supabase.from("sources").delete().in("id", staleSources);
    if (removed.error) fail(`could not remove old sources: ${removed.error.message}`);
  }

  console.log(`\nSeeded ${finalCount} benchmark rows and ${parsed.sources.length} sources. Removed ${stale.length} old rows.`);
}

const parsed = readCsv();
report(parsed);
if (!CHECK_ONLY) {
  await seed(parsed);
}
