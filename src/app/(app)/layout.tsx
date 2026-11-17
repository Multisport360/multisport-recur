import Link from "next/link";
import type { ReactNode } from "react";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { requireViewer } from "@/lib/auth/viewer";

/** The signed-in part of the site. Parents see their family; an athlete login sees only itself. */
export default async function AppLayout({ children }: { children: ReactNode }) {
  const viewer = await requireViewer();
  const home = viewer.role === "athlete" ? `/athletes/${viewer.athleteId}` : "/athletes";

  return (
    <>
      <SiteHeader homeHref={home}>
        <Link href={home}>{viewer.role === "athlete" ? "My report" : "My athletes"}</Link>
        <Link href="/plan">Training plan</Link>
        <Link href="/account">Account</Link>
      </SiteHeader>
      <main className="mx-auto max-w-120 px-2 py-4">{children}</main>
      <SiteFooter />
    </>
  );
}
