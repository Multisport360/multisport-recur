import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { AthleteLoginSection, RemoveAthleteSection } from "@/components/family/AthleteAdmin";
import { GapReportView } from "@/components/report/GapReportView";
import { classLabel } from "@/lib/athletes/rules";
import { findAthlete, requireViewer } from "@/lib/auth/viewer";
import { loadBenchmarkSets } from "@/lib/benchmarks/repository";
import type { Gender } from "@/lib/benchmarks/types";
import { gradeFromGradYear, needsSeniorTargetsNote } from "@/lib/grade";
import { buildSportReport } from "@/lib/report/build";
import { listAthleteSports, listStatEntries } from "@/lib/report/queries";
import { createServerSupabase } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "Gap report" };

type Props = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ invited?: string; login_removed?: string; saved?: string }>;
};

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

  const supabase = await createServerSupabase();
  const [sports, entries, benchmarks] = await Promise.all([
    listAthleteSports(supabase, athlete.id),
    listStatEntries(supabase, athlete.id),
    loadBenchmarkSets(),
  ]);
  const profile = { heightIn: athlete.height_in === null ? null : Number(athlete.height_in), weightLb: athlete.weight_lb === null ? null : Number(athlete.weight_lb) };
  const reports = benchmarks.status === "ok" ? sports.map((sport) => buildSportReport(benchmarks.sets, sport, athlete.gender as Gender, entries, profile)) : [];

  return (
    <GapReportView
      firstName={name}
      classText={classLabel(athlete.grad_year, today)}
      isOwnLogin={isOwnLogin}
      sports={sports}
      reports={reports}
      benchmarksDown={benchmarks.status !== "ok"}
      showSeniorNote={needsSeniorTargetsNote(gradeFromGradYear(athlete.grad_year, today))}
      notices={
        <>
          {invited ? <Notice>The invite is on its way to {name}&apos;s email.</Notice> : null}
          {loginRemoved ? <Notice>{name}&apos;s login was removed.</Notice> : null}
          {saved ? <Notice>Saved. The {saved.toLowerCase()} ruler below shows the new number.</Notice> : null}
        </>
      }
      enterHref={(athleteSportId, metric) => `/athletes/${athlete.id}/stats/new?sport=${athleteSportId}&metric=${encodeURIComponent(metric)}`}
      addSportHref={`/athletes/${athlete.id}/sports/new`}
      footer={
        viewer.role === "guardian" ? (
          <div className="mt-6 max-w-80">
            <AthleteLoginSection athlete={athlete} today={today} />
            <RemoveAthleteSection athlete={athlete} />
          </div>
        ) : null
      }
    />
  );
}

function Notice({ children }: { children: React.ReactNode }) {
  return (
    <p role="status" className="mt-2 border-l-4 border-infield-navy pl-2 font-bold">
      {children}
    </p>
  );
}
