"use client";

import { useActionState } from "react";
import { FormAlert } from "@/components/forms/Fields";
import { SubmitButton } from "@/components/forms/SubmitButton";
import { EMPTY_FORM_STATE } from "@/lib/forms";
import { saveScreens } from "@/lib/plan/actions";

type Choice = { value: string; label: string };

export type ScreenQuestion = {
  name: "painNow" | "throwingArmPain" | "trainingAge" | "seasonPhase" | "teamSessions";
  /** The question exactly as the template words it. */
  question: string;
  /** A line under the question that says how to answer. */
  hint?: string;
  choices: Choice[];
  defaultValue?: string;
  /** Short choices (numbers) sit side by side instead of one per line. */
  inline?: boolean;
};

type Props = { athleteId: string; questions: ScreenQuestion[]; submitLabel: string };

/** The plan questions, each a group of radio buttons with a large tap target. */
export function ScreensForm({ athleteId, questions, submitLabel }: Props) {
  const [state, action] = useActionState(saveScreens.bind(null, athleteId), EMPTY_FORM_STATE);

  return (
    <form action={action} className="space-y-4" noValidate>
      <FormAlert message={state.message} />
      {questions.map((question) => {
        const error = state.fields[question.name];
        const chosen = state.values[question.name] ?? question.defaultValue;
        const describedBy = [question.hint ? `${question.name}-hint` : null, error ? `${question.name}-error` : null].filter(Boolean).join(" ") || undefined;
        return (
          <fieldset key={question.name} aria-invalid={error ? true : undefined} aria-describedby={describedBy} className="border-t-2 border-chalk pt-2">
            <legend className="float-left w-full font-bold">{question.question}</legend>
            {question.hint ? (
              <p id={`${question.name}-hint`} className="clear-both pt-0.5">
                {question.hint}
              </p>
            ) : null}
            <div className={question.inline ? "clear-both flex flex-wrap gap-x-3 pt-1" : "clear-both pt-1"}>
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
