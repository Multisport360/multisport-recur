/**
 * The one place that links a benchmark `metric` (as written in data/benchmarks.csv) to the
 * plain-English stat name the plan templates use in `for_stats` / `not_trainable`.
 *
 * Every benchmark metric must be listed here; a unit test fails if one is missing. When a new
 * metric is added to the CSV, add it here too, pointing at the template stat it trains.
 */

export type StatLink =
  /** A stat a focus module can train. `forStat` must appear in some module's `for_stats`. */
  | { kind: "trainable"; forStat: string }
  /** Height and weight: no module, the template's not_trainable message is shown instead. */
  | { kind: "not_trainable"; stat: "Height" | "Weight" };

const trainable = (forStat: string): StatLink => ({ kind: "trainable", forStat });

export const METRIC_TO_STAT: Readonly<Record<string, StatLink>> = {
  // Baseball
  "60-yard dash": trainable("60-yard dash"),
  "Exit velocity": trainable("Exit velocity"),
  "Fastball velocity": trainable("Fastball velocity"),
  "Infield throwing velocity": trainable("Infield throwing velocity"),
  "Outfield throwing velocity": trainable("Outfield throwing velocity"),
  "Pop time": trainable("Catcher pop time"),
  // Football
  "40-yard dash": trainable("40-yard dash"),
  "Bench press (1RM)": trainable("Bench press"),
  "Vertical jump": trainable("Vertical jump"),
  Height: { kind: "not_trainable", stat: "Height" },
  Weight: { kind: "not_trainable", stat: "Weight" },
  // Track & field
  "100m": trainable("100 m"),
  "200m": trainable("200 m"),
  "400m": trainable("400 m"),
  "800m": trainable("800 m"),
  "1600m": trainable("1600 m"),
  "100m hurdles": trainable("100 m hurdles"),
  "110m hurdles": trainable("110 m hurdles"),
  "300m hurdles": trainable("300 m hurdles"),
  "Long jump distance": trainable("Long jump"),
  "High jump distance": trainable("High jump"),
  "Shot put distance": trainable("Shot put"),
  "Discus distance": trainable("Discus"),
};

/** The template link for a benchmark metric, or null if it has none (a test keeps this from happening). */
export function statLinkFor(metric: string): StatLink | null {
  return METRIC_TO_STAT[metric] ?? null;
}
