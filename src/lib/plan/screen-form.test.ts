import { describe, expect, test } from "vitest";
import { screenFormSchema, seasonChoices, teamSessionChoices } from "./screen-form";

const ALL_NO = { painNow: "no", throwingArmPain: "no", trainingAge: "no", seasonPhase: "off_season", teamSessions: "0" };

describe("screenFormSchema", () => {
  test("turns a baseball player's answers into screen answers", () => {
    expect(screenFormSchema(true).parse({ ...ALL_NO, trainingAge: "yes", seasonPhase: "rest_period", teamSessions: "3" })).toEqual({
      painNow: false,
      throwingArmPain: false,
      hasTrainingAge: true,
      seasonPhase: "rest_period",
      teamSessionsPerWeek: 3,
    });
  });

  test("no throwing-arm question and no rest period for an athlete who plays no baseball", () => {
    const noArm = { painNow: "no", trainingAge: "no", seasonPhase: "off_season", teamSessions: "5" };
    expect(screenFormSchema(false).parse(noArm).throwingArmPain).toBeNull();
    expect(screenFormSchema(false).safeParse({ ...noArm, seasonPhase: "rest_period" }).success).toBe(false);
    expect(screenFormSchema(false).safeParse(ALL_NO).success).toBe(false);
  });

  test("a missing answer says which question to answer", () => {
    const result = screenFormSchema(true).safeParse({ ...ALL_NO, painNow: undefined });
    expect(result.success).toBe(false);
    expect(result.error?.issues[0]?.message).toBe("Choose yes or no for pain right now.");
  });
});

describe("the team practices and games question", () => {
  test("offers None, 1 to 6, and 7 or more", () => {
    expect(teamSessionChoices().map((choice) => choice.label)).toEqual(["None", "1", "2", "3", "4", "5", "6", "7 or more"]);
  });

  test("0 and 7 are saved as numbers", () => {
    expect(screenFormSchema(false).parse({ ...ALL_NO, throwingArmPain: undefined, teamSessions: "0" }).teamSessionsPerWeek).toBe(0);
    expect(screenFormSchema(true).parse({ ...ALL_NO, teamSessions: "7" }).teamSessionsPerWeek).toBe(7);
  });

  test("a missing answer, a count above 7, a negative or a fraction is refused with a plain message", () => {
    for (const teamSessions of [undefined, "", "8", "-1", "2.5", "three"]) {
      const result = screenFormSchema(true).safeParse({ ...ALL_NO, teamSessions });
      expect(result.success, String(teamSessions)).toBe(false);
      expect(result.error?.issues[0]?.message).toBe("Choose how many team practices or games there are in a typical week.");
    }
  });
});

test("the rest-period season is offered only to baseball players", () => {
  expect(seasonChoices(true).map((choice) => choice.value)).toContain("rest_period");
  expect(seasonChoices(false).map((choice) => choice.value)).not.toContain("rest_period");
});
