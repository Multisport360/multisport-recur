import type { Metadata } from "next";
import Link from "next/link";
import { SignUpForm } from "@/components/auth/AuthForms";

export const metadata: Metadata = { title: "Create a parent account" };

export default function SignUpPage() {
  return (
    <>
      <h1 className="text-[2.75rem]">Create a parent account</h1>
      <p className="mt-2 mb-4">
        Accounts belong to parents and guardians. Once you&apos;re in, you add your athlete and their numbers. The gap
        report is free.
      </p>
      <SignUpForm />
      <p className="mt-4">
        Already have an account? <Link href="/login">Sign in</Link>
      </p>
      <p className="mt-2 text-[0.9375rem]">
        Athletes don&apos;t sign up here. A parent can invite an athlete who is 13 or older to their own login.
      </p>
    </>
  );
}
