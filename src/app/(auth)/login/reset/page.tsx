import type { Metadata } from "next";
import Link from "next/link";
import { PasswordResetForm } from "@/components/auth/AuthForms";

export const metadata: Metadata = { title: "Reset your password" };

type Props = { searchParams: Promise<{ sent?: string }> };

export default async function PasswordResetPage({ searchParams }: Props) {
  const { sent } = await searchParams;

  if (sent) {
    return (
      <>
        <h1 className="text-[2.75rem]">Check your email</h1>
        <p className="mt-2">
          If that address has an account, a reset link is on its way. Open it on this device to choose a new password.
        </p>
        <p className="mt-2">
          <Link href="/login">Back to sign in</Link>
        </p>
      </>
    );
  }

  return (
    <>
      <h1 className="text-[2.75rem]">Reset your password</h1>
      <p className="mt-2 mb-4">Type the email you signed up with and we&apos;ll send you a link to choose a new password.</p>
      <PasswordResetForm />
      <p className="mt-4">
        <Link href="/login">Back to sign in</Link>
      </p>
    </>
  );
}
