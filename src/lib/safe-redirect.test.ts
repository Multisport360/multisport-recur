import { describe, expect, test } from "vitest";
import { safeNextPath } from "./safe-redirect";

describe("safeNextPath", () => {
  test("keeps a path on this site, with its query string", () => {
    expect(safeNextPath("/athletes/abc?tab=stats", "/athletes")).toBe("/athletes/abc?tab=stats");
  });

  test("falls back when nothing is given", () => {
    expect(safeNextPath(null, "/athletes")).toBe("/athletes");
    expect(safeNextPath("", "/athletes")).toBe("/athletes");
  });

  test("refuses anything that could leave the site", () => {
    for (const next of ["https://evil.example", "//evil.example", "/\\evil.example", "javascript:alert(1)", "evil"]) {
      expect(safeNextPath(next, "/athletes")).toBe("/athletes");
    }
  });
});
