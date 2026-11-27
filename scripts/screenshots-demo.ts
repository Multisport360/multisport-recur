/**
 * Screenshots of every demo screen at 390px (full page, plus the screen as a phone shows it),
 * and the phone frame a laptop sees at 1280px. Needs a server with the demo on:
 *
 *   npm run build && DEMO_MODE=true npm run start -- -p 3104   (in one terminal)
 *   npm run screenshots:demo -- http://localhost:3104           (in another)
 *
 * No database or accounts: the demo has none. Pictures go to screenshots/demo/ (not committed).
 */
import { mkdirSync } from "node:fs";
import path from "node:path";
import { chromium, type Page } from "@playwright/test";

const BASE = (process.argv[2] ?? "http://localhost:3104").replace(/\/$/, "");
const OUT = path.resolve(import.meta.dirname, "../screenshots/demo");
const SETTLE_MS = 900;

type Shot = { name: string; path: string; prepare?: (page: Page) => Promise<void> };

const SHOTS: Shot[] = [
  { name: "report", path: "/demo" },
  { name: "add-stats", path: "/demo/stats" },
  { name: "add-stats-football", path: "/demo/stats?sport=demo-football-wr&metric=40-yard%20dash" },
  {
    name: "add-stats-errors",
    path: "/demo/stats",
    prepare: async (page) => {
      await page.getByRole("button", { name: "Save this number" }).click();
    },
  },
  {
    name: "report-after-save",
    path: "/demo/stats?sport=demo-baseball-pitcher&metric=Fastball%20velocity",
    prepare: async (page) => {
      await page.getByLabel("Fastball velocity (mph)").fill("84");
      await page.getByLabel("Who measured it").selectOption({ label: "A coach measured it" });
      await page.getByRole("button", { name: "Save this number" }).click();
      await page.waitForURL(/\/demo\?saved=/);
    },
  },
  { name: "plan", path: "/demo/plan" },
  { name: "plan-week-1", path: "/demo/plan?week=1" },
  { name: "account", path: "/demo/account" },
  {
    name: "account-cancel-note",
    path: "/demo/account",
    prepare: async (page) => {
      await page.getByText("Cancel my training plan", { exact: true }).click();
      await page.getByRole("button", { name: "Yes, cancel my training plan" }).click();
    },
  },
  { name: "subscribe", path: "/demo/subscribe" },
  {
    name: "subscribe-note",
    path: "/demo/subscribe",
    prepare: async (page) => {
      await page.getByRole("checkbox").check();
      await page.getByRole("button", { name: "Continue to payment" }).click();
    },
  },
];

async function main() {
  mkdirSync(OUT, { recursive: true });
  const browser = await chromium.launch();
  try {
    const phone = await browser.newPage({ viewport: { width: 390, height: 844 } });
    for (const shot of SHOTS) {
      await phone.goto(BASE + shot.path, { waitUntil: "load" });
      await phone.waitForTimeout(SETTLE_MS);
      if (shot.prepare) {
        await shot.prepare(phone);
        await phone.waitForTimeout(SETTLE_MS);
      }
      // What the phone shows (bar, screen, tab bar), then the whole screen's content scrolled out.
      await phone.screenshot({ path: path.join(OUT, `${shot.name}-phone.png`) });
      const main = phone.locator("main");
      const height = await main.evaluate((element) => element.scrollHeight);
      await phone.setViewportSize({ width: 390, height: Math.max(844, height + 200) });
      await phone.waitForTimeout(200);
      await phone.screenshot({ path: path.join(OUT, `${shot.name}-phone-full.png`) });
      await phone.setViewportSize({ width: 390, height: 844 });
      console.log(path.join(OUT, `${shot.name}-phone.png`));
    }
    await phone.close();

    const laptop = await browser.newPage({ viewport: { width: 1280, height: 960 } });
    for (const [name, route] of [
      ["framed-report", "/demo"],
      ["framed-plan", "/demo/plan"],
    ] as const) {
      await laptop.goto(BASE + route, { waitUntil: "load" });
      await laptop.waitForTimeout(SETTLE_MS * 2);
      await laptop.screenshot({ path: path.join(OUT, `${name}-desktop.png`) });
      console.log(path.join(OUT, `${name}-desktop.png`));
    }
    await laptop.close();

    // The home-screen icons, saved as files to look at.
    const icons = await browser.newPage();
    for (const icon of ["icon-512.png", "maskable-512.png", "apple-touch-icon.png"]) {
      const response = await icons.goto(`${BASE}/demo/icons/${icon}`);
      if (!response?.ok()) throw new Error(`${icon}: ${response?.status()}`);
      const { writeFileSync } = await import("node:fs");
      writeFileSync(path.join(OUT, `icon-${icon}`), await response.body());
    }
    await icons.close();
  } finally {
    await browser.close();
  }
}

await main();
