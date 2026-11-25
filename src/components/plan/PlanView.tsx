import Link from "next/link";
import { formatValue, metricInSentence } from "@/lib/benchmarks/format";
import { weekStatus } from "@/lib/plan/block";
import { teamScheduleFullText, teamSessionsText } from "@/lib/plan/rules";
import { DAY_NAMES } from "@/lib/plan/schedule";
import { sessionKey } from "@/lib/plan/queries";
import type { BuiltPlan, PlanItem, PlanWeek, Session } from "@/lib/plan/types";
import type { AthleteSport } from "@/lib/report/queries";
import { SessionDone } from "./SessionDone";

type Props = {
  athleteId: string;
  firstName: string;
  plan: BuiltPlan;
  sports: AthleteSport[];
  blockStart: string;
  currentWeek: number;
  shownWeek: number;
  done: Set<string>;
  isRetestWeek: boolean;
};

const SECTION = "mt-5 border-t-2 border-chalk pt-3";

/** The built plan: safety first, then what it focuses on, then the week day by day. */
export function PlanView(props: Props) {
  const { plan, shownWeek } = props;
  const week = plan.weeks[shownWeek - 1] as PlanWeek;
  return (
    <div data-testid="plan">
      <SafetyNotes plan={plan} />
      <FocusSummary {...props} />
      {props.isRetestWeek ? <RetestPrompt {...props} /> : null}
      <WeekNav {...props} />
      {/* A week with no sessions shows the reason above (team schedule full), never seven silent rest days. */}
      {week.days.some((day) => day.session) ? <WeekTable week={week} done={props.done} /> : null}
      {week.days.map((day) =>
        day.session ? (
          <DayDetail key={day.day} {...props} week={week} day={day.day} session={day.session} />
        ) : null,
      )}
      <HowItWorks plan={plan} />
    </div>
  );
}

function SafetyNotes({ plan }: { plan: BuiltPlan }) {
  return (
    <section data-testid="safety-notes" aria-labelledby="safety-heading" className="mt-3 border-l-4 border-infield-navy pl-2">
      <h2 id="safety-heading" className="text-[1.75rem]">
        Safety notes
      </h2>
      <ul className="mt-1 list-disc space-y-0.5 pl-3">
        {plan.safetyNotes.map((note, index) => (
          <li key={note} className={index === 0 ? "font-bold" : undefined}>
            {note}
          </li>
        ))}
      </ul>
      {plan.messages.length > 0 ? (
        <div data-testid="plan-messages" className="mt-2 space-y-1">
          {plan.messages.map((message) => (
            <p key={message} className="font-bold">
              {message}
            </p>
          ))}
        </div>
      ) : null}
    </section>
  );
}

function gapLine(gap: BuiltPlan["modules"][number]["gaps"][number]): string {
  return `${metricInSentence(gap.metric)} ${formatValue(gap.value, gap.unit)}, ${formatValue(gap.gap, gap.unit)} to ${gap.nextLevelLabel}`;
}

function FocusSummary({ plan, firstName }: Props) {
  return (
    <section className={SECTION} aria-labelledby="focus-heading">
      <h2 id="focus-heading" className="text-[1.75rem]">
        What this plan works on
      </h2>
      {plan.modules.length === 0 ? (
        <p className="mt-1">
          None of {firstName}&apos;s numbers that training can change have a gap to the next level yet, so this plan is the
          strength base on its own. Enter more numbers on the gap report and the plan will add focus work.
        </p>
      ) : (
        <ul className="mt-1 space-y-1">
          {plan.modules.map((mod) => (
            <li key={mod.id}>
              <span className="font-bold">{mod.name}.</span> {mod.goal}{" "}
              <span className="tabular-nums">({mod.gaps.map(gapLine).join("; ")})</span>
            </li>
          ))}
        </ul>
      )}
      <p className="mt-2">
        <span className="font-bold">{plan.tierLabel} level.</span> {plan.seasonText}
      </p>
    </section>
  );
}

function RetestPrompt({ plan, athleteId, sports }: Props) {
  const targets = plan.modules.flatMap((mod) => mod.gaps);
  return (
    <section data-testid="retest-prompt" className="mt-3 border-l-4 border-track-blue pl-2">
      <h2 className="text-[1.75rem]">Time to retest</h2>
      <p className="mt-1">{plan.retest}</p>
      {targets.length > 0 ? (
        <ul className="mt-1 space-y-0.5">
          {targets.map((gap) => {
            const sport = sports.find((candidate) => candidate.sport === gap.sport && candidate.positionOrEvent === gap.positionOrEvent);
            if (!sport) return null;
            return (
              <li key={`${sport.id}-${gap.metric}`}>
                <Link href={`/athletes/${athleteId}/stats/new?sport=${sport.id}&metric=${encodeURIComponent(gap.metric)}`} className="inline-block py-1">
                  Log a new {metricInSentence(gap.metric)}
                </Link>
              </li>
            );
          })}
        </ul>
      ) : null}
    </section>
  );
}

function WeekNav({ plan, athleteId, firstName, currentWeek, shownWeek, done }: Props) {
  const total = plan.weeks.reduce((count, week) => count + week.days.filter((day) => day.session).length, 0);
  const status = weekStatus(shownWeek, currentWeek);
  return (
    <section className={SECTION} aria-labelledby="week-heading">
      <h2 id="week-heading" className="text-[2.25rem] tabular-nums">
        Week {shownWeek} of {plan.weeks.length}
      </h2>
      {plan.teamScheduleFull ? (
        <p data-testid="team-schedule-full" role="status" className="mt-1 border-l-4 border-infield-navy pl-2 text-[1.25rem] font-bold">
          {teamScheduleFullText(plan.teamSessionsPerWeek, firstName)}
        </p>
      ) : null}
      <p data-testid="week-status" className="mt-1 tabular-nums">
        {status.text}{" "}
        {status.isCurrent ? null : <Link href={`/plan/${athleteId}?week=${currentWeek}`}>Go to week {currentWeek}</Link>}
      </p>
      {total > 0 ? (
        <p data-testid="completed-count" className="mt-1 tabular-nums">
          {done.size} of {total} sessions done in this 6-week block.
        </p>
      ) : null}
      <nav aria-label="Weeks in this block" className="mt-1">
        <ul className="flex flex-wrap gap-x-2">
          {plan.weeks.map((week) => (
            <li key={week.week}>
              <Link
                href={`/plan/${athleteId}?week=${week.week}`}
                aria-current={week.week === shownWeek ? "page" : undefined}
                className={`inline-flex min-h-6 items-center tabular-nums ${week.week === shownWeek ? "font-bold text-infield-navy no-underline" : ""}`}
              >
                Week {week.week}
                {week.week === currentWeek ? " (now)" : ""}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
      <p className="mt-1">{plan.weeks[shownWeek - 1]?.note}</p>
    </section>
  );
}

function WeekTable({ week, done }: { week: PlanWeek; done: Set<string> }) {
  return (
    <table data-testid="week-table" className="mt-2 w-full border-collapse text-left">
      <caption className="sr-only">Week {week.week}, day by day</caption>
      <thead>
        <tr className="border-b-2 border-infield-navy">
          <th scope="col" className="py-1 pr-1 font-bold">
            Day
          </th>
          <th scope="col" className="py-1 pr-1 font-bold">
            Session
          </th>
          <th scope="col" className="py-1 font-bold">
            Done
          </th>
        </tr>
      </thead>
      <tbody>
        {week.days.map((day) => (
          <tr key={day.day} className="border-b-2 border-chalk align-top">
            <th scope="row" className="py-1 pr-1 font-display text-[1.25rem] leading-[1.2] font-bold">
              {DAY_NAMES[day.day]}
            </th>
            <td className="py-1 pr-1">{day.session ? <a href={`#day-${day.day}`}>{day.session.title}</a> : "Rest day"}</td>
            <td className="py-1">{day.session ? (done.has(sessionKey(week.week, day.day)) ? "Done" : "Not yet") : ""}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function DayDetail({ week, day, session, athleteId, blockStart, done }: Props & { week: PlanWeek; day: number; session: Session }) {
  const dayName = DAY_NAMES[day as 0] as string;
  return (
    <section id={`day-${day}`} data-testid="plan-day" className={SECTION} aria-labelledby={`day-${day}-heading`}>
      <h3 id={`day-${day}-heading`} className="text-[1.75rem]">
        {dayName}: {session.title}
      </h3>
      {session.blocks.map((block, index) => (
        <div key={`${block.kind}-${index}`} className="mt-2">
          <h4 className="font-display text-[1.25rem] font-bold">{block.heading}</h4>
          <ul className="mt-0.5 space-y-1.5">
            {block.items.map((item) => (
              <Item key={item.name} item={item} />
            ))}
          </ul>
        </div>
      ))}
      <div className="mt-2">
        <SessionDone athleteId={athleteId} blockStart={blockStart} week={week.week} day={day} dayName={dayName} isDone={done.has(sessionKey(week.week, day))} />
      </div>
    </section>
  );
}

function Item({ item }: { item: PlanItem }) {
  return (
    <li data-testid="plan-item" className="border-l-2 border-chalk pl-1.5">
      <p className="font-bold">{item.name}</p>
      <p className="tabular-nums">
        {item.dose}
        {item.rest && item.rest !== "—" ? `. Rest ${item.rest.charAt(0).toLowerCase()}${item.rest.slice(1)}.` : null}
      </p>
      {item.cue ? <p className="text-[0.9375rem]">Cue: {item.cue}</p> : null}
    </li>
  );
}

function HowItWorks({ plan }: { plan: BuiltPlan }) {
  return (
    <section className={SECTION} aria-labelledby="how-heading">
      <h2 id="how-heading" className="text-[1.75rem]">
        How this plan works
      </h2>
      <ul className="mt-1 list-disc space-y-0.5 pl-3">
        {plan.tierRules.map((rule) => (
          <li key={rule}>{rule}</li>
        ))}
        <li>{plan.progression}</li>
        <li data-testid="hard-day-limit">
          No more than {plan.hardDayLimit} hard days a week
          {plan.teamSessionsPerWeek > 0 ? `, counting ${teamSessionsText(plan.teamSessionsPerWeek)}` : ""}. Training replaces some
          practice time rather than piling on top of a full sport schedule.
        </li>
      </ul>
      {/* When the team schedule is full, the message above the week already says why everything is left out. */}
      {plan.leftOut.length > 0 && !plan.teamScheduleFull ? (
        <ul className="mt-1 space-y-0.5">
          {plan.leftOut.map((line) => (
            <li key={line}>{line}</li>
          ))}
        </ul>
      ) : null}
    </section>
  );
}
