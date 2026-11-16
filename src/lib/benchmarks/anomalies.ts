import { sourceIds, type BenchmarkSet } from "./sets.ts";

/**
 * Finds benchmark rows that look wrong so a person can check them against the source.
 * It only reports. It never changes or hides a number.
 */
export function findAnomalies(sets: readonly BenchmarkSet[]): string[] {
  const found: string[] = [];

  for (const set of sets) {
    const where = `${set.sport} / ${set.positionOrEvent} / ${set.gender} / ${set.metric} [${sourceIds(set)}]`;

    if (set.better === "range") continue;
    const isEasier = (a: number, b: number) => (set.better === "higher" ? a < b : a > b);

    // set.levels is highest level first. A higher level should not have an easier or equal entry number.
    for (let high = 0; high < set.levels.length; high += 1) {
      for (let low = high + 1; low < set.levels.length; low += 1) {
        const higher = set.levels[high];
        const lower = set.levels[low];
        if (!higher || !lower) continue;
        if (isEasier(higher.entry, lower.entry)) {
          found.push(
            `${where}: ${higher.label} entry (${higher.entry} ${set.unit}) is easier than ${lower.label} entry (${lower.entry} ${set.unit})`,
          );
        } else if (higher.entry === lower.entry) {
          found.push(`${where}: ${higher.label} and ${lower.label} share the same entry (${higher.entry} ${set.unit})`);
        }
      }
    }
  }
  return found;
}

/** Metrics where only one level has a number, so there is no "next level" to show. */
export function findSingleLevelSets(sets: readonly BenchmarkSet[]): string[] {
  return sets
    .filter((set) => set.levels.length === 1)
    .map((set) => `${set.sport} / ${set.positionOrEvent} / ${set.metric} [${sourceIds(set)}]: only ${set.levels[0]?.label}`);
}
