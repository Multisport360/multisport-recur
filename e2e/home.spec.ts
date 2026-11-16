import { expect, test } from "@playwright/test";

test("home page loads with the headline in the display font", async ({ page }) => {
  await page.goto("/");

  const headline = page.getByRole("heading", { level: 1 });
  await expect(headline).toHaveText("Find out what college level your numbers reach.");

  const fontFamily = await headline.evaluate((el) => getComputedStyle(el).fontFamily);
  expect(fontFamily).toContain("Big Shoulders");

  const bodyFont = await page.evaluate(() => getComputedStyle(document.body).fontFamily);
  expect(bodyFont).toContain("Atkinson Hyperlegible Next");

  const numerals = await page.evaluate(() => getComputedStyle(document.body).fontVariantNumeric);
  expect(numerals).toContain("tabular-nums");
});
