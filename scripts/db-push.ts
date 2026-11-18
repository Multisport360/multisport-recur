/**
 * Applies supabase/migrations to the project's database with the Supabase CLI.
 *
 *   npm run db:push
 *
 * Needs SUPABASE_DB_URL in .env.local: Supabase dashboard -> Connect -> Session pooler,
 * with your database password filled in.
 */
import { spawnSync } from "node:child_process";

const dbUrl = process.env.SUPABASE_DB_URL?.trim();
if (!dbUrl) {
  console.error(
    "SUPABASE_DB_URL is not set in .env.local.\n" +
      "Get it from the Supabase dashboard: Connect -> Session pooler -> copy the URI and put your database password in it.\n" +
      "Then add a line to .env.local:  SUPABASE_DB_URL=postgresql://...",
  );
  process.exit(1);
}

const result = spawnSync("npx", ["--yes", "supabase@latest", "db", "push", `--remote=${dbUrl}`, ...process.argv.slice(2)], {
  stdio: "inherit",
});
process.exit(result.status ?? 1);
