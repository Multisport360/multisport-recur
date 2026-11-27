"use client";

import { DraftBanner } from "@/components/plan/DraftBanner";
import type { PlanLinks } from "@/components/plan/PlanView";
import { TrainingPlanView } from "@/components/plan/TrainingPlanView";
import { demoPlan } from "@/lib/demo/model";
import { DEMO_ATHLETE, DEMO_SPORTS } from "@/lib/demo/sample";
import { DemoAthleteBanner } from "../DemoShell";
import { useDemo } from "../DemoProvider";

const DEMO_PLAN_LINKS: PlanLinks = {
  week: (week) => `/demo/plan?week=${week}`,
  logStat: (sportId, metric) => `/demo/stats?sport=${sportId}&metric=${encodeURIComponent(metric)}`,
};

/** Jordan's plan, built from the draft (not coach-reviewed) templates by the app's plan builder. */
export function DemoPlan({ week }: { week: string | undefined }) {
  const { data, state, today, saveSessionDone } = useDemo();
  const built = demoPlan(data, state, today, week);
  const name = DEMO_ATHLETE.firstName;
  const banners = (
    <>
      <DemoAthleteBanner />
      <DraftBanner />
    </>
  );

  // The sample answers never stop the plan; this only guards a change to the sample data.
  if (built.result.kind === "stopped") {
    return (
      <div className="max-w-80">
        {banners}
        <p role="alert" className="mt-2 font-bold">
          {built.result.message}
        </p>
      </div>
    );
  }

  return (
    <TrainingPlanView
      banners={banners}
      heading={`${name}'s training plan`}
      answeredLine={<p className="mt-1">Answers from {built.answeredOn}.</p>}
      benchmarksDown={false}
      plan={{
        athleteId: DEMO_ATHLETE.id,
        links: DEMO_PLAN_LINKS,
        saveSessionDone,
        firstName: name,
        plan: built.result,
        sports: [...DEMO_SPORTS],
        blockStart: built.position.blockStart,
        currentWeek: built.position.week,
        shownWeek: built.shownWeek,
        done: built.done,
        isRetestWeek: built.isRetestWeek,
      }}
    />
  );
}
