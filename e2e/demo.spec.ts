import type { Page } from "@playwright/test";
import { expect, signIn, test } from "./support/accounts";
import { expectNoAxeViolations } from "./support/axe";

/**
 * The clickable demo at /demo. It runs on the production build with DEMO_MODE=true (port 3104),
 * like the Vercel rebuild preview. The main server has no DEMO_MODE, so there /demo is a 404.
 */

const DEMO_URL = `http://localhost:${process.env.E2E_DEMO_PORT ?? "3104"}`;
/** Hosts the demo must never reach from the browser. */
const OUTSIDE_SERVICES = /supabase\.co|stripe\.com|stripe\.network|resend\.com|anthropic\.com/;

/** Records every browser request to an outside service. */
function watchOutsideRequests(page: Page): string[] {
  const seen: string[] = [];
  page.on("request", (request) => {
    if (OUTSIDE_SERVICES.test(request.url())) seen.push(request.url());
  });
  return seen;
}

function fastballRuler(page: Page) {
  return page.getByTestId("gap-ruler").filter({ has: page.getByTestId("ruler-chip").filter({ hasText: "mph" }) });
}

async function markerPosition(page: Page): Promise<number> {
  const value = await fastballRuler(page).getByTestId("ruler-marker").evaluate((element) => getComputedStyle(element).getPropertyValue("--marker-x"));
  return Number(value);
}

test.describe("on a phone (390px)", () => {
  test.use({ baseURL: DEMO_URL, viewport: { width: 390, height: 844 } });

  test("walk the demo: report, add a number and see the ruler move, plan with banners, account, restart", async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== "phone", "The phone walkthrough runs in the 390px project.");
    const outside = watchOutsideRequests(page);

    // Open /demo: the gap report, the demo bar and the tab bar. No sign-in.
    await page.goto("/demo");
    await expect(page.getByRole("heading", { level: 1 })).toHaveText("Jordan's gap report");
    await expect(page.getByTestId("demo-bar")).toContainText("Demo, sample data");
    await expect(page.getByTestId("demo-stage")).toBeHidden();
    const tabs = page.getByRole("navigation", { name: "Demo screens" });
    await expect(tabs.getByRole("link")).toHaveText(["Report", "Add stats", "Plan", "Account"]);
    for (const tab of await tabs.getByRole("link").all()) expect((await tab.boundingBox())?.height).toBeGreaterThanOrEqual(44);
    await expect(tabs.getByRole("link", { name: "Report" })).toHaveAttribute("aria-current", "page");
    await expect(fastballRuler(page).getByTestId("ruler-chip")).toHaveText("81 mph");
    const before = await markerPosition(page);

    // Tabs change without a full page load: this mark on the window would be lost by one.
    await page.evaluate(() => Object.assign(window, { demoNoReload: true }));

    // Add stats: the app's form, saving in the browser.
    await tabs.getByRole("link", { name: "Add stats" }).click();
    await expect(page.getByRole("heading", { level: 1 })).toHaveText("Enter a number");
    await page.getByLabel("What was measured").selectOption("Fastball velocity");
    await page.getByLabel("Fastball velocity (mph)").fill("84");
    await page.getByLabel("Who measured it").selectOption({ label: "A coach measured it" });
    await page.getByRole("button", { name: "Save this number" }).click();

    // Back on the report, the marker has moved to the new number.
    await expect(page).toHaveURL(/\/demo\?saved=Fastball%20velocity$/);
    await expect(page.getByRole("status")).toHaveText("Saved. The fastball velocity ruler below shows the new number.");
    await expect(fastballRuler(page).getByTestId("ruler-chip")).toHaveText("84 mph");
    await expect(fastballRuler(page).getByTestId("ruler-result")).toContainText("D1 range");
    expect(await markerPosition(page)).toBeGreaterThan(before);

    // The plan: the demo banner and the draft banner, built from the draft templates.
    await tabs.getByRole("link", { name: "Plan" }).click();
    await expect(page.getByTestId("demo-athlete-banner")).toHaveText("Demo, sample athlete");
    await expect(page.getByTestId("draft-banner")).toContainText("Sample plan, not coach-reviewed");
    await expect(page.getByRole("heading", { level: 1 })).toHaveText("Jordan's training plan");
    await expect(page.getByTestId("completed-count")).toContainText("0 of");
    await page.getByTestId("plan-day").first().getByLabel(/Mark this session done/).check();
    await expect(page.getByTestId("completed-count")).toContainText("1 of");

    // Account: marked as a demo; cancelling and checkout only show a note.
    await tabs.getByRole("link", { name: "Account" }).click();
    await expect(page.getByTestId("billing")).toContainText("Demo.");
    await page.getByText("Cancel my training plan", { exact: true }).click();
    await page.getByRole("button", { name: "Yes, cancel my training plan" }).click();
    await expect(page.getByTestId("demo-payments-note")).toContainText("Payments are skipped in the demo");
    await page.getByRole("link", { name: "See what checkout shows before paying" }).click();
    await expect(page.getByTestId("billing-terms")).toContainText("How to cancel");
    await page.getByRole("checkbox").check();
    await page.getByRole("button", { name: "Continue to payment" }).click();
    await expect(page.locator("main").getByRole("alert")).toHaveText("Payments are skipped in the demo. In the app, this button opens Stripe's secure checkout.");
    expect(await page.evaluate(() => "demoNoReload" in window)).toBe(true);

    // Restart demo: everything back to the sample family.
    await page.getByTestId("demo-bar").getByRole("button", { name: "Restart demo" }).click();
    await expect(page).toHaveURL(/\/demo$/);
    await expect(fastballRuler(page).getByTestId("ruler-chip")).toHaveText("81 mph");
    await tabs.getByRole("link", { name: "Plan" }).click();
    await expect(page.getByTestId("completed-count")).toContainText("0 of");

    // A reload starts over too.
    await page.goto("/demo/stats?sport=demo-baseball-pitcher&metric=Fastball%20velocity");
    await page.getByLabel("Fastball velocity (mph)").fill("86");
    await page.getByLabel("Who measured it").selectOption({ label: "A coach measured it" });
    await page.getByRole("button", { name: "Save this number" }).click();
    await expect(fastballRuler(page).getByTestId("ruler-chip")).toHaveText("86 mph");
    await page.reload();
    await expect(fastballRuler(page).getByTestId("ruler-chip")).toHaveText("81 mph");

    expect(outside).toEqual([]);
  });

  test("every demo screen passes the axe accessibility checks", async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== "phone", "Runs in the 390px project.");
    for (const path of ["/demo", "/demo/stats", "/demo/plan", "/demo/account", "/demo/subscribe"]) {
      await page.goto(path);
      await expect(page.getByTestId("demo-bar")).toBeVisible();
      await expectNoAxeViolations(page);
    }
  });
});

test.describe("on a laptop (1280px)", () => {
  test.use({ baseURL: DEMO_URL, viewport: { width: 1280, height: 960 } });

  test("shows the demo inside a 390 x 844 phone frame, with the line beside it", async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== "desktop", "The framed view runs in the 1280px project.");
    await page.goto("/demo");
    const frame = page.getByTestId("demo-phone-frame");
    await expect(frame).toBeVisible();
    const box = await frame.boundingBox();
    // 390 x 844 inside a 2px border.
    expect(box?.width).toBe(394);
    expect(box?.height).toBe(848);
    await expect(page.getByText("Tap through it like the phone app.")).toBeVisible();
    // The full-width app is hidden; the frame shows the same pages at phone width.
    await expect(page.locator(".demo-app")).toBeHidden();
    const phone = page.frameLocator("iframe[title='Multi-Sport Recur demo']");
    await expect(phone.getByRole("heading", { level: 1 })).toHaveText("Jordan's gap report");
    await expect(phone.getByRole("navigation", { name: "Demo screens" })).toBeVisible();
    expect(await phone.locator("body").evaluate(() => window.innerWidth)).toBe(390);
    await phone.getByRole("link", { name: "Plan" }).click();
    await expect(phone.getByTestId("demo-athlete-banner")).toBeVisible();
  });
});

test.describe("add to home screen", () => {
  test.use({ baseURL: DEMO_URL });

  test("the manifest opens /demo standalone in track-blue, and its icons are PNGs", async ({ page, request }, testInfo) => {
    test.skip(testInfo.project.name !== "desktop", "Same at every width: runs once.");
    await page.goto("/demo");
    await expect(page.locator("link[rel=manifest]")).toHaveAttribute("href", "/demo/manifest.webmanifest");
    await expect(page.locator("link[rel=apple-touch-icon]")).toHaveAttribute("href", "/demo/icons/apple-touch-icon.png");
    const manifest = await (await request.get("/demo/manifest.webmanifest")).json();
    expect(manifest).toMatchObject({ name: "Multi-Sport Recur", start_url: "/demo", display: "standalone", theme_color: "#1F4E9C" });
    for (const icon of [...manifest.icons.map((entry: { src: string }) => entry.src), "/demo/icons/apple-touch-icon.png"]) {
      const response = await request.get(icon);
      expect(response.status(), icon).toBe(200);
      expect(response.headers()["content-type"], icon).toBe("image/png");
    }
  });
});

test.describe("a signed-in parent", () => {
  test.use({ baseURL: DEMO_URL });

  test("who opens /demo sees only the sample family, never their own", async ({ page, newParent }, testInfo) => {
    test.skip(testInfo.project.name === "phone", "Signs a real test user in: runs once, on desktop.");
    const family = await newParent("demo-signed-in");
    await signIn(page, family.user);
    await page.goto("/demo/account");
    const phone = page.frameLocator("iframe[title='Multi-Sport Recur demo']");
    await expect(phone.getByText("Signed in as Demo Parent")).toBeVisible();
    await expect(phone.locator("body")).not.toContainText(family.user.email);
    await phone.getByRole("link", { name: "Report" }).click();
    await expect(phone.getByRole("heading", { level: 1 })).toHaveText("Jordan's gap report");
  });
});

test("without DEMO_MODE (production), /demo and its manifest and icons are 404", async ({ page, request }, testInfo) => {
  test.skip(testInfo.project.name !== "desktop", "Same at every width: runs once.");
  for (const path of ["/demo", "/demo/stats", "/demo/plan", "/demo/account", "/demo/subscribe", "/demo/manifest.webmanifest", "/demo/icons/icon-512.png"]) {
    expect((await request.get(path)).status(), path).toBe(404);
  }
  await page.goto("/demo");
  await expect(page.getByTestId("demo-bar")).toHaveCount(0);
  await expect(page.getByText("Jordan")).toHaveCount(0);
});
