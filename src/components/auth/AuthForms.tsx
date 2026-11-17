"use client";

import { useActionState } from "react";
import { CheckboxField, FormAlert, TextField } from "@/components/forms/Fields";
import { SubmitButton } from "@/components/forms/SubmitButton";
import { requestPasswordReset, setPassword, signIn, signUp } from "@/lib/auth/actions";
import { EMPTY_FORM_STATE } from "@/lib/forms";

const PASSWORD_HINT = "At least 8 characters.";

export function SignUpForm() {
  const [state, action] = useActionState(signUp, EMPTY_FORM_STATE);
  return (
    <form action={action} className="space-y-3" noValidate>
      <FormAlert message={state.message} />
      <TextField name="email" label="Your email" type="email" autoComplete="email" inputMode="email" defaultValue={state.values.email} error={state.fields.email} required />
      <TextField name="password" label="Password" type="password" autoComplete="new-password" hint={PASSWORD_HINT} error={state.fields.password} required />
      <CheckboxField name="isParent" error={state.fields.isParent}>
        I&apos;m a parent or legal guardian, and I&apos;m 18 or older.
      </CheckboxField>
      <SubmitButton pendingText="Creating your account">Create my account</SubmitButton>
    </form>
  );
}

export function SignInForm({ next }: { next: string }) {
  const [state, action] = useActionState(signIn, EMPTY_FORM_STATE);
  return (
    <form action={action} className="space-y-3" noValidate>
      <FormAlert message={state.message} />
      <input type="hidden" name="next" value={state.values.next ?? next} />
      <TextField name="email" label="Email" type="email" autoComplete="email" inputMode="email" defaultValue={state.values.email} error={state.fields.email} required />
      <TextField name="password" label="Password" type="password" autoComplete="current-password" error={state.fields.password} required />
      <SubmitButton pendingText="Signing in">Sign in</SubmitButton>
    </form>
  );
}

export function PasswordResetForm() {
  const [state, action] = useActionState(requestPasswordReset, EMPTY_FORM_STATE);
  return (
    <form action={action} className="space-y-3" noValidate>
      <FormAlert message={state.message} />
      <TextField name="email" label="Email" type="email" autoComplete="email" inputMode="email" defaultValue={state.values.email} error={state.fields.email} required />
      <SubmitButton pendingText="Sending the link">Email me a reset link</SubmitButton>
    </form>
  );
}

export function SetPasswordForm() {
  const [state, action] = useActionState(setPassword, EMPTY_FORM_STATE);
  return (
    <form action={action} className="space-y-3" noValidate>
      <FormAlert message={state.message} />
      <TextField name="password" label="New password" type="password" autoComplete="new-password" hint={PASSWORD_HINT} error={state.fields.password} required />
      <SubmitButton pendingText="Saving your password">Save my password</SubmitButton>
    </form>
  );
}
