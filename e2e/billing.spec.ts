import type { Page } from "@playwright/test";
import type { Client } from "../tests/db/helpers";
import { expect, signIn, test, type E2eFamily } from "./support/accounts";

/**
 * M6: the paid training plan's billing. Runs against the real database. What a subscriber sees
 * on the plan page is in plans.spec.ts. Stripe calls only happen
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
