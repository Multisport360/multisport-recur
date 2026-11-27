"use client";

import { useRouter } from "next/navigation";
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import type { FormAction } from "@/lib/forms";
import { initialDemoState, saveDemoStat, toggleDemoSession, type DemoData, type DemoState } from "@/lib/demo/model";
import type { SaveSessionDone } from "@/lib/plan/types";

/**
 * Holds the demo in this browser tab's memory. It lives in the /demo layout, so it survives moving
 * between tabs, and is gone on a reload or "Restart demo". Nothing is sent anywhere.
 */

type DemoContextValue = {
  data: DemoData;
  state: DemoState;
  /** When this demo session started. Sample dates count back from here. */
  today: Date;
  /** The form action for "Save this number" on one of Jordan's sports. */
  saveStat: (sportId: string) => FormAction;
  saveSessionDone: SaveSessionDone;
  restart: () => void;
};

const DemoContext = createContext<DemoContextValue | null>(null);

type Props = {
  data: DemoData;
  children: ReactNode;
  /** Tests only: start from a given moment and state instead of now and the sample family. */
  start?: { today: Date; state: DemoState };
};

export function DemoProvider({ data, children, start }: Props) {
  const router = useRouter();
  const [today, setToday] = useState(() => start?.today ?? new Date());
  const [state, setState] = useState(() => start?.state ?? initialDemoState(today));
  // Form actions read the latest state, not the state from when the form was drawn.
  const latest = useRef(state);
  useEffect(() => {
    latest.current = state;
  }, [state]);

  const saveStat = useCallback(
    (sportId: string): FormAction =>
      (_previous, form) => {
        const result = saveDemoStat(data, latest.current, sportId, form, today);
        if (result.savedMetric) {
          latest.current = result.state;
          setState(result.state);
          router.push(`/demo?saved=${encodeURIComponent(result.savedMetric)}`);
        }
        return result.form;
      },
    [data, router, today],
  );

  const saveSessionDone = useCallback<SaveSessionDone>(async (_athleteId, _blockStart, week, day, done) => {
    setState((current) => toggleDemoSession(current, week, day, done));
    return { ok: true };
  }, []);

  const restart = useCallback(() => {
    const now = new Date();
    setToday(now);
    setState(initialDemoState(now));
    router.push("/demo");
  }, [router]);

  const value = useMemo(() => ({ data, state, today, saveStat, saveSessionDone, restart }), [data, state, today, saveStat, saveSessionDone, restart]);
  return <DemoContext.Provider value={value}>{children}</DemoContext.Provider>;
}

export function useDemo(): DemoContextValue {
  const value = useContext(DemoContext);
  if (!value) throw new Error("useDemo must be used inside the /demo layout.");
  return value;
}
