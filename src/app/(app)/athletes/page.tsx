import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { classLabel } from "@/lib/athletes/rules";
import { requireViewer } from "@/lib/auth/viewer";
import { listAthletes } from "@/lib/family/queries";
import { createServerSupabase } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "My athletes" };

type Props = { searchParams: Promise<{ removed?: string }> };

export default async function AthletesPage({ searchParams }: Props) {
  const viewer = await requireViewer("/athletes");
  if (viewer.role === "athlete") redirect(`/athletes/${viewer.athleteId}`);

  const { removed } = await searchParams;
  const athletes = await listAthletes(await createServerSupabase());
  const today = new Date();

  return (
    <div className="max-w-80">
      <h1 className="text-[2.75rem]">My athletes</h1>
      {removed ? (
        <p role="status" className="mt-2 border-l-4 border-infield-navy pl-2 font-bold">
          The athlete and all of their numbers were removed.
        </p>
      ) : null}

      {athletes.length === 0 ? (
        <div data-testid="no-athletes" className="mt-3">
          <p>
            No athletes yet. Add your athlete, enter a few numbers, and you&apos;ll see which college level each one
            reaches.
          </p>
          <p className="mt-3">
            <Link href="/athletes/new" className="button w-full sm:w-auto">
              Add an athlete
            </Link>
          </p>
        </div>
      ) : (
        <>
          <ul className="mt-3 border-t-2 border-chalk">
            {athletes.map((athlete) => (
              <li key={athlete.id} className="border-b-2 border-chalk py-2">
                <p className="font-display text-[1.75rem] leading-[1.1] font-extrabold">{athlete.first_name}</p>
                <p>{classLabel(athlete.grad_year, today)}</p>
                <p className="mt-0.5">
                  <Link href={`/athletes/${athlete.id}`} className="inline-block py-1">
                    See {athlete.first_name}&apos;s gap report
                  </Link>
                </p>
              </li>
            ))}
          </ul>
          <p className="mt-3">
            <Link href="/athletes/new" className="button button-quiet w-full sm:w-auto">
              Add another athlete
            </Link>
          </p>
        </>
      )}
    </div>
  );
}
