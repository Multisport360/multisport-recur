"use client";

import { useActionState } from "react";
import { FormAlert } from "@/components/forms/Fields";
import { SubmitButton } from "@/components/forms/SubmitButton";
import { EMPTY_FORM_STATE } from "@/lib/forms";
import { saveScreens } from "@/lib/plan/actions";

type Choice = { value: string; label: string };

export type ScreenQuestion = {
  name: "painNow" | "throwingArmPain" | "trainingAge" | "seasonPhase";
  /** The question exactly as the template words it. */
  question: string;
  choices: Choice[];
  defaultValue?: string;
};

type Props = { athleteId: string; questions: ScreenQuestion[]; submitLabel: string };

/** The four plan questions, each a group of radio buttons with a large tap target. */
export function ScreensForm({ athleteId, questions, submitLabel }: Props) {
  const [state, action] = useActionState(saveScreens.bind(null, athleteId), EMPTY_FORM_STATE);

  return (
    <form action={action} className="space-y-4" noValidate>
      <FormAlert message={state.message} />
      {questions.map((question) => {
        const error = state.fields[question.name];
        const chosen = state.values[question.name] ?? question.defaultValue;
        return (
          <fieldset key={question.name} aria-invalid={error ? true : undefined} aria-describedby={error ? `${question.name}-error` : undefined} className="border-t-2 border-chalk pt-2">
            <legend className="float-left w-full font-bold">{question.question}</legend>
            <div className="clear-both pt-1">
              {question.choices.map((choice) => {
                const id = `${question.name}-${choice.value}`;
                return (
                  <label key={choice.value} htmlFor={id} className="flex min-h-6 cursor-pointer items-center gap-1.5 py-0.5">
                    <input
                      id={id}
                      type="radio"
                      name={question.name}
                      value={choice.value}
                      defaultChecked={chosen === choice.value}
                      className="size-3 shrink-0 accent-track-blue"
                    />
                    <span>{choice.label}</span>
                  </label>
                );
              })}
            </div>
            {error ? (
              <p id={`${question.name}-error`} className="mt-0.5 border-l-4 border-infield-navy pl-1 font-bold">
                {error}
              </p>
            ) : null}
          </fieldset>
        );
      })}
      <SubmitButton pendingText="Saving the answers">{submitLabel}</SubmitButton>
    </form>
  );
}
