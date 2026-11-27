import { describe, expect, test } from "vitest";
import { loadDemoData } from "./load";
import { CHECKOUT_SKIPPED, demoCheckout, demoPlan, demoReports, initialDemoState, saveDemoStat, toggleDemoSession } from "./model";
import { DEMO_ATHLETE, DEMO_SPORTS } from "./sample";

// Friday 27 November 2026, noon Eastern.
const TODAY = new Date("2026-11-27T17:00:00Z");
const data = loadDemoData();
const PITCHER = "demo-baseball-pitcher";

function form(values: Record<string, string>): FormData {
  const data = new FormData();
  for (const [key, value] of Object.entries(values)) data.set(key, value);
  return data;
}

const fastball = (state: ReturnType<typeof initialDemoState>) =>
  demoReports(data, state)
    .find((report) => report.sport === "Baseball")
    ?.metrics.find((metric) => metric.metric === "Fastball velocity");

describe("the sample family", () => {
  test("is Jordan, class of 2028, a baseball pitcher and football WR", () => {
    expect(DEMO_ATHLETE).toMatchObject({ firstName: "Jordan", gradYear: 2028 });
    expect(DEMO_SPORTS.map((sport) => `${sport.sport}, ${sport.positionOrEvent}`)).toEqual(["Baseball, Pitcher", "Football, WR"]);
  });

  test("has 2 or 3 numbers per metric over the last few months, oldest first, none in the future", () => {
    const { entries } = initialDemoState(TODAY);
    const counts = Object.groupBy(entries, (entry) => entry.metric);
    for (const [metric, list] of Object.entries(counts)) expect(list?.length, metric).toBeGreaterThanOrEqual(2);
    for (const [metric, list] of Object.entries(counts)) expect(list?.length, metric).toBeLessThanOrEqual(3);
    expect(entries.map((entry) => entry.measuredOn)).toEqual([...entries.map((entry) => entry.measuredOn)].sort());
    expect(entries.every((entry) => entry.measuredOn <= "2026-11-27" && entry.measuredOn >= "2026-06-01")).toBe(true);
  });

  test("gets rulers only from the benchmark file, for Jordan's sports and gender", () => {
    expect(data.sets.length).toBeGreaterThan(0);
    expect(data.sets.every((set) => set.gender === "Male" && DEMO_SPORTS.some((sport) => sport.sport === set.sport && sport.positionOrEvent === set.positionOrEvent))).toBe(true);
    expect(data.library.review_status).toBe("draft");
  });
});

describe("adding a number in the demo", () => {
  test("a new fastball number becomes the latest and moves the ruler: 81 mph JUCO to 84 mph D1", () => {
    const before = initialDemoState(TODAY);
    expect(fastball(before)?.value).toBe(81);
    expect(fastball(before)?.comparisons[0]?.reachedLevel?.label).toBe("JUCO");

    const saved = saveDemoStat(data, before, PITCHER, form({ metric: "Fastball velocity", value: "84", measuredOn: "2026-11-27", howMeasured: "coach" }), TODAY);
    expect(saved.savedMetric).toBe("Fastball velocity");
    expect(fastball(saved.state)?.value).toBe(84);
    expect(fastball(saved.state)?.comparisons[0]?.reachedLevel?.label).toBe("D1");
    expect(fastball(saved.state)?.history).toHaveLength(4);
    // The earlier state is untouched: every number is a new entry, nothing is overwritten.
    expect(before.entries).toHaveLength(initialDemoState(TODAY).entries.length);
  });

  test("uses the app's form checks: a future date, a missing answer or a nonsense number are refused", () => {
    const state = initialDemoState(TODAY);
    const result = saveDemoStat(data, state, PITCHER, form({ metric: "Fastball velocity", value: "abc", measuredOn: "2026-11-28", howMeasured: "" }), TODAY);
    expect(result.savedMetric).toBeNull();
    expect(result.state).toBe(state);
    expect(result.form.fields).toMatchObject({ measuredOn: "The date can't be in the future.", howMeasured: "Choose who measured it." });
    expect(result.form.fields.value).toBeTruthy();
  });

  test("an unknown sport is refused", () => {
    expect(saveDemoStat(data, initialDemoState(TODAY), "someone-else", form({}), TODAY).form.message).toBe("Choose one of Jordan's sports first.");
  });
});

describe("the demo plan", () => {
  test("is built from the draft templates, in week 2, with sessions to do", () => {
    const plan = demoPlan(data, initialDemoState(TODAY), TODAY, undefined);
    expect(plan.result.kind).toBe("plan");
    expect(plan.position.week).toBe(2);
    if (plan.result.kind !== "plan") return;
    expect(plan.result.tier).toBe("development");
    expect(plan.result.weeks[1]?.days.some((day) => day.session)).toBe(true);
  });

  test("marks a session done and undone in memory", () => {
    const done = toggleDemoSession(initialDemoState(TODAY), 2, 0, true);
    expect(demoPlan(data, done, TODAY, undefined).done.has("2-0")).toBe(true);
    expect(toggleDemoSession(done, 2, 0, false).done).toEqual([]);
  });
});

test("checkout still asks for the renewal box, then says payments are skipped", () => {
  expect(demoCheckout(form({})).fields.agreesToRenewal).toBe("Tick the box to agree to the renewal terms before you continue.");
  expect(demoCheckout(form({ agreesToRenewal: "on" })).message).toBe(CHECKOUT_SKIPPED);
});
