"use client";

import { useActionState } from "react";
import { CheckboxField, FormAlert, SelectField, TextField } from "@/components/forms/Fields";
import { SubmitButton } from "@/components/forms/SubmitButton";
import { CHECKBOX_FIELDS } from "@/lib/consent/methods";
import { addAthlete, inviteAthlete, recordConsent } from "@/lib/family/actions";
import { EMPTY_FORM_STATE } from "@/lib/forms";

type Option = { value: string; label: string };

/**
 * The consent form. `methodId` picks the fields for the consent method in use,
 * so a new method only needs a new branch here.
 */
export function ConsentForm({ methodId }: { methodId: string }) {
  const [state, action] = useActionState(recordConsent, EMPTY_FORM_STATE);
  return (
    <form action={action} className="space-y-2" noValidate>
      <FormAlert message={state.message} />
      {methodId === "checkbox_attestation" ? (
        <>
          <CheckboxField name={CHECKBOX_FIELDS.isGuardian}>I am this athlete&apos;s parent or legal guardian.</CheckboxField>
          <CheckboxField name={CHECKBOX_FIELDS.agrees}>
            I agree to Multi-Sport Recur saving the information listed above for my athlete.
          </CheckboxField>
        </>
      ) : null}
      <SubmitButton pendingText="Saving your consent">Agree and add my athlete</SubmitButton>
    </form>
  );
}

type AthleteFormProps = { gradYears: Option[]; birthYears: Option[] };

const GENDER_OPTIONS: Option[] = [
  { value: "Male", label: "Boys" },
  { value: "Female", label: "Girls" },
];

export function AthleteForm({ gradYears, birthYears }: AthleteFormProps) {
  const [state, action] = useActionState(addAthlete, EMPTY_FORM_STATE);
  const { values, fields } = state;
  return (
    <form action={action} className="space-y-3" noValidate>
      <FormAlert message={state.message} />
      <TextField name="firstName" label="First name" autoComplete="off" defaultValue={values.firstName} error={fields.firstName} required />
      <SelectField name="gradYear" label="Grade" placeholder="Choose a grade" options={gradYears} defaultValue={values.gradYear} error={fields.gradYear} />
      <SelectField
        name="birthYear"
        label="Birth year"
        hint="The year only. We never ask for a full birth date."
        placeholder="Choose a year"
        options={birthYears}
        defaultValue={values.birthYear}
        error={fields.birthYear}
      />
      <SelectField
        name="gender"
        label="Competes with"
        hint="Benchmarks are different for boys' and girls' events."
        placeholder="Choose one"
        options={GENDER_OPTIONS}
        defaultValue={values.gender}
        error={fields.gender}
      />
      <TextField name="heightIn" label="Height (optional)" hint="Feet and inches, like 5'8." defaultValue={values.heightIn} error={fields.heightIn} />
      <TextField name="weightLb" label="Weight in pounds (optional)" inputMode="decimal" hint="Like 150." defaultValue={values.weightLb} error={fields.weightLb} />
      <SubmitButton pendingText="Adding your athlete">Add this athlete</SubmitButton>
    </form>
  );
}

export function InviteForm({ athleteId, athleteFirstName }: { athleteId: string; athleteFirstName: string }) {
  const [state, action] = useActionState(inviteAthlete.bind(null, athleteId), EMPTY_FORM_STATE);
  return (
    <form action={action} className="space-y-3" noValidate>
      <FormAlert message={state.message} />
      <TextField
        name="email"
        label={`${athleteFirstName}'s email`}
        type="email"
        inputMode="email"
        autoComplete="off"
        hint="We use it only to send the invite and for signing in."
        defaultValue={state.values.email}
        error={state.fields.email}
        required
      />
      <SubmitButton pendingText="Sending the invite">Send the invite</SubmitButton>
    </form>
  );
}
