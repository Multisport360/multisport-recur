import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { SportForm } from "@/components/report/ReportForms";
import { findAthlete, requireViewer } from "@/lib/auth/viewer";
import { loadBenchmarkSets } from "@/lib/benchmarks/repository";
import { listPositions, listSports } from "@/lib/benchmarks/sets";

export const metadata: Metadata = { title: "Add a sport" };

type Props = { params: Promise<{ id: string }> };

export default async function AddSportPage({ params }: Props) {
  const { id } = await params;
  const viewer = await requireViewer(`/athletes/${id}/sports/new`);
  const athlete = await findAthlete(id);
  if (!athlete) notFound();

  const benchmarks = await loadBenchmarkSets();
  const back = (
    <p className="mt-4">
      <Link href={`/athletes/${id}`}>Back to the report</Link>
    </p>
  );
  if (benchmarks.status !== "ok") {
    return (
      <div className="max-w-60">
        <h1 className="text-[2.75rem]">Add a sport</h1>
        <p role="alert" className="mt-2 font-bold">
          The list of sports can&apos;t be loaded right now. Try again in a few minutes.
        </p>
        {back}
      </div>
    );
  }

  // Only positions and events that have benchmarks for this athlete's gender.
  const positionsBySport = Object.fromEntries(
    listSports(benchmarks.sets)
      .map((sport) => [
        sport,
        listPositions(benchmarks.sets, sport)
          .filter((position) => position.genders.includes(athlete.gender as never))
          .map((position) => position.positionOrEvent),
      ] as const)
      .filter(([, positions]) => positions.length > 0),
  );

  return (
    <div className="max-w-60">
      <h1 className="text-[2.75rem]">{viewer.role === "athlete" ? "Add a sport" : `Add a sport for ${athlete.first_name}`}</h1>
      <p className="mt-2 mb-4">Pick the position or event the numbers are for. You can add more than one.</p>
      <SportForm athleteId={athlete.id} positionsBySport={positionsBySport} />
      {back}
    </div>
  );
}
