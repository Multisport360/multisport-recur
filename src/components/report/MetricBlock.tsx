import Link from "next/link";
import { GapRuler } from "@/components/gap-ruler/GapRuler";
import type { Subject } from "@/lib/benchmarks/describe";
import { metricInSentence } from "@/lib/benchmarks/format";
import type { MetricReport } from "@/lib/report/build";
import { formatDay, measuredBy } from "@/lib/report/words";
import { ProgressTable } from "./ProgressTable";

type Props = {
  metric: MetricReport;
  subject: Subject;
  firstName: string;
  enterHref: string;
};

/**
 * One metric in the report: its ruler, where the number came from, its history, and a way to add
 * a new number. When more than one guide has numbers for a metric, the family sees only the first
 * one (the same one the summary, the history and the training plan use), so each level has one
 * set of numbers.
 */
export function MetricBlock({ metric, subject, firstName, enterHref }: Props) {
  const source = metric.valueSource;
  const comparison = metric.comparisons[0] ?? null;
  const set = comparison?.set ?? metric.sets[0];

  return (
    <section data-testid="metric-block" data-metric={metric.metric} className="border-t-2 border-chalk py-4">
      <h3 className="text-[1.75rem]">{metric.metric}</h3>

      {metric.value === null ? (
        <>
          <p data-testid="metric-empty" className="mt-1 max-w-80">
            Not entered yet. Enter {firstName}&apos;s {metricInSentence(metric.metric)} to see which level it reaches.
          </p>
          <p className="mt-2">
            <Link href={enterHref} className="button button-quiet w-full sm:w-auto">
              Enter {metricInSentence(metric.metric)}
            </Link>
          </p>
        </>
      ) : (
        <>
          <p className="mt-0.5 mb-2 text-[0.9375rem]">
            {source?.kind === "entry"
              ? `Latest: ${formatDay(source.entry.measuredOn)}, ${measuredBy(source.entry.howMeasured)}.`
              : `From ${firstName}'s profile. Enter a measured number to replace it.`}
          </p>
          {set ? <GapRuler set={set} comparison={comparison} subject={subject} /> : null}
          {metric.history.length > 1 ? <ProgressTable metric={metric} /> : null}
          <p className="mt-3">
            <Link href={enterHref} className="inline-block py-1">
              Add a new {metricInSentence(metric.metric)} number
            </Link>
          </p>
        </>
      )}
    </section>
  );
}
