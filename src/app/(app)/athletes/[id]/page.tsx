import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { AthleteLoginSection, RemoveAthleteSection } from "@/components/family/AthleteAdmin";
import { classLabel } from "@/lib/athletes/rules";
import { findAthlete, requireViewer } from "@/lib/auth/viewer";

export const metadata: Metadata = { title: "Gap report" };

type Props = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ invited?: string; login_removed?: string }>;
};

export default async function AthletePage({ params, searchParams }: Props) {
  const { id } = await params;
  const viewer = await requireViewer(`/athletes/${id}`);
  // Another family's athlete is simply not found: row-level security never returns it.
  const athlete = await findAthlete(id);
  if (!athlete) notFound();

  const { invited, login_removed: loginRemoved } = await searchParams;
  const today = new Date();

  return (
    <div>
      <h1 className="text-[2.75rem] sm:text-[3.5rem]">{athlete.first_name}</h1>
      <p>{classLabel(athlete.grad_year, today)}</p>

      {invited ? (
        <p role="status" className="mt-2 border-l-4 border-infield-navy pl-2 font-bold">
          The invite is on its way to {athlete.first_name}&apos;s email.
        </p>
      ) : null}
      {loginRemoved ? (
        <p role="status" className="mt-2 border-l-4 border-infield-navy pl-2 font-bold">
          {athlete.first_name}&apos;s login was removed.
        </p>
      ) : null}

      {viewer.role === "guardian" ? (
        <div className="mt-4 max-w-80">
          <AthleteLoginSection athlete={athlete} today={today} />
          <RemoveAthleteSection athlete={athlete} />
        </div>
      ) : null}
    </div>
  );
}
