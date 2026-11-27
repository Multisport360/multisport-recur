"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { timeZoneOrDefault } from "@/lib/dates";
import { siteUrl } from "@/lib/env";
import { failed, fieldErrors, formValues, type FormState } from "@/lib/forms";
import { safeNextPath } from "@/lib/safe-redirect";
import { createServerSupabase } from "@/lib/supabase/server";

/**
 * Sign-up, sign-in, password reset and sign-out. Parents create accounts; athletes
 * never sign up here. An athlete login only ever comes from a parent's invite.
 */

const PASSWORD_MIN = 8;
const PASSWORD_MAX = 72;
const HOME_WHEN_SIGNED_IN = "/athletes";

const email = z.string().trim().toLowerCase().pipe(z.email("Type an email address, like name@example.com."));
const newPassword = z
  .string()
  .min(PASSWORD_MIN, `Use at least ${PASSWORD_MIN} characters for the password.`)
  .max(PASSWORD_MAX, `Keep the password to ${PASSWORD_MAX} characters or fewer.`);

const signUpSchema = z.object({
  email,
  password: newPassword,
  isParent: z.literal("on", "Tick the box to confirm you're a parent or legal guardian aged 18 or older."),
  // From the browser. Never shown, so a missing or unknown value quietly becomes America/New_York.
  timezone: z.string().optional().transform(timeZoneOrDefault),
});

const signInSchema = z.object({
  email,
  password: z.string().min(1, "Type your password."),
});

const TRY_AGAIN_LATER = "That didn't go through. Wait a minute and try again.";

/** Turn a Supabase auth error code into words that say what to do. */
function authProblem(code: string | undefined): string {
  switch (code) {
    case "invalid_credentials":
      return "That email and password don't match. Check both and try again.";
    case "email_not_confirmed":
      return "Confirm your email first: open the link we sent you, then sign in.";
    case "weak_password":
      return "That password is too easy to guess. Use a longer one with a mix of letters and numbers.";
    case "same_password":
      return "That is your current password. Choose a different one.";
    case "over_email_send_rate_limit":
    case "over_request_rate_limit":
      return "Too many tries in a short time. Wait a few minutes and try again.";
    case "signup_disabled":
      return "New accounts are switched off right now.";
    default:
      return TRY_AGAIN_LATER;
  }
}

export async function signUp(_previous: FormState, form: FormData): Promise<FormState> {
  const values = formValues(form, ["email"]);
  const parsed = signUpSchema.safeParse(Object.fromEntries(form));
  if (!parsed.success) return { message: null, fields: fieldErrors(parsed.error), values };

  const supabase = await createServerSupabase();
  const { data, error } = await supabase.auth.signUp({
    email: parsed.data.email,
    password: parsed.data.password,
    options: {
      emailRedirectTo: `${siteUrl()}/auth/confirm?next=${encodeURIComponent(HOME_WHEN_SIGNED_IN)}`,
      // ensure_family() copies this onto the family when the parent first signs in.
      data: { timezone: parsed.data.timezone },
    },
  });
  if (error) {
    console.error(`[auth] sign-up failed: ${error.code ?? "unknown"} ${error.message}`);
    return failed(authProblem(error.code), values);
  }

  // With email confirmation switched off in Supabase, the account is ready straight away.
  if (data.session) redirect(HOME_WHEN_SIGNED_IN);
  redirect("/signup/check-email");
}

export async function signIn(_previous: FormState, form: FormData): Promise<FormState> {
  const values = formValues(form, ["email", "next"]);
  const parsed = signInSchema.safeParse(Object.fromEntries(form));
  if (!parsed.success) return { message: null, fields: fieldErrors(parsed.error), values };

  const supabase = await createServerSupabase();
  const { error } = await supabase.auth.signInWithPassword(parsed.data);
  if (error) {
    if (error.code !== "invalid_credentials") {
      console.error(`[auth] sign-in failed: ${error.code ?? "unknown"} ${error.message}`);
    }
    return failed(authProblem(error.code), values);
  }

  redirect(safeNextPath(values.next, HOME_WHEN_SIGNED_IN));
}

export async function requestPasswordReset(_previous: FormState, form: FormData): Promise<FormState> {
  const values = formValues(form, ["email"]);
  const parsed = z.object({ email }).safeParse(Object.fromEntries(form));
  if (!parsed.success) return { message: null, fields: fieldErrors(parsed.error), values };

  const supabase = await createServerSupabase();
  const { error } = await supabase.auth.resetPasswordForEmail(parsed.data.email, {
    redirectTo: `${siteUrl()}/auth/confirm?next=${encodeURIComponent("/auth/set-password")}`,
  });
  if (error) {
    console.error(`[auth] password reset failed: ${error.code ?? "unknown"} ${error.message}`);
    if (error.code === "over_email_send_rate_limit") return failed(authProblem(error.code), values);
  }

  // The same answer whether or not the address has an account, so nobody can probe for accounts.
  redirect("/login/reset?sent=1");
}

export async function setPassword(_previous: FormState, form: FormData): Promise<FormState> {
  const parsed = z.object({ password: newPassword }).safeParse(Object.fromEntries(form));
  if (!parsed.success) return { message: null, fields: fieldErrors(parsed.error), values: {} };

  const supabase = await createServerSupabase();
  const { data: session } = await supabase.auth.getUser();
  if (!session.user) redirect("/login?problem=link");

  const { error } = await supabase.auth.updateUser({ password: parsed.data.password });
  if (error) {
    console.error(`[auth] set password failed: ${error.code ?? "unknown"} ${error.message}`);
    return failed(authProblem(error.code));
  }
  redirect(HOME_WHEN_SIGNED_IN);
}

export async function signOut(): Promise<void> {
  const supabase = await createServerSupabase();
  const { error } = await supabase.auth.signOut();
  if (error) console.error(`[auth] sign-out failed: ${error.message}`);
  redirect("/");
}
