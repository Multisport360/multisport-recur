import { checkoutTerms, type CheckoutTerms } from "@/config/billing";
import type { BenchmarkSet } from "@/lib/benchmarks/sets";
import { calendarDay, formatDayIn } from "@/lib/dates";
import { failed, fieldErrors, formValues, type FormState } from "@/lib/forms";
import { gradeFromGradYear, needsSeniorTargetsNote } from "@/lib/grade";
import { classLabel } from "@/lib/athletes/rules";
import type { PlanAccess } from "@/lib/billing/subscription";
import { blockPosition, isRetestWeek, sessionKey, weekToShow, type BlockPosition } from "@/lib/plan/block";
import { buildPlan } from "@/lib/plan/builder";
import { gapsFromReports } from "@/lib/plan/gaps";
import type { TemplateLibrary } from "@/lib/plan/library-schema";
import type { PlanResult } from "@/lib/plan/types";
import { buildSportReport, type SportReport, type StatEntry } from "@/lib/report/build";
import { metricChoices } from "@/lib/stats/metric-choices";
import { statFormSchema } from "@/lib/stats/rules";
import type { MetricChoice } from "@/components/report/StatForm";
import { DEMO_ATHLETE, DEMO_SCREENS, DEMO_SPORTS, DEMO_TIME_ZONE, demoAnsweredAt, demoEntries, demoRenewsOn } from "./sample";

/**
 * Everything the demo shows, worked out with the app's own code: the same report builder, benchmark
 * comparisons, form checks and plan builder. Pure functions over the sample family and what the visitor
 * has done in this browser tab. Nothing here reads or writes a database, Stripe, email or AI service.
 */

/** Loaded once on the server: the benchmark rulers for Jordan's sports, and the draft plan templates. */
export type DemoData = { sets: BenchmarkSet[]; library: TemplateLibrary };

/** What the visitor has changed. Kept in memory only, so a reload or "Restart demo" starts over. */
export type DemoState = {
  entries: StatEntry[];
  /** Plan sessions marked done, as sessionKey(week, day). */
  done: string[];
};

export const PAYMENTS_SKIPPED = "Payments are skipped in the demo.";
export const CANCEL_SKIPPED = `${PAYMENTS_SKIPPED} Nothing was cancelled. In the app, this cancels the plan at the end of the paid month.`;
export const CHECKOUT_SKIPPED = `${PAYMENTS_SKIPPED} In the app, this button opens Stripe's secure checkout.`;

export function initialDemoState(today: Date): DemoState {
  return { entries: demoEntries(today), done: [] };
}

const profile = { heightIn: DEMO_ATHLETE.heightIn, weightLb: DEMO_ATHLETE.weightLb };

export function demoToday(today: Date): string {
  return calendarDay(today, DEMO_TIME_ZONE);
}

/** One report per sport, the same way the gap report page builds them. */
export function demoReports(data: DemoData, state: DemoState): SportReport[] {
  return DEMO_SPORTS.map((sport) => buildSportReport(data.sets, sport, DEMO_ATHLETE.gender, state.entries, profile));
}

export function demoReportHeader(today: Date): { classText: string; showSeniorNote: boolean } {
  return {
    classText: classLabel(DEMO_ATHLETE.gradYear, today),
    showSeniorNote: needsSeniorTargetsNote(gradeFromGradYear(DEMO_ATHLETE.gradYear, today)),
  };
}

export function demoMetricChoices(data: DemoData, sportId: string): MetricChoice[] {
  const sport = DEMO_SPORTS.find((candidate) => candidate.id === sportId) ?? DEMO_SPORTS[0];
  if (!sport) return [];
  return metricChoices(data.sets, { sport: sport.sport, positionOrEvent: sport.positionOrEvent, gender: DEMO_ATHLETE.gender });
}

export type SaveResult = { state: DemoState; form: FormState; savedMetric: string | null };

/** "Save this number" in the demo: the real form checks, then the number is added in memory. */
export function saveDemoStat(data: DemoData, state: DemoState, sportId: string, form: FormData, today: Date): SaveResult {
  const values = formValues(form, ["metric", "value", "measuredOn", "howMeasured"]);
  const sport = DEMO_SPORTS.find((candidate) => candidate.id === sportId);
  if (!sport) return { state, form: failed("Choose one of Jordan's sports first.", values), savedMetric: null };

  const parsed = statFormSchema({
    sets: data.sets,
    sport: sport.sport,
    positionOrEvent: sport.positionOrEvent,
    gender: DEMO_ATHLETE.gender,
    today: demoToday(today),
  }).safeParse(values);
  if (!parsed.success) return { state, form: { message: null, fields: fieldErrors(parsed.error), values }, savedMetric: null };

  const entry: StatEntry = {
    id: `demo-added-${state.entries.length}`,
    sport: sport.sport,
    metric: parsed.data.metric,
    value: parsed.data.value,
    unit: parsed.data.unit,
    measuredOn: parsed.data.measuredOn,
    howMeasured: parsed.data.howMeasured,
    createdAt: today.toISOString(),
  };
  // Like stat_entries: never overwritten, every number is a new entry, kept in date order.
  const entries = [...state.entries, entry].sort((a, b) => a.measuredOn.localeCompare(b.measuredOn) || a.createdAt.localeCompare(b.createdAt));
  return { state: { ...state, entries }, form: { message: null, fields: {}, values: {} }, savedMetric: parsed.data.metric };
}

export type DemoPlan = {
  result: PlanResult;
  position: BlockPosition;
  shownWeek: number;
  isRetestWeek: boolean;
  answeredOn: string;
  done: Set<string>;
};

/** Jordan's plan from the draft templates, built by the same plan builder as the app. */
export function demoPlan(data: DemoData, state: DemoState, today: Date, requestedWeek: string | undefined): DemoPlan {
  const answeredAt = demoAnsweredAt(today);
  const result = buildPlan(data.library, {
    grade: gradeFromGradYear(DEMO_ATHLETE.gradYear, today),
    sports: DEMO_SPORTS,
    gaps: gapsFromReports(demoReports(data, state)),
    screens: DEMO_SCREENS,
  });
  const position = blockPosition(answeredAt, today, DEMO_TIME_ZONE);
  const shownWeek = weekToShow(requestedWeek, position.week);
  return {
    result,
    position,
    shownWeek,
    isRetestWeek: isRetestWeek(position.week) && shownWeek === position.week,
    answeredOn: formatDayIn(answeredAt, DEMO_TIME_ZONE),
    done: new Set(state.done),
  };
}

/** Ticks or unticks one session in memory. */
export function toggleDemoSession(state: DemoState, week: number, day: number, done: boolean): DemoState {
  const key = sessionKey(week, day);
  const others = state.done.filter((existing) => existing !== key);
  return { ...state, done: done ? [...others, key] : others };
}

/** The sample family's subscription: active, marked as a demo. */
export function demoAccess(today: Date): PlanAccess {
  return { state: "active", renewsOn: demoRenewsOn(today) };
}

export function demoCheckoutTerms(today: Date): CheckoutTerms {
  return checkoutTerms(today, DEMO_TIME_ZONE);
}

/** The demo's checkout: the same renewal-terms check, then a note instead of Stripe. */
export function demoCheckout(form: FormData): FormState {
  if (form.get("agreesToRenewal") !== "on") {
    return { message: null, fields: { agreesToRenewal: "Tick the box to agree to the renewal terms before you continue." }, values: {} };
  }
  return failed(CHECKOUT_SKIPPED);
}
