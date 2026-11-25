import { isLeftOut, lowEndSets, sessionsPerWeek } from "./doses.ts";
import type { Exercise, FocusModule, ModuleId, SeasonPhase, StrengthDayId, TemplateLibrary, TierId, WorkItem } from "./library-schema.ts";
import {
  ADDED_THROWING_VOLUME,
  COMPANION_MODULE,
  ENDURANCE_ROLES,
  FOCUS_ON_STRENGTH_DAYS,
  HARD_DAY_LIMIT,
  HURDLE_ONLY,
  INTERVAL_THROWING,
  PAIN_LINE,
  PRESS_EXERCISE,
  screenMessage,
  THROWING_CAUTION,
  THROWING_CAUTION_BELOW_GRADE,
  THROWING_DAY_POSITIONS,
  THROWING_ITEMS,
} from "./rules.ts";
import { layOutWeek, type RunPlan, type StrengthDayPlan } from "./schedule.ts";
import { chooseModules, chooseTier, notTrainableMessages } from "./select.ts";
import type { BuiltPlan, ChosenModule, PlanInput, PlanItem, PlanResult, PlanWeek, SessionBlock } from "./types.ts";

/**
 * Builds a 6-week plan from a template library. Plain code, no AI: it only picks and
 * arranges items the template already contains, following plan_rules, tiers and season_phases.
 */

type Context = {
  library: TemplateLibrary;
  tier: TierId;
  phase: SeasonPhase;
  week: number;
  modules: readonly ChosenModule[];
  /** Chosen modules plus their companions (see COMPANION_MODULE). */
  activeIds: ReadonlySet<ModuleId>;
  throwingRemoved: boolean;
  pitcherInSeason: boolean;
  hasHurdles: boolean;
};

const LOW_END_WEEKS = 2;

/** Weeks 1–2 and the pre-season and in-season phases use the low end of the sets listed. */
const lowStrength = (ctx: Context) => ctx.week <= LOW_END_WEEKS || ctx.phase === "pre_season" || ctx.phase === "in_season";
/** In season, speed and power work stays short and crisp: low end too. */
const lowFocus = (ctx: Context) => ctx.week <= LOW_END_WEEKS || ctx.phase === "in_season";

function moduleById(library: TemplateLibrary, id: ModuleId): FocusModule {
  return library.focus_modules.find((mod) => mod.id === id) as FocusModule;
}

function keepsItem(ctx: Context, name: string): boolean {
  if (ctx.throwingRemoved && THROWING_ITEMS.includes(name)) return false;
  if (ctx.pitcherInSeason && ADDED_THROWING_VOLUME.includes(name)) return false;
  if (!ctx.hasHurdles && name.includes(HURDLE_ONLY)) return false;
  return true;
}

function toItem(item: WorkItem | Exercise, tier: TierId, low: boolean): PlanItem | null {
  const dose = item[tier];
  if (isLeftOut(dose)) return null;
  return { name: item.name, dose: low ? lowEndSets(dose as string) : (dose as string), rest: item.rest, cue: "cue" in item ? item.cue : null };
}

function items(ctx: Context, work: readonly (WorkItem | Exercise)[], low: boolean): PlanItem[] {
  return work.filter((item) => keepsItem(ctx, item.name)).flatMap((item) => toItem(item, ctx.tier, low) ?? []);
}

function block(kind: SessionBlock["kind"], heading: string, list: PlanItem[]): SessionBlock[] {
  return list.length > 0 ? [{ kind, heading, items: list }] : [];
}

function warmup(ctx: Context): SessionBlock {
  return { kind: "warmup", heading: ctx.library.warmup.name, items: ctx.library.warmup.items.map((item) => ({ name: item.name, dose: item.dose, rest: null, cue: null })) };
}

/** Work that runs on throwing days: the interval program and the catcher drills. */
function throwingDayWork(ctx: Context): PlanItem[] {
  // The template doses the interval program per week ("3–4 days a week"); a day shows its share of that.
  const fromVelocity = ctx.modules.some((mod) => mod.id === "throwing_velocity")
    ? items(ctx, moduleById(ctx.library, "throwing_velocity").work.filter((item) => item.name === INTERVAL_THROWING), true).map((item) => ({
        ...item,
        dose: `One of the ${THROWING_DAY_POSITIONS.length} throwing days this week`,
      }))
    : [];
  const fromCatcher = ctx.activeIds.has("catcher_pop") ? items(ctx, moduleById(ctx.library, "catcher_pop").work, lowFocus(ctx)) : [];
  return [...fromVelocity, ...fromCatcher];
}

function hasThrowingDays(ctx: Context): boolean {
  return throwingDayWork(ctx).some((item) => THROWING_ITEMS.includes(item.name));
}

function focusBlocks(ctx: Context, day: StrengthDayId): SessionBlock[] {
  const blocks = [...ctx.activeIds].flatMap((id) => {
    const mod = moduleById(ctx.library, id);
    const onThisDay = FOCUS_ON_STRENGTH_DAYS[id]?.includes(day) ?? false;
    if (onThisDay) {
      const work = id === "throwing_velocity" ? mod.work.filter((item) => item.name !== INTERVAL_THROWING) : mod.work;
      return block("focus", `Focus: ${mod.name}`, items(ctx, work, lowFocus(ctx)));
    }
    // Catcher drills move to strength days A and B when there are no throwing days to hold them.
    if (id === "catcher_pop" && !hasThrowingDays(ctx) && day !== "strength_c") {
      return block("focus", `Focus: ${mod.name}`, items(ctx, mod.work, lowFocus(ctx)));
    }
    return [];
  });
  return blocks;
}

/** "Strength C (Development only)" reads as "Strength C": only Development athletes ever get it. */
function strengthDayName(library: TemplateLibrary, day: StrengthDayId): string {
  return library.strength_days[day].name.replace(/ \(Development only\)$/, "");
}

function strengthBlock(ctx: Context, day: StrengthDayId): SessionBlock {
  const template = ctx.library.strength_days[day];
  const upper = ctx.activeIds.has("upper_strength") ? items(ctx, moduleById(ctx.library, "upper_strength").work, lowStrength(ctx)) : null;
  const list = template.exercises.flatMap((exercise) => {
    if (upper && exercise.name === PRESS_EXERCISE[day]) return upper;
    return toItem(exercise, ctx.tier, lowStrength(ctx)) ?? [];
  });
  return { kind: "strength", heading: strengthDayName(ctx.library, day), items: list };
}

function strengthDayIds(ctx: Context): StrengthDayId[] {
  if (ctx.phase === "in_season") {
    // "Strength days drop to 1–2 per week": Development keeps A and B, Foundation alternates A and B.
    return ctx.tier === "development" ? ["strength_a", "strength_b"] : [ctx.week % 2 === 1 ? "strength_a" : "strength_b"];
  }
  // Distance running: "Running days on top of 2 strength days (Strength A and B only)".
  if (ctx.tier === "foundation" || ctx.activeIds.has("endurance")) return ["strength_a", "strength_b"];
  return ["strength_a", "strength_b", "strength_c"];
}

function strengthDays(ctx: Context): StrengthDayPlan[] {
  return strengthDayIds(ctx).map((id) => ({
    id,
    title: strengthDayName(ctx.library, id),
    blocks: [warmup(ctx), ...focusBlocks(ctx, id), strengthBlock(ctx, id)],
  }));
}

function speedEnduranceRun(ctx: Context): RunPlan[] {
  if (!ctx.activeIds.has("speed_endurance")) return [];
  const mod = moduleById(ctx.library, "speed_endurance");
  const list = items(ctx, mod.work, lowFocus(ctx));
  return [{ title: "Speed endurance run", block: { kind: "running", heading: `Running: ${mod.name}`, items: list }, isHard: true, notAfterStrength: true, canShareStrengthDay: false }];
}

function enduranceRuns(ctx: Context): RunPlan[] {
  if (!ctx.activeIds.has("endurance")) return [];
  const mod = moduleById(ctx.library, "endurance");
  const list = items(ctx, mod.work, false);
  const strides = list.find((item) => ENDURANCE_ROLES[item.name] === "strides");
  const runs: RunPlan[] = [];
  let stridesAdded = false;
  for (const item of list) {
    const role = ENDURANCE_ROLES[item.name];
    if (!role || role === "strides") continue;
    const { count, each } = sessionsPerWeek(item.dose);
    for (let n = 0; n < count; n += 1) {
      const withStrides = role === "easy" && strides && !stridesAdded;
      if (withStrides) stridesAdded = true;
      const runItems = [{ ...item, dose: each }, ...(withStrides && strides ? [strides] : [])];
      const title = role === "easy" ? "Easy run" : role === "tempo" ? "Tempo run" : "Interval run";
      runs.push({ title, block: { kind: "running", heading: `Running: ${mod.name}`, items: runItems }, isHard: role !== "easy", notAfterStrength: false, canShareStrengthDay: role === "easy" });
    }
  }
  return runs;
}

function weekNote(library: TemplateLibrary, week: number): string {
  const sentences = library.block.progression.split(/(?<=\.)\s+/);
  const index = week <= 2 ? 0 : week <= 4 ? 1 : week === 5 ? 2 : 3;
  const note = sentences[index] ?? library.block.progression;
  return week === library.block.weeks ? `${note} ${library.block.retest}` : note;
}

function buildWeek(ctx: Context): { week: PlanWeek; leftOut: string[] } {
  const throwingWork = throwingDayWork(ctx);
  const { days, leftOut } = layOutWeek({
    strengthDays: strengthDays(ctx),
    throwingBlock: hasThrowingDays(ctx) ? { kind: "throwing", heading: "Throwing", items: throwingWork } : null,
    runs: [...speedEnduranceRun(ctx), ...enduranceRuns(ctx)],
    hardDayLimit: HARD_DAY_LIMIT[ctx.tier],
    warmup: warmup(ctx),
  });
  return { week: { week: ctx.week, note: weekNote(ctx.library, ctx.week), days }, leftOut };
}

function safetyNotes(ctx: Omit<Context, "week">, grade: number, weeks: readonly PlanWeek[]): string[] {
  const moduleNotes = [...ctx.activeIds].flatMap((id) => moduleById(ctx.library, id).notes);
  const throws = weeks.some((week) => week.days.some((day) => day.session?.blocks.some((b) => b.items.some((item) => THROWING_ITEMS.includes(item.name)))));
  const caution = throws && grade < THROWING_CAUTION_BELOW_GRADE ? [THROWING_CAUTION] : [];
  return [PAIN_LINE, ...caution, ...new Set(moduleNotes)];
}

function screenMessages(library: TemplateLibrary, input: PlanInput, phase: SeasonPhase): string[] {
  return [
    ...(input.screens.throwingArmPain === true ? [screenMessage(library, "throwing_arm_pain")] : []),
    ...(phase === "rest_period" ? [library.season_phases.rest_period] : []),
  ];
}

export function buildPlan(library: TemplateLibrary, input: PlanInput): PlanResult {
  if (input.screens.painNow) return { kind: "stopped", message: screenMessage(library, "pain_now") };

  const playsBaseball = input.sports.some((sport) => sport.sport === "Baseball");
  const phase: SeasonPhase = input.screens.seasonPhase === "rest_period" && !playsBaseball ? "off_season" : input.screens.seasonPhase;
  const tier = chooseTier(input.grade, input.screens);
  const modules = chooseModules(library, input.gaps);
  const chosenIds = modules.map((mod) => mod.id);
  const companions = chosenIds.flatMap((id) => COMPANION_MODULE[id] ?? []);
  const throwingRemoved = input.screens.throwingArmPain === true || phase === "rest_period";

  const base: Omit<Context, "week"> = {
    library,
    tier,
    phase,
    modules,
    activeIds: new Set([...chosenIds, ...companions]),
    throwingRemoved,
    pitcherInSeason: phase === "in_season" && input.sports.some((sport) => sport.sport === "Baseball" && sport.positionOrEvent === "Pitcher"),
    hasHurdles: input.sports.some((sport) => /hurdles/i.test(sport.positionOrEvent)),
  };

  const built = Array.from({ length: library.block.weeks }, (_, index) => buildWeek({ ...base, week: index + 1 }));
  const weeks = built.map((result) => result.week);
  const plan: BuiltPlan = {
    kind: "plan",
    tier,
    tierLabel: library.tiers[tier].label,
    tierRules: library.tiers[tier].rules,
    seasonPhase: phase,
    seasonText: library.season_phases[phase],
    progression: library.block.progression,
    retest: library.block.retest,
    modules,
    weeks,
    safetyNotes: safetyNotes(base, input.grade, weeks),
    messages: [...screenMessages(library, input, phase), ...notTrainableMessages(library, input.gaps)],
    hardDayLimit: HARD_DAY_LIMIT[tier],
    leftOut: [...new Set(built.flatMap((result) => result.leftOut))],
  };
  return plan;
}
