import { formatValue } from "@/lib/benchmarks/format";
import type { MetricReport } from "@/lib/report/build";
import { changeWords, formatDay, measuredBy } from "@/lib/report/words";

/** Every entry for one metric, oldest first, with the level each reached and the change since the one before. */
export function ProgressTable({ metric }: { metric: MetricReport }) {
  const better = metric.sets[0]?.better ?? "higher";
  return (
    <div className="mt-3 overflow-x-auto">
      <table data-testid="progress-table" className="w-full max-w-80 border-collapse text-left">
        <caption className="mb-1 text-left font-display text-[1.375rem] font-bold">
          {metric.metric} over time
        </caption>
        <thead>
          <tr className="border-b-2 border-infield-navy">
            <th scope="col" className="py-1 pr-1">Date</th>
            <th scope="col" className="py-1 pr-1">Number</th>
            <th scope="col" className="py-1 pr-1">Level</th>
            <th scope="col" className="py-1">Change</th>
          </tr>
        </thead>
        <tbody>
          {metric.history.map((row) => (
            <tr key={row.entry.id} className="border-b-2 border-chalk">
              <td className="py-1 pr-1 whitespace-nowrap">
                {formatDay(row.entry.measuredOn)}
                <span className="block text-[0.9375rem]">{measuredBy(row.entry.howMeasured)}</span>
              </td>
              <td className="py-1 pr-1 whitespace-nowrap">{formatValue(row.entry.value, metric.unit)}</td>
              <td className="py-1 pr-1">{row.levelLabel ?? "Below the first level"}</td>
              <td className="py-1">{row.improvement === null ? "First entry" : changeWords(row.improvement, metric.unit, better)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
