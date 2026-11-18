import { headline, keepUnitsTogether, type Subject } from "@/lib/benchmarks/describe";
import type { Standout } from "@/lib/report/build";

type Props = { leader: Standout; others: Standout[]; firstName: string; subject: Subject };

function where(standout: Standout): string {
  return `${standout.sport}, ${standout.positionOrEvent}`;
}

/** For multi-sport athletes: which sport's numbers reach the highest level right now. */
export function ClosestSummary({ leader, others, firstName, subject }: Props) {
  const level = leader.comparison.reachedLevel?.label;
  return (
    <section data-testid="closest-summary" className="mt-3 border-l-4 border-infield-navy py-2 pr-2 pl-3">
      <h2 className="text-[1.75rem]">Closest to college right now</h2>
      <p className="mt-1 text-[1.25rem] leading-[1.35] font-bold">
        {level
          ? `${where(leader)}: ${leader.metric.toLowerCase()} reaches ${level} range.`
          : `${where(leader)}: ${leader.metric.toLowerCase()} is the closest to a first level.`}
      </p>
      <p className="mt-1">{keepUnitsTogether(headline(leader.comparison, subject))}</p>
      {others.length > 0 ? (
        <ul className="mt-2 space-y-0.5">
          {others.map((other) => (
            <li key={`${other.sport}-${other.positionOrEvent}`}>
              {where(other)}: {other.metric.toLowerCase()}{" "}
              {other.comparison.reachedLevel ? `in ${other.comparison.reachedLevel.label} range` : "below the first level"}.
            </li>
          ))}
        </ul>
      ) : null}
      <p className="mt-2 text-[0.9375rem]">
        Based on {firstName}&apos;s best number in each sport. Height and weight are left out.
      </p>
    </section>
  );
}
