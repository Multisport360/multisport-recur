import type { Page } from "@playwright/test";
import { addAthleteAsAdmin } from "../tests/db/helpers";
import { expect, signIn, test, THIS_YEAR, type E2eFamily } from "./support/accounts";
import { expectNoSources } from "./support/sources";

/**
 * M5: sports, stat entries and the full gap report, against the real database.
 * Expected numbers come from data/benchmarks.csv.
 */

async function addSport(page: Page, athleteId: string, sport: string, position: string) {
  await page.goto(`/athletes/${athleteId}/sports/new`);
  await page.getByLabel("Sport").selectOption(sport);
  await page.getByLabel(sport === "Track & Field" ? "Event" : "Position").selectOption(position);
  await page.getByRole("button", { name: "Add this sport" }).click();
  await expect(page).toHaveURL(new RegExp(`/athletes/${athleteId}$`));
}

async function enterNumber(page: Page, metricBlock: string, value: string, date: string, how: string, { expectSaved = true } = {}) {
  await page.locator(`[data-metric="${metricBlock}"]`).getByRole("link", { name: /^(Enter|Add a new)/ }).click();
  await page.getByLabel(/\(/).fill(value);
  await page.getByLabel("Date measured").fill(date);
  await page.getByLabel("Who measured it").selectOption({ label: how });
  await page.getByRole("button", { name: "Save this number" }).click();
  // Wait for the save, so a test that moves on straight away still finds the number on the report.
  if (expectSaved) await expect(page.getByRole("status")).toContainText("Saved.");
}

async function signedInWithAthlete(page: Page, admin: Parameters<typeof addAthleteAsAdmin>[0], parent: E2eFamily, birthYear = THIS_YEAR - 16) {
  const athlete = await addAthleteAsAdmin(admin, parent, "Sam", birthYear);
  await signIn(page, parent.user);
  return athlete.athleteId;
}

test("an empty report says what to do next", async ({ page, admin, newParent }) => {
  const athleteId = await signedInWithAthlete(page, admin, await newParent("report-empty"));
  await page.goto(`/athletes/${athleteId}`);

  await expect(page.getByRole("heading", { level: 1 })).toHaveText("Sam's gap report");
  await expect(page.getByTestId("no-sports")).toContainText("No sports yet. Add the sports Sam plays");

  await addSport(page, athleteId, "Baseball", "Pitcher");
  const velocity = page.locator('[data-metric="Fastball velocity"]');
  await expect(velocity.getByTestId("metric-empty")).toHaveText(
    "Not entered yet. Enter Sam's fastball velocity to see which level it reaches.",
  );
});

test("entering numbers: every entry is a new row, the ruler shows the latest, and progress appears", async ({ page, admin, newParent }) => {
  const parent = await newParent("report-entries");
  const athleteId = await signedInWithAthlete(page, admin, parent);
  await addSport(page, athleteId, "Baseball", "Pitcher");

  // A mistake first: the error says how to fix it and nothing is saved.
  await page.locator('[data-metric="Fastball velocity"]').getByRole("link", { name: "Enter fastball velocity" }).click();
  await page.getByLabel("Fastball velocity (mph)").fill("fast");
  await page.getByRole("button", { name: "Save this number" }).click();
  await expect(page.getByText("That isn't a number we can read. Type the speed in mph, like 84.")).toBeVisible();
  expect((await admin.from("stat_entries").select("id").eq("athlete_id", athleteId)).data).toEqual([]);
  await page.goto(`/athletes/${athleteId}`);

  await enterNumber(page, "Fastball velocity", "79", "2026-03-14", "We measured it ourselves");
  await expect(page.getByRole("status")).toHaveText("Saved. The fastball velocity ruler below shows the new number.");
  const block = page.locator('[data-metric="Fastball velocity"]');
  await expect(block.getByTestId("ruler-result").first()).toHaveText("Sam is in D3/NAIA range. 1 mph to JUCO.");
  await expect(block.getByTestId("progress-table")).toHaveCount(0);

  await enterNumber(page, "Fastball velocity", "83", "2026-10-02", "A coach measured it");
  await expect(block.getByTestId("ruler-result").first()).toHaveText("Sam is in D2 range. 1 mph to D1.");
  await expect(block).toContainText("Latest: Oct 2, 2026, measured by a coach.");

  const progress = block.getByTestId("progress-table");
  await expect(progress.getByRole("row")).toHaveCount(3);
  await expect(progress.getByRole("row").nth(1)).toContainText("Mar 14, 2026");
  await expect(progress.getByRole("row").nth(2)).toContainText("4 mph better");

  const rows = await admin.from("stat_entries").select("value, unit, measured_on, how_measured").eq("athlete_id", athleteId).order("measured_on");
  expect(rows.data?.map((row) => [Number(row.value), row.unit, row.measured_on, row.how_measured])).toEqual([
    [79, "mph", "2026-03-14", "self"],
    [83, "mph", "2026-10-02", "coach"],
  ]);
});

test("a future date is refused", async ({ page, admin, newParent }) => {
  const athleteId = await signedInWithAthlete(page, admin, await newParent("report-future"));
  await addSport(page, athleteId, "Baseball", "Pitcher");
  await enterNumber(page, "Fastball velocity", "80", `${THIS_YEAR + 1}-01-01`, "We measured it ourselves", { expectSaved: false });
  await expect(page.getByText("The date can't be in the future.")).toBeVisible();
});

test("a multi-sport athlete gets a summary of the sport closest to college", async ({ page, admin, newParent }) => {
  const athleteId = await signedInWithAthlete(page, admin, await newParent("report-multi"));
  await addSport(page, athleteId, "Baseball", "Pitcher");
  await addSport(page, athleteId, "Track & Field", "100m");
  await expect(page.getByTestId("sport-section")).toHaveCount(2);
  await expect(page.getByTestId("closest-summary")).toHaveCount(0);

  await enterNumber(page, "Fastball velocity", "83", "2026-10-02", "A coach measured it");
  await enterNumber(page, "100m", "10.8", "2026-05-10", "At a showcase, combine or meet");

  const summary = page.getByTestId("closest-summary");
  await expect(summary.getByRole("heading")).toHaveText("Closest to college right now");
  await expect(summary).toContainText("Track & Field, 100m: 100m reaches D1 range.");
  await expect(summary).toContainText("Baseball, Pitcher: fastball velocity is in D2 range.");
});

test("grades 8 to 11 see the senior-year note on the report", async ({ page, admin, newParent }) => {
  const athleteId = await signedInWithAthlete(page, admin, await newParent("report-grade"));
  await addSport(page, athleteId, "Baseball", "Pitcher");
  // The test athlete graduates in 2028, so is in 11th grade this school year.
  await expect(page.getByTestId("senior-note")).toContainText("These are senior-year targets.");
});

test("football height uses the profile until a height is entered", async ({ page, admin, newParent }) => {
  const parent = await newParent("report-profile");
  const athleteId = await signedInWithAthlete(page, admin, parent);
  await admin.from("athletes").update({ height_in: 73 }).eq("id", athleteId);
  await addSport(page, athleteId, "Football", "QB");

  const height = page.locator('[data-metric="Height"]');
  await expect(height).toContainText("From Sam's profile. Enter a measured number to replace it.");
  await expect(height.getByTestId("ruler-result")).toContainText("Sam is inside the typical FCS range.");
});

test("no benchmark source is shown on the gap report, even inside the score cards", async ({ page, admin, newParent }) => {
  const parent = await newParent("report-no-sources");
  const athleteId = await signedInWithAthlete(page, admin, parent);
  await addSport(page, athleteId, "Baseball", "Pitcher");
  await enterNumber(page, "Fastball velocity", "83", "2026-10-02", "A coach measured it");
  await addSport(page, athleteId, "Track & Field", "100m");

  await page.goto(`/athletes/${athleteId}`);
  await expect(page.getByTestId("gap-ruler").first()).toBeVisible();
  for (const summary of await page.getByText("See every level's numbers").all()) await summary.click();
  await expectNoSources(page);
});

test("a metric with numbers from two guides shows one ruler and one set of numbers per level", async ({ page, admin, newParent }) => {
  const parent = await newParent("report-one-guide");
  const athleteId = await signedInWithAthlete(page, admin, parent);
  await addSport(page, athleteId, "Baseball", "Pitcher");
  await enterNumber(page, "Fastball velocity", "83", "2026-10-02", "A coach measured it");

  await page.goto(`/athletes/${athleteId}`);
  const block = page.locator('[data-metric="Fastball velocity"]');
  await expect(block.getByTestId("gap-ruler")).toHaveCount(1);
  await expect(block.getByText("See every level's numbers")).toHaveCount(1);
  await block.getByText("See every level's numbers").click();
  const levels = block.locator("tbody tr");
  const levelNames = await levels.evaluateAll((rows) => rows.map((row) => row.querySelector("th, td")?.textContent?.trim() ?? ""));
  expect(levelNames.length).toBeGreaterThan(0);
  expect(new Set(levelNames).size).toBe(levelNames.length);
  await expect(page.getByText(/second guide/i)).toHaveCount(0);
  await expect(page.getByRole("main")).not.toContainText("in this guide");
});
