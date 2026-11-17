import type { Metadata } from "next";
import { signOut } from "@/lib/auth/actions";
import { requireViewer } from "@/lib/auth/viewer";

export const metadata: Metadata = { title: "Account" };

export default async function AccountPage() {
  const viewer = await requireViewer("/account");

  return (
    <div className="max-w-80">
      <h1 className="text-[2.75rem]">Account</h1>
      <p className="mt-2">
        Signed in as <strong>{viewer.email}</strong>
        {viewer.role === "athlete" ? " (athlete login)." : " (parent account)."}
      </p>
      <form action={signOut} className="mt-3">
        <button type="submit" className="button button-quiet w-full sm:w-auto">
          Sign out
        </button>
      </form>
    </div>
  );
}
