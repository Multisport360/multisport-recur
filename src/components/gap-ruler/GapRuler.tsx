import { orderSurprises } from "@/lib/benchmarks/anomalies";
import type { Comparison } from "@/lib/benchmarks/compare";
import { headline, keepUnitsTogether, screenReaderText, type Subject } from "@/lib/benchmarks/describe";
import { formatValue, metricInSentence } from "@/lib/benchmarks/format";
import { isRoughGuide } from "@/lib/benchmarks/levels";
import { buildRuler } from "@/lib/benchmarks/ruler";
import type { BenchmarkSet } from "@/lib/benchmarks/sets";
import { LevelDetails } from "./LevelDetails";
import { RangeLanes } from "./RangeLanes";
import { SourceLine } from "./SourceLine";
import { ThresholdTape } from "./ThresholdTape";

type Props = {
  set: BenchmarkSet;
  /** The result for the athlete's number, or null to show the bare ruler. */
  comparison: Comparison | null;
  /** Who the result is about. Leave out to say "You". */
  subject?: Subject;
  /** Shown in place of the result when there is no number yet. */
  emptyText?: string;
};

function emptyLabel(set: BenchmarkSet): string {
  const levels = set.levels.map((level) => level.label).reverse();
  return `${set.metric} ruler with ${levels.join(", ")}. No number entered yet.`;
}

/**
 * Split "You're in D2 range. 1 mph to D1." into the lead sentence (set big) and the rest.
 * A range in brackets moves out of the lead so the big line stays short.
 */
function splitLead(text: string): [string, string] {
  const end = text.indexOf(". ");
  const [lead, rest] = end === -1 ? [text, ""] : [text.slice(0, end + 1), text.slice(end + 2)];
  const bracketed = /^(.*) \((.+)\)\.$/.exec(lead);
  if (!bracketed) return [lead, rest];
  return [`${bracketed[1]}.`, [`That range is ${bracketed[2]}.`, rest].filter(Boolean).join(" ")];
}

/**
 * Plain-word notes about quirks in the guide's data, so the ruler never looks broken.
 * An out-of-order pair is only mentioned when it touches the level reached or the next one.
 */
function guideNotes(set: BenchmarkSet, comparison: Comparison | null): string[] {
  const shown = new Set([comparison?.reachedLevel?.levelCode, comparison?.nextLevel?.levelCode]);
  const matters = (codes: readonly string[]) => comparison === null || codes.some((code) => shown.has(code as never));
  const notes: string[] = [];
  const [onlyLevel] = set.levels;
  if (set.levels.length === 1 && onlyLevel) {
    notes.push(`This guide only gives a ${metricInSentence(set.metric)} number for ${onlyLevel.label}, so there is one level on this ruler.`);
  }
  for (const { higher, lower } of orderSurprises(set)) {
    if (!matters([higher.levelCode, lower.levelCode])) continue;
    notes.push(
      `This guide's ${higher.label} number (${formatValue(higher.entry, set.unit)}) is easier than its ${lower.label} number (${formatValue(lower.entry, set.unit)}). The ruler follows the guide's numbers.`,
    );
  }
  return notes;
}

const OFF_SCALE_TEXT = {
  below: "is a long way short of the first number on this ruler, so the marker sits at the left edge.",
  above: "is beyond the last number on this ruler. Check the number you typed.",
} as const;

/**
 * The GapRuler: a horizontal scale marked with college levels, with the athlete's
 * number as a yellow marker. Where the athlete stands is always said in words as well.
 */
export function GapRuler({ set, comparison, subject, emptyText = "Type a number to see where it lands." }: Props) {
  const value = comparison?.value ?? null;
  const model = buildRuler(set, value);
  const valueLabel = value === null ? null : formatValue(value, set.unit);

  const allRough = set.levels.every((level) => isRoughGuide(level.confidence));
  const someRough = set.levels.some((level) => isRoughGuide(level.confidence));
  const showRoughNote = comparison ? isRoughGuide(comparison.confidence) : allRough;
  const offScale = model.marker?.offScale ?? null;
  const [lead, rest] = splitLead(keepUnitsTogether(comparison ? headline(comparison, subject) : emptyText));

  return (
    <figure data-testid="gap-ruler" data-ruler-id={set.id}>
      <div role="img" aria-label={comparison ? screenReaderText(comparison) : emptyLabel(set)}>
        {model.kind === "range" ? (
          <RangeLanes set={set} model={model} valueLabel={valueLabel} />
        ) : (
          <ThresholdTape set={set} model={model} valueLabel={valueLabel} flagRoughLevels={someRough && !allRough} />
        )}
      </div>

      <figcaption className="mt-2">
        <p data-testid="ruler-result" className="max-w-80 text-[1.25rem] leading-[1.35]">
          <span className={comparison ? "block font-display text-[2rem] leading-[1.1] font-extrabold sm:text-[2.25rem]" : "font-bold"}>
            {lead}
          </span>
          {rest ? <>{" "}<span className="mt-0.5 block">{rest}</span></> : null}
        </p>
        {offScale ? (
          <p data-testid="off-scale" className="mt-1 max-w-80">
            {valueLabel} {OFF_SCALE_TEXT[offScale]}
          </p>
        ) : null}
        {guideNotes(set, comparison).map((note) => (
          <p key={note} data-testid="guide-note" className="mt-1 max-w-80">
            {keepUnitsTogether(note)}
          </p>
        ))}
        {showRoughNote ? (
          <p data-testid="rough-guide" className="mt-1 max-w-80">
            <strong>Rough guide.</strong> These numbers come from a less certain source, so treat the result as a ballpark.
          </p>
        ) : null}
        <SourceLine set={set} />
        <LevelDetails set={set} />
      </figcaption>
    </figure>
  );
}
