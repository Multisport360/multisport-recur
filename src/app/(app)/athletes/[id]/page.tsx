import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { AthleteLoginSection, RemoveAthleteSection } from "@/components/family/AthleteAdmin";
import { ClosestSummary } from "@/components/report/ClosestSummary";
import { MetricBlock } from "@/components/report/MetricBlock";
import { classLabel } from "@/lib/athletes/rules";
import { findAthlete, requireViewer } from "@/lib/auth/viewer";
import { loadBenchmarkSets } from "@/lib/benchmarks/repository";
import type { Gender } from "@/lib/benchmarks/types";
import { gradeFromGradYear, needsSeniorTargetsNote } from "@/lib/grade";
import { buildSportReport, closestSport, type SportReport } from "@/lib/report/build";
import { listAthleteSports, listStatEntries, type AthleteSport } from "@/lib/report/queries";
import { createServerSupabase } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "Gap report" };

type Props = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ invited?: string; login_removed?: string; saved?: string }>;
};

/** Metrics with a number first, so the report leads with what has been measured. */
function measuredFirst(report: SportReport): SportReport {
  return { ...report, metrics: [...report.metrics].sort((a, b) => Number(b.value !== null) - Number(a.value !== null)) };
}

export default async function AthletePage({ params, searchParams }: Props) {
  const { id } = await params;
  const viewer = await requireViewer(`/athletes/${id}`);
  // Another family's athlete is simply not found: row-level security never returns it.
  const athlete = await findAthlete(id);
  if (!athlete) notFound();

  const { invited, login_removed: loginRemoved, saved } = await searchParams;
  const today = new Date();
  const isOwnLogin = viewer.role === "athlete";
  const name = athlete.first_name;
  const subject = isOwnLogin ? undefined : { firstName: name };

  const supabase = await createServerSupabase();
  const [sports, entries, benchmarks] = await Promise.all([
    listAthleteSports(supabase, athlete.id),
    listStatEntries(supabase, athlete.id),
    loadBenchmarkSets(),
  ]);
  const profile = { heightIn: athlete.height_in === null ? null : Number(athlete.height_in), weightLb: athlete.weight_lb === null ? null : Number(athlete.weight_lb) };
  const reports =
    benchmarks.status === "ok"
      ? sports.map((sport) => measuredFirst(buildSportReport(benchmarks.sets, sport, athlete.gender as Gender, entries, profile)))
      : [];
  const summary = closestSport(reports);
  const sportIdFor = (report: SportReport) =>
    (sports.find((sport) => sport.sport === report.sport && sport.positionOrEvent === report.positionOrEvent) as AthleteSport).id;

  return (
    <div>
      <h1 className="text-[2.75rem] sm:text-[3.5rem]">{isOwnLogin ? "My gap report" : `${name}'s gap report`}</h1>
      <p>{classLabel(athlete.grad_year, today)}</p>

      {invited ? <Notice>The invite is on its way to {name}&apos;s email.</Notice> : null}
      {loginRemoved ? <Notice>{name}&apos;s login was removed.</Notice> : null}
      {saved ? <Notice>Saved. The {saved.toLowerCase()} ruler below shows the new number.</Notice> : null}

      {needsSeniorTargetsNote(gradeFromGradYear(athlete.grad_year, today)) && sports.length > 0 ? (
        <p data-testid="senior-note" className="mt-3 max-w-80 border-l-4 border-infield-navy pl-2">
          <strong>These are senior-year targets.</strong> {isOwnLogin ? "You aren't" : `${name} isn't`} expected to be
          there yet.
        </p>
      ) : null}

      {benchmarks.status !== "ok" ? (
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
          <p className="mt-3">
            <Link href={`/athletes/${athlete.id}/sports/new`} className="button w-full sm:w-auto">
              Add a sport
            </Link>
          </p>
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
                  enterHref={`/athletes/${athlete.id}/stats/new?sport=${sportIdFor(report)}&metric=${encodeURIComponent(metric.metric)}`}
                />
              ))}
            </section>
          ))}
          <p className="mt-4">
            <Link href={`/athletes/${athlete.id}/sports/new`} className="button button-quiet w-full sm:w-auto">
              Add another sport
            </Link>
          </p>
        </>
      )}

      {viewer.role === "guardian" ? (
        <div className="mt-6 max-w-80">
          <AthleteLoginSection athlete={athlete} today={today} />
          <RemoveAthleteSection athlete={athlete} />
        </div>
      ) : null}
    </div>
  );
}

function Notice({ children }: { children: React.ReactNode }) {
  return (
    <p role="status" className="mt-2 border-l-4 border-infield-navy pl-2 font-bold">
      {children}
    </p>
  );
}
