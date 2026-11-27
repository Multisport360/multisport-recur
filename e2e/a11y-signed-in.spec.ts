import { addAthleteAsAdmin } from "../tests/db/helpers";
import { signIn, test, THIS_YEAR } from "./support/accounts";
import { expectNoAxeViolations } from "./support/axe";

/**
 * axe accessibility check on every signed-in page, with real data in it.
 * Runs once (desktop), like the other account tests, to stay under Supabase's sign-in limit.
 */

test("no accessibility problems on any signed-in page", async ({ page, admin, newParent }) => {
  const empty = await newParent("a11y-empty");
  await signIn(page, empty.user);
  for (const path of ["/athletes", "/consent", "/account", "/plan", "/plan/subscribe"]) {
    await page.goto(path);
    await expectNoAxeViolations(page);
  }
  await page.goto("/plan/subscribe");
  await page.getByRole("button", { name: "Continue to payment" }).click();
  await page.getByText("Tick the box to agree").waitFor();
  await expectNoAxeViolations(page);

  const family = await newParent("a11y-full");
  const older = await addAthleteAsAdmin(admin, family, "Riley", THIS_YEAR - 15);
  const younger = await addAthleteAsAdmin(admin, family, "Jamie", THIS_YEAR - 12);
  await admin.from("consents").insert({ family_id: family.familyId, guardian_id: family.guardianId, consent_version: "2026-11-draft-1", method: "checkbox_attestation" });
  const sports = await admin
    .from("athlete_sports")
    .insert([
      { athlete_id: older.athleteId, sport: "Baseball", position_or_event: "Pitcher" },
      { athlete_id: older.athleteId, sport: "Football", position_or_event: "QB" },
    ])
    .select("id, sport");
  const baseball = sports.data?.find((row) => row.sport === "Baseball")?.id ?? "";
  const entry = (metric: string, value: number, unit: string, measured_on: string, sport = "Baseball") => ({
    athlete_id: older.athleteId, sport, metric, value, unit, measured_on, how_measured: "coach",
  });
  await admin.from("stat_entries").insert([
    entry("Fastball velocity", 79, "mph", "2026-03-14"),
    entry("Fastball velocity", 83, "mph", "2026-10-02"),
    entry("Height", 73, "in", "2026-09-12", "Football"),
  ]);
  await admin.from("subscriptions").insert({
    family_id: family.familyId,
    stripe_customer_id: `cus_a11y_${family.familyId}`,
    stripe_subscription_id: `sub_a11y_${family.familyId}`,
    status: "active",
    current_period_end: new Date(Date.now() + 30 * 24 * 3600 * 1000).toISOString(),
  });

  await page.context().clearCookies();
  await signIn(page, family.user);
  for (const path of [
    "/athletes",
    "/athletes/new",
    `/athletes/${older.athleteId}`,
    `/athletes/${younger.athleteId}`,
    `/athletes/${older.athleteId}/invite`,
    `/athletes/${older.athleteId}/sports/new`,
    `/athletes/${older.athleteId}/stats/new?sport=${baseball}&metric=Fastball%20velocity`,
    "/plan",
    "/account",
  ]) {
    await page.goto(path);
    await expectNoAxeViolations(page);
  }

  // Forms with their errors showing.
  await page.goto(`/athletes/${older.athleteId}/stats/new?sport=${baseball}&metric=Fastball%20velocity`);
  await page.getByRole("button", { name: "Save this number" }).click();
  await page.getByText("Choose who measured it.").waitFor();
  await expectNoAxeViolations(page);

  await page.goto("/athletes/new");
  await page.getByRole("button", { name: "Add this athlete" }).click();
  await page.getByText("Type your athlete's first name.").waitFor();
  await expectNoAxeViolations(page);
});
