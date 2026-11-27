import { test, type Page } from "@playwright/test";
import { expectNoAxeViolations } from "./support/axe";

/** axe accessibility check on every public page, at phone and desktop width. */

const PAGES = ["/", "/signup", "/signup/check-email", "/login", "/login?problem=link", "/login/reset", "/login/reset?sent=1", "/no-such-page"];

for (const path of PAGES) {
  test(`no accessibility problems on ${path}`, async ({ page }) => {
    await page.goto(path);
    await expectNoAxeViolations(page);
  });
}

async function pick(page: Page, label: string, option: string) {
  await page.getByLabel(label, { exact: true }).selectOption({ label: option });
}

test("no accessibility problems on the home page with a range ruler, an error and an open score card", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("figure").first().waitFor();
  await page.locator("summary").first().click();
  await expectNoAxeViolations(page);

  await pick(page, "Sport", "Football");
  await pick(page, "Position", "QB");
  await pick(page, "What was measured", "Height");
  await page.getByLabel("Height (feet and inches)").fill("6'1");
  await expectNoAxeViolations(page);

  await page.getByLabel("Height (feet and inches)").fill("tall");
  await expectNoAxeViolations(page);
});

test("no accessibility problems on forms showing their errors", async ({ page }) => {
  await page.goto("/signup");
  await page.getByRole("button", { name: "Create my account" }).click();
  await page.getByText("Use at least 8 characters for the password.").waitFor();
  await expectNoAxeViolations(page);
});
