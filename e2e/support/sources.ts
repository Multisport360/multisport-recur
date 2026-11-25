import { readFileSync } from "node:fs";
import path from "node:path";
import { expect, type Page } from "@playwright/test";
import { parseBenchmarkCsv } from "../../src/lib/benchmarks/csv";

/**
 * Benchmark sources are stored in the sources table but are not shown in the app (CLAUDE.md).
 * Every source in data/benchmarks.csv is checked, so a new source is covered automatically.
 */
const SOURCES = parseBenchmarkCsv(readFileSync(path.resolve(import.meta.dirname, "../../data/benchmarks.csv"), "utf8")).sources;

/** Fails if any source link, source name or "Source:" line is on the page's main content. */
export async function expectNoSources(page: Page): Promise<void> {
  const main = page.getByRole("main");
  for (const source of SOURCES) {
    await expect(main.locator(`a[href="${source.url}"]`), `link to ${source.id}`).toHaveCount(0);
    await expect(main.getByText(source.name, { exact: false }), `name of ${source.id}`).toHaveCount(0);
  }
  await expect(main.getByText(/^Source( for each level)?\b/)).toHaveCount(0);
  await expect(main.getByText("opens in a new tab")).toHaveCount(0);
}
