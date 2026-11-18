import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { AthleteForm } from "@/components/family/FamilyForms";
import { birthYearOptions, gradYearOptions } from "@/lib/athletes/rules";
import { requireGuardian } from "@/lib/auth/viewer";
import { hasUnusedConsent } from "@/lib/family/queries";
import { gradeLabel } from "@/lib/grade";
import { createServerSupabase } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "Add an athlete" };

export default async function NewAthletePage() {
  const viewer = await requireGuardian("/athletes/new");
  // No consent record yet means no athlete form: the consent step always comes first.
  if (!(await hasUnusedConsent(await createServerSupabase(), viewer.familyId))) redirect("/consent");

  const today = new Date();
  const gradYears = gradYearOptions(today).map(({ gradYear, grade }) => ({
    value: String(gradYear),
    label: `${gradeLabel(grade)} grade (class of ${gradYear})`,
  }));
  const birthYears = birthYearOptions(today).map((year) => ({ value: String(year), label: String(year) }));

  return (
    <div className="max-w-60">
      <h1 className="text-[2.75rem]">Add an athlete</h1>
      <p className="mt-2 mb-4">Thanks for your consent. Next you&apos;ll pick sports and enter numbers.</p>
      <AthleteForm gradYears={gradYears} birthYears={birthYears} />
    </div>
  );
}
