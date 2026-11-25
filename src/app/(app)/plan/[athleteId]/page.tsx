import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { DraftBanner } from "@/components/plan/DraftBanner";
import { PlanView } from "@/components/plan/PlanView";
import { findAthlete, requireViewer } from "@/lib/auth/viewer";
import { loadPlanAccess } from "@/lib/billing/queries";
import { hasPlanAccess } from "@/lib/billing/subscription";
import { formatDayIn } from "@/lib/dates";
import { gradeFromGradYear } from "@/lib/grade";
import { blockPosition, isRetestWeek, weekToShow } from "@/lib/plan/block";
import { buildPlan } from "@/lib/plan/builder";
import { completeAnswers, loadAthleteGaps, loadCompletions, loadPlanLibrary, loadScreens } from "@/lib/plan/queries";
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

  const answers = screens ? completeAnswers(screens.answers) : null;
  if (!screens || !answers) {
    // No answers yet, or answers saved before the team-practice question was added.
    const isNewQuestion = screens !== null;
    return (
      <div className="max-w-80">
        {banner}
        <h1 className="text-[2.75rem]">{heading}</h1>
        <p data-testid="plan-needs-answers" className="mt-2">
          {isParent
            ? isNewQuestion
              ? `The plan now asks how many team practices or games ${name} has in a typical week, so it doesn't pile hard days on top of them. Answer it to see the plan.`
              : `Before the first plan, answer 5 short questions about ${name}.`
            : isNewQuestion
              ? "The plan has a new question about your team schedule. Ask a parent to answer it from their account."
              : "Before your first plan, a parent answers 5 short questions. Ask them to open the training plan from their account."}
        </p>
        {isParent ? (
          <p className="mt-3">
            <Link href={`/plan/${athlete.id}/questions`} className="button w-full sm:w-auto">
              {isNewQuestion ? "Answer the new question" : "Answer the plan questions"}
            </Link>
          </p>
        ) : null}
      </div>
    );
  }

  const today = new Date();
  const { sports, gaps, benchmarksDown } = await loadAthleteGaps(supabase, athlete);
  const plan = buildPlan(library.library, { grade: gradeFromGradYear(athlete.grad_year, today), sports, gaps, screens: answers });
  const answeredLine = (
    <p className="mt-1">
      Answers from {formatDayIn(screens.answeredAt, viewer.timeZone)}.{" "}
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

  const position = blockPosition(screens.firstAnsweredAt, today, viewer.timeZone);
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
