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

/** One metric in the report: its ruler(s), where the number came from, its history, and a way to add a new number. */
export function MetricBlock({ metric, subject, firstName, enterHref }: Props) {
  const source = metric.valueSource;

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
          {metric.sets.map((set, index) => (
            <div key={set.id} className={index === 0 ? "" : "mt-4 border-t-2 border-chalk pt-3"}>
              {index > 0 ? <p className="mb-2 font-bold">The same number on a second guide</p> : null}
              <GapRuler
                set={set}
                comparison={metric.comparisons.find((comparison) => comparison.set.id === set.id) ?? null}
                subject={subject}
              />
            </div>
          ))}
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
