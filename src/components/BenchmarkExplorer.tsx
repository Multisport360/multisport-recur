"use client";

import Link from "next/link";
import { useId, useState } from "react";
import { GapRuler } from "@/components/gap-ruler/GapRuler";
import { compare } from "@/lib/benchmarks/compare";
import { screenReaderText } from "@/lib/benchmarks/describe";
import { inputGuide, parseValueInput } from "@/lib/benchmarks/format";
import { isSameSelection, optionsFor, resolveSelection, type Selection } from "@/lib/benchmarks/selection";
import { findSets, type BenchmarkSet } from "@/lib/benchmarks/sets";
import type { Gender, Sport } from "@/lib/benchmarks/types";
import { gradeLabel, MAX_GRADE, MIN_GRADE, needsSeniorTargetsNote } from "@/lib/grade";

/**
 * What the first screen shows before the visitor touches anything.
 * 83 mph sits clearly inside a band on both pitcher guides, so the example reads the same on each.
 */
const EXAMPLE: Selection & { value: string } = {
  sport: "Baseball",
  gender: "Male",
  positionOrEvent: "Pitcher",
  metric: "Fastball velocity",
  value: "83",
};

const GENDER_LABEL: Record<Gender, string> = { Male: "Boys", Female: "Girls" };
const GRADE_OPTIONS = [
  { value: "", label: "Choose a grade" },
  ...Array.from({ length: MAX_GRADE - MIN_GRADE + 1 }, (_, index) => {
    const grade = MIN_GRADE + index;
    return { value: String(grade), label: gradeLabel(grade) };
  }),
];

type State = { selection: Selection; rawValue: string; grade: number | null };

type PickerProps = {
  label: string;
  value: string;
  options: readonly { value: string; label: string }[];
  onChange: (value: string) => void;
  className: string;
};

/** A labelled drop-down. */
function Picker({ label, value, options, onChange, className }: PickerProps) {
  const id = useId();
  return (
    <div className={className}>
      <label htmlFor={id} className="block text-[0.9375rem] font-bold">
        {label}
      </label>
      <select id={id} className="field mt-0.5" value={value} onChange={(event) => onChange(event.target.value)}>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
}

function plainOptions(values: readonly string[]) {
  return values.map((value) => ({ value, label: value }));
}

function initialState(sets: readonly BenchmarkSet[]): State | null {
  const selection = resolveSelection(sets, EXAMPLE);
  if (!selection) return null;
  return { selection, rawValue: isSameSelection(selection, EXAMPLE) ? EXAMPLE.value : "", grade: null };
}

/**
 * The public try-it-out tool: pick a sport, a position or event and one metric, type a
 * number, and see the ruler. Everything happens in the browser. Nothing is saved or sent.
 */
export function BenchmarkExplorer({ sets }: { sets: BenchmarkSet[] }) {
  const [state, setState] = useState<State | null>(() => initialState(sets));
  const valueId = useId();
  const messageId = useId();

  if (!state) return null;
  const { selection, rawValue, grade } = state;
  const options = optionsFor(sets, selection);
  const rulers = findSets(sets, selection);
  const metricOption = options.metrics.find((option) => option.metric === selection.metric);
  if (!metricOption) return null;
  const { unit } = metricOption;

  /** Apply a change to the pickers. The number is cleared when it no longer belongs to the metric. */
  function choose(change: Partial<Selection>) {
    setState((current) => {
      if (!current) return current;
      const next = resolveSelection(sets, { ...current.selection, ...change });
      if (!next) return current;
      return { ...current, selection: next, rawValue: isSameSelection(next, current.selection) ? current.rawValue : "" };
    });
  }

  // A typical benchmark for the metric decides how the number is typed (seconds or minutes:seconds, and so on).
  const guide = inputGuide(unit, rulers[0]?.levels[0]?.entry);
  const parsed = rawValue.trim() === "" ? null : parseValueInput(rawValue, unit, rulers[0]?.levels[0]?.entry);
  const outcome = parsed?.ok ? compare(sets, { ...selection, value: parsed.value, unit }) : null;
  const comparisons = outcome?.status === "ok" ? outcome.comparisons : [];
  const errorMessage = parsed && !parsed.ok ? parsed.message : null;
  const isTrack = selection.sport === "Track & Field";
  const hasGenderChoice = options.genders.length > 1;
  const hasMetricChoice = options.metrics.length > 1;

  return (
    <div>
      <form className="grid grid-cols-2 gap-x-2 gap-y-2 sm:grid-cols-12" onSubmit={(event) => event.preventDefault()} noValidate>
        <Picker
          label="Sport"
          className="col-span-1 sm:col-span-3"
          value={selection.sport}
          options={plainOptions(options.sports)}
          onChange={(sport) => choose({ sport: sport as Sport })}
        />
        <Picker
          label="Grade"
          className="col-span-1 sm:col-span-3"
          value={grade === null ? "" : String(grade)}
          options={GRADE_OPTIONS}
          onChange={(value) => setState((current) => (current ? { ...current, grade: value === "" ? null : Number(value) } : current))}
        />
        {hasGenderChoice ? (
          <Picker
            label="Competes with"
            className="col-span-2 sm:col-span-2"
            value={selection.gender}
            options={options.genders.map((gender) => ({ value: gender, label: GENDER_LABEL[gender] }))}
            onChange={(gender) => choose({ gender: gender as Gender })}
          />
        ) : null}
        <Picker
          label={isTrack ? "Event" : "Position"}
          className="col-span-2 sm:col-span-4"
          value={selection.positionOrEvent}
          options={plainOptions(options.positions)}
          onChange={(positionOrEvent) => choose({ positionOrEvent })}
        />
        {hasMetricChoice ? (
          <Picker
            label="What was measured"
            className="col-span-2 sm:col-span-5"
            value={selection.metric}
            options={plainOptions(options.metrics.map((option) => option.metric))}
            onChange={(metric) => choose({ metric })}
          />
        ) : null}

        <div className="col-span-2 sm:col-span-5">
          <label htmlFor={valueId} className="block text-[0.9375rem] font-bold">
            {selection.metric} ({guide.unitLabel})
          </label>
          {/* Yellow marks the athlete's own number, so the field is yellow only once it holds one. */}
          <input
            id={valueId}
            className={`field mt-0.5 font-display text-[1.75rem] leading-none font-extrabold ${parsed?.ok ? "bg-hurdle-yellow" : ""}`}
            type="text"
            inputMode="decimal"
            autoComplete="off"
            value={rawValue}
            onChange={(event) => setState((current) => (current ? { ...current, rawValue: event.target.value } : current))}
            aria-describedby={messageId}
            aria-invalid={errorMessage ? true : undefined}
          />
        </div>

        <p id={messageId} data-testid="value-message" className={`col-span-2 sm:col-span-12 ${errorMessage ? "font-bold" : "text-[0.9375rem]"}`}>
          {errorMessage ?? guide.hint}
        </p>
      </form>

      {/* Read out to screen readers each time the result changes. */}
      <p className="sr-only" aria-live="polite" data-testid="live-result">
        {comparisons[0] ? screenReaderText(comparisons[0]) : (errorMessage ?? "")}
      </p>

      <div className="mt-3">
        {rulers.map((set, index) => (
          <section key={set.id} className={index === 0 ? "" : "mt-5 border-t-2 border-chalk pt-3"}>
            {index > 0 ? (
              <>
                <h2 className="text-[1.75rem]">The same number on a second guide</h2>
                <p className="mt-1 mb-2 max-w-80">
                  Recruiting guides don&apos;t agree on every number, so {selection.metric.toLowerCase()} gets a ruler for
                  each guide.
                </p>
              </>
            ) : null}
            <GapRuler set={set} comparison={comparisons.find((comparison) => comparison.set.id === set.id) ?? null} />
          </section>
        ))}
      </div>

      {needsSeniorTargetsNote(grade) ? (
        <p data-testid="senior-note" className="mt-3 max-w-80 border-l-4 border-infield-navy pl-2">
          <strong>These are senior-year targets.</strong> A younger athlete isn&apos;t expected to be there yet. Choose a
          grade above to change this note.
        </p>
      ) : null}

      <p className="mt-4">
        <Link href="/signup" className="button w-full sm:w-auto">
          Get the full report
        </Link>
      </p>
      <p className="mt-1 text-[0.9375rem]">Free. Nothing you type on this page is saved.</p>
    </div>
  );
}
