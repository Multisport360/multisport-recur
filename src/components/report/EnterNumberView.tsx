import Link from "next/link";
import type { ReactNode } from "react";
import type { FormAction } from "@/lib/forms";
import { HOW_MEASURED } from "@/lib/report/build";
import { HOW_MEASURED_LABELS } from "@/lib/stats/rules";
import { StatForm, type MetricChoice } from "./StatForm";

/**
 * "Enter a number" for one of the athlete's sports. Used by the signed-in page (saving with the
 * addStat Server Action) and by the demo (saving in the browser).
 */

type Props = {
  sportLabel: string;
  metrics: MetricChoice[];
  initialMetric: string;
  /** YYYY-MM-DD in the family's time zone: the latest date a number can be measured on. */
  today: string;
  action: FormAction;
  backHref: string;
  /** Shown between the heading and the form, e.g. the demo's choice of sport. */
  above?: ReactNode;
};

const HOW_MEASURED_OPTIONS = HOW_MEASURED.map((how) => ({ value: how, label: HOW_MEASURED_LABELS[how] }));

export function EnterNumberView({ sportLabel, metrics, initialMetric, today, action, backHref, above }: Props) {
  return (
    <div className="max-w-60">
      <h1 className="text-[2.75rem]">Enter a number</h1>
      {above}
      <p className="mt-2 mb-4">{sportLabel}. Earlier numbers stay in the history, so you can see progress over time.</p>
      {/* A new key per sport, so switching sport starts a fresh form. */}
      <StatForm key={sportLabel} action={action} metrics={metrics} initialMetric={initialMetric} today={today} howMeasured={HOW_MEASURED_OPTIONS} />
      <p className="mt-4">
        <Link href={backHref}>Back to the report</Link>
      </p>
    </div>
  );
}
