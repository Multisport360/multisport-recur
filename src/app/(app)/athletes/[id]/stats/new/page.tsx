import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { EnterNumberView } from "@/components/report/EnterNumberView";
import { findAthlete, requireViewer } from "@/lib/auth/viewer";
import { loadBenchmarkSets } from "@/lib/benchmarks/repository";
import { calendarDay } from "@/lib/dates";
import { listAthleteSports } from "@/lib/report/queries";
import { addStat } from "@/lib/stats/actions";
import { chosenMetric, metricChoices } from "@/lib/stats/metric-choices";
import { createServerSupabase } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "Enter a number" };

type Props = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ sport?: string; metric?: string }>;
};

export default async function EnterNumberPage({ params, searchParams }: Props) {
  const { id } = await params;
  const { sport: sportId, metric: wantedMetric } = await searchParams;
  const viewer = await requireViewer(`/athletes/${id}`);
  const athlete = await findAthlete(id);
  if (!athlete) notFound();

  const sport = (await listAthleteSports(await createServerSupabase(), athlete.id)).find((candidate) => candidate.id === sportId);
  if (!sport) redirect(`/athletes/${id}`);

  const benchmarks = await loadBenchmarkSets();
  if (benchmarks.status !== "ok") redirect(`/athletes/${id}`);

  const metrics = metricChoices(benchmarks.sets, { sport: sport.sport, positionOrEvent: sport.positionOrEvent, gender: athlete.gender });

  return (
    <EnterNumberView
      sportLabel={`${sport.sport}, ${sport.positionOrEvent}`}
      metrics={metrics}
      initialMetric={chosenMetric(metrics, wantedMetric)}
      today={calendarDay(new Date(), viewer.timeZone)}
      action={addStat.bind(null, athlete.id, sport.id)}
      backHref={`/athletes/${athlete.id}`}
    />
  );
}
