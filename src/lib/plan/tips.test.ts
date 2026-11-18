import { afterEach, describe, expect, test, vi } from "vitest";
import { areTipsEnabled, wordTips } from "./tips";
import type { PlanTemplate } from "./templates";

const TEMPLATE: PlanTemplate = {
  id: "t1",
  sport: "Baseball",
  positionOrEvent: "Pitcher",
  metric: null,
  minGrade: 8,
  maxGrade: 12,
  title: "Plan",
  summary: "",
  sections: [{ heading: "Week 1", items: ["Long toss"] }],
  safetyNotes: "Warm up.",
};

afterEach(() => {
  vi.unstubAllEnvs();
  vi.restoreAllMocks();
});

describe("Claude tips flag", () => {
  test("is off unless PLAN_TIPS_FROM_CLAUDE is exactly true", () => {
    vi.stubEnv("PLAN_TIPS_FROM_CLAUDE", "");
    expect(areTipsEnabled()).toBe(false);
    vi.stubEnv("PLAN_TIPS_FROM_CLAUDE", "yes");
    expect(areTipsEnabled()).toBe(false);
    vi.stubEnv("PLAN_TIPS_FROM_CLAUDE", "true");
    expect(areTipsEnabled()).toBe(true);
  });

  test("when off, no request is made and no tips come back", async () => {
    vi.stubEnv("PLAN_TIPS_FROM_CLAUDE", "");
    const fetchSpy = vi.spyOn(globalThis, "fetch");
    expect(await wordTips(TEMPLATE, { grade: 10, sport: "Baseball", positionOrEvent: "Pitcher" })).toBeNull();
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  test("when on but the key is missing, it gives up quietly and the plan shows without tips", async () => {
    vi.stubEnv("PLAN_TIPS_FROM_CLAUDE", "true");
    vi.stubEnv("ANTHROPIC_API_KEY", "");
    vi.spyOn(console, "error").mockImplementation(() => undefined);
    expect(await wordTips(TEMPLATE, { grade: 10, sport: "Baseball", positionOrEvent: "Pitcher" })).toBeNull();
  });
});
