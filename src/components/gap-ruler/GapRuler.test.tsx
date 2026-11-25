import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, test } from "vitest";
import { compareToSet } from "@/lib/benchmarks/compare";
import { buildSets, type BenchmarkSet } from "@/lib/benchmarks/sets";
import { SECOND_SOURCE, TEST_SOURCE, VELOCITY_ROWS, row } from "@/lib/benchmarks/test-fixtures";
import { GapRuler } from "./GapRuler";

/**
 * Benchmark sources are stored in the sources table but are not shown in the app (CLAUDE.md).
 * These render the ruler on the server and check no source name, URL or "Source" line appears.
 */

const [VELOCITY] = buildSets(VELOCITY_ROWS) as [BenchmarkSet];

/** Two sources on one ruler, one of them Low confidence, and numbers out of the usual order. */
const [MIXED] = buildSets([
  row({ level: "Junior College", levelCode: "JUCO", entry: 80, confidence: "Low", source: SECOND_SOURCE }),
  row({ level: "Division 2", levelCode: "D2", entry: 78 }),
  row({ level: "Division 1", levelCode: "D1", entry: 88 }),
]) as [BenchmarkSet];

function render(set: BenchmarkSet, value: number | null): string {
  return renderToStaticMarkup(<GapRuler set={set} comparison={value === null ? null : compareToSet(set, value)} />);
}

describe("GapRuler shows no benchmark sources", () => {
  test.each([
    ["one source, with a number", VELOCITY, 84],
    ["one source, no number yet", VELOCITY, null],
    ["several sources, with a number", MIXED, 84],
  ] as const)("%s", (_label, set, value) => {
    const html = render(set, value);
    for (const source of [TEST_SOURCE, SECOND_SOURCE]) {
      expect(html).not.toContain(source.url);
      expect(html).not.toContain(source.name);
    }
    expect(html).not.toMatch(/<a\s/);
    expect(html).not.toMatch(/Source/);
    expect(html).not.toContain("opens in a new tab");
  });

  test("the explanation lines about the guide's data are gone", () => {
    const html = render(MIXED, 84);
    expect(html).not.toContain("In this guide,");
    expect(html).not.toContain("guide-note");
  });

  test("a Low-confidence level still says rough guide, on the ruler and in the numbers table", () => {
    const html = render(MIXED, 79);
    expect(html).toContain("Rough guide.");
    expect(html).toContain('data-testid="level-rough-guide"');
  });

  test("the score card still lists every level's numbers", () => {
    const html = render(VELOCITY, 84);
    expect(html).toContain("See every level&#x27;s numbers");
    for (const level of VELOCITY.levels) expect(html).toContain(level.label);
  });
});
