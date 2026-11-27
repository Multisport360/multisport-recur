/**
 * Demo mode: a clickable demo with a made-up family at /demo, for showing the app to coaches and parents.
 *
 * On only when DEMO_MODE=true, and never on Vercel's production environment, even if DEMO_MODE is set
 * there by mistake. Everywhere else /demo and its manifest and icons return 404.
 */

type DemoEnv = { DEMO_MODE?: string; VERCEL_ENV?: string };

export function demoModeEnabled(env: DemoEnv = { DEMO_MODE: process.env.DEMO_MODE, VERCEL_ENV: process.env.VERCEL_ENV }): boolean {
  return env.DEMO_MODE === "true" && env.VERCEL_ENV !== "production";
}
