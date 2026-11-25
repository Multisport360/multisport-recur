import { randomUUID } from "node:crypto";
import { readFileSync } from "node:fs";
import path from "node:path";
import type { Client } from "../../tests/db/helpers";

/**
 * Plan template rows for end-to-end tests. The draft library is saved exactly as
 * `npm run plans:seed` would save it; an approved copy is added only for the length of one test.
 */

const DRAFT = JSON.parse(readFileSync(path.resolve(import.meta.dirname, "../../data/plan_templates.draft.json"), "utf8")) as {
  version: string;
  review_status: string;
};

/** The dev server's address. It runs `next dev` with ALLOW_DRAFT_PLANS=true (see playwright.config.ts). */
export const DEV_URL = `http://localhost:${process.env.E2E_DEV_PORT ?? "3102"}`;

/** Makes sure the draft library is in plan_templates, as a draft. */
export async function ensureDraftLibrary(admin: Client): Promise<void> {
  const existing = await admin.from("plan_templates").select("review_status").eq("version", DRAFT.version).maybeSingle();
  if (existing.error) throw new Error(`could not read plan_templates: ${existing.error.message}`);
  if (existing.data?.review_status === "approved") throw new Error(`${DRAFT.version} is approved in this database; e2e tests expect it to be a draft.`);
  const saved = await admin.from("plan_templates").upsert({ version: DRAFT.version, review_status: "draft", content: DRAFT }, { onConflict: "version" });
  if (saved.error) throw new Error(`could not save the draft library: ${saved.error.message}`);
}

/** No approved library may be left over, or "your plan is coming" can never show. */
export async function expectNoApprovedLibrary(admin: Client): Promise<void> {
  const approved = await admin.from("plan_templates").select("version").eq("review_status", "approved");
  if (approved.error) throw new Error(`could not read plan_templates: ${approved.error.message}`);
  if (approved.data.length > 0) throw new Error(`approved plan templates exist (${approved.data.map((row) => row.version).join(", ")}); remove them from the test database.`);
}

/** Adds an approved copy of the draft library and returns a function that removes it. */
export async function addApprovedLibrary(admin: Client): Promise<() => Promise<void>> {
  const version = `e2e-approved-${randomUUID().slice(0, 8)}`;
  const content = { ...DRAFT, version, review_status: "approved", reviewed_by: "E2E coach", reviewed_on: "2026-11-24" };
  const saved = await admin.from("plan_templates").insert({ version, review_status: "approved", reviewed_by: "E2E coach", reviewed_on: "2026-11-24", content });
  if (saved.error) throw new Error(`could not add an approved library: ${saved.error.message}`);
  return async () => {
    await admin.from("plan_templates").delete().eq("version", version);
  };
}

/** Saves a parent's plan answers directly (for tests that are not about the questions page). */
export async function answerScreens(
  admin: Client,
  athleteId: string,
  answers: {
    pain_now?: boolean;
    throwing_arm_pain?: boolean | null;
    has_training_age?: boolean;
    season_phase?: string;
    /** Null saves an answer set from before the team-practice question existed. */
    team_sessions_per_week?: number | null;
    answered_at?: string;
  } = {},
): Promise<void> {
  const saved = await admin.from("plan_screen_answers").insert({
    athlete_id: athleteId,
    pain_now: false,
    throwing_arm_pain: null,
    has_training_age: false,
    season_phase: "off_season",
    team_sessions_per_week: 0,
    ...answers,
  });
  if (saved.error) throw new Error(`could not save plan answers: ${saved.error.message}`);
}
