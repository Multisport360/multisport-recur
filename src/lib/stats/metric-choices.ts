import { inputGuide } from "@/lib/benchmarks/format";
import { findSets, listMetrics, type BenchmarkSet } from "@/lib/benchmarks/sets";
import type { MetricChoice } from "@/components/report/StatForm";

/** The metrics with benchmarks for one sport, position and gender, with the unit and input hint for each. */
export function metricChoices(sets: readonly BenchmarkSet[], query: { sport: string; positionOrEvent: string; gender: string }): MetricChoice[] {
  return listMetrics(sets, query).map((option) => {
    const typical = findSets(sets, { ...query, metric: option.metric })[0]?.levels[0]?.entry;
    return { metric: option.metric, ...inputGuide(option.unit, typical) };
  });
}

/** The metric asked for in the address bar if it is one of the choices, else the first. */
export function chosenMetric(metrics: readonly MetricChoice[], wanted: string | undefined): string {
  return metrics.some((option) => option.metric === wanted) ? (wanted as string) : (metrics[0]?.metric ?? "");
}
