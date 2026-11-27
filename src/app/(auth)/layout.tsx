import type { ReactNode } from "react";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";

/** Sign-up and sign-in pages: the site name, then one narrow column. */
export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <SiteHeader />
      <main className="mx-auto max-w-120 px-2 py-5">
        <div className="max-w-60">{children}</div>
      </main>
      <SiteFooter />
    </>
  );
}
