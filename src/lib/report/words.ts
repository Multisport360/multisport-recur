import { formatGap } from "@/lib/benchmarks/format";
import type { Better, Unit } from "@/lib/benchmarks/types";
import type { HowMeasured } from "./build";

/** Small pieces of report wording, kept together so they read the same everywhere. */

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

/** "2026-11-01" -> "Nov 1, 2026". Read as a calendar date, so time zones never shift it. */
export function formatDay(isoDay: string): string {
  const [year, month, day] = isoDay.split("-").map(Number);
  return `${MONTHS[(month ?? 1) - 1]} ${day}, ${year}`;
}

const MEASURED_BY: Record<HowMeasured, string> = {
  self: "measured at home",
  coach: "measured by a coach",
  event: "measured at an event",
};

export function measuredBy(how: HowMeasured): string {
  return MEASURED_BY[how];
}

/** "3 mph better", "0.2 sec slower", "No change". */
export function changeWords(improvement: number, unit: Unit, better: Better): string {
  if (improvement === 0) return "No change";
  const amount = formatGap(Math.abs(improvement), unit);
  if (better === "lower") return `${amount} ${improvement > 0 ? "faster" : "slower"}`;
  return `${amount} ${improvement > 0 ? "better" : "worse"}`;
}
