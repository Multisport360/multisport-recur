/**
 * Full-page screenshots of every page at 390px and 1280px, for the review step in CLAUDE.md.
 *
 *   npm run build && npm run start -- -p 3101     (in one terminal)
 *   npm run screenshots -- http://localhost:3101  (in another)
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
  if (shot.prepare) await shot.prepare(page);
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
      ]) await capture(parent, shot, size);
      await parent.close();
    }
  } finally {
    await browser.close();
    await cleanUp(admin, [empty.familyId, full.familyId]);
  }
}

await main();
