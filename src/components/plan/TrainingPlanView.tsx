import type { ComponentProps, ReactNode } from "react";
import { PlanView } from "./PlanView";

/**
 * A built plan's page: banners, heading, when the answers were given, then the plan itself.
 * The signed-in plan page and the demo both render this.
 */

type Props = {
  /** The draft banner (and the demo's sample-athlete banner) at the very top. */
  banners: ReactNode;
  heading: string;
  /** "Saved. The plan below uses the new answers." */
  notices?: ReactNode;
  /** "Answers from Nov 24, 2026. Change the answers" */
  answeredLine: ReactNode;
  benchmarksDown: boolean;
  plan: ComponentProps<typeof PlanView>;
};

export function TrainingPlanView({ banners, heading, notices, answeredLine, benchmarksDown, plan }: Props) {
  return (
    <div className="max-w-80">
      {banners}
      <h1 className="text-[2.75rem]">{heading}</h1>
      {notices}
      {answeredLine}
      {benchmarksDown ? (
        <p role="alert" className="mt-2 border-l-4 border-infield-navy pl-2 font-bold">
          The benchmarks can&apos;t be loaded right now, so this plan has no focus work. Reload in a few minutes.
        </p>
      ) : null}
      <PlanView {...plan} />
    </div>
  );
}
