import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, test } from "vitest";
import { parseBenchmarkCsv } from "@/lib/benchmarks/csv";
import { draftPlansAllowed, libraryFromRecord, pickLibrary, type PlanTemplateRecord } from "./library";
import { bannedThrowingMentions, MODULE_IDS, parseTemplateLibrary, TemplateLibraryError } from "./library-schema";
import { METRIC_TO_STAT, statLinkFor } from "./metric-map";
import { ADDED_THROWING_VOLUME, ENDURANCE_ROLES, INTERVAL_THROWING, PAIN_LINE, PRESS_EXERCISE, screenMessage, THROWING_ITEMS } from "./rules";
import { draftJson, draftLibrary } from "./test-library";

const BENCHMARK_METRICS = [
  ...new Set(parseBenchmarkCsv(readFileSync(path.resolve(import.meta.dirname, "../../../data/benchmarks.csv"), "utf8")).rows.map((row) => row.metric)),
];

function problemsOf(input: unknown): string[] {
  try {
    parseTemplateLibrary(input);
    return [];
  } catch (error) {
    if (error instanceof TemplateLibraryError) return [...error.problems];
    throw error;
  }
}

describe("the draft template file", () => {
  test("passes every check", () => {
    expect(problemsOf(draftJson())).toEqual([]);
    expect(draftLibrary().review_status).toBe("draft");
  });

  test("an unknown key, a missing field or a wrong type is refused, naming where", () => {
    expect(problemsOf({ ...draftJson(), extra: 1 })).toEqual([expect.stringContaining("extra")]);
    const noBlock = Object.fromEntries(Object.entries(draftJson()).filter(([key]) => key !== "block"));
    expect(problemsOf(noBlock)[0]).toMatch(/^block:/);
    expect(problemsOf({ ...draftJson(), review_status: "maybe" })[0]).toMatch(/^review_status:/);
  });

  test("approved needs the coach's name and the review date", () => {
    expect(problemsOf({ ...draftJson(), review_status: "approved" })).toEqual([
      "review_status is approved, so reviewed_by and reviewed_on must both be filled in",
    ]);
    expect(problemsOf({ ...draftJson(), review_status: "approved", reviewed_by: "A. Coach, CSCS", reviewed_on: "2026-12-01" })).toEqual([]);
  });

  test("asks the team practices question, worded for parents", () => {
    expect(draftLibrary().screens.find((screen) => screen.id === "team_sessions")?.question).toBe(
      "How many team practices or games does the athlete have in a typical week?",
    );
    const json = draftJson();
    const withoutIt = (json.screens as { id: string }[]).filter((screen) => screen.id !== "team_sessions");
    // A library from before the question existed (4 screens) is refused, so it can't build a plan that ignores practices.
    expect(problemsOf({ ...json, screens: withoutIt })).toEqual([expect.stringMatching(/^screens:/)]);
  });

  test("evidence must point at a listed source", () => {
    const json = draftJson();
    const modules = (json.focus_modules as { evidence: string[] }[]).map((mod, index) => (index === 0 ? { ...mod, evidence: ["S99"] } : mod));
    expect(problemsOf({ ...json, focus_modules: modules })).toEqual(["focus_modules.speed.evidence: S99 is not in sources"]);
  });
});

describe("weighted, overload and plyo balls", () => {
  test("never appear in any template text outside a 'no' sentence", () => {
    expect(bannedThrowingMentions(draftJson())).toEqual([]);
  });

  test("the check catches them, with or without a hyphen", () => {
    expect(bannedThrowingMentions({ a: "Add weighted ball throws in week 3." })).toHaveLength(1);
    expect(bannedThrowingMentions({ a: ["Fine.", "Use an overload-ball program."] })).toHaveLength(1);
    expect(bannedThrowingMentions({ a: "Plyo balls against a wall." })).toHaveLength(1);
    expect(bannedThrowingMentions({ a: "No weighted-ball (overload) throwing in any plan." })).toEqual([]);
  });

  test("a library that slips one in fails to load", () => {
    const json = draftJson();
    expect(problemsOf({ ...json, plan_rules: [...(json.plan_rules as string[]), "Weighted ball work twice a week."] })).toEqual([
      expect.stringContaining("weighted/overload/plyo ball"),
    ]);
  });
});

describe("benchmark metric to template stat mapping", () => {
  test("every benchmark metric in data/benchmarks.csv has a mapping", () => {
    expect(BENCHMARK_METRICS.filter((metric) => statLinkFor(metric) === null)).toEqual([]);
  });

  test("Height and Weight map to not_trainable, with a message in the template", () => {
    const library = draftLibrary();
    for (const stat of ["Height", "Weight"] as const) {
      expect(METRIC_TO_STAT[stat]).toEqual({ kind: "not_trainable", stat });
      expect(library.not_trainable.some((entry) => entry.stat === stat)).toBe(true);
    }
  });

  test("every trainable mapping names a for_stats entry in exactly one module", () => {
    const library = draftLibrary();
    for (const link of Object.values(METRIC_TO_STAT)) {
      if (link.kind !== "trainable") continue;
      expect(library.focus_modules.filter((mod) => mod.for_stats.includes(link.forStat)), link.forStat).toHaveLength(1);
    }
  });

  test("lists no metric that is not in the benchmarks", () => {
    expect(Object.keys(METRIC_TO_STAT).filter((metric) => !BENCHMARK_METRICS.includes(metric))).toEqual([]);
  });
});

describe("the builder's fixed rules match the template file", () => {
  const library = draftLibrary();
  const allWork = library.focus_modules.flatMap((mod) => mod.work.map((item) => item.name));

  test("every throwing item and running role names a real template item", () => {
    for (const name of [...THROWING_ITEMS, ...ADDED_THROWING_VOLUME, INTERVAL_THROWING, ...Object.keys(ENDURANCE_ROLES)]) {
      expect(allWork, name).toContain(name);
    }
  });

  test("the pressing exercise named for each strength day is on that day", () => {
    for (const [day, name] of Object.entries(PRESS_EXERCISE)) {
      expect(library.strength_days[day as keyof typeof PRESS_EXERCISE].exercises.map((exercise) => exercise.name)).toContain(name);
    }
  });

  test("the pain line is the one plan_rules asks for, and screen messages are read from the template", () => {
    expect(library.plan_rules.join(" ")).toContain(PAIN_LINE);
    expect(screenMessage(library, "pain_now")).toBe("Get this checked by a doctor or athletic trainer before starting a training plan.");
    expect(screenMessage(library, "throwing_arm_pain")).toBe("Have the arm checked by a doctor or athletic trainer before adding throwing.");
  });

  test("every module the builder knows is in the file", () => {
    expect(library.focus_modules.map((mod) => mod.id).sort()).toEqual([...MODULE_IDS].sort());
  });
});

describe("draft templates", () => {
  test("show only with ALLOW_DRAFT_PLANS=true outside a production build", () => {
    expect(draftPlansAllowed("development", "true")).toBe(true);
    expect(draftPlansAllowed("test", "true")).toBe(true);
    expect(draftPlansAllowed("development", undefined)).toBe(false);
    expect(draftPlansAllowed("development", "TRUE")).toBe(false);
    expect(draftPlansAllowed("development", "1")).toBe(false);
  });

  test("a production build ignores drafts even when the flag is set", () => {
    expect(draftPlansAllowed("production", "true")).toBe(false);
    const draft = record({ review_status: "draft" });
    expect(pickLibrary(null, draft, draftPlansAllowed("production", "true"))).toBeNull();
  });

  test("an approved library always wins; a draft is used only when allowed", () => {
    const approved = record({ version: "v-approved", review_status: "approved", reviewed_by: "Coach", reviewed_on: "2026-12-01" });
    const draft = record({ review_status: "draft" });
    expect(pickLibrary(approved, draft, true)?.version).toBe("v-approved");
    expect(pickLibrary(null, draft, true)?.version).toBe("draft-2026-11-17");
    expect(pickLibrary(null, draft, false)).toBeNull();
    // A row passed in as "approved" that is really a draft is never used as approved.
    expect(pickLibrary(draft, null, false)).toBeNull();
  });

  test("the row's review columns are what count, not the copy inside the JSON", () => {
    const loaded = libraryFromRecord(record({ review_status: "approved", reviewed_by: "A. Coach, CSCS", reviewed_on: "2026-12-01" }));
    expect(loaded.reviewStatus).toBe("approved");
    expect(loaded.library.reviewed_by).toBe("A. Coach, CSCS");
    expect(() => libraryFromRecord(record({ review_status: "approved" }))).toThrow(TemplateLibraryError);
  });
});

function record(overrides: Partial<PlanTemplateRecord>): PlanTemplateRecord {
  return { version: "draft-2026-11-17", review_status: "draft", reviewed_by: null, reviewed_on: null, content: draftJson(), ...overrides };
}
