import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { ConsentForm } from "@/components/family/FamilyForms";
import { requireGuardian } from "@/lib/auth/viewer";
import { activeConsentMethod } from "@/lib/consent/methods";
import { hasUnusedConsent } from "@/lib/family/queries";
import { createServerSupabase } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "Before you add your athlete" };

/**
 * The consent step. A parent reads what will be saved and agrees BEFORE any athlete
 * data is typed or stored. One consent record covers one athlete.
 *
 * The wording here is a draft. It needs to be checked against the Legal & Compliance Plan.
 */
export default async function ConsentPage() {
  const viewer = await requireGuardian("/consent");
  if (await hasUnusedConsent(await createServerSupabase(), viewer.familyId)) redirect("/athletes/new");

  return (
    <div className="max-w-80">
      <h1 className="text-[2.75rem]">Before you add your athlete</h1>
      <p className="mt-2">Your athlete is a minor, so we need your OK as their parent or legal guardian first.</p>

      <h2 className="mt-4 text-[1.75rem]">What we save</h2>
      <ul className="mt-1 list-disc space-y-0.5 pl-3">
        <li>First name, grade, and birth year (the year only)</li>
        <li>Height and weight, if you choose to add them</li>
        <li>The sports they play and the numbers you enter, like a 40-yard dash time</li>
      </ul>

      <h2 className="mt-4 text-[1.75rem]">What we never ask for</h2>
      <ul className="mt-1 list-disc space-y-0.5 pl-3">
        <li>A full birth date</li>
        <li>A home address or a school ID</li>
        <li>Photos</li>
      </ul>

      <h2 className="mt-4 text-[1.75rem]">Who can see it</h2>
      <ul className="mt-1 list-disc space-y-0.5 pl-3">
        <li>You. Nothing about your athlete is shown publicly.</li>
        <li>Your athlete, only if they are 13 or older and you invite them to their own login.</li>
        <li>Athletes under 13 never get their own login. You enter their numbers.</li>
      </ul>

      <h2 className="mt-4 text-[1.75rem]">Changing your mind</h2>
      <p className="mt-1 mb-4">
        You can remove your athlete, and everything saved about them, from their page at any time.
      </p>

      <ConsentForm methodId={activeConsentMethod().id} />
    </div>
  );
}
