import { expect, test } from "vitest";
import { demoModeEnabled } from "./config";

test("the demo is on only when DEMO_MODE is exactly 'true'", () => {
  expect(demoModeEnabled({ DEMO_MODE: "true" })).toBe(true);
  expect(demoModeEnabled({ DEMO_MODE: "true", VERCEL_ENV: "preview" })).toBe(true);
  expect(demoModeEnabled({})).toBe(false);
  expect(demoModeEnabled({ DEMO_MODE: "TRUE" })).toBe(false);
  expect(demoModeEnabled({ DEMO_MODE: "1" })).toBe(false);
});

test("Vercel production never runs the demo, even with DEMO_MODE=true set by mistake", () => {
  expect(demoModeEnabled({ DEMO_MODE: "true", VERCEL_ENV: "production" })).toBe(false);
});
