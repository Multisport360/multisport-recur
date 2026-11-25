import { describe, expect, test } from "vitest";
import { buildPlan } from "./builder";
import { MODULE_IDS, SEASON_PHASES, type ModuleId, type SeasonPhase } from "./library-schema";
import { ADDED_THROWING_VOLUME, HARD_DAY_LIMIT, INTERVAL_THROWING, PAIN_LINE, THROWING_CAUTION, THROWING_ITEMS } from "./rules";
import { MAX_FOCUS_MODULES } from "./select";
import { draftLibrary, gap, screens } from "./test-library";
import type { AthleteSportRef, BuiltPlan, PlanInput, PlanWeek, StatGap } from "./types";

const library = draftLibrary();
const PITCHER: AthleteSportRef = { sport: "Baseball", positionOrEvent: "Pitcher" };
const CATCHER: AthleteSportRef = { sport: "Baseball", positionOrEvent: "Catcher" };
const SPRINTER: AthleteSportRef = { sport: "Track & Field", positionOrEvent: "100m" };
const HURDLER: AthleteSportRef = { sport: "Track & Field", positionOrEvent: "300m hurdles" };
const WR: AthleteSportRef = { sport: "Football", positionOrEvent: "WR" };

function input(overrides: Partial<PlanInput>): PlanInput {
  return { grade: 10, sports: [PITCHER], gaps: [gap("Fastball velocity", 0.05)], screens: screens(), ...overrides };
}

function plan(overrides: Partial<PlanInput>): BuiltPlan {
  const result = buildPlan(library, input(overrides));
  if (result.kind !== "plan") throw new Error(`expected a plan, got: ${result.message}`);
  return result;
}

const allItems = (p: BuiltPlan) => p.weeks.flatMap((week) => week.days.flatMap((day) => day.session?.blocks.flatMap((block) => block.items) ?? []));
const itemNames = (p: BuiltPlan) => new Set(allItems(p).map((item) => item.name));
const strengthDays = (week: PlanWeek) => week.days.filter((day) => day.session?.strengthDay).map((day) => day.day);
const hardDays = (week: PlanWeek) => week.days.filter((day) => day.session?.isHard).length;
const restDays = (week: PlanWeek) => week.days.filter((day) => day.session === null).length;

/** The scheduling rules every week must keep, whatever the athlete. */
function expectRulesHold(p: BuiltPlan) {
  for (const week of p.weeks) {
    const days = strengthDays(week);
    for (const day of days) expect(days, `week ${week.week}: strength on consecutive days`).not.toContain(day + 1);
    // Weeks repeat, so Sunday and the next Monday must not both be strength days.
    expect(days.includes(6) && days.includes(0)).toBe(false);
    expect(hardDays(week), `week ${week.week}: hard days`).toBeLessThanOrEqual(HARD_DAY_LIMIT[p.tier]);
    expect(restDays(week), `week ${week.week}: rest days`).toBeGreaterThanOrEqual(1);
    for (const day of week.days) {
      const isSpeedEndurance = day.session?.title.includes("Speed endurance run");
      const dayBefore = week.days[(day.day + 6) % 7];
      if (isSpeedEndurance) expect(dayBefore?.session?.strengthDay ?? null, "speed endurance the day after strength").toBeNull();
      if (day.session) expect(day.session.blocks[0]?.kind, `week ${week.week} day ${day.day} starts with a warm-up`).toBe("warmup");
    }
  }
}

describe("the pain_now screen", () => {
  test("yes means no plan, only the message", () => {
    expect(buildPlan(library, input({ screens: screens({ painNow: true }) }))).toEqual({
      kind: "stopped",
      message: "Get this checked by a doctor or athletic trainer before starting a training plan.",
    });
  });
});

describe("the throwing_arm_pain screen", () => {
  test("yes removes every throwing item and shows the message", () => {
    const p = plan({ screens: screens({ throwingArmPain: true }) });
    for (const name of THROWING_ITEMS) expect(itemNames(p)).not.toContain(name);
    expect(p.weeks.every((week) => week.days.every((day) => !day.session?.blocks.some((block) => block.kind === "throwing")))).toBe(true);
    expect(p.messages).toContain("Have the arm checked by a doctor or athletic trainer before adding throwing.");
    expectRulesHold(p);
  });

  test("no keeps the throwing work on 3 days a week with a day between", () => {
    const p = plan({ screens: screens({ throwingArmPain: false }) });
    expect(itemNames(p)).toContain(INTERVAL_THROWING);
    const throwingDays = (p.weeks[0] as PlanWeek).days.filter((day) => day.session?.blocks.some((block) => block.kind === "throwing")).map((day) => day.day);
    expect(throwingDays).toEqual([0, 2, 4]);
    expect(p.messages).toEqual([]);
  });
});

describe("the training_age screen and the two tiers", () => {
  test("no year of coached training means Foundation: Strength A and B on 2 non-consecutive days", () => {
    const p = plan({ grade: 11, screens: screens({ hasTrainingAge: false }) });
    expect(p.tier).toBe("foundation");
    expect(p.hardDayLimit).toBe(4);
    for (const week of p.weeks) expect(strengthDays(week)).toEqual([0, 3]);
    expect(allItems(p).find((item) => item.name.startsWith("Squat"))?.dose).toBe("2 × 8–10");
    expectRulesHold(p);
  });

  test("a year of coached training in 9th grade or later means Development: Strength A, B and C", () => {
    const p = plan({ grade: 11, screens: screens({ hasTrainingAge: true }) });
    expect(p.tier).toBe("development");
    expect(p.hardDayLimit).toBe(5);
    for (const week of p.weeks) expect(strengthDays(week)).toEqual([0, 2, 4]);
    expect((p.weeks[2] as PlanWeek).days[4]?.session?.title).toMatch(/^Strength C/);
    expect(itemNames(p)).toContain("Trap bar deadlift");
    expectRulesHold(p);
  });

  test("an 8th grader with a year of training still gets Foundation", () => {
    const p = plan({ grade: 8, screens: screens({ hasTrainingAge: true }) });
    expect(p.tier).toBe("foundation");
    expect(itemNames(p)).not.toContain("Trap bar deadlift");
  });

  test("Foundation leaves out Development-only items", () => {
    const p = plan({ sports: [SPRINTER], gaps: [gap("100m", 0.04, "Track & Field", "100m", "sec")] });
    expect([...itemNames(p)].some((name) => name.startsWith("Light sled"))).toBe(false);
    const dev = plan({ sports: [SPRINTER], gaps: [gap("100m", 0.04, "Track & Field", "100m", "sec")], grade: 12, screens: screens({ hasTrainingAge: true }) });
    expect([...itemNames(dev)].some((name) => name.startsWith("Light sled"))).toBe(true);
  });
});

describe("the season_phase screen", () => {
  const squatDose = (p: BuiltPlan, week: number) =>
    (p.weeks[week - 1] as PlanWeek).days.flatMap((day) => day.session?.blocks.flatMap((block) => block.items) ?? []).find((item) => item.name.startsWith("Squat"))?.dose;
  const dev = (phase: SeasonPhase) => plan({ grade: 11, screens: screens({ hasTrainingAge: true, seasonPhase: phase }) });

  test("off-season is the full plan: the listed range from week 3", () => {
    const p = dev("off_season");
    expect(p.seasonText).toBe("Full plan.");
    expect(squatDose(p, 1)).toBe("3 × 4–6");
    expect(squatDose(p, 3)).toBe("3–4 × 4–6");
    expect(strengthDays(p.weeks[2] as PlanWeek)).toEqual([0, 2, 4]);
  });

  test("pre-season keeps every day but drops strength to the low end of the sets", () => {
    const p = dev("pre_season");
    expect(squatDose(p, 3)).toBe("3 × 4–6");
    expect(strengthDays(p.weeks[2] as PlanWeek)).toEqual([0, 2, 4]);
  });

  test("in-season drops to 2 strength days (Development) or 1 (Foundation), at the low end", () => {
    const p = dev("in_season");
    for (const week of p.weeks) expect(strengthDays(week)).toEqual([0, 3]);
    expect(squatDose(p, 3)).toBe("3 × 4–6");
    const foundation = plan({ screens: screens({ seasonPhase: "in_season" }) });
    for (const week of foundation.weeks) expect(strengthDays(week)).toHaveLength(1);
    // Foundation alternates A and B so both stay in the plan.
    expect(foundation.weeks.map((week) => week.days[0]?.session?.strengthDay)).toEqual(["strength_a", "strength_b", "strength_a", "strength_b", "strength_a", "strength_b"]);
  });

  test("in-season, pitchers get no added throwing volume; other throwers keep it", () => {
    const pitcher = plan({ screens: screens({ seasonPhase: "in_season" }) });
    for (const name of ADDED_THROWING_VOLUME) expect(itemNames(pitcher)).not.toContain(name);
    const infielder = plan({
      sports: [{ sport: "Baseball", positionOrEvent: "Infield (3B)" }],
      gaps: [gap("Infield throwing velocity", 0.05)],
      screens: screens({ seasonPhase: "in_season" }),
    });
    expect(itemNames(infielder)).toContain(INTERVAL_THROWING);
  });

  test("rest period removes every throwing item and shows the season text; strength and movement stay", () => {
    const p = plan({ screens: screens({ seasonPhase: "rest_period" }) });
    expect(p.seasonPhase).toBe("rest_period");
    for (const name of THROWING_ITEMS) expect(itemNames(p)).not.toContain(name);
    expect(p.messages).toContain(library.season_phases.rest_period);
    expect(itemNames(p)).toContain("Rotational medicine ball throw into a wall (3–4 kg)");
    expect([...itemNames(p)].some((name) => name.startsWith("Squat"))).toBe(true);
    expectRulesHold(p);
  });

  test("the rest period is baseball only: anyone else gets the off-season plan", () => {
    const p = plan({ sports: [WR], gaps: [gap("40-yard dash", 0.03, "Football", "WR", "sec")], screens: screens({ seasonPhase: "rest_period" }) });
    expect(p.seasonPhase).toBe("off_season");
  });
});

describe("choosing focus modules", () => {
  test("at most 2, the biggest gaps as a share of the next level's number", () => {
    const p = plan({
      sports: [WR],
      gaps: [
        gap("40-yard dash", 0.02, "Football", "WR", "sec"),
        gap("Vertical jump", 0.15, "Football", "WR", "in"),
        gap("Bench press (1RM)", 0.08, "Football", "WR", "lb"),
      ],
    });
    expect(p.modules).toHaveLength(MAX_FOCUS_MODULES);
    expect(p.modules.map((mod) => mod.id)).toEqual(["power", "upper_strength"]);
    expect(itemNames(p)).not.toContain("Flying sprints (build up 15–20 m, sprint 10–20 m)");
  });

  test("compares across units: 0.3 sec on a 6.9 sec dash beats 4 mph on 88 mph", () => {
    const share = (gapValue: number, next: number) => gapValue / next;
    const dash: StatGap = { ...gap("60-yard dash", 0), unit: "sec", nextLevelEntry: 6.9, gap: 0.3 };
    const velocity: StatGap = { ...gap("Fastball velocity", 0), nextLevelEntry: 88, gap: 4 };
    expect(share(0.3, 6.9)).toBeLessThan(share(4, 88)); // 4.3% vs 4.5%
    expect(plan({ gaps: [dash, velocity] }).modules.map((mod) => mod.id)).toEqual(["throwing_velocity", "speed"]);
  });

  test("two stats for one module count once, at the bigger gap", () => {
    const p = plan({ sports: [SPRINTER], gaps: [gap("100m", 0.02, "Track & Field", "100m", "sec"), gap("200m", 0.05, "Track & Field", "200m", "sec")] });
    expect(p.modules.map((mod) => mod.id)).toEqual(["speed"]);
    expect(p.modules[0]?.gaps.map((g) => g.metric)).toEqual(["200m", "100m"]);
  });

  test("upper-body strength replaces the pressing exercise on strength days", () => {
    const p = plan({ sports: [WR], gaps: [gap("Bench press (1RM)", 0.1, "Football", "WR", "lb")] });
    expect(itemNames(p)).not.toContain("Push-up (Foundation) / dumbbell bench press (Development)");
    expect(itemNames(p)).not.toContain("Half-kneeling one-arm dumbbell press");
    expect(itemNames(p)).toContain("Barbell bench press (Development) / dumbbell bench press (Foundation)");
  });

  test("hurdle-only items appear only for hurdlers", () => {
    const flat = plan({ sports: [{ sport: "Track & Field", positionOrEvent: "400m" }], gaps: [gap("400m", 0.05, "Track & Field", "400m", "sec")] });
    expect([...itemNames(flat)].some((name) => name.includes("hurdle events only"))).toBe(false);
    const hurdler = plan({ sports: [HURDLER], gaps: [gap("300m hurdles", 0.05, "Track & Field", "300m hurdles", "sec")] });
    expect([...itemNames(hurdler)].some((name) => name.includes("hurdle events only"))).toBe(true);
    expectRulesHold(hurdler);
  });
});

describe("height and weight", () => {
  test("never get a module: an athlete whose only gaps are height and weight gets the strength base and both messages", () => {
    const p = plan({ sports: [WR], gaps: [gap("Height", 0.03, "Football", "WR", "in"), gap("Weight", 0.1, "Football", "WR", "lb")] });
    expect(p.modules).toEqual([]);
    expect(p.messages).toEqual(library.not_trainable.map((entry) => entry.message));
    expect(p.weeks[0]?.days.filter((day) => day.session).map((day) => day.session?.title)).toEqual(["Strength A", "Strength B"]);
    expect((p.weeks[0] as PlanWeek).days[0]?.session?.blocks.map((block) => block.kind)).toEqual(["warmup", "strength"]);
    expectRulesHold(p);
  });
});

describe("safety notes", () => {
  test("every plan starts with the pain line and the notes of its modules", () => {
    const p = plan({ sports: [SPRINTER], gaps: [gap("100m", 0.05, "Track & Field", "100m", "sec")] });
    expect(p.safetyNotes[0]).toBe(PAIN_LINE);
    for (const note of library.focus_modules.find((mod) => mod.id === "speed")?.notes ?? []) expect(p.safetyNotes).toContain(note);
  });

  test("throwing work before 11th grade adds the extra caution; none once throwing is removed", () => {
    expect(plan({ grade: 10 }).safetyNotes).toContain(THROWING_CAUTION);
    expect(plan({ grade: 11 }).safetyNotes).not.toContain(THROWING_CAUTION);
    expect(plan({ grade: 10, screens: screens({ seasonPhase: "rest_period" }) }).safetyNotes).not.toContain(THROWING_CAUTION);
  });

  test("a module pulled in as a companion brings its notes too (catcher pop time adds throwing velocity)", () => {
    const p = plan({ sports: [CATCHER], gaps: [gap("Pop time", 0.1, "Baseball", "Catcher", "sec")] });
    expect(p.safetyNotes).toContain("No weighted-ball (overload) throwing in any plan.");
  });
});

describe("the 6-week block", () => {
  test("has 6 weeks; weeks 1–2 use the low end, week 6 asks for the retest", () => {
    const p = plan({});
    expect(p.weeks.map((week) => week.week)).toEqual([1, 2, 3, 4, 5, 6]);
    expect(p.weeks[0]?.note).toBe("Weeks 1–2 learn the movements at the listed low end.");
    expect(p.weeks[5]?.note).toContain(library.block.retest);
  });
});

describe("the rules hold for every combination", () => {
  const sportFor: Record<ModuleId, { sport: AthleteSportRef; metric: string }> = {
    speed: { sport: SPRINTER, metric: "100m" },
    power: { sport: WR, metric: "Vertical jump" },
    agility: { sport: WR, metric: "Vertical jump" },
    upper_strength: { sport: WR, metric: "Bench press (1RM)" },
    throwing_velocity: { sport: PITCHER, metric: "Fastball velocity" },
    catcher_pop: { sport: CATCHER, metric: "Pop time" },
    rotational_power: { sport: { sport: "Baseball", positionOrEvent: "Outfield (CF)" }, metric: "Exit velocity" },
    speed_endurance: { sport: HURDLER, metric: "300m hurdles" },
    endurance: { sport: { sport: "Track & Field", positionOrEvent: "1600m" }, metric: "1600m" },
  };
  // Agility has no benchmark metric yet, so it can never be picked; every other pair is checked.
  const pickable = MODULE_IDS.filter((id) => id !== "agility");
  const pairs = pickable.flatMap((a, i) => pickable.slice(i).map((b) => [a, b] as const));

  test.each(pairs)("%s + %s, both tiers, every season phase", (a, b) => {
    for (const hasTrainingAge of [false, true]) {
      for (const seasonPhase of SEASON_PHASES) {
        for (const throwingArmPain of [false, true]) {
          const p = plan({
            grade: 11,
            sports: [sportFor[a].sport, sportFor[b].sport],
            gaps: [gap(sportFor[a].metric, 0.1), gap(sportFor[b].metric, 0.05)],
            screens: screens({ hasTrainingAge, seasonPhase, throwingArmPain }),
          });
          expectRulesHold(p);
          if (throwingArmPain || p.seasonPhase === "rest_period") for (const name of THROWING_ITEMS) expect(itemNames(p)).not.toContain(name);
        }
      }
    }
  });
});
