"use client";

import { useActionState, useState } from "react";
import { FormAlert, SelectField, TextField } from "@/components/forms/Fields";
import { SubmitButton } from "@/components/forms/SubmitButton";
import { EMPTY_FORM_STATE, type FormAction } from "@/lib/forms";

type Option = { value: string; label: string };

export type MetricChoice = { metric: string; unitLabel: string; hint: string };

type StatFormProps = {
  /**
   * What saving does. The real page passes the addStat Server Action bound to the athlete and sport;
   * the demo passes a function that keeps the number in the browser.
   */
  action: FormAction;
  metrics: MetricChoice[];
  initialMetric: string;
  today: string;
  howMeasured: Option[];
};

/** Enter one number. It is saved as a new entry; earlier numbers are kept. */
export function StatForm({ action: save, metrics, initialMetric, today, howMeasured }: StatFormProps) {
  const [state, action] = useActionState(save, EMPTY_FORM_STATE);
  const [metric, setMetric] = useState(state.values.metric ?? initialMetric);
  const choice = metrics.find((option) => option.metric === metric) ?? metrics[0];

  return (
    <form action={action} className="space-y-3" noValidate>
      <FormAlert message={state.message} />
      <div>
        <label htmlFor="metric" className="block font-bold">
          What was measured
        </label>
        <select id="metric" name="metric" className="field mt-0.5" value={metric} onChange={(event) => setMetric(event.target.value)}>
          {metrics.map((option) => (
            <option key={option.metric}>{option.metric}</option>
          ))}
        </select>
      </div>
      <TextField
        name="value"
        label={`${choice?.metric ?? "Number"} (${choice?.unitLabel ?? ""})`}
        inputMode="decimal"
        autoComplete="off"
        hint={choice?.hint}
        defaultValue={state.values.value}
        error={state.fields.value}
        required
      />
      <div>
        <label htmlFor="measuredOn" className="block font-bold">
          Date measured
        </label>
        <input
          id="measuredOn"
          name="measuredOn"
          type="date"
          className="field mt-0.5"
          max={today}
          defaultValue={state.values.measuredOn ?? today}
          aria-invalid={state.fields.measuredOn ? true : undefined}
          aria-describedby={state.fields.measuredOn ? "measuredOn-error" : undefined}
        />
        {state.fields.measuredOn ? (
          <p id="measuredOn-error" className="mt-0.5 border-l-4 border-infield-navy pl-1 font-bold">
            {state.fields.measuredOn}
          </p>
        ) : null}
      </div>
      <SelectField
        name="howMeasured"
        label="Who measured it"
        hint="Coaches trust numbers from a coach or an event more than ones measured at home."
        placeholder="Choose one"
        options={howMeasured}
        defaultValue={state.values.howMeasured}
        error={state.fields.howMeasured}
      />
      <SubmitButton pendingText="Saving the number">Save this number</SubmitButton>
    </form>
  );
}
