import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, test } from "vitest";
import { findAnomalies } from "./anomalies";
import { compare } from "./compare";
import { BenchmarkCsvError, CSV_COLUMNS, parseBenchmarkCsv } from "./csv";
import { buildSets, findSets, sourceIds } from "./sets";

const HEADER = CSV_COLUMNS.join(",");
const GOOD_ROW =
  "Baseball,Pitcher,Male,Fastball velocity,mph,higher,Division 2,D2,82,,90,SRC,Medium,82-90+,Test source,https://example.com/a";

function csv(...lines: string[]): string {
  return [HEADER, ...lines].join("\n");
}

function problemsOf(text: string): readonly string[] {
  try {
    parseBenchmarkCsv(text);
  } catch (error) {
    if (error instanceof BenchmarkCsvError) return error.problems;
    throw error;
  }
  throw new Error("expected the CSV to be rejected");
}

describe("parseBenchmarkCsv", () => {
  test("reads a valid row into typed values", () => {
    const { rows, sources } = parseBenchmarkCsv(csv(GOOD_ROW));

    expect(rows).toEqual([
      {
        sport: "Baseball",
        positionOrEvent: "Pitcher",
        gender: "Male",
        metric: "Fastball velocity",
        unit: "mph",
        better: "higher",
        level: "Division 2",
        levelCode: "D2",
        entry: 82,
        mid: null,
        elite: 90,
        confidence: "Medium",
        notes: "82-90+",
        source: { id: "SRC", name: "Test source", url: "https://example.com/a" },
      },
    ]);
    expect(sources).toEqual([{ id: "SRC", name: "Test source", url: "https://example.com/a" }]);
  });

  test("fails on a non-numeric entry and names the line and column", () => {
    expect(problemsOf(csv(GOOD_ROW, GOOD_ROW.replace(",D2,82,", ",D1,eighty,")))).toEqual([
      "line 3: entry must be a positive number",
    ]);
  });

  test("fails on a blank entry", () => {
    expect(problemsOf(csv(GOOD_ROW.replace(",D2,82,", ",D2,,")))).toEqual(["line 2: entry must be a positive number"]);
  });

  test("fails on an unknown level code, unit, direction, sport, gender or confidence", () => {
    const bad = [
      GOOD_ROW.replace(",D2,", ",D9,"),
      GOOD_ROW.replace(",mph,", ",kph,"),
      GOOD_ROW.replace(",higher,", ",bigger,"),
      GOOD_ROW.replace("Baseball,", "Cricket,"),
      GOOD_ROW.replace(",Male,", ",Boys,"),
      GOOD_ROW.replace(",Medium,", ",Certain,"),
    ];
    const problems = problemsOf(csv(...bad));

    expect(problems).toHaveLength(6);
    expect(problems.map((problem) => problem.split(" ").slice(0, 3).join(" "))).toEqual([
      "line 2: level_code",
      "line 3: unit",
      "line 4: better",
      "line 5: sport",
      "line 6: gender",
      "line 7: confidence",
    ]);
  });

  test("reports every bad row, not just the first", () => {
    const problems = problemsOf(
      csv(GOOD_ROW.replace(",D2,82,", ",D2,x,"), GOOD_ROW.replace(",D2,82,", ",D1,y,"), GOOD_ROW.replace(",D2,", ",JUCO,")),
    );
    expect(problems).toEqual(["line 2: entry must be a positive number", "line 3: entry must be a positive number"]);
  });

  test("fails when marks run against the direction", () => {
    expect(problemsOf(csv(GOOD_ROW.replace(",82,,90,", ",82,,80,")))[0]).toContain("must get bigger");
    expect(
      problemsOf(csv(GOOD_ROW.replace(",higher,", ",lower,").replace(",82,,90,", ",6.8,,7.0,")))[0],
    ).toContain("must get smaller");
  });

  test("a range row needs elite and no mid", () => {
    const range = GOOD_ROW.replace(",higher,", ",range,");
    expect(problemsOf(csv(range.replace(",82,,90,", ",82,,,")))[0]).toContain("needs elite");
    expect(problemsOf(csv(range.replace(",82,,90,", ",82,85,90,")))[0]).toContain("must leave mid blank");
    expect(problemsOf(csv(range.replace(",82,,90,", ",82,,70,")))[0]).toContain("runs backwards");
  });

  test("fails on a duplicate level for the same metric and source", () => {
    expect(problemsOf(csv(GOOD_ROW, GOOD_ROW))).toEqual([
      "line 3: duplicate of line 2 (same sport, position, gender, metric, level and source)",
    ]);
  });

  test("fails when rows of one metric disagree on unit or direction", () => {
    const other = GOOD_ROW.replace(",D2,", ",D1,").replace(",mph,higher,", ",sec,lower,").replace(",82,,90,", ",82,,80,");
    expect(problemsOf(csv(GOOD_ROW, other))[0]).toContain("does not match line 2");
  });

  test("fails when one source id has two different names or URLs", () => {
    const other = GOOD_ROW.replace(",D2,", ",D1,").replace("https://example.com/a", "https://example.com/b");
    expect(problemsOf(csv(GOOD_ROW, other))).toEqual([
      "line 3: source SRC has a different name or URL than on line 2",
    ]);
  });

  test("fails on a source URL that is not a web address", () => {
    expect(problemsOf(csv(GOOD_ROW.replace("https://example.com/a", "see the PDF")))[0]).toContain("line 2: source_url");
  });

  test("fails on a missing or unexpected column", () => {
    const notesIndex = CSV_COLUMNS.indexOf("notes");
    const withoutNotes = [HEADER, GOOD_ROW]
      .map((line) => line.split(",").filter((_, index) => index !== notesIndex).join(","))
      .join("\n");
    expect(problemsOf(withoutNotes)).toEqual(["header: missing column(s) notes"]);
    expect(problemsOf(`${HEADER},extra\n${GOOD_ROW},1`)).toEqual(["header: unexpected column(s) extra"]);
  });

  test("fails on a file with no rows", () => {
    expect(problemsOf(HEADER)).toEqual(["the file has a header but no rows"]);
  });
});

describe("data/benchmarks.csv (the real file)", () => {
  const text = readFileSync(path.resolve(import.meta.dirname, "../../../data/benchmarks.csv"), "utf8");
  const { rows, sources } = parseBenchmarkCsv(text);
  const sets = buildSets(rows);

  test("every one of the 272 rows passes validation", () => {
    expect(rows).toHaveLength(272);
    expect(sources.map((source) => source.id).sort()).toEqual([
      "NC-FB",
      "NCSA-BB",
      "RC-D1",
      "RC-D2",
      "RC-D3",
      "RC-NAIA",
      "YSC-BB",
    ]);
  });

  test("covers the three launch sports", () => {
    expect([...new Set(rows.map((row) => row.sport))]).toEqual(["Baseball", "Football", "Track & Field"]);
  });

  test("every row lands in exactly one ruler", () => {
    expect(sets.reduce((total, set) => total + set.levels.length, 0)).toBe(272);
  });

  test("an 84 mph pitcher gets one result per source, with the Medium-confidence source first", () => {
    const outcome = compare(sets, {
      sport: "Baseball",
      positionOrEvent: "Pitcher",
      gender: "Male",
      metric: "Fastball velocity",
      value: 84,
      unit: "mph",
    });

    expect(outcome.status).toBe("ok");
    if (outcome.status !== "ok") return;
    expect(
      outcome.comparisons.map((c) => [sourceIds(c.set), c.reachedLevel?.label, c.nextLevel?.label ?? null, c.gap, c.confidence]),
    ).toEqual([
      ["NCSA-BB", "D1", null, null, "Medium"],
      ["YSC-BB", "D2", "D1 mid-major", 1, "Low"],
    ]);
  });

  test("track & field puts all four divisions on one ruler, each level linked to its own source", () => {
    const rulers = findSets(sets, {
      sport: "Track & Field",
      positionOrEvent: "100m",
      gender: "Female",
      metric: "100m",
    });

    expect(rulers).toHaveLength(1);
    expect(rulers[0]?.levels.map((level) => [level.label, level.entry, level.source.id])).toEqual([
      ["D1", 12.5, "RC-D1"],
      ["D2", 12.9, "RC-D2"],
      ["NAIA", 13.1, "RC-NAIA"],
      ["D3", 13.4, "RC-D3"],
    ]);
  });

  test("the anomaly check finds the known corner-outfield 60-yard dash inconsistency", () => {
    expect(findAnomalies(sets)).toContain(
      "Baseball / Outfield (corner) / Male / 60-yard dash [NCSA-BB]: D2 entry (7 sec) is easier than D3/NAIA entry (6.9 sec)",
    );
  });
});
