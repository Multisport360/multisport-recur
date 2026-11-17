import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = { title: "Check your email" };

export default function CheckEmailPage() {
  return (
    <>
      <h1 className="text-[2.75rem]">Check your email</h1>
      <p className="mt-2">
        We sent you a link. Open it on this device to confirm your email, then add your athlete.
      </p>
      <p className="mt-2">
        Nothing after a few minutes? Look in your spam folder. If you already have an account,{" "}
        <Link href="/login">sign in</Link> instead.
      </p>
    </>
  );
}
