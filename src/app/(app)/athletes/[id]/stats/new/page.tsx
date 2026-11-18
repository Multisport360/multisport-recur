import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { StatForm } from "@/components/report/ReportForms";
import { findAthlete, requireViewer } from "@/lib/auth/viewer";
import { inputGuide } from "@/lib/benchmarks/format";
import { loadBenchmarkSets } from "@/lib/benchmarks/repository";
import { findSets, listMetrics } from "@/lib/benchmarks/sets";
import { HOW_MEASURED } from "@/lib/report/build";
import { listAthleteSports } from "@/lib/report/queries";
import { HOW_MEASURED_LABELS, isoDate } from "@/lib/stats/rules";
import { createServerSupabase } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "Enter a number" };

type Props = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ sport?: string; metric?: string }>;
};

export default async function EnterNumberPage({ params, searchParams }: Props) {
  const { id } = await params;
  const { sport: sportId, metric: wantedMetric } = await searchParams;
  await requireViewer(`/athletes/${id}`);
  const athlete = await findAthlete(id);
  if (!athlete) notFound();

  const sport = (await listAthleteSports(await createServerSupabase(), athlete.id)).find((candidate) => candidate.id === sportId);
  if (!sport) redirect(`/athletes/${id}`);

  const benchmarks = await loadBenchmarkSets();
  if (benchmarks.status !== "ok") redirect(`/athletes/${id}`);

  const query = { sport: sport.sport, positionOrEvent: sport.positionOrEvent, gender: athlete.gender };
  const metrics = listMetrics(benchmarks.sets, query).map((option) => {
    const typical = findSets(benchmarks.sets, { ...query, metric: option.metric })[0]?.levels[0]?.entry;
    return { metric: option.metric, ...inputGuide(option.unit, typical) };
  });
  const initialMetric = metrics.some((option) => option.metric === wantedMetric) ? (wantedMetric as string) : (metrics[0]?.metric ?? "");

  return (
    <div className="max-w-60">
      <h1 className="text-[2.75rem]">Enter a number</h1>
      <p className="mt-2 mb-4">
        {sport.sport}, {sport.positionOrEvent}. Each number is saved as a new entry, so earlier numbers stay in the history.
      </p>
      <StatForm
        athleteId={athlete.id}
        athleteSportId={sport.id}
        metrics={metrics}
        initialMetric={initialMetric}
        today={isoDate(new Date())}
        howMeasured={HOW_MEASURED.map((how) => ({ value: how, label: HOW_MEASURED_LABELS[how] }))}
      />
      <p className="mt-4">
        <Link href={`/athletes/${athlete.id}`}>Back to the report</Link>
      </p>
    </div>
  );
}
