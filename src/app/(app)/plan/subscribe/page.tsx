import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { SubscribeForm } from "@/components/billing/SubscribeForm";
import { checkoutTerms, PLAN, priceWithInterval } from "@/config/billing";
import { requireGuardian } from "@/lib/auth/viewer";
import { loadPlanAccess } from "@/lib/billing/queries";
import { hasPlanAccess } from "@/lib/billing/subscription";
import { createServerSupabase } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "Subscribe to the training plan" };

type Props = { searchParams: Promise<{ checkout?: string }> };

/** Price, renewal, next charge date and how to cancel, all shown before checkout. */
export default async function SubscribePage({ searchParams }: Props) {
  const viewer = await requireGuardian("/plan/subscribe");
  const { access } = await loadPlanAccess(await createServerSupabase(), viewer.familyId);
  if (hasPlanAccess(access)) redirect("/plan");

  const { checkout } = await searchParams;
  const terms = checkoutTerms(new Date(), viewer.timeZone);

  return (
    <div className="max-w-80">
      <h1 className="text-[2.75rem]">Subscribe to the training plan</h1>
      {checkout === "stopped" ? (
        <p role="status" className="mt-2 border-l-4 border-infield-navy pl-2 font-bold">
          You left checkout before paying. Nothing was charged.
        </p>
      ) : null}

      <dl data-testid="billing-terms" className="mt-4 border-t-2 border-infield-navy">
        <Term label="Price">{priceWithInterval()}</Term>
        <Term label="Renewal">{terms.renewal}</Term>
        <Term label="Today">{terms.firstCharge}</Term>
        <Term label="Next charge">{terms.nextCharge}</Term>
        <Term label="How to cancel">{terms.howToCancel}</Term>
      </dl>

      <h2 className="mt-4 text-[1.75rem]">What you get</h2>
      <p className="mt-1">
        A week-by-week training plan for each athlete, built from training templates a certified strength coach reviews and
        aimed at the numbers with the biggest gap on their report. Safety notes sit at the top of every plan. The gap
        report stays free whether or not you subscribe.
      </p>
      <p className="mt-2 border-l-4 border-infield-navy pl-2">
        <strong>The templates are still being reviewed.</strong> Until a coach has approved them, the plan page will say
        your plan is coming. We never make up a plan to fill the gap.
      </p>

      <div className="mt-4">
        <SubscribeForm agreement={terms.agreement} />
      </div>
      <p className="mt-2 text-[0.9375rem]">
        Stripe takes the payment, in US dollars, for the {PLAN.name}.
      </p>
      <p className="mt-3">
        <Link href="/plan">Back to the training plan</Link>
      </p>
    </div>
  );
}

function Term({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="grid grid-cols-[8rem_minmax(0,1fr)] gap-x-2 border-b-2 border-chalk py-1.5">
      <dt className="font-bold">{label}</dt>
      <dd>{children}</dd>
    </div>
  );
}
