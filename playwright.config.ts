import { defineConfig, devices } from "@playwright/test";

// Tests that create accounts need the Supabase keys from .env.local.
try {
  process.loadEnvFile(".env.local");
} catch {
  // No .env.local: tests that need the database will say which key is missing.
}

const PORT = 3100;
// Set E2E_BASE_URL to test a server that is already running (for example a Vercel preview).
const EXTERNAL_URL = process.env.E2E_BASE_URL;
const BASE_URL = EXTERNAL_URL ?? `http://localhost:${PORT}`;

// End-to-end tests run against a production build so they see what a visitor sees.
export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  forbidOnly: Boolean(process.env.CI),
  retries: 0,
  reporter: [["list"]],
  use: {
    baseURL: BASE_URL,
    trace: "retain-on-failure",
  },
  projects: [
    { name: "desktop", use: { ...devices["Desktop Chrome"], viewport: { width: 1280, height: 800 } } },
    {
      name: "phone",
      use: { ...devices["Desktop Chrome"], viewport: { width: 390, height: 844 } },
      // These sign real test users in and out through Supabase Auth, which limits sign-ins
      // per IP. The server logic is the same at every width, so they run once, on desktop.
      // Phone layout of the signed-in pages is checked by the screenshot and axe review.
      testIgnore: /(auth|billing|family|report|sends-email)\.spec\.ts/,
    },
  ],
  webServer: EXTERNAL_URL
    ? undefined
    : {
        command: `npm run build && npm run start -- -p ${PORT}`,
        url: BASE_URL,
        reuseExistingServer: !process.env.CI,
        timeout: 180_000,
      },
});
