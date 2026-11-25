import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { priceWithInterval } from "@/config/billing";
import { requireViewer } from "@/lib/auth/viewer";
import { syncCheckout } from "@/lib/billing/actions";
import { loadPlanAccess } from "@/lib/billing/queries";
import { hasPlanAccess } from "@/lib/billing/subscription";
import { listAthletes } from "@/lib/family/queries";
import { loadPlanLibrary, loadScreens } from "@/lib/plan/queries";
import { createServerSupabase } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "Training plan" };

type Props = { searchParams: Promise<{ checkout?: string; session_id?: string }> };

function Notice({ children, role = "status" }: { children: React.ReactNode; role?: "status" | "alert" }) {
  return (
    <p role={role} className="mt-2 border-l-4 border-infield-navy pl-2 font-bold">
      {children}
    </p>
  );
}

export default async function PlanPage({ searchParams }: Props) {
  const viewer = await requireViewer("/plan");
  const { checkout, session_id: sessionId } = await searchParams;
  const isParent = viewer.role === "guardian";

  let syncProblem = false;
  if (isParent && checkout === "done" && sessionId) {
    try {
      await syncCheckout(sessionId, viewer.familyId);
    } catch (error) {
      console.error(`[plan] could not sync checkout: ${error instanceof Error ? error.message : String(error)}`);
      syncProblem = true;
    }
  }

  const supabase = await createServerSupabase();
  const { access } = await loadPlanAccess(supabase, viewer.familyId);

  if (!hasPlanAccess(access)) {
    return (
      <div className="max-w-80">
        <h1 className="text-[2.75rem]">Training plan</h1>
        {syncProblem ? <Notice role="alert">Your payment went through, but this page couldn&apos;t confirm it yet. Reload in a minute.</Notice> : null}
        {access.state === "payment_problem" ? (
          <Notice role="alert">The last payment didn&apos;t go through, so the plan is paused. Update your card in the email Stripe sent you.</Notice>
        ) : null}
        <p data-testid="plan-not-subscribed" className="mt-2">
          The training plan is a paid add-on to the free gap report: {priceWithInterval()}, cancel any time. Each plan is
          built from training templates that a certified strength coach reviews, aimed at the numbers with the biggest gap
          on your athlete&apos;s report. The templates are still being reviewed, so a new subscriber sees &ldquo;your plan
          is coming&rdquo; until they&apos;re ready.
        </p>
        {isParent ? (
          <p className="mt-3">
            <Link href="/plan/subscribe" className="button w-full sm:w-auto">
              See the price and subscribe
            </Link>
          </p>
        ) : (
          <p className="mt-2">Ask your parent to add the training plan from their account.</p>
        )}
      </div>
    );
  }

  const library = await loadPlanLibrary(supabase);
  if (library && viewer.role === "athlete") redirect(`/plan/${viewer.athleteId}`);
  const athletes = library ? await listAthletes(supabase) : [];
  const answered = await Promise.all(athletes.map(async (athlete) => ({ athlete, screens: await loadScreens(supabase, athlete.id) })));

  return (
    <div className="max-w-80">
      <h1 className="text-[2.75rem]">Training plan</h1>
      {checkout === "done" ? <Notice>You&apos;re subscribed. A confirmation email is on its way.</Notice> : null}
      {!library ? (
        <p data-testid="plan-coming" className="mt-2">
          <strong>Your plan is coming.</strong> A certified strength coach is still reviewing the training templates. Your
          athlete&apos;s plan will appear here as soon as they&apos;re signed off. Until then, keep entering numbers so the
          gap report stays current.
        </p>
      ) : athletes.length === 0 ? (
        <p className="mt-2">
          Add an athlete and their numbers, and their plan will show here. <Link href="/athletes/new">Add an athlete</Link>
        </p>
      ) : (
        <ul className="mt-3 border-t-2 border-infield-navy">
          {answered.map(({ athlete, screens }) => (
            <li key={athlete.id} className="border-b-2 border-chalk py-2">
              <p className="font-display text-[1.75rem] font-bold">{athlete.first_name}</p>
              {screens ? (
                <Link href={`/plan/${athlete.id}`} className="inline-block py-1">
                  See {athlete.first_name}&apos;s plan
                </Link>
              ) : (
                <>
                  <p className="mt-0.5">Answer 4 short safety questions to build {athlete.first_name}&apos;s first plan.</p>
                  <Link href={`/plan/${athlete.id}/questions`} className="button mt-1 w-full sm:w-auto">
                    Answer the plan questions
                  </Link>
                </>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
