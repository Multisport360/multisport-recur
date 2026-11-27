"use client";

import Link from "next/link";
import { useState } from "react";
import { AccountView } from "@/components/billing/AccountView";
import { CANCEL_SKIPPED, demoAccess } from "@/lib/demo/model";
import { DEMO_PARENT, DEMO_TIME_ZONE } from "@/lib/demo/sample";
import { useDemo } from "../DemoProvider";

/** The account screen. Cancelling shows a note instead of reaching Stripe. */
export function DemoAccount() {
  const { today, restart } = useDemo();
  const [cancelTried, setCancelTried] = useState(false);

  return (
    <AccountView
      email={DEMO_PARENT.name}
      roleText=" (parent account, demo)."
      access={demoAccess(today)}
      timeZone={DEMO_TIME_ZONE}
      subscribedNote=" Demo."
      notices={
        cancelTried ? (
          <p data-testid="demo-payments-note" role="status" className="mt-1 border-l-4 border-infield-navy pl-2 font-bold">
            {CANCEL_SKIPPED}
          </p>
        ) : null
      }
      cancelAction={() => setCancelTried(true)}
      subscribeHref="/demo/subscribe"
      footer={
        <div className="space-y-2">
          <p>
            <Link href="/demo/subscribe" className="inline-flex min-h-6 items-center">
              See what checkout shows before paying
            </Link>
          </p>
          <button type="button" onClick={restart} className="button button-quiet w-full sm:w-auto">
            Restart demo
          </button>
        </div>
      }
    />
  );
}
