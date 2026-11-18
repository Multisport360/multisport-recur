import { describe, expect, test } from "vitest";
import type { PlanTemplateRow } from "@/lib/supabase/database.types";
import { matchTemplates, needsThrowingCaution, toPlanTemplate, type PlanTemplate } from "./templates";

function row(overrides: Partial<PlanTemplateRow> = {}): PlanTemplateRow {
  return {
    id: "t1",
    sport: "Baseball",
    position_or_event: null,
    metric: null,
    min_grade: 8,
    max_grade: 12,
    title: "General baseball strength",
    summary: "",
    body: [{ heading: "Week 1", items: ["Item one", 7, "Item two"] }, "not a section"],
    safety_notes: "Warm up first.",
    reviewed_by: "Coach A",
    reviewed_at: "2026-11-01T00:00:00Z",
    is_published: true,
    created_at: "",
    ...overrides,
  };
}

const plan = (overrides: Partial<PlanTemplateRow>) => toPlanTemplate(row(overrides)) as PlanTemplate;

describe("toPlanTemplate", () => {
  test("only a published, coach-reviewed template is usable", () => {
    expect(toPlanTemplate(row({ is_published: false }))).toBeNull();
    expect(toPlanTemplate(row({ reviewed_by: null }))).toBeNull();
    expect(toPlanTemplate(row())?.title).toBe("General baseball strength");
  });

  test("reads the coach's sections and leaves out anything malformed", () => {
    expect(toPlanTemplate(row())?.sections).toEqual([{ heading: "Week 1", items: ["Item one", "Item two"] }]);
  });
});

describe("matchTemplates", () => {
  const general = plan({ id: "general" });
  const pitcher = plan({ id: "pitcher", position_or_event: "Pitcher" });
  const seniorsOnly = plan({ id: "seniors", min_grade: 12 });
  const football = plan({ id: "football", sport: "Football" });
  const all = [general, pitcher, seniorsOnly, football];

  test("matches sport, position and grade, position-specific first", () => {
    expect(matchTemplates(all, { sport: "Baseball", positionOrEvent: "Pitcher" }, 10).map((t) => t.id)).toEqual(["pitcher", "general"]);
    expect(matchTemplates(all, { sport: "Baseball", positionOrEvent: "Catcher" }, 12).map((t) => t.id)).toEqual(["general", "seniors"]);
  });

  test("with no templates there is no plan, and nothing is made up", () => {
    expect(matchTemplates([], { sport: "Baseball", positionOrEvent: "Pitcher" }, 10)).toEqual([]);
  });
});

describe("needsThrowingCaution", () => {
  const velocity = plan({ metric: "Fastball velocity", title: "Velocity build" });

  test("throwing-velocity plans get extra caution below 11th grade", () => {
    expect(needsThrowingCaution(velocity, 9)).toBe(true);
    expect(needsThrowingCaution(velocity, 10)).toBe(true);
    expect(needsThrowingCaution(velocity, 11)).toBe(false);
  });

  test("other plans do not", () => {
    expect(needsThrowingCaution(plan({ metric: "60-yard dash", title: "Speed" }), 9)).toBe(false);
  });
});
