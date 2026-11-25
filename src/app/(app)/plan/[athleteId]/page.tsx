import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { DraftBanner } from "@/components/plan/DraftBanner";
import { PlanView } from "@/components/plan/PlanView";
import { findAthlete, requireViewer } from "@/lib/auth/viewer";
import { loadPlanAccess } from "@/lib/billing/queries";
import { hasPlanAccess } from "@/lib/billing/subscription";
import { formatDay } from "@/lib/report/words";
import { gradeFromGradYear } from "@/lib/grade";
import { blockPosition, isRetestWeek, weekToShow } from "@/lib/plan/block";
import { buildPlan } from "@/lib/plan/builder";
import { loadAthleteGaps, loadCompletions, loadPlanLibrary, loadScreens } from "@/lib/plan/queries";
import { createServerSupabase } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "Training plan" };

type Props = {
  params: Promise<{ athleteId: string }>;
  searchParams: Promise<{ week?: string; answers?: string }>;
};

export default async function AthletePlanPage({ params, searchParams }: Props) {
  const { athleteId } = await params;
  const viewer = await requireViewer(`/plan/${athleteId}`);
  const athlete = await findAthlete(athleteId);
  if (!athlete) notFound();
  const { week: requestedWeek, answers: answersSaved } = await searchParams;

  // The paid gate: no active subscription, no plan.
  const supabase = await createServerSupabase();
  const { access } = await loadPlanAccess(supabase, viewer.familyId);
  if (!hasPlanAccess(access)) redirect("/plan");
  const library = await loadPlanLibrary(supabase);
  if (!library) redirect("/plan");

  const isParent = viewer.role === "guardian";
  const name = athlete.first_name;
  const heading = viewer.role === "athlete" ? "My training plan" : `${name}'s training plan`;
  const screens = await loadScreens(supabase, athlete.id);
  const banner = library.reviewStatus === "draft" ? <DraftBanner /> : null;

  if (!screens) {
    return (
      <div className="max-w-80">
        {banner}
        <h1 className="text-[2.75rem]">{heading}</h1>
        <p data-testid="plan-needs-answers" className="mt-2">
          {isParent
            ? `Before the first plan, answer 4 short safety questions about ${name}.`
            : "Before your first plan, a parent answers 4 short safety questions. Ask them to open the training plan from their account."}
        </p>
        {isParent ? (
          <p className="mt-3">
            <Link href={`/plan/${athlete.id}/questions`} className="button w-full sm:w-auto">
              Answer the plan questions
            </Link>
          </p>
        ) : null}
      </div>
    );
  }

  const today = new Date();
  const { sports, gaps, benchmarksDown } = await loadAthleteGaps(supabase, athlete);
  const plan = buildPlan(library.library, { grade: gradeFromGradYear(athlete.grad_year, today), sports, gaps, screens: screens.answers });
  const answeredLine = (
    <p className="mt-1">
      Answers from {formatDay(screens.answeredAt.toISOString().slice(0, 10))}.{" "}
      {isParent ? <Link href={`/plan/${athlete.id}/questions`}>Change the answers</Link> : null}
    </p>
  );

  if (plan.kind === "stopped") {
    return (
      <div className="max-w-80">
        {banner}
        <h1 className="text-[2.75rem]">{heading}</h1>
        <p data-testid="plan-stopped" role="alert" className="mt-2 border-l-4 border-infield-navy pl-2 text-[1.25rem] font-bold">
          {plan.message}
        </p>
        <p className="mt-1">There is no plan until then. When {viewer.role === "athlete" ? "you're" : `${name} is`} cleared, change the answer and the plan appears.</p>
        {answeredLine}
      </div>
    );
  }

  const position = blockPosition(screens.firstAnsweredAt, today);
  const shownWeek = weekToShow(requestedWeek, position.week);
  const done = await loadCompletions(supabase, athlete.id, position.blockStart);

  return (
    <div className="max-w-80">
      {banner}
      <h1 className="text-[2.75rem]">{heading}</h1>
      {answersSaved ? (
        <p role="status" className="mt-2 border-l-4 border-infield-navy pl-2 font-bold">
          Saved. The plan below uses the new answers.
        </p>
      ) : null}
      {answeredLine}
      {benchmarksDown ? (
        <p role="alert" className="mt-2 border-l-4 border-infield-navy pl-2 font-bold">
          The benchmarks can&apos;t be loaded right now, so this plan has no focus work. Reload in a few minutes.
        </p>
      ) : null}
      <PlanView
        athleteId={athlete.id}
        firstName={name}
        plan={plan}
        sports={sports}
        blockStart={position.blockStart}
        currentWeek={position.week}
        shownWeek={shownWeek}
        done={done}
        isRetestWeek={isRetestWeek(position.week) && shownWeek === position.week}
      />
    </div>
  );
}
