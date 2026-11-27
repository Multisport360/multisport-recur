import type { ReactNode } from "react";

/**
 * Form fields with a visible label, an optional hint, and an error that says how to fix it.
 * Plain HTML controls, so they work with the keyboard and screen readers out of the box.
 */

type BaseProps = {
  name: string;
  label: string;
  hint?: string;
  error?: string;
};

function describedBy(name: string, hint?: string, error?: string): string | undefined {
  const ids = [hint ? `${name}-hint` : null, error ? `${name}-error` : null].filter(Boolean);
  return ids.length > 0 ? ids.join(" ") : undefined;
}

function Help({ name, hint, error }: { name: string; hint?: string; error?: string }) {
  return (
    <>
      {hint ? (
        <p id={`${name}-hint`} className="mt-0.5 text-[0.9375rem]">
          {hint}
        </p>
      ) : null}
      {error ? (
        <p id={`${name}-error`} className="mt-0.5 border-l-4 border-infield-navy pl-1 font-bold">
          {error}
        </p>
      ) : null}
    </>
  );
}

type TextFieldProps = BaseProps & {
  type?: "text" | "email" | "password";
  defaultValue?: string;
  autoComplete?: string;
  inputMode?: "text" | "decimal" | "numeric" | "email";
  required?: boolean;
};

export function TextField({ name, label, hint, error, type = "text", defaultValue, autoComplete, inputMode, required }: TextFieldProps) {
  return (
    <div>
      <label htmlFor={name} className="block font-bold">
        {label}
      </label>
      <input
        id={name}
        name={name}
        type={type}
        className="field mt-0.5"
        defaultValue={defaultValue}
        autoComplete={autoComplete}
        inputMode={inputMode}
        required={required}
        aria-describedby={describedBy(name, hint, error)}
        aria-invalid={error ? true : undefined}
      />
      <Help name={name} hint={hint} error={error} />
    </div>
  );
}

type SelectFieldProps = BaseProps & {
  options: readonly { value: string; label: string }[];
  defaultValue?: string;
  /** Text of the empty first option, like "Choose a year". */
  placeholder?: string;
};

export function SelectField({ name, label, hint, error, options, defaultValue = "", placeholder }: SelectFieldProps) {
  return (
    <div>
      <label htmlFor={name} className="block font-bold">
        {label}
      </label>
      <select
        id={name}
        name={name}
        className="field mt-0.5"
        defaultValue={defaultValue}
        aria-describedby={describedBy(name, hint, error)}
        aria-invalid={error ? true : undefined}
      >
        {placeholder ? <option value="">{placeholder}</option> : null}
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      <Help name={name} hint={hint} error={error} />
    </div>
  );
}

type CheckboxFieldProps = {
  name: string;
  children: ReactNode;
  error?: string;
  defaultChecked?: boolean;
};

/** A tick box with a large tap target. The whole row is the label. */
export function CheckboxField({ name, children, error, defaultChecked }: CheckboxFieldProps) {
  return (
    <div>
      <label htmlFor={name} className="flex min-h-6 cursor-pointer items-start gap-1.5 py-1">
        <input
          id={name}
          name={name}
          type="checkbox"
          defaultChecked={defaultChecked}
          className="mt-[0.2rem] size-3 shrink-0 accent-track-blue"
          aria-describedby={describedBy(name, undefined, error)}
          aria-invalid={error ? true : undefined}
        />
        <span>{children}</span>
      </label>
      <Help name={name} error={error} />
    </div>
  );
}

/** A problem with the whole form. Announced to screen readers as soon as it appears. */
export function FormAlert({ message }: { message: string | null }) {
  if (!message) return null;
  return (
    <p role="alert" className="border-l-4 border-infield-navy pl-2 font-bold">
      {message}
    </p>
  );
}
