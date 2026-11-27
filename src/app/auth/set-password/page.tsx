import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { SetPasswordForm } from "@/components/auth/AuthForms";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { createServerSupabase } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "Choose a password" };

export default async function SetPasswordPage() {
  const supabase = await createServerSupabase();
  const { data } = await supabase.auth.getUser();
  if (!data.user) redirect("/login?problem=link");

  return (
    <>
      <SiteHeader />
      <main className="mx-auto max-w-120 px-2 py-5">
        <div className="max-w-60">
          <h1 className="text-[2.75rem]">Choose a password</h1>
          <p className="mt-2 mb-4">You&apos;ll use it with {data.user.email} to sign in from now on.</p>
          <SetPasswordForm />
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
