import type { StrengthDayId } from "./library-schema.ts";
import { STRENGTH_DAY_POSITIONS, THROWING_DAY_POSITIONS } from "./rules.ts";
import type { DayIndex, PlanDay, Session, SessionBlock } from "./types.ts";

/**
 * Lays one week out day by day. Pure and rule-checked:
 *   - strength days never fall on consecutive days (positions in STRENGTH_DAY_POSITIONS);
 *   - hard days never exceed the tier's limit;
 *   - at least one full rest day is kept;
 *   - a run marked `notAfterStrength` never lands the day after a strength day.
 * Work that cannot be placed without breaking a rule is left out and reported, never squeezed in.
 */

export const DAY_NAMES = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"] as const;
const DAYS: readonly DayIndex[] = [0, 1, 2, 3, 4, 5, 6];
const MIN_REST_DAYS = 1;

export type StrengthDayPlan = { id: StrengthDayId; title: string; blocks: SessionBlock[] };

export type RunPlan = {
  title: string;
  block: SessionBlock;
  isHard: boolean;
  /** speed_endurance: "Never on the day after a hard strength day." */
  notAfterStrength: boolean;
  /** Easy runs may share a strength day when every free day is taken. */
  canShareStrengthDay: boolean;
};

export type WeekRequest = {
  strengthDays: readonly StrengthDayPlan[];
  /** Work for each throwing day, or null for no throwing days. */
  throwingBlock: SessionBlock | null;
  runs: readonly RunPlan[];
  hardDayLimit: number;
  /** "Warm-up (every session)": added in front of any session that starts on an empty day. */
  warmup: SessionBlock;
};

type Slot = { titles: string[]; blocks: SessionBlock[]; isHard: boolean; strengthDay: StrengthDayId | null };

const previous = (day: number): number => (day + 6) % 7;

function emptyWeek(): Slot[] {
  return DAYS.map(() => ({ titles: [], blocks: [], isHard: false, strengthDay: null }));
}

function hardCount(slots: readonly Slot[]): number {
  return slots.filter((slot) => slot.isHard).length;
}

function freeDays(slots: readonly Slot[]): number[] {
  return DAYS.filter((day) => slots[day]?.titles.length === 0);
}

function addTo(slots: readonly Slot[], day: number, title: string, blocks: SessionBlock[], isHard: boolean, warmup?: SessionBlock): Slot[] {
  return slots.map((slot, index) => {
    if (index !== day) return slot;
    const needsWarmup = warmup !== undefined && slot.blocks.length === 0 && blocks[0]?.kind !== "warmup";
    const added = needsWarmup ? [warmup, ...blocks] : blocks;
    return { ...slot, titles: [...slot.titles, title], blocks: [...slot.blocks, ...added], isHard: slot.isHard || isHard };
  });
}

/** Would adding hard work on this day stay within the limit? */
function fitsHardLimit(slots: readonly Slot[], day: number, isHard: boolean, limit: number): boolean {
  return !isHard || slots[day]?.isHard === true || hardCount(slots) + 1 <= limit;
}

function placeStrength(slots: Slot[], strengthDays: readonly StrengthDayPlan[]): Slot[] {
  const positions = STRENGTH_DAY_POSITIONS[strengthDays.length as 1 | 2 | 3] ?? [];
  return strengthDays.reduce((week, plan, index) => {
    const day = positions[index] as number;
    const placed = addTo(week, day, plan.title, plan.blocks, true);
    return placed.map((slot, i) => (i === day ? { ...slot, strengthDay: plan.id } : slot));
  }, slots);
}

function placeThrowing(slots: Slot[], block: SessionBlock | null, limit: number, warmup: SessionBlock, leftOut: string[]): Slot[] {
  if (!block) return slots;
  return THROWING_DAY_POSITIONS.reduce((week, day) => {
    if (!fitsHardLimit(week, day, true, limit)) {
      leftOut.push(`One throwing day was left out on ${DAY_NAMES[day]} to stay within ${limit} hard days a week.`);
      return week;
    }
    return addTo(week, day, "Throwing", [block], true, warmup);
  }, slots);
}

function runDayChoices(slots: readonly Slot[], run: RunPlan, limit: number): number[] {
  // Taking a free day must still leave at least one full rest day.
  const free = freeDays(slots).length > MIN_REST_DAYS ? freeDays(slots) : [];
  const allowed = free.filter((day) => fitsHardLimit(slots, day, run.isHard, limit));
  const afterStrength = (day: number) => slots[previous(day)]?.strengthDay !== null;
  const hardNeighbours = (day: number) => Number(slots[previous(day)]?.isHard === true) + Number(slots[(day + 1) % 7]?.isHard === true);
  const usable = run.notAfterStrength ? allowed.filter((day) => !afterStrength(day)) : allowed;
  // Hard runs prefer a day with easy or rest days either side. Sorting is stable, so ties keep weekday order.
  return run.isHard ? [...usable].sort((a, b) => hardNeighbours(a) - hardNeighbours(b)) : usable;
}

function placeRun(slots: Slot[], run: RunPlan, limit: number, warmup: SessionBlock, leftOut: string[]): Slot[] {
  const [day] = runDayChoices(slots, run, limit);
  if (day !== undefined) return addTo(slots, day, run.title, [run.block], run.isHard, warmup);
  if (run.canShareStrengthDay) {
    const shared = DAYS.find((candidate) => slots[candidate]?.strengthDay !== null && !slots[candidate]?.blocks.some((b) => b.kind === "running"));
    if (shared !== undefined) return addTo(slots, shared, run.title, [run.block], false);
  }
  leftOut.push(`${run.title} was left out this week: it would break the hard-day or rest-day rules.`);
  return slots;
}

function toSession(slot: Slot): Session | null {
  if (slot.titles.length === 0) return null;
  const [first, ...rest] = slot.titles;
  const title = rest.length === 0 ? (first as string) : `${first} and ${rest.map((part) => part.toLowerCase()).join(" and ")}`;
  return { title, isHard: slot.isHard, strengthDay: slot.strengthDay, blocks: slot.blocks };
}

export function layOutWeek(request: WeekRequest): { days: PlanDay[]; leftOut: string[] } {
  const leftOut: string[] = [];
  let slots = placeStrength(emptyWeek(), request.strengthDays);
  slots = placeThrowing(slots, request.throwingBlock, request.hardDayLimit, request.warmup, leftOut);
  // Hard runs first, so the easy ones fill in around them.
  const ordered = [...request.runs].sort((a, b) => Number(b.isHard) - Number(a.isHard));
  for (const run of ordered) slots = placeRun(slots, run, request.hardDayLimit, request.warmup, leftOut);
  return { days: DAYS.map((day) => ({ day, session: toSession(slots[day] as Slot) })), leftOut };
}
