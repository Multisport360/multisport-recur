import Link from "next/link";
import type { ReactNode } from "react";
import { ClosestSummary } from "@/components/report/ClosestSummary";
import { MetricBlock } from "@/components/report/MetricBlock";
import type { Subject } from "@/lib/benchmarks/describe";
import { closestSport, type SportReport } from "@/lib/report/build";
import type { AthleteSport } from "@/lib/report/queries";

/**
 * The gap report: the closest-to-college summary, then a ruler for every number coaches ask for.
 * The signed-in page and the demo both render this; only where the data comes from differs.
 */

type Props = {
  firstName: string;
  /** "Class of 2028 (11th grade)". */
  classText: string;
  isOwnLogin: boolean;
  sports: readonly AthleteSport[];
  /** One report per sport, built from the benchmarks; empty when the benchmarks could not be loaded. */
  reports: readonly SportReport[];
  benchmarksDown: boolean;
  showSeniorNote: boolean;
  /** Status lines under the heading ("Saved. ..."). */
  notices?: ReactNode;
  /** Where "Enter a number" goes for one metric of one sport. */
  enterHref: (athleteSportId: string, metric: string) => string;
  /** "Add a sport" / "Add another sport", or null where sports can't be added (the demo). */
  addSportHref: string | null;
  /** Shown after the report, e.g. the parent's athlete login and remove sections. */
  footer?: ReactNode;
};

/** Metrics with a number first, so the report leads with what has been measured. */
function measuredFirst(report: SportReport): SportReport {
  return { ...report, metrics: [...report.metrics].sort((a, b) => Number(b.value !== null) - Number(a.value !== null)) };
}

export function GapReportView(props: Props) {
  const { firstName: name, isOwnLogin, sports, benchmarksDown, enterHref, addSportHref } = props;
  const reports = props.reports.map(measuredFirst);
  const subject: Subject | undefined = isOwnLogin ? undefined : { firstName: name };
  const summary = closestSport(reports);
  const sportIdFor = (report: SportReport) =>
    (sports.find((sport) => sport.sport === report.sport && sport.positionOrEvent === report.positionOrEvent) as AthleteSport).id;

  return (
    <div>
      <h1 className="text-[2.75rem] sm:text-[3.5rem]">{isOwnLogin ? "My gap report" : `${name}'s gap report`}</h1>
      <p className="mt-1">{props.classText}</p>

      {props.notices}

      {props.showSeniorNote && sports.length > 0 ? (
        <p data-testid="senior-note" className="mt-3 max-w-80 border-l-4 border-infield-navy pl-2">
          <strong>These are senior-year targets.</strong> {isOwnLogin ? "You aren't" : `${name} isn't`} expected to be
          there yet.
        </p>
      ) : null}

      {benchmarksDown ? (
        <p role="alert" className="mt-3 max-w-80 border-l-4 border-infield-navy pl-2 font-bold">
          The benchmarks can&apos;t be loaded right now, so the rulers are missing. Your numbers are safe. Reload the page in a few
          minutes.
        </p>
      ) : null}

      {summary ? <ClosestSummary leader={summary.leader} others={summary.others} firstName={name} subject={subject} /> : null}

      {sports.length === 0 ? (
        <section data-testid="no-sports" className="mt-4 max-w-80">
          <p>
            No sports yet. Add the sports {isOwnLogin ? "you play" : `${name} plays`}, with a position or event, and the report
            will show a ruler for each number coaches ask for.
          </p>
          {addSportHref ? (
            <p className="mt-3">
              <Link href={addSportHref} className="button w-full sm:w-auto">
                Add a sport
              </Link>
            </p>
          ) : null}
        </section>
      ) : (
        <>
          {reports.map((report) => (
            <section key={`${report.sport}-${report.positionOrEvent}`} data-testid="sport-section" className="mt-6">
              <h2 className="border-b-2 border-infield-navy pb-1 text-[2.25rem]">
                {report.sport}, {report.positionOrEvent}
              </h2>
              {report.metrics.map((metric) => (
                <MetricBlock
                  key={metric.metric}
                  metric={metric}
                  subject={subject}
                  firstName={isOwnLogin ? "your" : name}
                  enterHref={enterHref(sportIdFor(report), metric.metric)}
                />
              ))}
            </section>
          ))}
          {addSportHref ? (
            <p className="mt-4">
              <Link href={addSportHref} className="button button-quiet w-full sm:w-auto">
                Add another sport
              </Link>
            </p>
          ) : null}
        </>
      )}

      {props.footer}
    </div>
  );
}
