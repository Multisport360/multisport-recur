import type { Comparison } from "./compare.ts";
import { formatGap, formatRange, formatValue, spokenValue } from "./format.ts";
import { isRoughGuide } from "./levels.ts";
import { stepLabel } from "./sets.ts";

/**
 * The words that go with a comparison. Status is always said in words,
 * never left to colour or position alone.
 */

/** Who the sentence is about. Leave out for "You". */
export type Subject = { firstName: string } | undefined;

function subjectIs(subject: Subject): string {
  return subject ? `${subject.firstName} is` : "You're";
}

/** Name of the level reached: "D2", or "D2 and D3/NAIA" when levels share an entry number. */
export function reachedName(comparison: Comparison): string | null {
  if (comparison.reachedStep) return stepLabel(comparison.reachedStep);
  return comparison.reachedLevel?.label ?? null;
}

export function nextName(comparison: Comparison): string | null {
  if (comparison.nextStep) return stepLabel(comparison.nextStep);
  return comparison.nextLevel?.label ?? null;
}

function rangeText(comparison: Comparison, low: number, high: number | null): string {
  const { unit } = comparison.set;
  return high === null ? formatValue(low, unit) : formatRange(low, high, unit);
}

function thresholdHeadline(comparison: Comparison, subject: Subject): string {
  const { unit } = comparison.set;
  const reached = reachedName(comparison);
  const next = nextName(comparison);
  const who = subjectIs(subject);

  if (comparison.standing === "below_lowest" && next && comparison.gap !== null) {
    return `${who} ${formatGap(comparison.gap, unit)} short of ${next} range.`;
  }
  if (comparison.standing === "in_level" && reached && next && comparison.gap !== null) {
    return `${who} in ${reached} range. ${formatGap(comparison.gap, unit)} to ${next}.`;
  }

  // At the top there is no gap to chase, so say where the level's own numbers run to.
  const top = comparison.reachedLevel;
  const base = `${who} in ${reached} range. ${top?.label} is the top level in this guide.`;
  if (!top || top.elite === null) return base;
  return `${base} This guide's ${top.label} numbers run from ${formatRange(top.entry, top.elite, unit)}.`;
}

function rangeHeadline(comparison: Comparison, subject: Subject): string {
  const { unit } = comparison.set;
  const { reachedLevel, nextLevel, gap } = comparison;
  const who = subjectIs(subject);

  if (comparison.standing === "above_range") {
    return `${who} above the typical range for every level listed.`;
  }
  const nextPart =
    nextLevel && gap !== null
      ? `${formatGap(gap, unit)} under the typical ${nextLevel.label} range (${rangeText(comparison, nextLevel.entry, nextLevel.elite)}).`
      : "";
  if (!reachedLevel) return `${who} ${nextPart}`;

  const inside = `${who} inside the typical ${reachedLevel.label} range (${rangeText(comparison, reachedLevel.entry, reachedLevel.elite)}).`;
  return nextPart ? `${inside} ${nextPart}` : inside;
}

/** The one-line result: "You're in D2 range. 6 mph to D1 mid-major." */
export function headline(comparison: Comparison, subject?: Subject): string {
  return comparison.kind === "range" ? rangeHeadline(comparison, subject) : thresholdHeadline(comparison, subject);
}

/** The same result for a screen reader: "84 mph, D2 range, 6 mph short of D1 mid-major". */
export function screenReaderText(comparison: Comparison): string {
  const { unit } = comparison.set;
  const reached = reachedName(comparison);
  const next = nextName(comparison);
  const parts = [spokenValue(comparison.value, unit)];

  if (comparison.kind === "range") {
    if (comparison.standing === "above_range") {
      parts.push("above the typical range for every level listed");
    } else {
      if (comparison.reachedLevel) {
        const { entry, elite, label } = comparison.reachedLevel;
        const top = elite === null ? "" : ` to ${spokenValue(elite, unit)}`;
        parts.push(`inside the typical ${label} range of ${spokenValue(entry, unit)}${top}`);
      }
      if (next && comparison.gap !== null) {
        parts.push(`${spokenValue(comparison.gap, unit)} under the typical ${next} range`);
      }
    }
  } else if (comparison.standing === "below_lowest" && next && comparison.gap !== null) {
    parts.push(`below ${next} range`, `${spokenValue(comparison.gap, unit)} short of ${next}`);
  } else if (comparison.standing === "in_level" && reached && next && comparison.gap !== null) {
    parts.push(`${reached} range`, `${spokenValue(comparison.gap, unit)} short of ${next}`);
  } else {
    parts.push(`${reached} range`, "the top level in this guide");
  }

  if (isRoughGuide(comparison.confidence)) parts.push("rough guide");
  return parts.join(", ");
}

/**
 * Keep a number and its unit on one line: "6 mph", "6' 2\"", "1 inch".
 * Swaps the space between them for a non-breaking space. For display only.
 */
export function keepUnitsTogether(text: string): string {
  return text
    .replace(/(\d) (mph|sec|lb|in|inch|inches)\b/g, "$1\u00a0$2")
    .replace(/(\d') (\d)/g, "$1\u00a0$2");
}
