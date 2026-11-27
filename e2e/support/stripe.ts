import { expect, type Page } from "@playwright/test";

/**
 * Paying on Stripe's hosted Checkout page with the test card 4242 4242 4242 4242.
 * Only ever used with a test-mode key (sk_test_...): Stripe refuses test cards in live mode.
 */

export const TEST_CARD = { number: "4242 4242 4242 4242", expiry: "12 / 34", cvc: "123", name: "E2E Parent", zip: "22939" } as const;

const STRIPE_TIMEOUT = 30_000;

export function hasStripeTestKey(): boolean {
  return /^sk_test_/.test(process.env.STRIPE_SECRET_KEY?.trim() ?? "");
}

/**
 * Stripe's hosted Checkout page draws its form inside an iframe, with labelled fields
 * (checked by hand against the live test-mode page in Nov 2026). If Stripe changes the page,
 * this is the one place to update.
 */
export async function payWithTestCard(page: Page): Promise<void> {
  await expect(page).toHaveURL(/^https:\/\/checkout\.stripe\.com\//, { timeout: STRIPE_TIMEOUT });
  const form = page.frameLocator("iframe").first();
  const field = (name: string) => form.getByRole("textbox", { name, exact: true });

  const card = form.getByRole("button", { name: "Card", exact: true });
  await expect(card).toBeVisible({ timeout: STRIPE_TIMEOUT });
  if ((await card.getAttribute("aria-expanded")) !== "true") await card.click();

  await field("Card number").fill(TEST_CARD.number);
  await field("Expiration (MM/YY)").fill(TEST_CARD.expiry);
  await field("Security code").fill(TEST_CARD.cvc);
  await field("Name on card").fill(TEST_CARD.name);
  await form.getByRole("combobox", { name: "Country", exact: true }).selectOption({ label: "United States" });
  const zip = form.getByRole("textbox", { name: /ZIP/ });
  if (await zip.isVisible()) await zip.fill(TEST_CARD.zip);

  // Stripe ticks "Save my information" (Link) by default, which then asks for a phone number.
  const saveInfo = form.getByRole("checkbox", { name: "Save my information for faster checkout" });
  if ((await saveInfo.isVisible()) && (await saveInfo.isChecked())) await saveInfo.uncheck();

  await form.getByRole("button", { name: "Subscribe", exact: true }).click();
}
