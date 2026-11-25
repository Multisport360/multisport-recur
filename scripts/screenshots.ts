/**
 * Full-page screenshots of every page at 390px and 1280px, for the review step in CLAUDE.md.
 *
 *   npm run build && npm run start -- -p 3101     (in one terminal)
 *   npm run screenshots -- http://localhost:3101  (in another)
 *
 * A production build never shows draft plans, so to see the plan pages with the draft library:
 *   ALLOW_DRAFT_PLANS=true npx next dev -p 3102
 *   npm run screenshots -- http://localhost:3102
 *
 * Pictures go to screenshots/ (not committed). Signed-in pages use a throwaway parent
 * account made with the service role, and it is deleted at the end.
 */
import { mkdirSync } from "node:fs";
import path from "node:path";
import { chromium, type Page } from "@playwright/test";
import { addAthleteAsAdmin, adminClient, cleanUp, createFamilyWithoutSignIn } from "../tests/db/helpers.ts";

const BASE = (process.argv[2] ?? "http://localhost:3101").replace(/\/$/, "");
const OUT = path.resolve(import.meta.dirname, "../screenshots");
const SIZES = [
  ["phone", 390, 844],
  ["desktop", 1280, 800],
] as const;
const SETTLE_MS = 800;

type Shot = { name: string; path: string; prepare?: (page: Page) => Promise<void> };

async function pick(page: Page, label: string, option: string) {
  await page.getByLabel(label, { exact: true }).selectOption({ label: option });
}

/** The home page with a sport, position, metric and number chosen. */
function homeWith(name: string, sport: string, positionLabel: string, position: string, metric: string | null, value: string): Shot {
  return {
    name,
    path: "/",
    prepare: async (page) => {
      await pick(page, "Sport", sport);
      await pick(page, positionLabel, position);
      if (metric) await pick(page, "What was measured", metric);
      await page.locator("input[inputmode=decimal]").fill(value);
    },
  };
}

const PUBLIC_SHOTS: Shot[] = [
  { name: "home", path: "/" },
  homeWith("home-qb-height", "Football", "Position", "QB", "Height", "6'1"),
  homeWith("home-ol-weight", "Football", "Position", "OL", "Weight", "265"),
  homeWith("home-qb-vertical", "Football", "Position", "QB", "Vertical jump", "28"),
  homeWith("home-track-1600", "Track & Field", "Event", "1600m", null, "4:40"),
  homeWith("home-discus", "Track & Field", "Event", "Discus", null, "150'"),
  homeWith("home-corner-of-60", "Baseball", "Position", "Outfield (corner)", "60-yard dash", "6.95"),
  { name: "signup", path: "/signup" },
  { name: "signup-check-email", path: "/signup/check-email" },
  { name: "login", path: "/login" },
  { name: "login-reset", path: "/login/reset" },
  { name: "login-reset-sent", path: "/login/reset?sent=1" },
  { name: "not-found", path: "/no-such-page" },
];

async function capture(page: Page, shot: Shot, size: string) {
  await page.goto(BASE + shot.path, { waitUntil: "load" });
  if (shot.prepare) {
    // Let the page finish starting up in the browser before choosing options.
    await page.waitForTimeout(SETTLE_MS);
    await shot.prepare(page);
  }
  await page.waitForTimeout(SETTLE_MS);
  const file = path.join(OUT, `${shot.name}-${size}.png`);
  await page.screenshot({ path: file, fullPage: true });
  console.log(file);
}

async function signIn(page: Page, email: string, password: string) {
  await page.goto(`${BASE}/login`);
  await page.getByLabel("Email").fill(email);
  await page.getByLabel("Password").fill(password);
  await page.getByRole("button", { name: "Sign in" }).click();
  await page.waitForURL(/\/athletes/);
}

async function main() {
  mkdirSync(OUT, { recursive: true });
  const admin = adminClient();
  const empty = await createFamilyWithoutSignIn(admin, "shots-empty");
  const full = await createFamilyWithoutSignIn(admin, "shots-full");
  const older = await addAthleteAsAdmin(admin, full, "Riley", new Date().getFullYear() - 15);
  const younger = await addAthleteAsAdmin(admin, full, "Jamie", new Date().getFullYear() - 12);
  // An unused consent, so the add-athlete form shows instead of the consent page.
  await admin.from("consents").insert({ family_id: full.familyId, guardian_id: full.guardianId, consent_version: "2026-11-draft-1", method: "checkbox_attestation" });
  // A two-sport report with history, and a subscription so the plan pages show their paid state.
  const sports = await admin
    .from("athlete_sports")
    .insert([
      { athlete_id: older.athleteId, sport: "Baseball", position_or_event: "Pitcher" },
      { athlete_id: older.athleteId, sport: "Football", position_or_event: "QB" },
    ])
    .select("id, sport");
  const baseballSportId = sports.data?.find((row) => row.sport === "Baseball")?.id ?? "";
  const stat = (metric: string, value: number, unit: string, measured_on: string, sport = "Baseball") => ({
    athlete_id: older.athleteId, sport, metric, value, unit, measured_on, how_measured: "coach",
  });
  await admin.from("stat_entries").insert([
    stat("Fastball velocity", 78, "mph", "2026-03-14"),
    stat("Fastball velocity", 81, "mph", "2026-06-20"),
    stat("Fastball velocity", 83, "mph", "2026-10-02"),
    stat("60-yard dash", 7.05, "sec", "2026-10-02"),
    stat("40-yard dash", 4.85, "sec", "2026-09-12", "Football"),
    stat("Height", 73, "in", "2026-09-12", "Football"),
  ]);
  await admin.from("subscriptions").insert({
    family_id: full.familyId,
    stripe_customer_id: `cus_shots_${full.familyId}`,
    stripe_subscription_id: `sub_shots_${full.familyId}`,
    status: "active",
    price_cents: 1200,
    billing_interval: "month",
    current_period_end: new Date(Date.now() + 30 * 24 * 3600 * 1000).toISOString(),
  });

  // Riley has answered the plan questions; Jamie has not. The plan page itself only shows a plan
  // when there is an approved library, or a draft on a dev server with ALLOW_DRAFT_PLANS=true.
  await admin.from("plan_screen_answers").insert({
    athlete_id: older.athleteId,
    pain_now: false,
    throwing_arm_pain: false,
    has_training_age: true,
    season_phase: "off_season",
  });

  const browser = await chromium.launch();
  try {
    for (const [size, width, height] of SIZES) {
      const visitor = await browser.newPage({ viewport: { width, height } });
      for (const shot of PUBLIC_SHOTS) await capture(visitor, shot, size);
      await visitor.close();

      const newParent = await browser.newPage({ viewport: { width, height } });
      await signIn(newParent, empty.user.email, empty.user.password);
      for (const shot of [
        { name: "athletes-empty", path: "/athletes" },
        { name: "consent", path: "/consent" },
        { name: "account", path: "/account" },
        { name: "plan-not-subscribed", path: "/plan" },
        { name: "plan-subscribe", path: "/plan/subscribe" },
      ]) await capture(newParent, shot, size);
      await newParent.close();

      const parent = await browser.newPage({ viewport: { width, height } });
      await signIn(parent, full.user.email, full.user.password);
      for (const shot of [
        { name: "athletes", path: "/athletes" },
        { name: "athlete-new", path: "/athletes/new" },
        { name: "athlete-15", path: `/athletes/${older.athleteId}` },
        { name: "athlete-12", path: `/athletes/${younger.athleteId}` },
        { name: "athlete-invite", path: `/athletes/${older.athleteId}/invite` },
        { name: "sport-new", path: `/athletes/${older.athleteId}/sports/new` },
        { name: "stat-new", path: `/athletes/${older.athleteId}/stats/new?sport=${baseballSportId}&metric=Fastball%20velocity` },
        {
          name: "athlete-15-levels-open",
          path: `/athletes/${older.athleteId}`,
          prepare: async (page: Page) => {
            for (const summary of await page.getByText("See every level's numbers").all()) await summary.click();
          },
        },
        { name: "plan-subscribed", path: "/plan" },
        { name: "plan-athlete", path: `/plan/${older.athleteId}` },
        { name: "plan-questions-first", path: `/plan/${younger.athleteId}/questions` },
        { name: "plan-questions-change", path: `/plan/${older.athleteId}/questions` },
        { name: "account-subscribed", path: "/account" },
      ]) await capture(parent, shot, size);
      await parent.close();
    }
  } finally {
    await browser.close();
    await cleanUp(admin, [empty.familyId, full.familyId]);
  }
}

await main();
