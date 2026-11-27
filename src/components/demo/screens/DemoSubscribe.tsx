"use client";

import { SubscribeForm } from "@/components/billing/SubscribeForm";
import { SubscribeView } from "@/components/billing/SubscribeView";
import { demoCheckout, demoCheckoutTerms } from "@/lib/demo/model";
import { useDemo } from "../DemoProvider";

/** What a parent sees before paying. "Continue to payment" shows a note instead of opening Stripe. */
export function DemoSubscribe() {
  const { today } = useDemo();
  const terms = demoCheckoutTerms(today);
  return (
    <SubscribeView
      terms={terms}
      form={<SubscribeForm agreement={terms.agreement} action={(_previous, form) => demoCheckout(form)} />}
      backHref="/demo/plan"
    />
  );
}
