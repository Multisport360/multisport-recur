"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, type ReactNode } from "react";
import { useDemo } from "./DemoProvider";

/**
 * The demo's phone app: a thin "Demo, sample data" bar, the screen, and a bottom tab bar.
 *
 * On a laptop (a wide screen with a mouse) the page instead shows a phone-sized frame with the demo
 * inside it. The frame loads the same /demo pages at 390px wide, so every screen lays out exactly as
 * it does on a phone. Which one shows is decided by CSS (.demo-app / .demo-stage in globals.css).
 */

const TABS = [
  { href: "/demo", label: "Report", matches: (path: string) => path === "/demo" },
  { href: "/demo/stats", label: "Add stats", matches: (path: string) => path.startsWith("/demo/stats") },
  { href: "/demo/plan", label: "Plan", matches: (path: string) => path.startsWith("/demo/plan") },
  { href: "/demo/account", label: "Account", matches: (path: string) => path.startsWith("/demo/account") || path.startsWith("/demo/subscribe") },
] as const;

export function DemoShell({ children }: { children: ReactNode }) {
  const pathname = usePathname() ?? "/demo";
  const { restart } = useDemo();
  const screen = useRef<HTMLElement>(null);

  // A new tab starts at the top, like a phone app.
  useEffect(() => {
    screen.current?.scrollTo({ top: 0 });
  }, [pathname]);

  return (
    <>
      <div className="demo-app flex h-dvh flex-col">
        <div data-testid="demo-bar" className="flex min-h-6 shrink-0 items-center justify-between gap-2 border-b-2 border-infield-navy bg-chalk px-2 pt-[env(safe-area-inset-top)]">
          <p className="font-bold">Demo, sample data</p>
          <button type="button" onClick={restart} className="min-h-6 text-track-blue underline underline-offset-4">
            Restart demo
          </button>
        </div>
        <main ref={screen} className="min-h-0 flex-1 overflow-y-auto px-2 py-3">
          {children}
        </main>
        <nav aria-label="Demo screens" className="shrink-0 border-t-2 border-infield-navy bg-lane-white pb-[env(safe-area-inset-bottom)]">
          <ul className="grid grid-cols-4">
            {TABS.map((tab) => {
              const isCurrent = tab.matches(pathname);
              return (
                <li key={tab.href}>
                  <Link
                    href={tab.href}
                    aria-current={isCurrent ? "page" : undefined}
                    className={`flex min-h-7 items-center justify-center border-t-4 px-0.5 text-center leading-tight no-underline ${
                      isCurrent ? "border-track-blue font-bold text-infield-navy" : "border-transparent text-track-blue"
                    }`}
                  >
                    {tab.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
      </div>

      <div data-testid="demo-stage" className="demo-stage min-h-dvh items-center justify-center gap-6 px-4 py-4">
        <div data-testid="demo-phone-frame" className="h-[848px] w-[394px] shrink-0 overflow-hidden rounded-[2.5rem] border-2 border-infield-navy bg-lane-white">
          {/* Loaded only when the frame shows: lazy iframes inside display:none never load. */}
          <iframe src={pathname} title="Multi-Sport Recur demo" loading="lazy" className="block h-full w-full rounded-[2.5rem] border-0" />
        </div>
        <div className="max-w-60">
          <p className="font-display text-[2.25rem] leading-[1.1] font-bold">Multi-Sport Recur</p>
          <p className="mt-1 text-[1.25rem]">Tap through it like the phone app.</p>
        </div>
      </div>
    </>
  );
}

/** At the top of the demo's plan, above the draft banner. */
export function DemoAthleteBanner() {
  return (
    <p data-testid="demo-athlete-banner" role="note" className="mb-1 border-2 border-infield-navy bg-chalk px-2 py-1.5 font-bold">
      Demo, sample athlete
    </p>
  );
}
