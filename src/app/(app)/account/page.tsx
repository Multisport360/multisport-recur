import type { Metadata } from "next";
import { AccountView } from "@/components/billing/AccountView";
import { signOut } from "@/lib/auth/actions";
import { requireViewer } from "@/lib/auth/viewer";
import { cancelSubscription } from "@/lib/billing/actions";
import { loadPlanAccess } from "@/lib/billing/queries";
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
    <AccountView
      email={viewer.email}
      roleText={viewer.role === "athlete" ? " (athlete login)." : " (parent account)."}
      access={access}
      timeZone={viewer.timeZone}
      notices={
        <>
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
        </>
      }
      cancelAction={cancelSubscription}
      subscribeHref="/plan/subscribe"
      footer={
        <form action={signOut}>
          <button type="submit" className="button button-quiet w-full sm:w-auto">
            Sign out
          </button>
        </form>
      }
    />
  );
}
