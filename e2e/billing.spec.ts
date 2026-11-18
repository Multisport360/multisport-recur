import type { Page } from "@playwright/test";
import { addAthleteAsAdmin, type Client } from "../tests/db/helpers";
import { expect, signIn, test, THIS_YEAR, type E2eFamily } from "./support/accounts";

/**
 * M6: the paid training plan. Runs against the real database. Stripe calls only happen
 * when STRIPE_SECRET_KEY is set; without it the pages must say payments are off.
 */

const HAS_STRIPE_KEY = Boolean(process.env.STRIPE_SECRET_KEY?.trim());
const ONE_MONTH_MS = 30 * 24 * 60 * 60 * 1000;

/** Gives a family an active subscription directly in the database (no Stripe involved). */
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

async function athleteWithSport(admin: Client, family: E2eFamily, sport: string, position: string, birthYear = THIS_YEAR - 15) {
  const { athleteId } = await addAthleteAsAdmin(admin, family, "Sam", birthYear);
  const added = await admin.from("athlete_sports").insert({ athlete_id: athleteId, sport, position_or_event: position });
  if (added.error) throw new Error(`could not add sport: ${added.error.message}`);
  return athleteId;
}

async function openSubscribe(page: Page, family: E2eFamily) {
  await signIn(page, family.user);
  await page.goto("/plan");
  await page.getByRole("link", { name: "See the price and subscribe" }).click();
  await expect(page).toHaveURL(/\/plan\/subscribe$/);
}

test("before checkout: price, renewal, next charge date and how to cancel are all shown", async ({ page, newParent }) => {
  await openSubscribe(page, await newParent("billing-terms"));
  const terms = page.getByTestId("billing-terms");

  await expect(terms).toContainText("Price$12 a month");
  await expect(terms).toContainText("It renews every month until you cancel.");
  await expect(terms).toContainText("You pay $12 today.");
  await expect(terms).toContainText(/Your next charge is \$12 on [A-Z][a-z]+ \d{1,2}, \d{4}\./);
  await expect(terms).toContainText("Cancel any time from your Account page in two clicks.");
  await expect(page.getByText("We never make up a plan to fill the gap.")).toBeVisible();
});

test("the renewal-terms box must be ticked before going to payment", async ({ page, admin, newParent }) => {
  const family = await newParent("billing-checkbox");
  await openSubscribe(page, family);

  await page.getByRole("button", { name: "Continue to payment" }).click();
  await expect(page.getByText("Tick the box to agree to the renewal terms before you continue.")).toBeVisible();
  await expect(page).toHaveURL(/\/plan\/subscribe$/);
  expect((await admin.from("subscriptions").select("id").eq("family_id", family.familyId)).data).toEqual([]);
});

test("after agreeing, the parent goes to Stripe Checkout, or is told payments are off", async ({ page, admin, newParent }) => {
  const family = await newParent("billing-checkout");
  await openSubscribe(page, family);
  await page.getByLabel(/renews automatically at \$12 every month/).check();
  await page.getByRole("button", { name: "Continue to payment" }).click();

  if (HAS_STRIPE_KEY) {
    await expect(page).toHaveURL(/^https:\/\/checkout\.stripe\.com\//, { timeout: 20_000 });
    const row = await admin.from("subscriptions").select("status, stripe_customer_id").eq("family_id", family.familyId).single();
    expect(row.data?.status).toBe("incomplete");
    expect(row.data?.stripe_customer_id).toMatch(/^cus_/);
  } else {
    await expect(page.getByRole("main").getByRole("alert")).toHaveText(
      "Payments aren't switched on yet, so you can't subscribe right now. Nothing was charged.",
    );
  }
});

test("a subscriber with no coach-reviewed template sees 'your plan is coming', never a made-up plan", async ({ page, admin, newParent }) => {
  const family = await newParent("billing-coming");
  await athleteWithSport(admin, family, "Track & Field", "100m");
  await subscribe(admin, family);
  await signIn(page, family.user);

  await page.goto("/plan");
  await expect(page.getByTestId("plan-coming")).toContainText("Your plan is coming.");
  await expect(page.getByTestId("plan-template")).toHaveCount(0);
});

test("a published template is shown as written, with safety notes and extra throwing caution for younger athletes", async ({ page, admin, newParent }) => {
  const family = await newParent("billing-template");
  const athleteId = await athleteWithSport(admin, family, "Baseball", "Pitcher", THIS_YEAR - 15);
  // 9th grade this school year (younger than 11th), so the extra throwing caution applies.
  const ninthGradeClass = new Date().getMonth() >= 7 ? THIS_YEAR + 4 : THIS_YEAR + 3;
  await admin.from("athletes").update({ grad_year: ninthGradeClass }).eq("id", athleteId);
  await subscribe(admin, family);
  const template = await admin
    .from("plan_templates")
    .insert({
      sport: "Baseball",
      position_or_event: "Pitcher",
      metric: "Fastball velocity",
      title: "E2E test plan: velocity base",
      body: [{ heading: "Week 1", items: ["E2E item one"] }],
      safety_notes: "E2E safety note.",
      reviewed_by: "E2E coach",
      reviewed_at: new Date().toISOString(),
      is_published: true,
    })
    .select("id")
    .single();
  if (template.error) throw new Error(template.error.message);

  try {
    await signIn(page, family.user);
    await page.goto("/plan");
    const plan = page.getByTestId("plan-template");
    await expect(plan).toContainText("E2E test plan: velocity base");
    await expect(plan).toContainText("E2E item one");
    await expect(plan.getByTestId("safety-notes")).toContainText("E2E safety note.");
    await expect(plan.getByTestId("safety-notes")).toContainText("Extra caution for younger throwers");
    // The AI tips flag is off by default, so no tips are shown.
    await expect(plan.getByText("Tips are worded by AI")).toHaveCount(0);
  } finally {
    await admin.from("plan_templates").delete().eq("id", template.data.id);
  }
});

test("cancel is two clicks from the account page", async ({ page, admin, newParent }) => {
  const family = await newParent("billing-cancel");
  await subscribe(admin, family);
  await signIn(page, family.user);
  await page.goto("/account");

  const billing = page.getByTestId("billing");
  await expect(billing).toContainText("Subscribed: $12 a month. Renews on");
  await billing.getByText("Cancel my training plan", { exact: true }).click(); // click 1
  await billing.getByRole("button", { name: "Yes, cancel my training plan" }).click(); // click 2

  if (HAS_STRIPE_KEY) {
    // The test subscription id is not a real Stripe subscription, so Stripe refuses it.
    await expect(page.getByRole("main").getByRole("alert")).toContainText("the plan is not cancelled yet");
  } else {
    await expect(page.getByRole("main").getByRole("alert")).toContainText("Payments aren't switched on yet");
  }
});

test("a family without a subscription is offered the plan, and the gap report stays free", async ({ page, newParent }) => {
  const family = await newParent("billing-none");
  await signIn(page, family.user);
  await page.goto("/plan");
  await expect(page.getByTestId("plan-not-subscribed")).toContainText("paid add-on to the free gap report");
  await page.goto("/account");
  await expect(page.getByTestId("billing")).toContainText("Not subscribed. The gap report is free.");
});
