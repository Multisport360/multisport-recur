import { describe, expect, test } from "vitest";
import { addOneMonth, checkoutTerms, formatLongDate, formatPrice, priceWithInterval } from "./billing";

describe("billing config", () => {
  test("price wording", () => {
    expect(formatPrice(1200)).toBe("$12");
    expect(formatPrice(1250)).toBe("$12.50");
    expect(priceWithInterval()).toBe("$12 a month");
  });

  test("next charge is the same day next month, clamped to the month's last day", () => {
    expect(formatLongDate(addOneMonth(new Date(Date.UTC(2026, 10, 17))))).toBe("December 17, 2026");
    expect(formatLongDate(addOneMonth(new Date(Date.UTC(2027, 0, 31))))).toBe("February 28, 2027");
    expect(formatLongDate(addOneMonth(new Date(Date.UTC(2027, 11, 15))))).toBe("January 15, 2028");
  });

  test("checkout terms state the price, renewal, next charge and how to cancel", () => {
    const terms = checkoutTerms(new Date(Date.UTC(2026, 10, 17)));
    expect(terms.firstCharge).toBe("You pay $12 today.");
    expect(terms.renewal).toBe("It renews every month until you cancel.");
    expect(terms.nextCharge).toBe("Your next charge is $12 on December 17, 2026.");
    expect(terms.howToCancel).toContain("two clicks");
    expect(terms.agreement).toContain("renews automatically at $12 every month");
  });
});
