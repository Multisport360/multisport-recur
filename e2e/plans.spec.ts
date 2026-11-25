import { randomUUID } from "node:crypto";
import Stripe from "stripe";
import { addAthleteAsAdmin, type Client } from "../tests/db/helpers";
import { expect, signIn, test, THIS_YEAR, type E2eFamily } from "./support/accounts";
import { addApprovedLibrary, answerScreens, DEV_URL, ensureDraftLibrary, expectNoApprovedLibrary } from "./support/plans";
import { hasStripeTestKey, payWithTestCard } from "./support/stripe";

/**
 * Training plans built from the template library.
 *
 * The library is shared by every family in the database, so these tests run one after another:
 *   1. production build, draft in the database, ALLOW_DRAFT_PLANS=true: still "your plan is coming";
 *   2. dev server with ALLOW_DRAFT_PLANS=true: the whole journey, ending on a draft plan with its banner;
 *   3. production build with an approved library (added for that test only): the plan, the gate, retest.
 * playwright.config.ts starts the production server WITH the flag set, so test 1 proves the flag
 * alone can never show a draft.
 */

test.describe.configure({ mode: "serial" });

const ONE_MONTH_MS = 30 * 24 * 60 * 60 * 1000;
const DAY_MS = 24 * 60 * 60 * 1000;
const PAIN_LINE = "Stop and tell a parent or coach about any pain. Pain is not part of training.";
const DRAFT_BANNER = "Sample plan, not coach-reviewed. For testing only.";

async function subscribe(admin: Client, family: E2eFamily) {
  const result = await admin.from("subscriptions").insert({
    family_id: family.familyId,
    stripe_customer_id: `cus_e2e_${family.familyId}`,
    stripe_subscription_id: `sub_e2e_${family.familyId}`,
    status: "active",
    price_cents: 1200,
    billing_interval: "month",
    current_period_end: new Date(Date.now() + ONE_MONTH_MS).toISOString(),
  });
  if (result.error) throw new Error(`could not add subscription: ${result.error.message}`);
}

/** A 9th-grade pitcher (younger than 11th, so throwing caution applies) at 79 mph. */
async function ninthGradePitcher(admin: Client, family: E2eFamily): Promise<string> {
  const { athleteId } = await addAthleteAsAdmin(admin, family, "Sam", THIS_YEAR - 15);
  const ninthGradeClass = new Date().getMonth() >= 7 ? THIS_YEAR + 4 : THIS_YEAR + 3;
  await admin.from("athletes").update({ grad_year: ninthGradeClass }).eq("id", athleteId);
  await admin.from("athlete_sports").insert({ athlete_id: athleteId, sport: "Baseball", position_or_event: "Pitcher" });
  const stat = await admin.from("stat_entries").insert({
    athlete_id: athleteId,
    sport: "Baseball",
    metric: "Fastball velocity",
    value: 79,
    unit: "mph",
    measured_on: "2026-10-01",
    how_measured: "coach",
  });
  if (stat.error) throw new Error(`could not add stat: ${stat.error.message}`);
  return athleteId;
}

test("a production build never shows a draft, even with ALLOW_DRAFT_PLANS=true: subscribers see 'your plan is coming'", async ({ page, admin, newParent }) => {
  await ensureDraftLibrary(admin);
  await expectNoApprovedLibrary(admin);
  const family = await newParent("plans-coming");
  const athleteId = await ninthGradePitcher(admin, family);
  await subscribe(admin, family);
  await signIn(page, family.user);

  await page.goto("/plan");
  await expect(page.getByTestId("plan-coming")).toContainText("Your plan is coming.");
  await expect(page.getByTestId("draft-banner")).toHaveCount(0);
  await page.goto(`/plan/${athleteId}`);
  await expect(page).toHaveURL(/\/plan$/);
  await page.goto(`/plan/${athleteId}/questions`);
  await expect(page).toHaveURL(/\/plan$/);
});

test.describe("local development with ALLOW_DRAFT_PLANS=true", () => {
  // A browser on Central time, to show the family's time zone comes from the browser at sign-up.
  test.use({ baseURL: DEV_URL, timezoneId: "America/Chicago" });

  test("sign up, consent, add an athlete, enter a number, pay with the test card, answer the questions, see the draft plan", async ({ page, admin }) => {
    test.skip(Boolean(process.env.E2E_BASE_URL), "Needs the local dev server that playwright.config.ts starts.");
    test.skip(!hasStripeTestKey(), "Needs a Stripe test-mode key (sk_test_...) in .env.local.");
    test.setTimeout(300_000);
    await ensureDraftLibrary(admin);
    const email = `e2e-plans-${randomUUID().slice(0, 8)}@example.com`;

    try {
      // Sign up. "Confirm email" is off, so the parent is signed straight in.
      await page.goto("/signup");
      await page.getByLabel("Your email").fill(email);
      await page.getByLabel("Password").fill(`pw-${randomUUID()}`);
      await page.getByLabel(/I'm a parent or legal guardian/).check();
      await page.getByRole("button", { name: "Create my account" }).click();
      await expect(page.getByRole("heading", { level: 1 })).toHaveText("My athletes", { timeout: 60_000 });
      expect(await familyTimeZoneFor(admin, email)).toBe("America/Chicago");

      // Consent comes before the athlete.
      await page.getByRole("link", { name: "Add an athlete" }).first().click();
      await expect(page).toHaveURL(/\/consent$/);
      await page.getByLabel("I am this athlete's parent or legal guardian.").check();
      await page.getByLabel(/I agree to Multi-Sport Recur saving/).check();
      await page.getByRole("button", { name: "Agree and add my athlete" }).click();
      await expect(page).toHaveURL(/\/athletes\/new$/);
      await page.getByLabel("First name").fill("Sam");
      await page.getByLabel("Grade").selectOption({ index: 3 });
      await page.getByLabel("Birth year").selectOption(String(THIS_YEAR - 15));
      await page.getByLabel("Competes with").selectOption({ label: "Boys" });
      await page.getByRole("button", { name: "Add this athlete" }).click();
      await expect(page).toHaveURL(/\/athletes\/[0-9a-f-]{36}/);
      const athleteId = /\/athletes\/([0-9a-f-]{36})/.exec(page.url())?.[1] as string;

      // A sport and a number with a gap to the next level.
      await page.goto(`/athletes/${athleteId}/sports/new`);
      await page.getByLabel("Sport").selectOption("Baseball");
      await page.getByLabel("Position").selectOption("Pitcher");
      await page.getByRole("button", { name: "Add this sport" }).click();
      await expect(page).toHaveURL(new RegExp(`/athletes/${athleteId}$`));
      await page.locator('[data-metric="Fastball velocity"]').getByRole("link", { name: "Enter fastball velocity" }).click();
      await page.getByLabel("Fastball velocity (mph)").fill("79");
      await page.getByLabel("Date measured").fill("2026-10-02");
      await page.getByLabel("Who measured it").selectOption({ label: "A coach measured it" });
      await page.getByRole("button", { name: "Save this number" }).click();
      await expect(page.getByRole("status")).toHaveText("Saved. The fastball velocity ruler below shows the new number.");

      // Subscribe with the Stripe test card.
      await page.goto("/plan");
      await page.getByRole("link", { name: "See the price and subscribe" }).click();
      await page.getByLabel(/renews automatically at \$12 every month/).check();
      await page.getByRole("button", { name: "Continue to payment" }).click();
      await payWithTestCard(page);
      await expect(page).toHaveURL(new RegExp(`^${DEV_URL}/plan\\?checkout=done`), { timeout: 60_000 });
      await expect(page.getByRole("status")).toContainText("You're subscribed.");

      // The four questions, before the first plan.
      await page.getByRole("link", { name: "Answer the plan questions" }).click();
      await expect(page.getByRole("heading", { level: 1 })).toHaveText("Before Sam's first plan");
      await expect(page.getByTestId("draft-banner")).toHaveText(DRAFT_BANNER);
      await page.getByRole("button", { name: "Build Sam's plan" }).click();
      await expect(page.getByText("Choose yes or no for pain right now.")).toBeVisible();
      await page.getByRole("group", { name: /pain right now/ }).getByLabel("No").check();
      await page.getByRole("group", { name: /throwing shoulder or elbow/ }).getByLabel("No").check();
      await page.getByRole("group", { name: /a year of strength training/ }).getByLabel("No").check();
      await page.getByRole("group", { name: /in their season/ }).getByLabel("Off-season").check();
      await page.getByRole("button", { name: "Build Sam's plan" }).click();

      // The draft plan, with the banner at the very top and safety first.
      await expect(page).toHaveURL(new RegExp(`/plan/${athleteId}\\?answers=saved$`));
      const main = page.getByRole("main");
      await expect(page.getByTestId("draft-banner")).toHaveText(DRAFT_BANNER);
      await expect(main.locator("[data-testid=draft-banner] ~ h1, [data-testid=draft-banner] + h1")).toHaveText("Sam's training plan");
      const safety = page.getByTestId("safety-notes");
      await expect(safety.getByRole("listitem").first()).toHaveText(PAIN_LINE);
      await expect(safety).toContainText("No weighted-ball (overload) throwing in any plan.");
      await expect(page.getByTestId("plan")).toContainText("Throwing velocity.");
      await expect(page.getByTestId("week-table").getByRole("row")).toHaveCount(8);
      const firstDay = page.getByTestId("plan-day").first();
      await expect(firstDay.getByRole("heading", { level: 3 })).toHaveText("Monday: Strength A and throwing");
      await expect(firstDay).toContainText("Cue: Chest up, knees track over toes, full depth you can control.");

      // Mark a session done; it is saved per athlete.
      await expect(page.getByTestId("completed-count")).toContainText("0 of");
      await firstDay.getByLabel(/Mark this session done/).check();
      await expect(page.getByTestId("completed-count")).toContainText("1 of");
      await page.reload();
      await expect(page.getByTestId("plan-day").first().getByLabel(/Mark this session done/)).toBeChecked();
      const marks = await admin.from("plan_session_completions").select("week, day").eq("athlete_id", athleteId);
      expect(marks.data).toEqual([{ week: 1, day: 0 }]);

      // The answers can be changed from the plan page. Pain now means no plan.
      await page.getByRole("link", { name: "Change the answers" }).click();
      await page.getByRole("group", { name: /pain right now/ }).getByLabel("Yes").check();
      await page.getByRole("button", { name: "Save and update the plan" }).click();
      await expect(page.getByTestId("plan-stopped")).toHaveText("Get this checked by a doctor or athletic trainer before starting a training plan.");
      await expect(page.getByTestId("plan")).toHaveCount(0);
      const answers = await admin.from("plan_screen_answers").select("pain_now, answered_at").eq("athlete_id", athleteId).order("answered_at");
      expect(answers.data?.map((row) => row.pain_now)).toEqual([false, true]);
    } finally {
      await removeSignedUpParent(admin, email);
    }
  });
});

test("with an approved library: the plan shows without a banner, behind the paid gate, and asks for a retest in week 6", async ({ page, admin, newParent }) => {
  test.setTimeout(90_000);
  const removeApproved = await addApprovedLibrary(admin);
  try {
    const unpaid = await newParent("plans-unpaid");
    const unpaidAthlete = await ninthGradePitcher(admin, unpaid);
    await answerScreens(admin, unpaidAthlete);
    await signIn(page, unpaid.user);
    await page.goto(`/plan/${unpaidAthlete}`);
    await expect(page).toHaveURL(/\/plan$/);
    await expect(page.getByTestId("plan-not-subscribed")).toBeVisible();
    await page.context().clearCookies();

    const family = await newParent("plans-approved");
    const athleteId = await ninthGradePitcher(admin, family);
    await subscribe(admin, family);
    // First answered 35 days ago: always week 6 (the retest week), whatever weekday it was.
    await answerScreens(admin, athleteId, { throwing_arm_pain: false, answered_at: new Date(Date.now() - 35 * DAY_MS).toISOString() });
    await signIn(page, family.user);

    await page.goto("/plan");
    await page.getByRole("link", { name: "See Sam's plan" }).click();
    await expect(page.getByTestId("plan")).toBeVisible();
    await expect(page.getByTestId("draft-banner")).toHaveCount(0);
    await expect(page.getByTestId("safety-notes")).toContainText("Extra caution for younger throwers");
    await expect(page.getByRole("heading", { name: "Week 6 of 6" })).toBeVisible();

    const retest = page.getByTestId("retest-prompt");
    await expect(retest).toContainText("Retest the target stat at the end of week 6");
    await retest.getByRole("link", { name: "Log a new fastball velocity" }).click();
    await expect(page).toHaveURL(new RegExp(`/athletes/${athleteId}/stats/new\\?sport=.+&metric=Fastball`));
    await expect(page.getByLabel("Fastball velocity (mph)")).toBeVisible();

    // The arm-pain answer removes every throwing item.
    await answerScreens(admin, athleteId, { throwing_arm_pain: true });
    await page.goto(`/plan/${athleteId}?week=1`);
    await expect(page.getByTestId("plan-messages")).toContainText("Have the arm checked by a doctor or athletic trainer before adding throwing.");
    await expect(page.getByTestId("plan")).not.toContainText("Interval throwing program");
  } finally {
    await removeApproved();
  }
});

test("an answer saved at 8 pm Eastern shows that day's date for an Eastern family, and the next day's for a UTC family", async ({ page, admin, newParent }) => {
  test.setTimeout(90_000);
  const removeApproved = await addApprovedLibrary(admin);
  try {
    const family = await newParent("plans-8pm");
    const athleteId = await ninthGradePitcher(admin, family);
    await subscribe(admin, family);
    // Tuesday Nov 24, 2026, 8 pm Eastern = Wednesday Nov 25, 1 am UTC.
    await answerScreens(admin, athleteId, { throwing_arm_pain: false, answered_at: "2026-11-25T01:00:00Z" });
    await signIn(page, family.user);

    // Families made before time zones were stored are on Eastern time.
    expect((await admin.from("families").select("timezone").eq("id", family.familyId).single()).data?.timezone).toBe("America/New_York");
    await page.goto(`/plan/${athleteId}`);
    await expect(page.getByText(/^Answers from /)).toContainText("Answers from Nov 24, 2026.");

    await admin.from("families").update({ timezone: "UTC" }).eq("id", family.familyId);
    await page.reload();
    await expect(page.getByText(/^Answers from /)).toContainText("Answers from Nov 25, 2026.");
  } finally {
    await removeApproved();
  }
});

async function familyTimeZoneFor(admin: Client, email: string): Promise<string | null> {
  const users = await admin.auth.admin.listUsers({ perPage: 200 });
  const user = users.data?.users.find((candidate) => candidate.email === email);
  if (!user) return null;
  const guardian = await admin.from("guardians").select("family_id").eq("user_id", user.id).single();
  const family = await admin.from("families").select("timezone").eq("id", guardian.data?.family_id ?? "").single();
  return family.data?.timezone ?? null;
}

/** Deletes a parent made through the real sign-up form, and cancels their Stripe test subscription. */
async function removeSignedUpParent(admin: Client, email: string) {
  const users = await admin.auth.admin.listUsers({ perPage: 200 });
  const user = users.data?.users.find((candidate) => candidate.email === email);
  if (!user) return;
  const guardian = await admin.from("guardians").select("family_id").eq("user_id", user.id).maybeSingle();
  const subscription = guardian.data
    ? await admin.from("subscriptions").select("stripe_subscription_id").eq("family_id", guardian.data.family_id).maybeSingle()
    : null;
  const stripeSubscription = subscription?.data?.stripe_subscription_id;
  if (stripeSubscription && hasStripeTestKey()) {
    await new Stripe(process.env.STRIPE_SECRET_KEY as string).subscriptions.cancel(stripeSubscription).catch(() => undefined);
  }
  // Deleting the parent's login also deletes their family (see the guardians trigger).
  await admin.auth.admin.deleteUser(user.id);
}
