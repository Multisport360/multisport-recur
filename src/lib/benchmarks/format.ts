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
  mph: 130,
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

/** A distance between two marks: "6 mph", "0.15 sec", "3 in". */
export function formatGap(gap: number, unit: Unit): string {
  switch (unit) {
    case "sec":
      return `${trimNumber(gap, 2)} sec`;
    case "in":
      return gap < FEET_AND_INCHES_FROM ? `${trimNumber(gap, 2)} in` : formatValue(gap, unit);
    case "mph":
      return `${trimNumber(gap, 1)} mph`;
    case "lb":
      return `${trimNumber(gap, 1)} lb`;
  }
}

function plural(amount: number, singular: string, pluralForm: string): string {
  return amount === 1 ? singular : pluralForm;
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

const HOW_TO_TYPE: Record<Unit, string> = {
  mph: "Type the speed in mph, like 84.",
  sec: "Type the time in seconds, like 11.4, or in minutes and seconds, like 4:29.5.",
  in: "Type inches, like 74, or feet and inches, like 6'2.",
  lb: "Type the weight in pounds, like 185.",
};

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
export function parseValueInput(raw: string, unit: Unit): ParsedValue {
  const text = raw.trim();
  if (text === "") return { ok: false, message: HOW_TO_TYPE[unit] };

  const value = readNumber(text, unit);
  if (value === null) return { ok: false, message: `That isn't a number we can read. ${HOW_TO_TYPE[unit]}` };
  if (value <= 0) return { ok: false, message: `The number has to be more than zero. ${HOW_TO_TYPE[unit]}` };
  if (value > MAX_VALUE[unit]) {
    return { ok: false, message: `${formatValue(value, unit)} is higher than this field accepts. Check the number and type it again.` };
  }
  return { ok: true, value };
}

/** Hint shown under a number field. */
export function inputHint(unit: Unit): string {
  return HOW_TO_TYPE[unit];
}
