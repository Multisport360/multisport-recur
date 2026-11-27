"use client";

import { useOptimistic, useState, useTransition } from "react";
import type { SaveSessionDone } from "@/lib/plan/types";

type Props = {
  athleteId: string;
  blockStart: string;
  week: number;
  day: number;
  /** "Monday", for the label read out by screen readers. */
  dayName: string;
  isDone: boolean;
  save: SaveSessionDone;
};

/** "Mark this session done". Saves as soon as it is ticked or unticked; says so if it didn't save. */
export function SessionDone({ athleteId, blockStart, week, day, dayName, isDone, save }: Props) {
  const [optimisticDone, setOptimisticDone] = useOptimistic(isDone);
  const [problem, setProblem] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const id = `done-${week}-${day}`;

  function toggle(done: boolean) {
    setProblem(null);
    startTransition(async () => {
      setOptimisticDone(done);
      const result = await save(athleteId, blockStart, week, day, done);
      if (!result.ok) setProblem(result.message);
    });
  }

  return (
    <div data-testid="session-done">
      <label htmlFor={id} className="flex min-h-6 cursor-pointer items-center gap-1.5 py-0.5 font-bold">
        <input
          id={id}
          type="checkbox"
          checked={optimisticDone}
          onChange={(event) => toggle(event.target.checked)}
          aria-describedby={problem ? `${id}-problem` : undefined}
          className="size-3 shrink-0 accent-track-blue"
        />
        <span>
          Mark this session done<span className="sr-only">: week {week}, {dayName}</span>
        </span>
        {isPending ? <span className="font-normal">Saving</span> : null}
      </label>
      {problem ? (
        <p id={`${id}-problem`} role="alert" className="mt-0.5 border-l-4 border-infield-navy pl-1 font-bold">
          {problem}
        </p>
      ) : null}
    </div>
  );
}
