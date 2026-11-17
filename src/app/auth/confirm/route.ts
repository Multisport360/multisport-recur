import type { EmailOtpType } from "@supabase/supabase-js";
import { NextResponse, type NextRequest } from "next/server";
import { safeNextPath } from "@/lib/safe-redirect";
import { createServerSupabase } from "@/lib/supabase/server";

/**
 * Where links in emails land: confirm a new account, accept an athlete invite, reset a password.
 * It swaps the one-time token in the link for a signed-in session, then moves on.
 *
 * Two link styles are understood:
 *   ?token_hash=...&type=...   (our invite emails, and Supabase templates set up as in the README)
 *   ?code=...                  (Supabase's default templates)
 */

const OTP_TYPES: readonly EmailOtpType[] = ["signup", "invite", "magiclink", "recovery", "email_change", "email"];
/** Links of these types are from someone who has no password yet, or has forgotten it. */
const NEEDS_PASSWORD: readonly EmailOtpType[] = ["invite", "recovery"];
const SET_PASSWORD_PATH = "/auth/set-password";

function isOtpType(value: string | null): value is EmailOtpType {
  return OTP_TYPES.includes(value as EmailOtpType);
}

export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams;
  const tokenHash = params.get("token_hash");
  const type = params.get("type");
  const code = params.get("code");
  const next = safeNextPath(params.get("next"), "/athletes");
  const goTo = (path: string) => NextResponse.redirect(new URL(path, request.url));

  const supabase = await createServerSupabase();

  if (tokenHash && isOtpType(type)) {
    const { error } = await supabase.auth.verifyOtp({ type, token_hash: tokenHash });
    if (!error) return goTo(NEEDS_PASSWORD.includes(type) ? SET_PASSWORD_PATH : next);
    console.error(`[auth] email link (${type}) was rejected: ${error.message}`);
  } else if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) return goTo(next);
    console.error(`[auth] email link code was rejected: ${error.message}`);
  }

  return goTo("/login?problem=link");
}
