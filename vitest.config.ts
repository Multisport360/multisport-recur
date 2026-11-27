import path from "node:path";
import { defineConfig } from "vitest/config";

// Unit tests: pure functions and server-rendered components. No database, no network.
// Tests that need the real Supabase project live in tests/db and run with `npm run test:db`.
export default defineConfig({
  resolve: {
    alias: { "@": path.resolve(import.meta.dirname, "src") },
  },
  test: {
    environment: "node",
    include: ["src/**/*.test.{ts,tsx}", "scripts/**/*.test.ts"],
  },
});
