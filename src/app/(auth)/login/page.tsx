import type { Metadata } from "next";
import Link from "next/link";
import { SignInForm } from "@/components/auth/AuthForms";
import { safeNextPath } from "@/lib/safe-redirect";

export const metadata: Metadata = { title: "Sign in" };

type Props = { searchParams: Promise<{ next?: string; problem?: string }> };

export default async function SignInPage({ searchParams }: Props) {
  const { next, problem } = await searchParams;

  return (
    <>
      <h1 className="text-[2.75rem]">Sign in</h1>
      {problem === "link" ? (
        <p role="alert" className="mt-2 border-l-4 border-infield-navy pl-2 font-bold">
          That link has expired or was already used. Sign in below, or ask for a new link.
        </p>
      ) : null}
      <div className="mt-4">
        <SignInForm next={safeNextPath(next, "/athletes")} />
      </div>
      <p className="mt-4">
        <Link href="/login/reset">Forgot your password?</Link>
      </p>
      <p className="mt-1">
        New here? <Link href="/signup">Create a parent account</Link>
      </p>
    </>
  );
}
