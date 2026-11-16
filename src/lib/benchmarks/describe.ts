import type { Comparison } from "./compare.ts";
import { formatGap, formatValue, spokenValue } from "./format.ts";
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
  return high === null ? formatValue(low, unit) : `${formatValue(low, unit)} to ${formatValue(high, unit)}`;
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

  const base = `${who} in ${reached} range, the highest level this source lists.`;
  const nextMark = comparison.topLevel?.nextMark;
  if (!nextMark) return base;
  const where = nextMark.tier === "mid" ? "middle" : "top";
  return `${base} ${formatGap(nextMark.gap, unit)} to the ${where} of ${reached} range.`;
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
    parts.push(`${reached} range`, "the highest level listed");
  }

  if (isRoughGuide(comparison.confidence)) parts.push("rough guide");
  return parts.join(", ");
}
