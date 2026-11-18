import Link from "next/link";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";

export default function NotFound() {
  return (
    <>
      <SiteHeader />
      <main className="mx-auto max-w-120 px-2 py-5">
        <div className="max-w-80">
          <h1 className="text-[2.75rem]">That page isn&apos;t here</h1>
          <p className="mt-2 mb-3">Check the address, or sign in to the account the page belongs to.</p>
          <Link href="/" className="button w-full sm:w-auto">
            Go to the home page
          </Link>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
