"use client";

import { useActionState } from "react";
import { CheckboxField, FormAlert } from "@/components/forms/Fields";
import { SubmitButton } from "@/components/forms/SubmitButton";
import { startCheckout } from "@/lib/billing/actions";
import { EMPTY_FORM_STATE } from "@/lib/forms";

/** The required renewal-terms box and the button that goes to Stripe Checkout. */
export function SubscribeForm({ agreement }: { agreement: string }) {
  const [state, action] = useActionState(startCheckout, EMPTY_FORM_STATE);
  return (
    <form action={action} className="space-y-2" noValidate>
      <FormAlert message={state.message} />
      <CheckboxField name="agreesToRenewal" error={state.fields.agreesToRenewal}>
        {agreement}
      </CheckboxField>
      <SubmitButton pendingText="Opening secure checkout">Continue to payment</SubmitButton>
    </form>
  );
}
