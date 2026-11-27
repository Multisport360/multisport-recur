"use client";

import { useActionState } from "react";
import { CheckboxField, FormAlert } from "@/components/forms/Fields";
import { SubmitButton } from "@/components/forms/SubmitButton";
import { EMPTY_FORM_STATE, type FormAction } from "@/lib/forms";

/**
 * The required renewal-terms box and the button that goes to checkout. `action` is the startCheckout
 * Server Action in the app (it opens Stripe Checkout); the demo passes one that only shows a note.
 */
export function SubscribeForm({ agreement, action: start }: { agreement: string; action: FormAction }) {
  const [state, action] = useActionState(start, EMPTY_FORM_STATE);
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
