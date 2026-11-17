import { Fragment } from "react";
import { formatGap, formatRange, formatValue } from "@/lib/benchmarks/format";
import type { RangeLane, RangeRulerModel } from "@/lib/benchmarks/ruler";
import type { BenchmarkSet } from "@/lib/benchmarks/sets";
import { MarkerBar, MarkerChip, MarkerChipSpace, markerStyle } from "./Marker";

type Props = {
  set: BenchmarkSet;
  model: RangeRulerModel;
  valueLabel: string | null;
};

const MIN_TINT = 28;
const MAX_TINT = 100;

/** Higher levels get a stronger blue. Lanes arrive highest level first. */
function laneColor(index: number, count: number): string {
  const share = count === 1 ? 1 : 1 - index / (count - 1);
  const percent = Math.round(MIN_TINT + (MAX_TINT - MIN_TINT) * share);
  return `color-mix(in srgb, var(--color-track-blue) ${percent}%, var(--color-lane-white))`;
}

/** Where the athlete's number sits against one lane, in words: "inside", "1 inch under". */
function fitWords(lane: RangeLane, set: BenchmarkSet): string | null {
  if (lane.fit === null) return null;
  if (lane.fit === "inside") return "inside";
  return `${formatGap(lane.distance, set.unit)} ${lane.fit}`;
}

/**
 * The ruler for height and weight: one lane per college level on a shared number line,
 * each showing that level's typical range, with the athlete's yellow marker crossing the
 * lanes. Each lane also says in words whether the number is inside, under or over it.
 */
export function RangeLanes({ set, model, valueLabel }: Props) {
  const laneCount = model.lanes.length;

  return (
    <div className="grid grid-cols-[6.5rem_minmax(0,1fr)] sm:grid-cols-[10rem_minmax(0,1fr)]" style={markerStyle(model.marker)}>
      {model.lanes.map((lane, index) => {
        const words = fitWords(lane, set);
        return (
          <Fragment key={lane.level.levelCode}>
            <div className="min-h-6 border-t-2 border-chalk py-0.5 pr-1" style={{ gridColumn: 1, gridRow: index + 1 }}>
              <div className="font-display text-[1.0625rem] leading-[1.1] font-bold sm:text-[1.375rem]">{lane.level.label}</div>
              <div className="text-[0.9375rem] leading-[1.3] whitespace-nowrap">
                {formatRange(lane.level.entry, lane.level.elite ?? lane.level.entry, set.unit)}
              </div>
              {words ? (
                <div data-testid="lane-fit" className={`text-[0.9375rem] leading-[1.3] ${lane.fit === "inside" ? "font-bold" : ""}`}>
                  {words}
                </div>
              ) : null}
            </div>
            <div className="relative border-t-2 border-chalk" style={{ gridColumn: 2, gridRow: index + 1 }}>
              <div
                className="absolute top-1 bottom-1"
                style={{
                  left: `${lane.start * 100}%`,
                  width: `${(lane.end - lane.start) * 100}%`,
                  backgroundColor: laneColor(index, laneCount),
                }}
              />
            </div>
          </Fragment>
        );
      })}

      {/* The marker crosses every lane and stops at the number line. */}
      <div className="pointer-events-none relative" style={{ gridColumn: 2, gridRow: `1 / span ${laneCount}` }}>
        {model.marker ? <MarkerBar reach="-top-1 bottom-0" /> : null}
      </div>

      <div className="relative h-3 border-t-2 border-infield-navy" style={{ gridColumn: 2, gridRow: laneCount + 1 }}>
        {model.ticks.map((tick) => (
          <div
            key={tick.value}
            className="absolute top-0 -translate-x-1/2 text-[0.9375rem] leading-[1.3] whitespace-nowrap"
            style={{ left: `${tick.position * 100}%` }}
          >
            <div className="mx-auto h-0.5 w-[2px] bg-infield-navy" />
            {formatValue(tick.value, set.unit)}
          </div>
        ))}
      </div>

      <div style={{ gridColumn: 2, gridRow: laneCount + 2 }}>
        {valueLabel && model.marker ? <MarkerChip label={valueLabel} /> : <MarkerChipSpace />}
      </div>
    </div>
  );
}
