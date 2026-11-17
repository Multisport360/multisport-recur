import type { CSSProperties } from "react";
import type { MarkerPlacement } from "@/lib/benchmarks/ruler";

/** Sets --marker-x on a ruler so the bar and the chip line up. */
export function markerStyle(marker: MarkerPlacement | null): CSSProperties {
  return { "--marker-x": marker?.position ?? 0 } as CSSProperties;
}

/**
 * The hurdle-yellow bar that crosses the ruler at the athlete's number.
 * `reach` says how far it sticks out above and below the strip it crosses.
 */
export function MarkerBar({ reach = "-top-1 -bottom-1" }: { reach?: string }) {
  return (
    <div
      data-testid="ruler-marker"
      className={`ruler-marker pointer-events-none absolute w-[6px] bg-hurdle-yellow outline-2 outline-infield-navy ${reach}`}
    />
  );
}

/** The athlete's own number, on yellow, under the bar. This is the readout: it is meant to be big. */
export function MarkerChip({ label }: { label: string }) {
  return (
    <div className="relative mt-1 h-6">
      <div
        data-testid="ruler-chip"
        className="ruler-chip absolute top-0 border-2 border-infield-navy bg-hurdle-yellow px-1 font-display text-[2.25rem] leading-[2.5rem] font-extrabold whitespace-nowrap text-infield-navy"
      >
        {label}
      </div>
    </div>
  );
}

/** Keeps the layout steady when there is no number yet. */
export function MarkerChipSpace() {
  return <div className="mt-1 h-6" />;
}
