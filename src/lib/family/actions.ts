"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { CONSENT_VERSION } from "@/config/consent";
import { athleteFormSchema, canHaveLogin } from "@/lib/athletes/rules";
import { ATHLETE_ROLE, findAthlete, requireGuardian } from "@/lib/auth/viewer";
import { activeConsentMethod } from "@/lib/consent/methods";
import { sendEmail } from "@/lib/email/send";
import { athleteInviteEmail } from "@/lib/email/templates";
import { siteUrl } from "@/lib/env";
import { hasUnusedConsent } from "@/lib/family/queries";
import { failed, fieldErrors, formValues, type FormState } from "@/lib/forms";
import { createAdminSupabase } from "@/lib/supabase/admin";
import { createServerSupabase } from "@/lib/supabase/server";

/**
 * What a parent can do for their family: give consent, add an athlete, invite an athlete
 * to their own login, and remove an athlete. Every action first checks the caller is a
 * guardian, and every read and write goes through row-level security.
 */

const ATHLETE_FIELDS = ["firstName", "gradYear", "birthYear", "heightIn", "weightLb", "gender"] as const;
const SAVE_FAILED = "That didn't save. Wait a minute and try again.";

/** The consent step. Writes a consent record BEFORE any athlete data exists. */
export async function recordConsent(_previous: FormState, form: FormData): Promise<FormState> {
  const viewer = await requireGuardian("/consent");
  const method = activeConsentMethod();

  const problem = await method.verify(form);
  if (problem) return failed(problem);

  const supabase = await createServerSupabase();
  const { error } = await supabase.from("consents").insert({
    family_id: viewer.familyId,
    guardian_id: viewer.guardianId,
    consent_version: CONSENT_VERSION,
    method: method.id,
  });
  if (error) {
    console.error(`[consent] could not save: ${error.message}`);
    return failed(SAVE_FAILED);
  }
  redirect("/athletes/new");
}

export async function addAthlete(_previous: FormState, form: FormData): Promise<FormState> {
  const viewer = await requireGuardian("/athletes/new");
  const values = formValues(form, ATHLETE_FIELDS);
  const parsed = athleteFormSchema(new Date()).safeParse(values);
  if (!parsed.success) return { message: null, fields: fieldErrors(parsed.error), values };

  const supabase = await createServerSupabase();
  if (!(await hasUnusedConsent(supabase, viewer.familyId))) redirect("/consent");

  const { data, error } = await supabase
    .from("athletes")
    .insert({
      family_id: viewer.familyId,
      first_name: parsed.data.firstName,
      grad_year: parsed.data.gradYear,
      birth_year: parsed.data.birthYear,
      height_in: parsed.data.heightIn,
      weight_lb: parsed.data.weightLb,
      gender: parsed.data.gender,
    })
    .select("id")
    .single();

  if (error) {
    // The database refuses an athlete with no consent record, whatever the app thinks.
    if (error.message.includes("consent_required")) redirect("/consent");
    console.error(`[athletes] could not add: ${error.message}`);
    return failed(SAVE_FAILED, values);
  }
  redirect(`/athletes/${data.id}`);
}

const inviteSchema = z.object({
  email: z.string().trim().toLowerCase().pipe(z.email("Type your athlete's email address, like name@example.com.")),
});

/**
 * Invite an athlete aged 13 or older to their own login, tied to that one athlete.
 * The login is created by the server, marked as an athlete login, linked to the athlete,
 * and only then is the email sent. If any step fails, the earlier steps are undone.
 */
export async function inviteAthlete(athleteId: string, _previous: FormState, form: FormData): Promise<FormState> {
  const viewer = await requireGuardian(`/athletes/${athleteId}/invite`);
  const values = formValues(form, ["email"]);
  const parsed = inviteSchema.safeParse(values);
  if (!parsed.success) return { message: null, fields: fieldErrors(parsed.error), values };
  const { email } = parsed.data;

  // Row-level security: this only returns an athlete in the caller's own family.
  const athlete = await findAthlete(athleteId);
  if (!athlete || athlete.family_id !== viewer.familyId) return failed("That athlete isn't in your family.");
  if (athlete.login_user_id) return failed(`${athlete.first_name} already has a login.`);
  if (!canHaveLogin(athlete.birth_year, new Date())) {
    return failed("Athletes under 13 can't have their own login. You can enter their numbers for them.");
  }
  if (email === viewer.email.toLowerCase()) {
    return failed(`Use ${athlete.first_name}'s own email address, not yours.`, values);
  }

  const admin = createAdminSupabase();
  const link = await admin.auth.admin.generateLink({ type: "invite", email });
  if (link.error || !link.data.user) {
    if (link.error?.code === "email_exists") {
      return failed(`That email already has an account here. Use a different email for ${athlete.first_name}.`, values);
    }
    console.error(`[invite] could not create the login: ${link.error?.message}`);
    return failed(SAVE_FAILED, values);
  }
  const invitedUserId = link.data.user.id;
  const undo = async () => {
    const removed = await admin.auth.admin.deleteUser(invitedUserId);
    if (removed.error) console.error(`[invite] could not undo login ${invitedUserId}: ${removed.error.message}`);
  };

  const marked = await admin.auth.admin.updateUserById(invitedUserId, { app_metadata: { role: ATHLETE_ROLE } });
  if (marked.error) {
    console.error(`[invite] could not mark the login as an athlete login: ${marked.error.message}`);
    await undo();
    return failed(SAVE_FAILED, values);
  }

  const linked = await admin
    .from("athletes")
    .update({ login_user_id: invitedUserId })
    .eq("id", athlete.id)
    .eq("family_id", viewer.familyId)
    .is("login_user_id", null)
    .select("id");
  if (linked.error || linked.data.length === 0) {
    console.error(`[invite] could not link the login: ${linked.error?.message ?? "no athlete row matched"}`);
    await undo();
    return failed(
      linked.error?.message.includes("login_under_13")
        ? "Athletes under 13 can't have their own login."
        : SAVE_FAILED,
      values,
    );
  }

  const confirmUrl = new URL("/auth/confirm", siteUrl());
  confirmUrl.searchParams.set("token_hash", link.data.properties.hashed_token);
  confirmUrl.searchParams.set("type", "invite");
  const sent = await sendEmail({
    to: email,
    ...athleteInviteEmail({ athleteFirstName: athlete.first_name, link: confirmUrl.toString() }),
  });
  if (!sent.ok) {
    // Deleting the login also clears athletes.login_user_id (on delete set null).
    await undo();
    return failed("The invite email couldn't be sent, so no login was created. Try again in a few minutes.", values);
  }

  redirect(`/athletes/${athlete.id}?invited=1`);
}

/** Take away an athlete's login. The athlete's numbers stay. */
export async function removeAthleteLogin(athleteId: string): Promise<void> {
  const viewer = await requireGuardian(`/athletes/${athleteId}`);
  const athlete = await findAthlete(athleteId);
  if (!athlete || athlete.family_id !== viewer.familyId || !athlete.login_user_id) redirect(`/athletes/${athleteId}`);

  const { error } = await createAdminSupabase().auth.admin.deleteUser(athlete.login_user_id);
  if (error) throw new Error(`Could not remove the login: ${error.message}`);
  redirect(`/athletes/${athleteId}?login_removed=1`);
}

/** Remove an athlete and everything saved about them: sports, numbers, consent record and login. */
export async function removeAthlete(athleteId: string): Promise<void> {
  const viewer = await requireGuardian(`/athletes/${athleteId}`);
  const athlete = await findAthlete(athleteId);
  if (!athlete || athlete.family_id !== viewer.familyId) redirect("/athletes");

  if (athlete.login_user_id) {
    const { error } = await createAdminSupabase().auth.admin.deleteUser(athlete.login_user_id);
    if (error) throw new Error(`Could not remove the athlete's login: ${error.message}`);
  }

  const supabase = await createServerSupabase();
  const { error } = await supabase.from("athletes").delete().eq("id", athlete.id);
  if (error) throw new Error(`Could not remove the athlete: ${error.message}`);
  redirect("/athletes?removed=1");
}
