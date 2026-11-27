"use client";

import Link from "next/link";
import { EnterNumberView } from "@/components/report/EnterNumberView";
import { demoMetricChoices, demoToday } from "@/lib/demo/model";
import { DEMO_SPORTS } from "@/lib/demo/sample";
import { chosenMetric } from "@/lib/stats/metric-choices";
import { useDemo } from "../DemoProvider";

/** "Enter a number", with the app's form and checks. Saving keeps the number in this tab only. */
export function DemoAddStat({ sportId, metric }: { sportId: string | undefined; metric: string | undefined }) {
  const { data, today, saveStat } = useDemo();
  const sport = DEMO_SPORTS.find((candidate) => candidate.id === sportId) ?? (DEMO_SPORTS[0] as (typeof DEMO_SPORTS)[number]);
  const metrics = demoMetricChoices(data, sport.id);

  return (
    <EnterNumberView
      sportLabel={`${sport.sport}, ${sport.positionOrEvent}`}
      metrics={metrics}
      initialMetric={chosenMetric(metrics, metric)}
      today={demoToday(today)}
      action={saveStat(sport.id)}
      backHref="/demo"
      above={
        <nav aria-label="Jordan's sports" className="mt-2">
          <ul className="flex flex-wrap gap-x-3">
            {DEMO_SPORTS.map((option) => (
              <li key={option.id}>
                <Link
                  href={`/demo/stats?sport=${option.id}`}
                  aria-current={option.id === sport.id ? "page" : undefined}
                  className={`inline-flex min-h-6 items-center ${option.id === sport.id ? "font-bold text-infield-navy no-underline" : ""}`}
                >
                  {option.sport}, {option.positionOrEvent}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      }
    />
  );
}
