import type { CSSProperties } from "react";
import { formatValue, tickCaption } from "@/lib/benchmarks/format";
import { isRoughGuide } from "@/lib/benchmarks/levels";
import type { ThresholdBand, ThresholdRulerModel } from "@/lib/benchmarks/ruler";
import type { BenchmarkSet } from "@/lib/benchmarks/sets";
import { MarkerBar, MarkerChip, MarkerChipSpace, markerStyle } from "./Marker";

type Props = {
  set: BenchmarkSet;
  model: ThresholdRulerModel;
  /** The athlete's number as text, or null when there is no number yet. */
  valueLabel: string | null;
  /** Flag individual levels as a rough guide (used when only some levels are low-confidence). */
  flagRoughLevels: boolean;
};

/** Bands darker than this get light tick marks so the ticks stay visible. */
const LIGHT_TICKS_FROM_TINT = 0.5;

function bandColor(tint: number): string {
  const percent = Math.round(tint * 100);
  return `color-mix(in srgb, var(--color-track-blue) ${percent}%, var(--color-lane-white))`;
}

/** Let long level names break after a slash so they fit a narrow band. */
function breakable(label: string) {
  return label.split("/").flatMap((part, index) => (index === 0 ? [part] : ["/", <wbr key={index} />, part]));
}

/** Every fifth tick is taller, like the half-way marks on a tape. */
const LONG_TICK_EVERY = 5;

function BandStrip({ band }: { band: ThresholdBand }) {
  const tickColor = band.tint >= LIGHT_TICKS_FROM_TINT ? "bg-lane-white" : "bg-infield-navy";
  return (
    <div className="relative" style={{ backgroundColor: bandColor(band.tint) }}>
      {band.ticks.map((tick, index) => {
        const isLong = index % LONG_TICK_EVERY === LONG_TICK_EVERY - 1;
        return (
          <div
            key={tick}
            data-testid="ruler-tick"
            className={`absolute bottom-0 -ml-px w-[2px] ${isLong ? "h-[1.125rem]" : "h-1.5"} ${tickColor}`}
            style={{ left: `${tick * 100}%` }}
          />
        );
      })}
    </div>
  );
}

/**
 * The ruler for higher/lower metrics: a strip of track with one blue band per college
 * level, a white lane line and a flag at each entry number, tape-measure ticks at real
 * unit steps, and the athlete's yellow marker.
 */
export function ThresholdTape({ set, model, valueLabel, flagRoughLevels }: Props) {
  const columns: CSSProperties = {
    gridTemplateColumns: model.bands.map((band) => `minmax(0, ${band.weight}fr)`).join(" "),
  };

  return (
    <div style={markerStyle(model.marker)}>
      {set.better === "lower" ? (
        <div className="mb-0.5 flex justify-between text-[0.9375rem]">
          <span>Slower</span>
          <span>Faster</span>
        </div>
      ) : null}

      <div className="grid items-end" style={columns}>
        {model.bands.map((band, index) =>
          band.step ? (
            <div key={index} className="border-l-2 border-infield-navy pt-0.5 pr-0.5 pb-1.5 pl-0.5">
              {band.step.levels.map((level) => (
                <div key={level.levelCode} className="font-display text-[1.0625rem] leading-[1.1] font-bold sm:text-[1.375rem]">
                  {breakable(level.label)}
                </div>
              ))}
              <div className="text-[0.9375rem] leading-[1.3] whitespace-nowrap">{formatValue(band.step.entry, set.unit)}</div>
              {flagRoughLevels && band.step.levels.some((level) => isRoughGuide(level.confidence)) ? (
                <div className="text-[0.9375rem] leading-[1.3]">rough guide</div>
              ) : null}
            </div>
          ) : (
            <div key={index} />
          ),
        )}
      </div>

      <div className="relative">
        <div className="grid h-7 gap-x-[3px] border-y-2 border-infield-navy bg-lane-white sm:h-8" style={columns}>
          {model.bands.map((band, index) => (
            <BandStrip key={index} band={band} />
          ))}
        </div>
        {model.marker ? <MarkerBar /> : null}
      </div>

      {valueLabel && model.marker ? <MarkerChip label={valueLabel} /> : <MarkerChipSpace />}
      {model.tickStep !== null ? (
        <p data-testid="tick-caption" className="mt-0.5 text-[0.9375rem]">
          {tickCaption(model.tickStep, set.unit)}
        </p>
      ) : null}
    </div>
  );
}
