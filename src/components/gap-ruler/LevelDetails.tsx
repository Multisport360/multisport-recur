import { formatValue } from "@/lib/benchmarks/format";
import { isRoughGuide } from "@/lib/benchmarks/levels";
import type { BenchmarkSet } from "@/lib/benchmarks/sets";

/**
 * The score card behind a ruler: every level's numbers in a table, then each level's
 * source with the guide's own note. Closed until asked for.
 */
export function LevelDetails({ set }: { set: BenchmarkSet }) {
  const { unit } = set;
  const isRange = set.better === "range";
  const hasMiddle = set.levels.some((level) => level.mid !== null);
  const hasTop = set.levels.some((level) => level.elite !== null);
  const cell = (mark: number | null) => (mark === null ? "" : formatValue(mark, unit));

  return (
    <details className="mt-1">
      <summary className="py-1.5 text-track-blue underline underline-offset-4">See every level&apos;s numbers</summary>
      <table className="w-full max-w-80 border-collapse text-left">
        <thead>
          <tr className="border-b-2 border-infield-navy">
            <th scope="col" className="py-1 pr-1 font-bold">
              Level
            </th>
            <th scope="col" className="py-1 pr-1 font-bold">
              {isRange ? "From" : "Entry"}
            </th>
            {hasMiddle ? (
              <th scope="col" className="py-1 pr-1 font-bold">
                Middle
              </th>
            ) : null}
            {hasTop ? (
              <th scope="col" className="py-1 font-bold">
                {isRange ? "To" : "Top"}
              </th>
            ) : null}
          </tr>
        </thead>
        <tbody>
          {set.levels.map((level) => (
            <tr key={level.levelCode} className="border-b-2 border-chalk">
              <th scope="row" className="py-1 pr-1 font-display text-[1.25rem] leading-[1.1] font-bold">
                {level.label}
              </th>
              <td className="py-1 pr-1">{cell(level.entry)}</td>
              {hasMiddle ? <td className="py-1 pr-1">{cell(level.mid)}</td> : null}
              {hasTop ? <td className="py-1">{cell(level.elite)}</td> : null}
            </tr>
          ))}
        </tbody>
      </table>
      <ul className="mt-2 max-w-80 space-y-1 text-[0.9375rem]">
        {set.levels.map((level) => (
          <li key={level.levelCode}>
            <strong>{level.level}:</strong>{" "}
            <a href={level.source.url} rel="noopener noreferrer" target="_blank">
              {level.source.name}
            </a>
            {level.notes ? <> The guide says: {level.notes}.</> : null}
            {isRoughGuide(level.confidence) ? <> Rough guide.</> : null}
          </li>
        ))}
      </ul>
    </details>
  );
}
