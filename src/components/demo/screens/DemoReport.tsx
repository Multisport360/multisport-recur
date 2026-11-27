"use client";

import { GapReportView } from "@/components/report/GapReportView";
import { demoReportHeader, demoReports } from "@/lib/demo/model";
import { DEMO_ATHLETE, DEMO_SPORTS } from "@/lib/demo/sample";
import { useDemo } from "../DemoProvider";

/** Jordan's gap report: the app's report view, fed from the sample family and the numbers added in this tab. */
export function DemoReport({ saved }: { saved: string | undefined }) {
  const { data, state, today } = useDemo();
  const header = demoReportHeader(today);
  return (
    <GapReportView
      firstName={DEMO_ATHLETE.firstName}
      classText={header.classText}
      isOwnLogin={false}
      sports={DEMO_SPORTS}
      reports={demoReports(data, state)}
      benchmarksDown={false}
      showSeniorNote={header.showSeniorNote}
      notices={
        saved ? (
          <p role="status" className="mt-2 border-l-4 border-infield-navy pl-2 font-bold">
            Saved. The {saved.toLowerCase()} ruler below shows the new number.
          </p>
        ) : null
      }
      enterHref={(sportId, metric) => `/demo/stats?sport=${sportId}&metric=${encodeURIComponent(metric)}`}
      addSportHref={null}
    />
  );
}
