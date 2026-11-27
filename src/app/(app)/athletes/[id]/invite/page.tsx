import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { InviteForm } from "@/components/family/FamilyForms";
import { canHaveLogin } from "@/lib/athletes/rules";
import { findAthlete, requireGuardian } from "@/lib/auth/viewer";

export const metadata: Metadata = { title: "Invite your athlete" };

type Props = { params: Promise<{ id: string }> };

export default async function InviteAthletePage({ params }: Props) {
  const { id } = await params;
  await requireGuardian(`/athletes/${id}/invite`);
  const athlete = await findAthlete(id);
  if (!athlete) notFound();
  if (athlete.login_user_id || !canHaveLogin(athlete.birth_year, new Date())) redirect(`/athletes/${id}`);

  return (
    <div className="max-w-60">
      <h1 className="text-[2.75rem]">Invite {athlete.first_name} to their own login</h1>
      <p className="mt-2">
        {athlete.first_name} will get an email with a link to choose a password. Their login shows only their own
        report, and they can add their own numbers. They can&apos;t see billing or other athletes.
      </p>
      <p className="mt-2 mb-4">You can take the login away again at any time from {athlete.first_name}&apos;s page.</p>
      <InviteForm athleteId={athlete.id} athleteFirstName={athlete.first_name} />
      <p className="mt-4">
        <Link href={`/athletes/${athlete.id}`}>Back to {athlete.first_name}&apos;s report</Link>
      </p>
    </div>
  );
}
