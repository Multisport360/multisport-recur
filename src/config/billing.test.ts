import { describe, expect, test } from "vitest";
import { addOneMonth, checkoutTerms, formatLongDate, formatPrice, priceWithInterval } from "./billing";

const EASTERN = "America/New_York";

describe("billing config", () => {
  test("price wording", () => {
    expect(formatPrice(1200)).toBe("$12");
    expect(formatPrice(1250)).toBe("$12.50");
    expect(priceWithInterval()).toBe("$12 a month");
  });

  test("next charge is the same day next month, clamped to the month's last day", () => {
    expect(formatLongDate(addOneMonth(new Date(Date.UTC(2026, 10, 17, 15))), EASTERN)).toBe("December 17, 2026");
    expect(formatLongDate(addOneMonth(new Date(Date.UTC(2027, 0, 31, 15))), EASTERN)).toBe("February 28, 2027");
    expect(formatLongDate(addOneMonth(new Date(Date.UTC(2027, 11, 15, 15))), EASTERN)).toBe("January 15, 2028");
  });

  test("checkout terms state the price, renewal, next charge and how to cancel", () => {
    const terms = checkoutTerms(new Date(Date.UTC(2026, 10, 17, 15)), EASTERN);
    expect(terms.firstCharge).toBe("You pay $12 today.");
    expect(terms.renewal).toBe("It renews every month until you cancel.");
    expect(terms.nextCharge).toBe("Your next charge is $12 on December 17, 2026.");
    expect(terms.howToCancel).toContain("two clicks");
    expect(terms.agreement).toContain("renews automatically at $12 every month");
  });

  test("subscribing at 8 pm Eastern on Nov 24 shows the next charge on Dec 24, not Dec 25", () => {
    const eightPmEastern = new Date("2026-11-25T01:00:00Z");
    expect(checkoutTerms(eightPmEastern, EASTERN).nextCharge).toBe("Your next charge is $12 on December 24, 2026.");
    expect(checkoutTerms(eightPmEastern, "UTC").nextCharge).toBe("Your next charge is $12 on December 25, 2026.");
  });
});
