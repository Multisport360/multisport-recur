import type { SportReport } from "@/lib/report/build";
import type { StatGap } from "./types";

/**
 * The stats on an athlete's gap report that still have a next level to reach, with how far
 * away it is. Uses the same comparison the report shows (the most trustworthy ruler first).
 * Numbers at the top level, or not entered yet, have no gap and are left out.
 */
export function gapsFromReports(reports: readonly SportReport[]): StatGap[] {
  return reports.flatMap((report) =>
    report.metrics.flatMap((metric) => {
      const comparison = metric.comparisons[0];
      if (!comparison || comparison.gap === null || comparison.gap <= 0 || !comparison.nextLevel) return [];
      const nextLevelEntry = comparison.nextStep?.entry ?? comparison.nextLevel.entry;
      return [
        {
          sport: report.sport,
          positionOrEvent: report.positionOrEvent,
          metric: metric.metric,
          unit: metric.unit,
          value: comparison.value,
          nextLevelLabel: comparison.nextLevel.label,
          nextLevelEntry,
          gap: comparison.gap,
        },
      ];
    }),
  );
}
