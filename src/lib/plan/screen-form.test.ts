import { describe, expect, test } from "vitest";
import { screenFormSchema, seasonChoices } from "./screen-form";

const ALL_NO = { painNow: "no", throwingArmPain: "no", trainingAge: "no", seasonPhase: "off_season" };

describe("screenFormSchema", () => {
  test("turns a baseball player's answers into screen answers", () => {
    expect(screenFormSchema(true).parse({ ...ALL_NO, trainingAge: "yes", seasonPhase: "rest_period" })).toEqual({
      painNow: false,
      throwingArmPain: false,
      hasTrainingAge: true,
      seasonPhase: "rest_period",
    });
  });

  test("no throwing-arm question and no rest period for an athlete who plays no baseball", () => {
    const noArm = { painNow: "no", trainingAge: "no", seasonPhase: "off_season" };
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

test("the rest-period season is offered only to baseball players", () => {
  expect(seasonChoices(true).map((choice) => choice.value)).toContain("rest_period");
  expect(seasonChoices(false).map((choice) => choice.value)).not.toContain("rest_period");
});
