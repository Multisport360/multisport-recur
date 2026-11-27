/**
 * Loads a plan template library (data/plan_templates.draft.json by default) into plan_templates.
 *
 *   npm run plans:check                 check the file only (no database needed)
 *   npm run plans:seed                  check, then save it (one row per version)
 *   npm run plans:seed -- path/to.json  a different file
 *
 * Every field is checked with zod first (src/lib/plan/library-schema.ts). If anything is wrong,
 * the script lists every problem, writes nothing and exits with an error.
 *
 * Re-running with the same version updates that row. It never changes a row's review status
 * to "approved" on its own: approval comes from the file (review_status, reviewed_by, reviewed_on)
 * or from the coach's sign-off on the row (see the migration for the one-line update).
 */
import { readFileSync } from "node:fs";
import path from "node:path";
import { createClient } from "@supabase/supabase-js";
import { parseTemplateLibrary, TemplateLibraryError, type TemplateLibrary } from "../src/lib/plan/library-schema.ts";

const DEFAULT_PATH = path.resolve(import.meta.dirname, "../data/plan_templates.draft.json");
const args = process.argv.slice(2);
const CHECK_ONLY = args.includes("--check");
const filePath = path.resolve(args.find((arg) => !arg.startsWith("--")) ?? DEFAULT_PATH);

function fail(message: string): never {
  console.error(`\nPlan template seed failed: ${message}`);
  process.exit(1);
}

function readLibrary(): TemplateLibrary {
  let json: unknown;
  try {
    json = JSON.parse(readFileSync(filePath, "utf8"));
  } catch (error) {
    fail(`could not read ${filePath} as JSON: ${error instanceof Error ? error.message : String(error)}`);
  }
  try {
    return parseTemplateLibrary(json);
  } catch (error) {
    if (error instanceof TemplateLibraryError) fail(`${path.basename(filePath)}\n${error.message}`);
    throw error;
  }
}

async function save(library: TemplateLibrary): Promise<void> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceKey) fail("NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set in .env.local.");
  const supabase = createClient(url, serviceKey, { auth: { persistSession: false } });

  const existing = await supabase.from("plan_templates").select("review_status").eq("version", library.version).maybeSingle();
  if (existing.error) fail(`could not read plan_templates: ${existing.error.message}`);
  if (existing.data?.review_status === "approved" && library.review_status !== "approved") {
    fail(`version ${library.version} is approved in the database, and this file says ${library.review_status}. Give the file a new version instead of un-approving a live plan.`);
  }

  const result = await supabase.from("plan_templates").upsert(
    {
      version: library.version,
      review_status: library.review_status,
      reviewed_by: library.reviewed_by ?? null,
      reviewed_on: library.reviewed_on ?? null,
      content: library,
    },
    { onConflict: "version" },
  );
  if (result.error) fail(`could not save version ${library.version}: ${result.error.message}`);
}

const library = readLibrary();
const counts = `${library.focus_modules.length} focus modules, ${library.screens.length} screens, ${Object.keys(library.sources).length} sources`;
console.log(`${path.basename(filePath)}: version ${library.version}, ${library.review_status}. ${counts}. Every field passed the checks.`);
if (!CHECK_ONLY) {
  await save(library);
  console.log(`Saved to plan_templates as version ${library.version} (${library.review_status}).`);
  if (library.review_status === "draft") console.log("Drafts are never shown to families. Locally they show only with ALLOW_DRAFT_PLANS=true in `npm run dev`.");
}
