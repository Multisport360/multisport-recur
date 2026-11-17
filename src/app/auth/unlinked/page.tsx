import type { Metadata } from "next";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { signOut } from "@/lib/auth/actions";

export const metadata: Metadata = { title: "This login isn't linked to an athlete" };

/** Shown to an athlete login whose athlete profile was removed by the parent. */
export default function UnlinkedAthletePage() {
  return (
    <>
      <SiteHeader />
      <main className="mx-auto max-w-120 px-2 py-5">
        <div className="max-w-60">
          <h1 className="text-[2.75rem]">This login isn&apos;t linked to an athlete</h1>
          <p className="mt-2 mb-4">
            Your parent removed the athlete profile this login belonged to. Ask them to invite you again from their
            account.
          </p>
          <form action={signOut}>
            <button type="submit" className="button w-full sm:w-auto">
              Sign out
            </button>
          </form>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
