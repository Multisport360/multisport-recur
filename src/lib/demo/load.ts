import { readFileSync } from "node:fs";
import path from "node:path";
import draftTemplates from "../../../data/plan_templates.draft.json";
import { parseBenchmarkCsv } from "@/lib/benchmarks/csv";
import { buildSets } from "@/lib/benchmarks/sets";
import { parseTemplateLibrary } from "@/lib/plan/library-schema";
import type { DemoData } from "./model";
import { DEMO_ATHLETE, DEMO_SPORTS } from "./sample";

/**
 * The demo's data, read on the server without a database (demo exception in CLAUDE.md):
 *   - benchmarks from data/benchmarks.csv, the file the benchmarks table is seeded from, checked by the
 *     same parser as `npm run db:seed`;
 *   - plan templates from data/plan_templates.draft.json, checked by the same schema as `npm run plans:seed`.
 * Only the rulers for Jordan's sports and gender are sent to the browser.
 */

const BENCHMARKS_CSV = path.join(process.cwd(), "data", "benchmarks.csv");

export function loadDemoData(): DemoData {
  const { rows } = parseBenchmarkCsv(readFileSync(BENCHMARKS_CSV, "utf8"));
  const wanted = (row: (typeof rows)[number]) =>
    row.gender === DEMO_ATHLETE.gender && DEMO_SPORTS.some((sport) => sport.sport === row.sport && sport.positionOrEvent === row.positionOrEvent);
  return { sets: buildSets(rows.filter(wanted)), library: parseTemplateLibrary(draftTemplates) };
}
