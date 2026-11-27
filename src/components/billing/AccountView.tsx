import Link from "next/link";
import type { ReactNode } from "react";
import { formatLongDate, priceWithInterval } from "@/config/billing";
import type { PlanAccess } from "@/lib/billing/subscription";

/**
 * The account screen: who is signed in, the training plan subscription and how to cancel it.
 * The account page passes the cancelSubscription Server Action; the demo passes one that only shows a note.
 */

type Props = {
  email: string;
  /** " (parent account)." or " (athlete login)." */
  roleText: string;
  /** Null for an athlete login, which has no billing section. */
  access: PlanAccess | null;
  timeZone: string;
  /** Status or problem lines shown above the subscription, e.g. "Cancelled." */
  notices?: ReactNode;
  /** Words after "Subscribed: $12 every month", e.g. " Demo." Empty in the app. */
  subscribedNote?: string;
  cancelAction: () => void | Promise<void>;
  subscribeHref: string;
  /** Sign out in the app; "Restart demo" in the demo. */
  footer: ReactNode;
};

export function AccountView({ email, roleText, access, timeZone, notices, subscribedNote = "", cancelAction, subscribeHref, footer }: Props) {
  return (
    <div className="max-w-80">
      <h1 className="text-[2.75rem]">Account</h1>
      <p className="mt-2">
        Signed in as <strong>{email}</strong>
        {roleText}
      </p>

      {access ? (
        <section data-testid="billing" className="mt-4 border-t-2 border-chalk pt-3">
          <h2 className="text-[1.75rem]">Training plan</h2>
          {notices}
          <BillingStatus access={access} timeZone={timeZone} subscribedNote={subscribedNote} cancelAction={cancelAction} subscribeHref={subscribeHref} />
        </section>
      ) : null}

      <div className="mt-4 border-t-2 border-chalk pt-3">{footer}</div>
    </div>
  );
}

type StatusProps = Pick<Props, "timeZone" | "cancelAction" | "subscribeHref"> & { access: PlanAccess; subscribedNote: string };

function BillingStatus({ access, timeZone, subscribedNote, cancelAction, subscribeHref }: StatusProps) {
  switch (access.state) {
    case "active":
      return (
        <>
          <p className="mt-1">
            Subscribed: {priceWithInterval()}.{subscribedNote}{" "}
            {access.renewsOn ? `Renews on ${formatLongDate(access.renewsOn, timeZone)}.` : "Renews automatically."}
          </p>
          {/* Cancel is two clicks: open this, then confirm. */}
          <details className="mt-2">
            <summary className="py-1.5 text-track-blue underline underline-offset-4">Cancel my training plan</summary>
            <p className="mt-1 mb-2">
              You keep the plan until {access.renewsOn ? formatLongDate(access.renewsOn, timeZone) : "the end of the month you've paid for"},
              then it stops. You won&apos;t be charged again.
            </p>
            <form action={cancelAction}>
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
          Cancelled. You keep the plan until {access.endsOn ? formatLongDate(access.endsOn, timeZone) : "the end of the paid month"}, and
          you won&apos;t be charged again.
        </p>
      );
    case "payment_problem":
      return <p className="mt-1">The last payment didn&apos;t go through, so the plan is paused. Check the email Stripe sent you.</p>;
    case "none":
    case "ended":
      return (
        <p className="mt-1">
          Not subscribed. The gap report is free. <Link href={subscribeHref}>See the training plan price</Link>
        </p>
      );
  }
}
