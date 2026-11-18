import type { Page } from "@playwright/test";
import { addAthleteAsAdmin } from "../tests/db/helpers";
import { expect, signIn, test, THIS_YEAR } from "./support/accounts";

/**
 * Family accounts: the consent step, adding athletes, athlete logins.
 * Needs the Supabase project in .env.local with the migrations applied.
 */

const AGE_15_BIRTH_YEAR = String(THIS_YEAR - 15);

async function giveConsent(page: Page) {
  await page.getByLabel("I am this athlete's parent or legal guardian.").check();
  await page.getByLabel(/I agree to Multi-Sport Recur saving/).check();
  await page.getByRole("button", { name: "Agree and add my athlete" }).click();
  await expect(page).toHaveURL(/\/athletes\/new$/);
}

async function fillAthlete(page: Page, firstName: string, birthYear: string) {
  await page.getByLabel("First name").fill(firstName);
  await page.getByLabel("Grade").selectOption({ index: 3 });
  await page.getByLabel("Birth year").selectOption(birthYear);
  await page.getByLabel("Competes with").selectOption({ label: "Boys" });
  await page.getByRole("button", { name: "Add this athlete" }).click();
}

test("consent comes first: no athlete form, and no athlete row, until a consent record exists", async ({ page, admin, newParent }) => {
  const parent = await newParent("consent");
  await signIn(page, parent.user);

  await page.getByRole("link", { name: "Add an athlete" }).click();
  await expect(page).toHaveURL(/\/consent$/);
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("Before you add your athlete");

  // Going straight to the form is not a way round it.
  await page.goto("/athletes/new");
  await expect(page).toHaveURL(/\/consent$/);

  // Agreeing needs both boxes.
  await page.getByRole("button", { name: "Agree and add my athlete" }).click();
  await expect(page.getByRole("main").getByRole("alert")).toHaveText(
    "Tick the first box to confirm you are this athlete's parent or legal guardian.",
  );
  expect((await admin.from("consents").select("id").eq("family_id", parent.familyId)).data).toEqual([]);

  await giveConsent(page);

  const consents = await admin.from("consents").select("*").eq("family_id", parent.familyId);
  expect(consents.data).toHaveLength(1);
  expect(consents.data?.[0]).toMatchObject({
    guardian_id: parent.guardianId,
    athlete_id: null,
    consent_version: "2026-11-draft-1",
    method: "checkbox_attestation",
  });
  expect(Date.parse(consents.data?.[0]?.accepted_at ?? "")).toBeGreaterThan(Date.now() - 60_000);
});

test("a parent adds an athlete, and the consent record is tied to that athlete", async ({ page, admin, newParent }) => {
  const parent = await newParent("add-athlete");
  await signIn(page, parent.user);
  await page.goto("/consent");
  await giveConsent(page);

  // An empty form says what each field needs.
  await page.getByRole("button", { name: "Add this athlete" }).click();
  await expect(page.getByText("Type your athlete's first name.")).toBeVisible();
  await expect(page.getByText("Choose a birth year.")).toBeVisible();

  await page.getByLabel("Height (optional)").fill("5'10");
  await page.getByLabel("Weight in pounds (optional)").fill("160");
  await fillAthlete(page, "Riley", AGE_15_BIRTH_YEAR);

  await expect(page.getByRole("heading", { level: 1 })).toHaveText("Riley");

  const athletes = await admin.from("athletes").select("*").eq("family_id", parent.familyId);
  expect(athletes.data).toHaveLength(1);
  const athlete = athletes.data?.[0];
  expect(athlete).toMatchObject({
    first_name: "Riley",
    birth_year: THIS_YEAR - 15,
    gender: "Male",
    login_user_id: null,
  });
  expect(Number(athlete?.height_in)).toBe(70);
  expect(Number(athlete?.weight_lb)).toBe(160);
  // Only the fields CLAUDE.md allows are stored.
  expect(Object.keys(athlete ?? {}).sort()).toEqual(
    ["birth_year", "created_at", "family_id", "first_name", "gender", "grad_year", "height_in", "id", "login_user_id", "weight_lb"].sort(),
  );

  const consents = await admin.from("consents").select("athlete_id").eq("family_id", parent.familyId);
  expect(consents.data).toEqual([{ athlete_id: athlete?.id }]);

  // A second athlete needs its own consent.
  await page.goto("/athletes/new");
  await expect(page).toHaveURL(/\/consent$/);
});

test("an athlete under 13 has no login option, and one who is 13 or older can be invited", async ({ page, admin, newParent }) => {
  const parent = await newParent("login-rule");
  const young = await addAthleteAsAdmin(admin, parent, "Jamie", THIS_YEAR - 12);
  const older = await addAthleteAsAdmin(admin, parent, "Morgan", THIS_YEAR - 15);
  await signIn(page, parent.user);

  await page.goto(`/athletes/${young.athleteId}`);
  await expect(page.getByTestId("no-login-under-13")).toContainText("Athletes under 13 can't have their own login");
  await expect(page.getByRole("link", { name: /Invite Jamie/ })).toHaveCount(0);
  await page.goto(`/athletes/${young.athleteId}/invite`);
  await expect(page).toHaveURL(new RegExp(`/athletes/${young.athleteId}$`));

  await page.goto(`/athletes/${older.athleteId}`);
  await page.getByRole("link", { name: "Invite Morgan to their own login" }).click();
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("Invite Morgan to their own login");

  // The parent's own email is refused before anything is created.
  await page.getByLabel("Morgan's email").fill(parent.user.email);
  await page.getByRole("button", { name: "Send the invite" }).click();
  await expect(page.getByRole("main").getByRole("alert")).toHaveText("Use Morgan's own email address, not yours.");
});

test("one family cannot open another family's athlete", async ({ page, admin, newParent }) => {
  const familyA = await newParent("family-a");
  const familyB = await newParent("family-b");
  const athleteOfA = await addAthleteAsAdmin(admin, familyA, "Alex", THIS_YEAR - 15);

  await signIn(page, familyB.user);
  for (const path of [`/athletes/${athleteOfA.athleteId}`, `/athletes/${athleteOfA.athleteId}/invite`]) {
    await page.goto(path);
    await expect(page.getByRole("heading", { level: 1 })).toHaveText("That page isn't here");
    await expect(page.getByText("Alex")).toHaveCount(0);
  }
});

test("a parent can remove an athlete and everything saved about them", async ({ page, admin, newParent }) => {
  const parent = await newParent("remove");
  const athlete = await addAthleteAsAdmin(admin, parent, "Taylor", THIS_YEAR - 15);
  await signIn(page, parent.user);

  await page.goto(`/athletes/${athlete.athleteId}`);
  await page.getByText("Remove Taylor and everything saved about them").click();
  await page.getByRole("button", { name: "Yes, remove Taylor for good" }).click();

  await expect(page).toHaveURL(/\/athletes\?removed=1$/);
  await expect(page.getByRole("main").getByRole("status")).toHaveText("The athlete and all of their numbers were removed.");
  for (const table of ["athletes", "consents"] as const) {
    expect((await admin.from(table).select("id").eq("family_id", parent.familyId)).data).toEqual([]);
  }
  expect((await admin.from("stat_entries").select("id").eq("athlete_id", athlete.athleteId)).data).toEqual([]);
  expect((await admin.from("athlete_sports").select("id").eq("athlete_id", athlete.athleteId)).data).toEqual([]);
});
