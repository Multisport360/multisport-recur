import type { Unit } from "./types.ts";

/**
 * Turning numbers into text and typed text into numbers.
 * Times of a minute or more read as 4:29.0. Lengths of four feet or more read as 21' 8".
 */

const SECONDS_PER_MINUTE = 60;
const INCHES_PER_FOOT = 12;
/** Lengths from this many inches up are shown in feet and inches. */
const FEET_AND_INCHES_FROM = 48;

/** The biggest value that can be typed for each unit. Catches typos like 840 mph. */
export const MAX_VALUE: Record<Unit, number> = {
  mph: 110,
  sec: 1800,
  in: 3600,
  lb: 700,
};

function roundTo(value: number, decimals: number): number {
  const factor = 10 ** decimals;
  return Math.round(value * factor) / factor;
}

/** 7 -> "7", 6.80 -> "6.8", 1.95 -> "1.95". Keeps at least `minDecimals` places. */
function trimNumber(value: number, maxDecimals: number, minDecimals = 0): string {
  const fixed = roundTo(value, maxDecimals).toFixed(maxDecimals);
  if (maxDecimals === 0) return fixed;
  const [whole, decimals = ""] = fixed.split(".");
  const trimmed = decimals.replace(/0+$/, "").padEnd(minDecimals, "0");
  return trimmed.length > 0 ? `${whole}.${trimmed}` : (whole as string);
}

function splitMinutes(totalSeconds: number): { minutes: number; seconds: number } {
  const total = roundTo(totalSeconds, 2);
  const minutes = Math.floor(total / SECONDS_PER_MINUTE);
  return { minutes, seconds: roundTo(total - minutes * SECONDS_PER_MINUTE, 2) };
}

function splitFeet(totalInches: number): { feet: number; inches: number } {
  const total = roundTo(totalInches, 2);
  const feet = Math.floor(total / INCHES_PER_FOOT);
  return { feet, inches: roundTo(total - feet * INCHES_PER_FOOT, 2) };
}

/** A measurement as people write it: "84 mph", "6.95 sec", "4:29.0", "21' 8\"", "185 lb". */
export function formatValue(value: number, unit: Unit): string {
  switch (unit) {
    case "sec": {
      if (value < SECONDS_PER_MINUTE) return `${trimNumber(value, 2, 1)} sec`;
      const { minutes, seconds } = splitMinutes(value);
      const [whole, decimals] = trimNumber(seconds, 2, 1).split(".");
      return `${minutes}:${(whole as string).padStart(2, "0")}.${decimals}`;
    }
    case "in": {
      if (value < FEET_AND_INCHES_FROM) return `${trimNumber(value, 2)} in`;
      const { feet, inches } = splitFeet(value);
      return `${feet}' ${trimNumber(inches, 2)}"`;
    }
    case "mph":
      return `${trimNumber(value, 1)} mph`;
    case "lb":
      return `${trimNumber(value, 1)} lb`;
  }
}

function plural(amount: number, singular: string, pluralForm: string): string {
  return amount === 1 ? singular : pluralForm;
}

/** Both ends of a range with the unit said once where it can be: "290 to 325 lb", "6' 2\" to 6' 6\"". */
export function formatRange(low: number, high: number, unit: Unit): string {
  const lowText = formatValue(low, unit);
  const highText = formatValue(high, unit);
  const suffix = ` ${unit}`;
  return lowText.endsWith(suffix) && highText.endsWith(suffix)
    ? `${lowText.slice(0, -suffix.length)} to ${highText}`
    : `${lowText} to ${highText}`;
}

/** A distance between two marks: "6 mph", "0.15 sec", "3 inches". */
export function formatGap(gap: number, unit: Unit): string {
  switch (unit) {
    case "sec":
      return `${trimNumber(gap, 2)} sec`;
    case "in":
      // Spelled out, because "1 in under" reads like a typo.
      return gap < FEET_AND_INCHES_FROM ? `${trimNumber(gap, 2)} ${plural(gap, "inch", "inches")}` : formatValue(gap, unit);
    case "mph":
      return `${trimNumber(gap, 1)} mph`;
    case "lb":
      return `${trimNumber(gap, 1)} lb`;
  }
}

/** A measurement the way a screen reader should say it: "21 feet 8 inches", "4 minutes 29 seconds". */
export function spokenValue(value: number, unit: Unit): string {
  switch (unit) {
    case "sec": {
      if (value < SECONDS_PER_MINUTE) {
        return `${trimNumber(value, 2)} ${plural(value, "second", "seconds")}`;
      }
      const { minutes, seconds } = splitMinutes(value);
      return `${minutes} ${plural(minutes, "minute", "minutes")} ${trimNumber(seconds, 2)} ${plural(seconds, "second", "seconds")}`;
    }
    case "in": {
      if (value < FEET_AND_INCHES_FROM) return `${trimNumber(value, 2)} ${plural(value, "inch", "inches")}`;
      const { feet, inches } = splitFeet(value);
      return `${feet} ${plural(feet, "foot", "feet")} ${trimNumber(inches, 2)} ${plural(inches, "inch", "inches")}`;
    }
    case "mph":
      return `${trimNumber(value, 1)} mph`;
    case "lb":
      return `${trimNumber(value, 1)} ${plural(value, "pound", "pounds")}`;
  }
}

export type ParsedValue = { ok: true; value: number } | { ok: false; message: string };

const PLAIN_NUMBER = /^\d+(\.\d+)?$|^\.\d+$/;
const MINUTES_AND_SECONDS = /^(\d+):(\d{1,2}(?:\.\d+)?)$/;
const FEET_AND_INCHES = /^(\d+)\s*(?:'|ft\.?|feet|foot|-)\s*(?:(\d+(?:\.\d+)?)\s*(?:"|in\.?|inches|inch)?)?$/i;

export type InputGuide = {
  /** Goes after the field label: "Fastball velocity (mph)". */
  unitLabel: string;
  /** How to type the value, with an example. */
  hint: string;
};

/**
 * How a value should be typed. Depends on the size of the numbers involved: a mile time is
 * typed as minutes and seconds, a discus throw as feet and inches, a vertical jump as inches.
 * @param typical a typical value for the metric (a benchmark entry number), in the metric's unit
 */
export function inputGuide(unit: Unit, typical?: number): InputGuide {
  switch (unit) {
    case "mph":
      return { unitLabel: "mph", hint: "Type the speed in mph, like 84." };
    case "lb":
      return { unitLabel: "pounds", hint: "Type the weight in pounds, like 185." };
    case "sec":
      return typical !== undefined && typical >= SECONDS_PER_MINUTE
        ? { unitLabel: "minutes:seconds", hint: "Type the time as minutes and seconds, like 4:40." }
        : { unitLabel: "seconds", hint: "Type the time in seconds, like 11.4." };
    case "in":
      return typical !== undefined && typical < FEET_AND_INCHES_FROM
        ? { unitLabel: "inches", hint: "Type inches, like 30." }
        : { unitLabel: "feet and inches", hint: "Type feet and inches, like 6'2 or 21'8." };
  }
}

function readNumber(text: string, unit: Unit): number | null {
  if (PLAIN_NUMBER.test(text)) return Number(text);

  if (unit === "sec") {
    const match = MINUTES_AND_SECONDS.exec(text);
    if (!match) return null;
    const seconds = Number(match[2]);
    return seconds < SECONDS_PER_MINUTE ? Number(match[1]) * SECONDS_PER_MINUTE + seconds : null;
  }

  if (unit === "in") {
    const match = FEET_AND_INCHES.exec(text);
    if (!match) return null;
    const inches = match[2] === undefined ? 0 : Number(match[2]);
    return inches < INCHES_PER_FOOT ? Number(match[1]) * INCHES_PER_FOOT + inches : null;
  }

  return null;
}

/** Read what someone typed into a number field. Never guesses: anything unclear is an error with a fix. */
export function parseValueInput(raw: string, unit: Unit, typical?: number): ParsedValue {
  const { hint } = inputGuide(unit, typical);
  const text = raw.trim();
  if (text === "") return { ok: false, message: hint };

  const value = readNumber(text, unit);
  if (value === null) return { ok: false, message: `That isn't a number we can read. ${hint}` };
  if (value <= 0) return { ok: false, message: `The number has to be more than zero. ${hint}` };
  if (value > MAX_VALUE[unit]) {
    return { ok: false, message: `${formatValue(value, unit)} is higher than this field accepts. Check the number and type it again.` };
  }
  return { ok: true, value };
}

