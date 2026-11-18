import { expect, test, type Locator, type Page } from "@playwright/test";

/**
 * The public home page: pick a sport, a position or event and a metric, type a number, see the ruler.
 * Expected numbers are the ones in data/benchmarks.csv, so the benchmarks table must be seeded.
 */

const rulers = (page: Page) => page.getByTestId("gap-ruler");
const result = (ruler: Locator) => ruler.getByTestId("ruler-result");

async function pick(page: Page, label: string, option: string) {
  await page.getByLabel(label, { exact: true }).selectOption({ label: option });
}

async function typeNumber(page: Page, fieldLabel: string, value: string) {
  await page.getByLabel(fieldLabel).fill(value);
}

/** Where the marker sits across the ruler strip, 0 (left) to 1 (right), once it has stopped moving. */
async function markerShare(ruler: Locator): Promise<number> {
  const marker = ruler.getByTestId("ruler-marker");
  await expect(marker).toBeVisible();
  await marker.evaluate((el) => Promise.all(el.getAnimations().map((animation) => animation.finished)));
  return marker.evaluate((el) => {
    const strip = el.parentElement as HTMLElement;
    const stripBox = strip.getBoundingClientRect();
    const box = el.getBoundingClientRect();
    return (box.left + box.width / 2 - stripBox.left) / stripBox.width;
  });
}

test("home page loads with the headline in the display font", async ({ page }) => {
  await page.goto("/");

  const headline = page.getByRole("heading", { level: 1 });
  await expect(headline).toHaveText("Find out what college level your numbers reach.");

  const fontFamily = await headline.evaluate((el) => getComputedStyle(el).fontFamily);
  expect(fontFamily).toContain("Big Shoulders");

  const bodyFont = await page.evaluate(() => getComputedStyle(document.body).fontFamily);
  expect(bodyFont).toContain("Atkinson Hyperlegible Next");

  const numerals = await page.evaluate(() => getComputedStyle(document.body).fontVariantNumeric);
  expect(numerals).toContain("tabular-nums");
});

test("first screen shows the example: an 83 mph pitcher on the ruler, with the level and the gap in words", async ({ page }) => {
  await page.goto("/");

  await expect(page.getByLabel("Sport", { exact: true })).toHaveValue("Baseball");
  await expect(page.getByLabel("Position", { exact: true })).toHaveValue("Pitcher");
  await expect(page.getByLabel("Fastball velocity (mph)")).toHaveValue("83");

  // Two guides cover pitcher velocity, so there are two rulers. The more certain guide comes first.
  await expect(rulers(page)).toHaveCount(2);
  const [first, second] = [rulers(page).nth(0), rulers(page).nth(1)];

  await expect(result(first)).toHaveText("You're in D2 range. 1 mph to D1.");
  await expect(first.getByTestId("ruler-chip")).toHaveText("83 mph");
  // A half-width lead-in, then D3/NAIA, JUCO, D2 (82) and D1 (84): 4.5 shares. 83 is halfway across D2.
  expect(await markerShare(first)).toBeCloseTo(3 / 4.5, 1);

  await expect(result(second)).toHaveText("You're in D2 range. 2 mph to D1 mid-major.");
  await expect(page.getByRole("link", { name: "Get the full report" })).toHaveAttribute("href", "/signup");
});

test("typing a number moves the marker and updates the level, the gap and the screen-reader text", async ({ page }) => {
  await page.goto("/");
  const first = rulers(page).first();

  await typeNumber(page, "Fastball velocity (mph)", "81");

  await expect(result(first)).toHaveText("You're in JUCO range. 1 mph to D2.");
  await expect(first.getByRole("img")).toHaveAccessibleName("81 mph, JUCO range, 1 mph short of D2");
  await expect(page.getByTestId("live-result")).toHaveText("81 mph, JUCO range, 1 mph short of D2");
  await expect(page.getByTestId("live-result")).toHaveAttribute("aria-live", "polite");
  // JUCO starts at 80 and D2 at 82, so 81 sits halfway across the JUCO band.
  expect(await markerShare(first)).toBeCloseTo(2 / 4.5, 1);

  // At the top level there is no gap, so the words say where that level's numbers run to.
  await typeNumber(page, "Fastball velocity (mph)", "84");
  await expect(result(first)).toHaveText(
    "You're in D1 range. D1 is the top level in this guide. This guide's D1 numbers run from 84 to 95 mph.",
  );
  await expect(first.getByRole("img")).toHaveAccessibleName("84 mph, D1 range, the top level in this guide");

  await typeNumber(page, "Fastball velocity (mph)", "70");
  await expect(result(first)).toHaveText("You're 7 mph short of D3/NAIA range.");
  await expect(first.getByRole("img")).toHaveAccessibleName("70 mph, below D3/NAIA range, 7 mph short of D3/NAIA");
});

test("low-confidence benchmarks say rough guide and every ruler links to its source", async ({ page }) => {
  await page.goto("/");
  const [first, second] = [rulers(page).nth(0), rulers(page).nth(1)];

  await expect(first.getByTestId("rough-guide")).toHaveCount(0);
  await expect(second.getByTestId("rough-guide")).toContainText("Rough guide.");
  await expect(second.getByRole("img")).toHaveAccessibleName(/rough guide$/);

  await expect(first.getByRole("link", { name: /NCSA/ }).first()).toHaveAttribute(
    "href",
    "https://www.ncsasports.org/baseball/recruiting-guidelines",
  );
  await expect(second.getByRole("link", { name: /D1 vs D2 vs D3 Baseball/ }).first()).toHaveAttribute("href", /^https:\/\//);

  // The score card lists every level's numbers, then each level's source.
  await first.getByText("See every level's numbers").click();
  await expect(first.getByRole("row", { name: /^D1/ })).toHaveText(/D1\s*84 mph\s*95 mph/);
  await expect(first.getByRole("listitem").filter({ hasText: "Division 1:" }).getByRole("link")).toHaveAttribute(
    "href",
    "https://www.ncsasports.org/baseball/recruiting-guidelines",
  );
});

test("grades 8 to 11 see the senior-year targets note and seniors do not", async ({ page }) => {
  await page.goto("/");
  const note = page.getByTestId("senior-note");

  await expect(note).toContainText("These are senior-year targets.");
  for (const grade of ["8th", "9th", "10th", "11th"]) {
    await pick(page, "Grade", grade);
    await expect(note).toContainText("These are senior-year targets.");
  }
  await pick(page, "Grade", "12th");
  await expect(note).toHaveCount(0);
});

test("track & field: girls' 100m puts four divisions on one ruler, each linked to its own source", async ({ page }) => {
  await page.goto("/");

  await pick(page, "Sport", "Track & Field");
  await pick(page, "Competes with", "Girls");
  await pick(page, "Event", "100m");
  // Changing the metric clears the example number.
  await expect(page.getByLabel("100m (seconds)")).toHaveValue("");
  await expect(rulers(page)).toHaveCount(1);
  await expect(result(rulers(page).first())).toHaveText("Type a number to see where it lands.");

  await typeNumber(page, "100m (seconds)", "12.7");

  const ruler = rulers(page).first();
  await expect(result(ruler)).toHaveText("You're in D2 range. 0.2 sec to D1.");
  await expect(ruler.getByRole("img")).toHaveAccessibleName("12.7 seconds, D2 range, 0.2 seconds short of D1");
  await expect(ruler.getByRole("link", { name: /Runcruit/ })).toHaveCount(4);
});

test("times can be typed as minutes and seconds", async ({ page }) => {
  await page.goto("/");

  await pick(page, "Sport", "Track & Field");
  await pick(page, "Event", "1600m");
  await expect(page.getByTestId("value-message")).toHaveText("Type the time as minutes and seconds, like 4:40.");
  await typeNumber(page, "1600m (minutes:seconds)", "4:40");

  const ruler = rulers(page).first();
  await expect(ruler.getByTestId("ruler-chip")).toHaveText("4:40.0");
  await expect(result(ruler)).toHaveText("You're in D2 range. 11 sec to D1.");
});

test("football height uses the range ruler and reads feet and inches", async ({ page }) => {
  await page.goto("/");

  await pick(page, "Sport", "Football");
  await pick(page, "Position", "QB");
  await pick(page, "What was measured", "Height");
  await typeNumber(page, "Height (feet and inches)", "6'1");

  const ruler = rulers(page).first();
  await expect(result(ruler)).toHaveText(
    "You're inside the typical FCS range. That range is 6' 1\" to 6' 4\". 1 inch under the typical FBS range (6' 2\" to 6' 6\").",
  );
  // Every lane says in words where the number sits, not just by position.
  await expect(ruler.getByTestId("lane-fit")).toHaveText(["1 inch short", "In this range", "In this range", "In this range"]);
  await expect(ruler.getByTestId("ruler-chip")).toHaveText("6' 1\"");
});

test("a number that can't be read shows how to fix it and no marker", async ({ page }) => {
  await page.goto("/");
  const field = page.getByLabel("Fastball velocity (mph)");

  await field.fill("fast");

  await expect(page.getByTestId("value-message")).toHaveText(
    "That isn't a number we can read. Type the speed in mph, like 84.",
  );
  await expect(field).toHaveAttribute("aria-invalid", "true");
  await expect(page.getByTestId("ruler-marker")).toHaveCount(0);
  await expect(result(rulers(page).first())).toHaveText("Type a number to see where it lands.");
});

test("the marker slides to its value, and does not move at all under reduced motion", async ({ page }) => {
  await page.goto("/");
  const marker = rulers(page).first().getByTestId("ruler-marker");
  const motion = () =>
    marker.evaluate((el) => {
      const style = getComputedStyle(el);
      return { animation: style.animationName, transition: style.transitionDuration };
    });

  expect(await motion()).toEqual({ animation: "ruler-slide-in", transition: "0.45s, 0.45s" });

  await page.emulateMedia({ reducedMotion: "reduce" });
  expect(await motion()).toEqual({ animation: "none", transition: "0s" });
});

test("nothing else on the page animates", async ({ page }) => {
  await page.goto("/");
  const animated = await page.evaluate(() =>
    [...document.querySelectorAll("*")]
      .filter((el) => {
        const style = getComputedStyle(el);
        return style.animationName !== "none" || style.transitionDuration.split(",").some((d) => parseFloat(d) > 0);
      })
      .map((el) => (el as HTMLElement).dataset.testid ?? el.tagName),
  );
  expect([...new Set(animated)].sort()).toEqual(["ruler-chip", "ruler-marker"]);
});

test("the whole tool works from the keyboard", async ({ page }) => {
  await page.goto("/");

  // Tab order follows the page: site name, sign in, then the form in reading order.
  const focusedLabels: string[] = [];
  for (let presses = 0; presses < 6; presses += 1) {
    await page.keyboard.press("Tab");
    focusedLabels.push(
      await page.evaluate(() => {
        const el = document.activeElement as HTMLElement & { labels?: NodeListOf<HTMLLabelElement> };
        return (el.labels?.[0]?.textContent ?? el.textContent ?? "").trim();
      }),
    );
  }
  expect(focusedLabels).toEqual([
    "Multi-Sport Recur",
    "Sign in",
    "Sport",
    "Grade",
    "Position",
    "Fastball velocity (mph)",
  ]);

  // Type a number with the keyboard only.
  await page.getByLabel("Fastball velocity (mph)").focus();
  await page.keyboard.press("ControlOrMeta+a");
  await page.keyboard.type("88");
  await expect(result(rulers(page).first())).toContainText("You're in D1 range");

  // Focus is always visible.
  const outline = await page.evaluate(() => getComputedStyle(document.activeElement as Element).outlineStyle);
  expect(outline).toBe("solid");
});

test("nothing is saved or sent while using the tool", async ({ page }) => {
  await page.goto("/");
  await expect(rulers(page).first()).toBeVisible();

  const requests: string[] = [];
  page.on("request", (request) => {
    const isPagePrefetch = request.method() === "GET" && new URL(request.url()).origin === new URL(page.url()).origin;
    if (!isPagePrefetch) requests.push(`${request.method()} ${request.url()}`);
  });

  await typeNumber(page, "Fastball velocity (mph)", "90");
  await pick(page, "Sport", "Football");
  await pick(page, "Position", "WR");
  await pick(page, "What was measured", "40-yard dash");
  await typeNumber(page, "40-yard dash (seconds)", "4.6");
  await pick(page, "Grade", "10th");
  await expect(result(rulers(page).first())).toContainText("range");

  expect(requests).toEqual([]);
  expect(await page.context().cookies()).toEqual([]);
  expect(await page.evaluate(() => localStorage.length + sessionStorage.length)).toBe(0);
});

test("the page never scrolls sideways", async ({ page }) => {
  await page.goto("/");
  for (const [sport, position] of [
    ["Baseball", "Pitcher"],
    ["Football", "DL (DE / edge)"],
    ["Track & Field", "110m hurdles"],
  ] as const) {
    await pick(page, "Sport", sport);
    await pick(page, sport === "Track & Field" ? "Event" : "Position", position);
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
    expect(overflow).toBeLessThanOrEqual(0);
  }
});

test("tick marks use one natural step per metric and say what it is", async ({ page }) => {
  await page.goto("/");
  // Both pitcher-velocity rulers tick every 1 mph.
  await expect(page.getByTestId("tick-caption")).toHaveText(["Each tick is 1 mph.", "Each tick is 1 mph."]);

  await pick(page, "Position", "Outfield (corner)");
  await pick(page, "What was measured", "60-yard dash");
  // These levels are exactly 0.1 sec apart, so the tape marks every 0.05 sec rather than showing no ticks.
  await expect(page.getByTestId("tick-caption")).toHaveText("Each tick is 0.05 seconds.");
  expect(await rulers(page).first().getByTestId("ruler-tick").count()).toBeGreaterThan(0);

  // Long throws tick in whole feet. The step widens only when a band would be crowded.
  await pick(page, "Sport", "Track & Field");
  await pick(page, "Event", "Discus");
  await expect(page.getByTestId("tick-caption")).toHaveText(/^Each tick is \d+ (foot|feet)\.$/);
});

test("quirks in a guide's data are explained in words", async ({ page }) => {
  await page.goto("/");

  // A guide that lists only one level says so.
  await pick(page, "Sport", "Football");
  await pick(page, "Position", "QB");
  await pick(page, "What was measured", "Vertical jump");
  await expect(rulers(page).first().getByTestId("guide-note")).toContainText("only gives a vertical jump number for FBS");

  // A guide whose numbers run against the usual order of levels says so.
  await pick(page, "Sport", "Baseball");
  await pick(page, "Position", "Outfield (corner)");
  await pick(page, "What was measured", "60-yard dash");
  await expect(rulers(page).first().getByTestId("guide-note").first()).toHaveText(
    "In this guide, D2 asks for a slower time than D3/NAIA (7.0 sec against 6.9 sec). The ruler follows the guide.",
  );
});

test("a number past the end of the ruler says so and asks for a check", async ({ page }) => {
  await page.goto("/");
  await typeNumber(page, "Fastball velocity (mph)", "105");

  const first = rulers(page).first();
  await expect(first.getByTestId("off-scale")).toHaveText(
    "105 mph is beyond the last number on this ruler. Check the number you typed.",
  );
  // The readout chip stays inside the ruler.
  const overflow = await first.getByTestId("ruler-chip").evaluate((chip) => {
    const ruler = chip.closest("figure") as HTMLElement;
    return chip.getBoundingClientRect().right - ruler.getBoundingClientRect().right;
  });
  expect(overflow).toBeLessThanOrEqual(0.5);
});

test("links and controls are big enough to tap", async ({ page }) => {
  await page.goto("/");
  const MIN_TAP = 44;
  const targets = [
    page.getByRole("link", { name: "Sign in" }),
    page.getByRole("link", { name: "Get the full report" }),
    page.getByLabel("Sport", { exact: true }),
    page.getByLabel("Fastball velocity (mph)"),
    rulers(page).first().locator("summary"),
  ];
  for (const target of targets) {
    const box = await target.boundingBox();
    expect(box?.height ?? 0).toBeGreaterThanOrEqual(MIN_TAP);
  }
});
