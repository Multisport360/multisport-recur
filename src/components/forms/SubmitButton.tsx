"use client";

import type { ReactNode } from "react";
import { useFormStatus } from "react-dom";

type Props = {
  children: ReactNode;
  /** Shown while the form is being sent, like "Saving". */
  pendingText: string;
  quiet?: boolean;
};

/** A submit button that says what is happening while the form is sent. */
export function SubmitButton({ children, pendingText, quiet = false }: Props) {
  const { pending } = useFormStatus();
  return (
    <button type="submit" className={`button w-full sm:w-auto ${quiet ? "button-quiet" : ""}`} aria-disabled={pending} disabled={pending}>
      {pending ? pendingText : children}
    </button>
  );
}
