import path from "node:path";
import { defineConfig } from "vitest/config";

// Database tests talk to the real Supabase project named in .env.local.
// They need the migrations applied first. Run with: npm run test:db
export default defineConfig({
  resolve: {
    alias: { "@": path.resolve(import.meta.dirname, "src") },
  },
  test: {
    environment: "node",
    include: ["tests/db/**/*.test.ts"],
    fileParallelism: false,
    testTimeout: 30_000,
    hookTimeout: 60_000,
  },
});
