import type { Metadata } from "next";
import Link from "next/link";
import { priceWithInterval } from "@/config/billing";
import { requireViewer } from "@/lib/auth/viewer";
import { syncCheckout } from "@/lib/billing/actions";
import { loadPlanAccess } from "@/lib/billing/queries";
import { hasPlanAccess } from "@/lib/billing/subscription";
import { listAthletes } from "@/lib/family/queries";
import { gradeFromGradYear } from "@/lib/grade";
import { matchTemplates, needsThrowingCaution, THROWING_CAUTION, toPlanTemplate, type PlanTemplate } from "@/lib/plan/templates";
import { wordTips } from "@/lib/plan/tips";
import { listAthleteSports } from "@/lib/report/queries";
import type { AthleteRow } from "@/lib/supabase/database.types";
import { createServerSupabase } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "Training plan" };

type Props = { searchParams: Promise<{ checkout?: string; session_id?: string }> };

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
        {syncProblem ? (
          <p role="alert" className="mt-2 border-l-4 border-infield-navy pl-2 font-bold">
            Your payment went through, but this page couldn&apos;t confirm it yet. Reload in a minute.
          </p>
        ) : null}
        {access.state === "payment_problem" ? (
          <p role="alert" className="mt-2 border-l-4 border-infield-navy pl-2 font-bold">
            The last payment didn&apos;t go through, so the plan is paused. Update your card in the email Stripe sent you.
          </p>
        ) : null}
        <p data-testid="plan-not-subscribed" className="mt-2">
          The training plan is a paid add-on to the free gap report: {priceWithInterval()}, cancel any time. Each plan is
          written and reviewed by a coach for your athlete&apos;s sport and position.
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

  const templatesResult = await supabase.from("plan_templates").select("*").eq("is_published", true);
  if (templatesResult.error) throw new Error(`Could not load plans: ${templatesResult.error.message}`);
  const templates = templatesResult.data.map(toPlanTemplate).filter((template): template is PlanTemplate => template !== null);

  const athletes = (await listAthletes(supabase)).filter((athlete) => viewer.role === "guardian" || athlete.id === viewer.athleteId);

  return (
    <div className="max-w-80">
      <h1 className="text-[2.75rem]">Training plan</h1>
      {checkout === "done" ? (
        <p role="status" className="mt-2 border-l-4 border-infield-navy pl-2 font-bold">
          You&apos;re subscribed. A confirmation email is on its way.
        </p>
      ) : null}
      {athletes.length === 0 ? (
        <p className="mt-2">
          Add an athlete and their sports, and their plan will show here. <Link href="/athletes/new">Add an athlete</Link>
        </p>
      ) : (
        athletes.map((athlete) => <AthletePlans key={athlete.id} athlete={athlete} templates={templates} />)
      )}
    </div>
  );
}

async function AthletePlans({ athlete, templates }: { athlete: AthleteRow; templates: PlanTemplate[] }) {
  const sports = await listAthleteSports(await createServerSupabase(), athlete.id);
  const grade = gradeFromGradYear(athlete.grad_year, new Date());
  const plans = await Promise.all(
    sports.map(async (sport) => {
      const [template] = matchTemplates(templates, sport, grade);
      const tips = template ? await wordTips(template, { grade, sport: sport.sport, positionOrEvent: sport.positionOrEvent }) : null;
      return { sport, template, tips };
    }),
  );

  return (
    <section className="mt-5">
      <h2 className="border-b-2 border-infield-navy pb-1 text-[2.25rem]">{athlete.first_name}</h2>
      {sports.length === 0 ? (
        <p className="mt-2">
          Add {athlete.first_name}&apos;s sports first. <Link href={`/athletes/${athlete.id}/sports/new`}>Add a sport</Link>
        </p>
      ) : null}
      {plans.map(({ sport, template, tips }) => {
        return (
          <div key={sport.id} className="border-b-2 border-chalk py-3">
            <h3 className="text-[1.5rem]">
              {sport.sport}, {sport.positionOrEvent}
            </h3>
            {template ? (
              <PlanView template={template} grade={grade} tips={tips} />
            ) : (
              <p data-testid="plan-coming" className="mt-1">
                <strong>Your plan is coming.</strong> A coach is still writing and reviewing the {sport.positionOrEvent}{" "}
                plan. It will appear here as soon as it&apos;s ready. Until then, keep entering numbers so the gap report
                stays current.
              </p>
            )}
          </div>
        );
      })}
    </section>
  );
}

/** A coach's plan, shown exactly as written, with its safety notes. */
function PlanView({ template, grade, tips }: { template: PlanTemplate; grade: number; tips: string[] | null }) {
  return (
    <div data-testid="plan-template" className="mt-1">
      <p className="font-bold">{template.title}</p>
      {template.summary ? <p className="mt-1">{template.summary}</p> : null}
      <section data-testid="safety-notes" className="mt-2 border-l-4 border-infield-navy pl-2">
        <h4 className="font-display text-[1.25rem] font-bold">Safety notes</h4>
        <p className="mt-0.5">{template.safetyNotes}</p>
        {needsThrowingCaution(template, grade) ? <p className="mt-1 font-bold">{THROWING_CAUTION}</p> : null}
      </section>
      {template.sections.map((section) => (
        <div key={section.heading} className="mt-2">
          <h4 className="font-display text-[1.25rem] font-bold">{section.heading}</h4>
          <ul className="mt-0.5 list-disc pl-3">
            {section.items.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
      ))}
      {tips ? (
        <div className="mt-2">
          <h4 className="font-display text-[1.25rem] font-bold">Tips</h4>
          <ul className="mt-0.5 list-disc pl-3">
            {tips.map((tip) => (
              <li key={tip}>{tip}</li>
            ))}
          </ul>
          <p className="mt-0.5 text-[0.9375rem]">Tips are worded by AI from the coach&apos;s plan. The plan itself is unchanged.</p>
        </div>
      ) : null}
    </div>
  );
}
