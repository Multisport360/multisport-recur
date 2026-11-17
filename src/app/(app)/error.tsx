"use client";

import { useEffect } from "react";

/** Shown when a signed-in page fails to load. Says what to do next. */
export default function AppError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="max-w-80">
      <h1 className="text-[2.75rem]">This page didn&apos;t load</h1>
      <p className="mt-2 mb-3">Something failed on our side while loading it. Your saved numbers are not affected.</p>
      <button type="button" className="button w-full sm:w-auto" onClick={reset}>
        Load the page again
      </button>
    </div>
  );
}
