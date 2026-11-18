import type { Metadata } from "next";
import Link from "next/link";
import { formatLongDate, priceWithInterval } from "@/config/billing";
import { signOut } from "@/lib/auth/actions";
import { requireViewer } from "@/lib/auth/viewer";
import { cancelSubscription } from "@/lib/billing/actions";
import { loadPlanAccess } from "@/lib/billing/queries";
import type { PlanAccess } from "@/lib/billing/subscription";
import { createServerSupabase } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "Account" };

type Props = { searchParams: Promise<{ cancelled?: string; cancel_problem?: string }> };

const CANCEL_PROBLEMS: Record<string, string> = {
  payments: "Payments aren't switched on yet, so the cancel didn't go through. Nothing will be charged while payments are off.",
  stripe: "We couldn't reach the payment service, so the plan is not cancelled yet. Try again in a few minutes.",
};

export default async function AccountPage({ searchParams }: Props) {
  const viewer = await requireViewer("/account");
  const { cancelled, cancel_problem: cancelProblem } = await searchParams;
  const access = viewer.role === "guardian" ? (await loadPlanAccess(await createServerSupabase(), viewer.familyId)).access : null;

  return (
    <div className="max-w-80">
      <h1 className="text-[2.75rem]">Account</h1>
      <p className="mt-2">
        Signed in as <strong>{viewer.email}</strong>
        {viewer.role === "athlete" ? " (athlete login)." : " (parent account)."}
      </p>

      {access ? (
        <section data-testid="billing" className="mt-4 border-t-2 border-chalk pt-3">
          <h2 className="text-[1.75rem]">Training plan</h2>
          {cancelled ? (
            <p role="status" className="mt-1 border-l-4 border-infield-navy pl-2 font-bold">
              Cancelled. You won&apos;t be charged again, and a confirmation email is on its way.
            </p>
          ) : null}
          {cancelProblem && CANCEL_PROBLEMS[cancelProblem] ? (
            <p role="alert" className="mt-1 border-l-4 border-infield-navy pl-2 font-bold">
              {CANCEL_PROBLEMS[cancelProblem]}
            </p>
          ) : null}
          <BillingStatus access={access} />
        </section>
      ) : null}

      <form action={signOut} className="mt-4 border-t-2 border-chalk pt-3">
        <button type="submit" className="button button-quiet w-full sm:w-auto">
          Sign out
        </button>
      </form>
    </div>
  );
}

function BillingStatus({ access }: { access: PlanAccess }) {
  switch (access.state) {
    case "active":
      return (
        <>
          <p className="mt-1">
            Subscribed: {priceWithInterval()}.{" "}
            {access.renewsOn ? `Renews on ${formatLongDate(access.renewsOn)}.` : "Renews automatically."}
          </p>
          {/* Cancel is two clicks: open this, then confirm. */}
          <details className="mt-2">
            <summary className="py-1.5 text-track-blue underline underline-offset-4">Cancel my training plan</summary>
            <p className="mt-1 mb-2">
              You keep the plan until {access.renewsOn ? formatLongDate(access.renewsOn) : "the end of the month you've paid for"},
              then it stops. You won&apos;t be charged again.
            </p>
            <form action={cancelSubscription}>
              <button type="submit" className="button w-full sm:w-auto">
                Yes, cancel my training plan
              </button>
            </form>
          </details>
        </>
      );
    case "ending":
      return (
        <p className="mt-1">
          Cancelled. You keep the plan until {access.endsOn ? formatLongDate(access.endsOn) : "the end of the paid month"}, and
          you won&apos;t be charged again.
        </p>
      );
    case "payment_problem":
      return <p className="mt-1">The last payment didn&apos;t go through, so the plan is paused. Check the email Stripe sent you.</p>;
    case "none":
    case "ended":
      return (
        <p className="mt-1">
          Not subscribed. The gap report is free. <Link href="/plan/subscribe">See the training plan price</Link>
        </p>
      );
  }
}
