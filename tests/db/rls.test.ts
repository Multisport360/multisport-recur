import { afterAll, beforeAll, describe, expect, test } from "vitest";
import {
  addAthlete,
  adminClient,
  anonClient,
  cleanUp,
  createFamily,
  createSignedInUser,
  recordConsent,
  TEST_CONSENT,
  type Client,
  type TestFamily,
  type TestUser,
} from "./helpers";

/**
 * Proves row-level security against the real database:
 * guardian A cannot read or change family B's rows, an athlete login sees only itself,
 * and a signed-out visitor sees only benchmarks.
 *
 * Needs the migrations applied (npm run db:push). Run with: npm run test:db
 */

const PERMISSION_DENIED = "42501";
const THIS_YEAR = new Date().getFullYear();
const BORN_16_YEARS_AGO = THIS_YEAR - 16;
const BORN_12_YEARS_AGO = THIS_YEAR - 12;

/** Tables that hold family data. A signed-out visitor must get nothing from any of them. */
const FAMILY_TABLES = [
  "families",
  "guardians",
  "consents",
  "athletes",
  "athlete_sports",
  "stat_entries",
  "subscriptions",
  "plan_templates",
  "plan_screen_answers",
  "plan_session_completions",
] as const;

let admin: Client;
let familyA: TestFamily;
let familyB: TestFamily;
let athleteLogin: TestUser;
let a: Client;

let athleteA1: { athleteId: string; statId: string };
let athleteA2: { athleteId: string; statId: string };
let athleteB1: { athleteId: string; statId: string };
let publishedTemplateId: string;
let draftTemplateId: string;

beforeAll(async () => {
  admin = adminClient();
  familyA = await createFamily(admin, "guardian-a");
  familyB = await createFamily(admin, "guardian-b");
  a = familyA.user.client;

  athleteA1 = await addAthlete(familyA, "Alex", BORN_16_YEARS_AGO);
  athleteA2 = await addAthlete(familyA, "Avery", BORN_12_YEARS_AGO);
  athleteB1 = await addAthlete(familyB, "Blake", BORN_16_YEARS_AGO);

  // An athlete login tied to Alex only. The server does this when a parent's invite is accepted.
  athleteLogin = await createSignedInUser(admin, "athlete-a1");
  const linked = await admin.from("athletes").update({ login_user_id: athleteLogin.id }).eq("id", athleteA1.athleteId);
  if (linked.error) throw new Error(`could not link athlete login: ${linked.error.message}`);

  // Family B pays. Family A does not.
  const subscription = await admin.from("subscriptions").insert({
    family_id: familyB.familyId,
    stripe_customer_id: `cus_test_${familyB.familyId}`,
    stripe_subscription_id: `sub_test_${familyB.familyId}`,
    status: "active",
  });
  if (subscription.error) throw new Error(`could not add subscription: ${subscription.error.message}`);

  // Version names are unique per run, so parallel runs never collide.
  const run = crypto.randomUUID().slice(0, 8);
  const templates = await admin
    .from("plan_templates")
    .insert([
      { version: `rls-approved-${run}`, review_status: "approved", reviewed_by: "RLS test", reviewed_on: "2026-11-24", content: { test: true } },
      { version: `rls-draft-${run}`, review_status: "draft", content: { test: true } },
    ])
    .select("id, review_status");
  if (templates.error) throw new Error(`could not add plan templates: ${templates.error.message}`);
  publishedTemplateId = templates.data.find((t) => t.review_status === "approved")?.id ?? "";
  draftTemplateId = templates.data.find((t) => t.review_status === "draft")?.id ?? "";
});

afterAll(async () => {
  if (!admin) return;
  await admin.from("plan_templates").delete().in("id", [publishedTemplateId, draftTemplateId].filter(Boolean));
  await cleanUp(
    admin,
    [familyA?.familyId, familyB?.familyId].filter((id): id is string => Boolean(id)),
  );
});

describe("guardian A cannot read family B's rows", () => {
  test("reading each table returns only family A's rows", async () => {
    const families = await a.from("families").select("id");
    expect(families.data?.map((row) => row.id)).toEqual([familyA.familyId]);

    const guardians = await a.from("guardians").select("family_id");
    expect(guardians.data?.map((row) => row.family_id)).toEqual([familyA.familyId]);

    const consents = await a.from("consents").select("family_id");
    expect(new Set(consents.data?.map((row) => row.family_id))).toEqual(new Set([familyA.familyId]));

    const athletes = await a.from("athletes").select("id");
    expect(new Set(athletes.data?.map((row) => row.id))).toEqual(new Set([athleteA1.athleteId, athleteA2.athleteId]));

    const sports = await a.from("athlete_sports").select("athlete_id");
    expect(new Set(sports.data?.map((row) => row.athlete_id))).toEqual(new Set([athleteA1.athleteId, athleteA2.athleteId]));

    const stats = await a.from("stat_entries").select("id");
    expect(new Set(stats.data?.map((row) => row.id))).toEqual(new Set([athleteA1.statId, athleteA2.statId]));

    const subscriptions = await a.from("subscriptions").select("family_id");
    expect(subscriptions.data).toEqual([]);
  });

  test("asking for family B's rows by id returns nothing", async () => {
    expect((await a.from("families").select("id").eq("id", familyB.familyId)).data).toEqual([]);
    expect((await a.from("guardians").select("id").eq("family_id", familyB.familyId)).data).toEqual([]);
    expect((await a.from("consents").select("id").eq("family_id", familyB.familyId)).data).toEqual([]);
    expect((await a.from("athletes").select("id").eq("id", athleteB1.athleteId)).data).toEqual([]);
    expect((await a.from("athlete_sports").select("id").eq("athlete_id", athleteB1.athleteId)).data).toEqual([]);
    expect((await a.from("stat_entries").select("id").eq("id", athleteB1.statId)).data).toEqual([]);
    expect((await a.from("subscriptions").select("id").eq("family_id", familyB.familyId)).data).toEqual([]);
  });
});

describe("guardian A cannot change family B's rows", () => {
  test("cannot add an athlete to family B, even when family B has an unused consent", async () => {
    await recordConsent(familyB);
    const attempt = await a
      .from("athletes")
      .insert({ family_id: familyB.familyId, first_name: "Intruder", grad_year: 2028, birth_year: BORN_16_YEARS_AGO, gender: "Male" });

    expect(attempt.error?.code).toBe(PERMISSION_DENIED);
    const check = await admin.from("athletes").select("id").eq("family_id", familyB.familyId);
    expect(check.data?.map((row) => row.id)).toEqual([athleteB1.athleteId]);
  });

  test("cannot add a stat or a sport to family B's athlete", async () => {
    const stat = await a.from("stat_entries").insert({
      athlete_id: athleteB1.athleteId,
      sport: "Baseball",
      metric: "Fastball velocity",
      value: 99,
      unit: "mph",
      measured_on: "2026-10-02",
      how_measured: "self",
    });
    expect(stat.error?.code).toBe(PERMISSION_DENIED);

    const sport = await a
      .from("athlete_sports")
      .insert({ athlete_id: athleteB1.athleteId, sport: "Football", position_or_event: "QB" });
    expect(sport.error?.code).toBe(PERMISSION_DENIED);
  });

  test("updating or deleting family B's athlete touches no rows", async () => {
    const updated = await a.from("athletes").update({ first_name: "Hacked" }).eq("id", athleteB1.athleteId).select("id");
    expect(updated.data).toEqual([]);

    const deleted = await a.from("athletes").delete().eq("id", athleteB1.athleteId).select("id");
    expect(deleted.data).toEqual([]);

    const check = await admin.from("athletes").select("first_name").eq("id", athleteB1.athleteId).single();
    expect(check.data?.first_name).toBe("Blake");
  });

  test("cannot record a consent for family B or in guardian B's name", async () => {
    const forFamilyB = await a
      .from("consents")
      .insert({ family_id: familyB.familyId, guardian_id: familyA.guardianId, ...TEST_CONSENT });
    expect(forFamilyB.error?.code).toBe(PERMISSION_DENIED);

    const asGuardianB = await a
      .from("consents")
      .insert({ family_id: familyA.familyId, guardian_id: familyB.guardianId, ...TEST_CONSENT });
    expect(asGuardianB.error?.code).toBe(PERMISSION_DENIED);
  });
});

describe("rules that hold even inside your own family", () => {
  test("an athlete cannot be saved without an unused consent record", async () => {
    const attempt = await a
      .from("athletes")
      .insert({ family_id: familyA.familyId, first_name: "NoConsent", grad_year: 2029, birth_year: BORN_16_YEARS_AGO, gender: "Female" });

    expect(attempt.error?.message).toContain("consent_required");
    const check = await admin.from("athletes").select("id").eq("family_id", familyA.familyId);
    expect(check.data).toHaveLength(2);
  });

  test("each athlete is tied to exactly one consent record", async () => {
    const consents = await a.from("consents").select("athlete_id, consent_version, method");
    expect(new Set(consents.data?.map((row) => row.athlete_id))).toEqual(new Set([athleteA1.athleteId, athleteA2.athleteId]));
    expect(consents.data?.every((row) => row.consent_version === TEST_CONSENT.consent_version)).toBe(true);
  });

  test("a consent record cannot be edited or deleted by the guardian", async () => {
    const edited = await a.from("consents").update({ method: "changed" }).eq("family_id", familyA.familyId);
    expect(edited.error?.code).toBe(PERMISSION_DENIED);
    const deleted = await a.from("consents").delete().eq("family_id", familyA.familyId);
    expect(deleted.error?.code).toBe(PERMISSION_DENIED);
  });

  test("stat entries cannot be overwritten or deleted, even by their owner", async () => {
    const updated = await a.from("stat_entries").update({ value: 95 }).eq("id", athleteA1.statId);
    expect(updated.error?.code).toBe(PERMISSION_DENIED);
    const deleted = await a.from("stat_entries").delete().eq("id", athleteA1.statId);
    expect(deleted.error?.code).toBe(PERMISSION_DENIED);

    // Not even the server can overwrite one.
    const byServer = await admin.from("stat_entries").update({ value: 95 }).eq("id", athleteA1.statId);
    expect(byServer.error?.message).toContain("stat_entry_locked");

    const check = await admin.from("stat_entries").select("value").eq("id", athleteA1.statId).single();
    expect(Number(check.data?.value)).toBe(80);
  });

  test("a guardian cannot give their family a subscription", async () => {
    const attempt = await a.from("subscriptions").insert({
      family_id: familyA.familyId,
      stripe_customer_id: "cus_free_ride",
      status: "active",
    });
    expect(attempt.error?.code).toBe(PERMISSION_DENIED);
  });

  test("a guardian cannot attach a login to an athlete directly", async () => {
    const attempt = await a.from("athletes").update({ login_user_id: familyA.user.id }).eq("id", athleteA2.athleteId);
    expect(attempt.error?.code).toBe(PERMISSION_DENIED);
  });

  test("an athlete under 13 can never get a login, even from the server", async () => {
    const spare = await createSignedInUser(admin, "under-13");
    const attempt = await admin.from("athletes").update({ login_user_id: spare.id }).eq("id", athleteA2.athleteId);
    expect(attempt.error?.message).toContain("login_under_13");
  });

  test("signed-in users cannot change benchmarks or sources", async () => {
    const insertSource = await a.from("sources").insert({ id: "FAKE", name: "Fake", url: "https://example.com" });
    expect(insertSource.error?.code).toBe(PERMISSION_DENIED);
    const editBenchmarks = await a.from("benchmarks").update({ entry: 1 }).gt("id", 0);
    expect(editBenchmarks.error?.code).toBe(PERMISSION_DENIED);
    const deleteBenchmarks = await a.from("benchmarks").delete().gt("id", 0);
    expect(deleteBenchmarks.error?.code).toBe(PERMISSION_DENIED);
  });
});

describe("an athlete login sees only its own athlete", () => {
  test("reads its own athlete, sports and stats, and nothing of its sibling or family B", async () => {
    const me = athleteLogin.client;

    const athletes = await me.from("athletes").select("id");
    expect(athletes.data?.map((row) => row.id)).toEqual([athleteA1.athleteId]);

    const stats = await me.from("stat_entries").select("id");
    expect(stats.data?.map((row) => row.id)).toEqual([athleteA1.statId]);

    const sports = await me.from("athlete_sports").select("athlete_id");
    expect(sports.data?.map((row) => row.athlete_id)).toEqual([athleteA1.athleteId]);

    expect((await me.from("guardians").select("id")).data).toEqual([]);
    expect((await me.from("consents").select("id")).data).toEqual([]);
  });

  test("can add a stat for itself but not for its sibling", async () => {
    const me = athleteLogin.client;
    const entry = {
      sport: "Baseball",
      metric: "Fastball velocity",
      value: 81,
      unit: "mph",
      measured_on: "2026-11-01",
      how_measured: "coach",
    };

    const own = await me.from("stat_entries").insert({ athlete_id: athleteA1.athleteId, ...entry });
    expect(own.error).toBeNull();

    const sibling = await me.from("stat_entries").insert({ athlete_id: athleteA2.athleteId, ...entry });
    expect(sibling.error?.code).toBe(PERMISSION_DENIED);
  });

  test("cannot edit its own profile or turn itself into a parent account", async () => {
    const me = athleteLogin.client;

    const edited = await me.from("athletes").update({ first_name: "Renamed" }).eq("id", athleteA1.athleteId).select("id");
    expect(edited.data ?? []).toEqual([]);

    const family = await me.rpc("ensure_family");
    expect(family.error?.message).toContain("athlete_login");
  });
});

describe("training plan templates", () => {
  test("a family with an active subscription sees approved templates only, never drafts", async () => {
    const visible = await familyB.user.client
      .from("plan_templates")
      .select("id")
      .in("id", [publishedTemplateId, draftTemplateId]);
    expect(visible.data?.map((row) => row.id)).toEqual([publishedTemplateId]);
  });

  test("a family without a subscription sees no templates", async () => {
    const visible = await a.from("plan_templates").select("id").in("id", [publishedTemplateId, draftTemplateId]);
    expect(visible.data).toEqual([]);
  });

  test("signed-in users cannot add or approve templates", async () => {
    const insert = await familyB.user.client.from("plan_templates").insert({ version: "fake", content: {} });
    expect(insert.error?.code).toBe(PERMISSION_DENIED);
    const approve = await familyB.user.client.from("plan_templates").update({ review_status: "approved" }).eq("id", draftTemplateId);
    expect(approve.error?.code).toBe(PERMISSION_DENIED);
  });

  test("the database refuses an approved template with no reviewer or review date", async () => {
    const attempt = await admin.from("plan_templates").insert({ version: `rls-bad-${crypto.randomUUID()}`, review_status: "approved", content: {} });
    expect(attempt.error?.message).toContain("plan_templates_approved_needs_review");
  });
});

const SCREEN_ANSWERS = { pain_now: false, throwing_arm_pain: false, has_training_age: true, season_phase: "off_season" } as const;

describe("plan screen answers", () => {
  test("a parent answers for their own athlete, and can read the answers", async () => {
    const saved = await a.from("plan_screen_answers").insert({ athlete_id: athleteA1.athleteId, ...SCREEN_ANSWERS }).select("athlete_id").single();
    expect(saved.error).toBeNull();
    const read = await a.from("plan_screen_answers").select("athlete_id").eq("athlete_id", athleteA1.athleteId);
    expect(read.data?.length).toBeGreaterThan(0);
  });

  test("a parent cannot answer for, or read, another family's athlete", async () => {
    const attempt = await a.from("plan_screen_answers").insert({ athlete_id: athleteB1.athleteId, ...SCREEN_ANSWERS });
    expect(attempt.error?.code).toBe(PERMISSION_DENIED);
    await admin.from("plan_screen_answers").insert({ athlete_id: athleteB1.athleteId, ...SCREEN_ANSWERS });
    const read = await a.from("plan_screen_answers").select("id").eq("athlete_id", athleteB1.athleteId);
    expect(read.data).toEqual([]);
  });

  test("an athlete login can read its own answers but not answer them", async () => {
    const read = await athleteLogin.client.from("plan_screen_answers").select("athlete_id").eq("athlete_id", athleteA1.athleteId);
    expect(read.data?.length).toBeGreaterThan(0);
    const attempt = await athleteLogin.client.from("plan_screen_answers").insert({ athlete_id: athleteA1.athleteId, ...SCREEN_ANSWERS });
    expect(attempt.error?.code).toBe(PERMISSION_DENIED);
  });

  test("a parent saves the team practices and games count; it must be 0 to 7, and older answers have none", async () => {
    const saved = await a
      .from("plan_screen_answers")
      .insert({ athlete_id: athleteA1.athleteId, ...SCREEN_ANSWERS, team_sessions_per_week: 3 })
      .select("team_sessions_per_week")
      .single();
    expect(saved.error).toBeNull();
    expect(saved.data?.team_sessions_per_week).toBe(3);

    for (const count of [8, -1]) {
      const attempt = await a.from("plan_screen_answers").insert({ athlete_id: athleteA1.athleteId, ...SCREEN_ANSWERS, team_sessions_per_week: count });
      expect(attempt.error?.message, String(count)).toContain("plan_screen_answers_team_sessions_range");
    }

    const older = await a.from("plan_screen_answers").insert({ athlete_id: athleteA1.athleteId, ...SCREEN_ANSWERS }).select("team_sessions_per_week").single();
    expect(older.error).toBeNull();
    expect(older.data?.team_sessions_per_week).toBeNull();
  });

  test("answers are never changed in place: a change is a new row", async () => {
    const update = await a.from("plan_screen_answers").update({ pain_now: true }).eq("athlete_id", athleteA1.athleteId);
    expect(update.error?.code).toBe(PERMISSION_DENIED);
    const remove = await a.from("plan_screen_answers").delete().eq("athlete_id", athleteA1.athleteId).select("id");
    expect(remove.error?.code).toBe(PERMISSION_DENIED);
  });
});

describe("finished plan sessions", () => {
  const SESSION = { block_start: "2026-11-23", week: 1, day: 0 } as const;

  test("a parent ticks and unticks a session for their own athlete", async () => {
    const tick = await a.from("plan_session_completions").insert({ athlete_id: athleteA2.athleteId, ...SESSION });
    expect(tick.error).toBeNull();
    const untick = await a.from("plan_session_completions").delete().eq("athlete_id", athleteA2.athleteId).select("id");
    expect(untick.data).toHaveLength(1);
  });

  test("an athlete login ticks its own sessions only", async () => {
    const own = await athleteLogin.client.from("plan_session_completions").insert({ athlete_id: athleteA1.athleteId, ...SESSION });
    expect(own.error).toBeNull();
    const sibling = await athleteLogin.client.from("plan_session_completions").insert({ athlete_id: athleteA2.athleteId, ...SESSION });
    expect(sibling.error?.code).toBe(PERMISSION_DENIED);
  });

  test("another family can neither tick nor see the sessions", async () => {
    const attempt = await familyB.user.client.from("plan_session_completions").insert({ athlete_id: athleteA1.athleteId, ...SESSION, day: 2 });
    expect(attempt.error?.code).toBe(PERMISSION_DENIED);
    const read = await familyB.user.client.from("plan_session_completions").select("id").eq("athlete_id", athleteA1.athleteId);
    expect(read.data).toEqual([]);
    const remove = await familyB.user.client.from("plan_session_completions").delete().eq("athlete_id", athleteA1.athleteId).select("id");
    expect(remove.data ?? []).toEqual([]);
  });
});

describe("a signed-out visitor", () => {
  test("can read benchmarks and sources", async () => {
    const anon = anonClient();
    const benchmarks = await anon.from("benchmarks").select("id").limit(1);
    expect(benchmarks.error).toBeNull();
    const sources = await anon.from("sources").select("id").limit(1);
    expect(sources.error).toBeNull();
  });

  test.each(FAMILY_TABLES)("gets nothing from %s", async (table) => {
    const result = await anonClient().from(table).select("*");
    expect(result.data ?? []).toEqual([]);
  });

  test("cannot write benchmarks", async () => {
    const attempt = await anonClient().from("sources").insert({ id: "FAKE", name: "Fake", url: "https://example.com" });
    expect(attempt.error?.code).toBe(PERMISSION_DENIED);
  });
});
