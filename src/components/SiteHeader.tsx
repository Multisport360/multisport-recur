import Link from "next/link";
import type { ReactNode } from "react";
import { SITE } from "@/config/site";

/** Site name on the left, a few links on the right. `children` are the links. */
export function SiteHeader({ children, homeHref = "/" }: { children?: ReactNode; homeHref?: string }) {
  return (
    <header className="border-b-2 border-chalk">
      <div className="mx-auto flex max-w-120 flex-wrap items-center justify-between gap-x-3 px-2 py-1">
        <Link href={homeHref} className="inline-flex min-h-[2.75rem] items-center font-display text-[1.5rem] leading-none font-extrabold text-infield-navy no-underline">
          {SITE.name}
        </Link>
        {children ? (
          <nav aria-label="Main" className="flex flex-wrap items-center gap-x-3 [&_a]:inline-flex [&_a]:min-h-[2.75rem] [&_a]:items-center">
            {children}
          </nav>
        ) : null}
      </div>
    </header>
  );
}
