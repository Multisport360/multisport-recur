import type { BenchmarkSet, LevelMark, Step } from "./sets.ts";
import type { Unit } from "./types.ts";

/**
 * Where things sit on the GapRuler. Positions are fractions from 0 (left edge) to 1 (right edge).
 * Pure geometry: no React, no styling.
 *
 * higher / lower metrics
 *   The ruler has one equal-width band per level, plus a shorter lead-in stretch before the
 *   first level. Left is always "not there yet", right is always "better", for times as well
 *   as distances. Inside a band the value is placed in proportion between the two entry
 *   numbers. Tick marks sit at real unit steps, so a band that covers more ground shows more ticks.
 *
 * range metrics
 *   One lane per level on a plain number line, like lanes on a track.
 */

export type MarkerPlacement = {
  position: number;
  /** Set when the value is past the end of the ruler and the marker is pinned to the edge. */
  offScale: "below" | "above" | null;
};

export type ThresholdBand = {
  /** Null for the lead-in stretch before the first level. */
  step: Step | null;
  /** How strong the blue tint is, 0 to 1. Higher levels are stronger. */
  tint: number;
  /** Relative width. Level bands are 1; the lead-in is narrower. */
  weight: number;
  /** Tick marks inside the band, each 0 to 1 across the band. */
  ticks: number[];
};

export type ThresholdRulerModel = {
  kind: "threshold";
  bands: ThresholdBand[];
  marker: MarkerPlacement | null;
  /** The distance between two tick marks, in the metric's unit. Null when no ticks are drawn. */
  tickStep: number | null;
};

export type RangeLane = {
  level: LevelMark;
  start: number;
  end: number;
  /** Where the value sits against this level's typical range. Null when there is no value. */
  fit: "under" | "inside" | "over" | null;
  /** How far outside the range the value is, in the metric's unit. 0 when inside or no value. */
  distance: number;
};

export type RangeTick = { value: number; position: number };

export type RangeRulerModel = {
  kind: "range";
  lanes: RangeLane[];
  ticks: RangeTick[];
  marker: MarkerPlacement | null;
};

export type RulerModel = ThresholdRulerModel | RangeRulerModel;

const MIN_TINT = 0.18;
const MAX_TINT = 1;
const SINGLE_LEVEL_TINT = 0.6;
const LEAD_IN_WEIGHT = 0.5;
/** With only one level there are no steps to measure, so the end stretches are this share of the entry number. */
const SINGLE_LEVEL_STRETCH = 0.25;
/** A full-width band shows at most this many ticks; the half-width lead-in, half as many. */
const MAX_TICKS_PER_BAND = 12;
/** If the natural step would crowd a band, it grows by these factors in turn. */
const STEP_GROWTH = [1, 2, 5, 10];
/** If the natural step would leave every band empty, it shrinks by these factors in turn. */
const STEP_SHRINK = [2, 5];
const SECONDS_PER_MINUTE = 60;
const INCHES_PER_FOOT = 12;
const FEET_AND_INCHES_FROM = 48;
/** Empty space either side of the range lanes, as a share of the widest span. */
const RANGE_PADDING = 0.15;
const TARGET_RANGE_TICKS = 5;
const RANGE_TICK_STEPS = [1, 2, 5, 10, 20, 25, 50, 100, 200, 500];
const FLOAT_SLACK = 1e-9;

function median(values: readonly number[]): number {
  const sorted = [...values].sort((a, b) => a - b);
  const middle = Math.floor(sorted.length / 2);
  const upper = sorted[middle] as number;
  return sorted.length % 2 === 1 ? upper : ((sorted[middle - 1] as number) + upper) / 2;
}

function clamp01(value: number): number {
  return Math.min(1, Math.max(0, value));
}

/** Flip times so that a bigger number always means better. */
function toProgress(set: BenchmarkSet, value: number): number {
  return set.better === "lower" ? -value : value;
}

/**
 * The edges of every band in "progress" units: the start of the lead-in stretch,
 * each entry number, then the far end of the top level.
 */
function thresholdEdges(set: BenchmarkSet): number[] {
  const entries = set.steps.map((step) => toProgress(set, step.entry));
  const first = entries[0] as number;
  const last = entries[entries.length - 1] as number;

  const gaps = entries.slice(1).map((entry, index) => entry - (entries[index] as number));
  const typicalGap = gaps.length > 0 ? median(gaps) : Math.abs(first) * SINGLE_LEVEL_STRETCH;

  // The top band runs to the top level's own mid/elite mark when the data has one.
  const topStep = set.steps[set.steps.length - 1] as Step;
  const topMarks = topStep.levels
    .flatMap((level) => [level.mid, level.elite])
    .filter((mark): mark is number => mark !== null)
    .map((mark) => toProgress(set, mark));
  const furthestMark = Math.max(last, ...topMarks);

  return [first - typicalGap, ...entries, furthestMark > last ? furthestMark : last + typicalGap];
}

function bandWeights(bandCount: number): number[] {
  return Array.from({ length: bandCount }, (_, index) => (index === 0 ? LEAD_IN_WEIGHT : 1));
}

function placeOnEdges(edges: readonly number[], weights: readonly number[], progress: number): MarkerPlacement {
  const bandCount = edges.length - 1;
  const start = edges[0] as number;
  const end = edges[bandCount] as number;
  if (progress < start) return { position: 0, offScale: "below" };
  if (progress > end) return { position: 1, offScale: "above" };

  // The last edge the value has reached decides the band.
  let band = 0;
  for (let index = 1; index < bandCount; index += 1) {
    if (progress >= (edges[index] as number)) band = index;
  }
  const bandStart = edges[band] as number;
  const bandEnd = edges[band + 1] as number;
  const share = bandEnd === bandStart ? 0 : (progress - bandStart) / (bandEnd - bandStart);

  const totalWeight = weights.reduce((sum, weight) => sum + weight, 0);
  const weightBefore = weights.slice(0, band).reduce((sum, weight) => sum + weight, 0);
  return { position: clamp01((weightBefore + share * (weights[band] as number)) / totalWeight), offScale: null };
}

/**
 * The step a coach would measure in: 1 mph, 5 lb, 1 inch or 1 foot, a tenth of a second
 * for a sprint, a second for a lap, five seconds for a mile. It depends only on the unit and
 * the size of the numbers, so two rulers for the same metric always tick the same way.
 */
export function naturalTickStep(unit: Unit, typical: number): number {
  switch (unit) {
    case "mph":
      return 1;
    case "lb":
      return 5;
    case "in":
      return typical < FEET_AND_INCHES_FROM ? 1 : INCHES_PER_FOOT;
    case "sec":
      if (typical < 15) return 0.1;
      return typical < SECONDS_PER_MINUTE ? 1 : 5;
  }
}

/** The natural step, made coarser only if it would crowd a band. */
function tickStep(set: BenchmarkSet, edges: readonly number[], weights: readonly number[]): number {
  const natural = naturalTickStep(set.unit, set.steps[0]?.entry ?? 0);
  const fits = (step: number) =>
    edges.slice(1).every((edge, index) => (edge - (edges[index] as number)) / step <= MAX_TICKS_PER_BAND * (weights[index] as number));
  const factor = STEP_GROWTH.find((growth) => fits(natural * growth)) ?? (STEP_GROWTH[STEP_GROWTH.length - 1] as number);
  const step = natural * factor;
  const drawsTicks = (candidate: number) =>
    edges.slice(1).some((edge, index) => ticksBetween(edges[index] as number, edge, candidate).length > 0);
  if (drawsTicks(step)) return step;
  // Levels exactly one step apart (4.9, 5.0, 5.1 sec) would leave the tape bare. Use a finer mark if one fits.
  const finer = STEP_SHRINK.map((shrink) => step / shrink).find((candidate) => fits(candidate) && drawsTicks(candidate));
  return finer ?? step;
}

/** Tick positions (0 to 1) strictly inside one band, at whole multiples of the step. */
function ticksBetween(start: number, end: number, step: number): number[] {
  const ticks: number[] = [];
  const firstMultiple = Math.floor(start / step + FLOAT_SLACK) + 1;
  for (let multiple = firstMultiple; multiple * step < end - FLOAT_SLACK; multiple += 1) {
    ticks.push((multiple * step - start) / (end - start));
  }
  return ticks;
}

function tintFor(stepIndex: number, stepCount: number): number {
  if (stepCount === 1) return SINGLE_LEVEL_TINT;
  return MIN_TINT + ((MAX_TINT - MIN_TINT) * stepIndex) / (stepCount - 1);
}

export function thresholdRuler(set: BenchmarkSet, value: number | null): ThresholdRulerModel {
  const edges = thresholdEdges(set);
  const weights = bandWeights(edges.length - 1);
  const step = tickStep(set, edges, weights);

  const bands: ThresholdBand[] = weights.map((weight, index) => ({
    step: index === 0 ? null : (set.steps[index - 1] as Step),
    tint: index === 0 ? 0 : tintFor(index - 1, set.steps.length),
    weight,
    ticks: ticksBetween(edges[index] as number, edges[index + 1] as number, step),
  }));

  const marker = value === null ? null : placeOnEdges(edges, weights, toProgress(set, value));
  // No caption for ticks that aren't there.
  const hasTicks = bands.some((band) => band.ticks.length > 0);
  return { kind: "threshold", bands, marker, tickStep: hasTicks ? step : null };
}

function rangeTickStep(span: number): number {
  const rough = span / TARGET_RANGE_TICKS;
  return RANGE_TICK_STEPS.find((step) => step >= rough) ?? (RANGE_TICK_STEPS[RANGE_TICK_STEPS.length - 1] as number);
}

function laneFit(level: LevelMark, value: number | null): Pick<RangeLane, "fit" | "distance"> {
  if (value === null) return { fit: null, distance: 0 };
  const high = level.elite ?? level.entry;
  if (value < level.entry) return { fit: "under", distance: Math.round((level.entry - value) * 1000) / 1000 };
  if (value > high) return { fit: "over", distance: Math.round((value - high) * 1000) / 1000 };
  return { fit: "inside", distance: 0 };
}

export function rangeRuler(set: BenchmarkSet, value: number | null): RangeRulerModel {
  const lows = set.levels.map((level) => level.entry);
  const highs = set.levels.map((level) => level.elite ?? level.entry);
  const lowest = Math.min(...lows);
  const highest = Math.max(...highs);
  const padding = Math.max((highest - lowest) * RANGE_PADDING, 1);
  const min = lowest - padding;
  const max = highest + padding;
  const toPosition = (mark: number) => (mark - min) / (max - min);

  const lanes = set.levels.map((level) => ({
    level,
    start: toPosition(level.entry),
    end: toPosition(level.elite ?? level.entry),
    ...laneFit(level, value),
  }));

  const step = rangeTickStep(max - min);
  const ticks: RangeTick[] = [];
  for (let tick = Math.ceil(min / step) * step; tick <= max; tick += step) {
    ticks.push({ value: tick, position: toPosition(tick) });
  }

  let marker: MarkerPlacement | null = null;
  if (value !== null) {
    const offScale = value < min ? "below" : value > max ? "above" : null;
    marker = { position: clamp01(toPosition(value)), offScale };
  }

  return { kind: "range", lanes, ticks, marker };
}

export function buildRuler(set: BenchmarkSet, value: number | null): RulerModel {
  return set.better === "range" ? rangeRuler(set, value) : thresholdRuler(set, value);
}
