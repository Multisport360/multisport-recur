import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { DraftBanner } from "@/components/plan/DraftBanner";
import { ScreensForm, type ScreenQuestion } from "@/components/plan/ScreensForm";
import { findAthlete, requireGuardian } from "@/lib/auth/viewer";
import { loadPlanAccess } from "@/lib/billing/queries";
import { hasPlanAccess } from "@/lib/billing/subscription";
import type { TemplateLibrary } from "@/lib/plan/library-schema";
import { loadPlanLibrary, loadScreens, type SavedScreens } from "@/lib/plan/queries";
import { seasonChoices, teamSessionChoices } from "@/lib/plan/screen-form";
import { listAthleteSports } from "@/lib/report/queries";
import { createServerSupabase } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "Plan questions" };

type Props = { params: Promise<{ athleteId: string }> };

const YES_NO = [
  { value: "yes", label: "Yes" },
  { value: "no", label: "No" },
];

const yesNo = (value: boolean | null | undefined) => (value === undefined || value === null ? undefined : value ? "yes" : "no");

/** The questions in the order and wording of the template. Throwing-arm pain is asked of baseball players only. */
function questionsFor(library: TemplateLibrary, playsBaseball: boolean, saved: SavedScreens | null): ScreenQuestion[] {
  const answers = saved?.answers;
  return library.screens.flatMap((screen): ScreenQuestion[] => {
    switch (screen.id) {
      case "pain_now":
        return [{ name: "painNow", question: screen.question, choices: YES_NO, defaultValue: yesNo(answers?.painNow) }];
      case "throwing_arm_pain":
        return playsBaseball ? [{ name: "throwingArmPain", question: screen.question.replace(/^Baseball only: (.)/, (_, first: string) => first.toUpperCase()), choices: YES_NO, defaultValue: yesNo(answers?.throwingArmPain) }] : [];
      case "training_age":
        return [{ name: "trainingAge", question: screen.question, choices: YES_NO, defaultValue: yesNo(answers?.hasTrainingAge) }];
      case "season_phase":
        return [{ name: "seasonPhase", question: "Where is the athlete in their season?", choices: seasonChoices(playsBaseball), defaultValue: answers?.seasonPhase }];
      case "team_sessions":
        return [
          {
            name: "teamSessions",
            question: screen.question,
            hint: "Count each practice and each game. Each one is a hard day, so the plan adds fewer of its own.",
            choices: teamSessionChoices(),
            defaultValue: answers?.teamSessionsPerWeek === null || answers?.teamSessionsPerWeek === undefined ? undefined : String(answers.teamSessionsPerWeek),
            inline: true,
          },
        ];
    }
  });
}

export default async function PlanQuestionsPage({ params }: Props) {
  const { athleteId } = await params;
  const viewer = await requireGuardian(`/plan/${athleteId}/questions`);
  const athlete = await findAthlete(athleteId);
  if (!athlete) notFound();

  const supabase = await createServerSupabase();
  const { access } = await loadPlanAccess(supabase, viewer.familyId);
  if (!hasPlanAccess(access)) redirect("/plan");
  const library = await loadPlanLibrary(supabase);
  if (!library) redirect("/plan");

  const [sports, saved] = await Promise.all([listAthleteSports(supabase, athlete.id), loadScreens(supabase, athlete.id)]);
  const playsBaseball = sports.some((sport) => sport.sport === "Baseball");
  const name = athlete.first_name;

  return (
    <div className="max-w-80">
      {library.reviewStatus === "draft" ? <DraftBanner /> : null}
      <h1 className="text-[2.75rem]">{saved ? `Change ${name}'s plan answers` : `Before ${name}'s first plan`}</h1>
      <p className="mt-1">
        {saved
          ? "Answer again and the plan changes to match. Earlier answers are kept."
          : `These 5 questions keep the plan safe. The answers decide whether ${name} gets a plan today, how hard it is, whether it includes throwing, and how much it adds to the team schedule.`}
      </p>
      <div className="mt-3">
        <ScreensForm athleteId={athlete.id} questions={questionsFor(library.library, playsBaseball, saved)} submitLabel={saved ? "Save and update the plan" : `Build ${name}'s plan`} />
      </div>
      <p className="mt-3">
        <Link href={saved ? `/plan/${athlete.id}` : "/plan"}>Back to the training plan</Link>
      </p>
    </div>
  );
}
