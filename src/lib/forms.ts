import type { z } from "zod";

/** What a form's Server Action hands back when it does not redirect. */
export type FormState = {
  /** A problem with the form as a whole, in plain words. */
  message: string | null;
  /** Problems with single fields, keyed by field name. */
  fields: Record<string, string>;
  /** What the person typed, so the form can be shown again without losing it. Never passwords. */
  values: Record<string, string>;
};

export const EMPTY_FORM_STATE: FormState = { message: null, fields: {}, values: {} };

/** The first problem zod found for each field. */
export function fieldErrors(error: z.ZodError): Record<string, string> {
  const fields: Record<string, string> = {};
  for (const issue of error.issues) {
    const key = String(issue.path[0] ?? "form");
    if (!(key in fields)) fields[key] = issue.message;
  }
  return fields;
}

/** Text values of the named fields, for re-filling the form. Do not pass password field names. */
export function formValues(form: FormData, names: readonly string[]): Record<string, string> {
  const values: Record<string, string> = {};
  for (const name of names) {
    const value = form.get(name);
    if (typeof value === "string") values[name] = value;
  }
  return values;
}

export function failed(message: string, values: Record<string, string> = {}): FormState {
  return { message, fields: {}, values };
}
