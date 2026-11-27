import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { SubscribeForm } from "@/components/billing/SubscribeForm";
import { SubscribeView } from "@/components/billing/SubscribeView";
import { checkoutTerms } from "@/config/billing";
import { requireGuardian } from "@/lib/auth/viewer";
import { startCheckout } from "@/lib/billing/actions";
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
    <SubscribeView
      terms={terms}
      notice={
        checkout === "stopped" ? (
          <p role="status" className="mt-2 border-l-4 border-infield-navy pl-2 font-bold">
            You left checkout before paying. Nothing was charged.
          </p>
        ) : null
      }
      form={<SubscribeForm agreement={terms.agreement} action={startCheckout} />}
      backHref="/plan"
    />
  );
}
