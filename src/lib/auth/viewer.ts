import { redirect } from "next/navigation";
import { cache } from "react";
import type { AthleteRow } from "@/lib/supabase/database.types";
import { createServerSupabase } from "@/lib/supabase/server";

/**
 * Who is looking at the page.
 *  - guardian: a parent login. Sees their whole family.
 *  - athlete: a login a parent invited for one athlete aged 13 or older. Sees only that athlete.
 *  - unlinked_athlete: an athlete login whose athlete was removed. Sees nothing.
 */
export type GuardianViewer = { role: "guardian"; userId: string; email: string; familyId: string; guardianId: string };
export type AthleteViewer = { role: "athlete"; userId: string; email: string; familyId: string; athleteId: string };
export type UnlinkedAthleteViewer = { role: "unlinked_athlete"; userId: string; email: string };
export type Viewer = GuardianViewer | AthleteViewer | UnlinkedAthleteViewer;

/** Set by the server (never by the user) on logins created through a parent's invite. */
export const ATHLETE_ROLE = "athlete";

/** The signed-in viewer, or null when signed out. Looked up once per request. */
export const getViewer = cache(async (): Promise<Viewer | null> => {
  const supabase = await createServerSupabase();
  const { data, error } = await supabase.auth.getUser();
  if (error || !data.user) return null;

  const { user } = data;
  const base = { userId: user.id, email: user.email ?? "" };

  const athlete = await supabase.from("athletes").select("id, family_id").eq("login_user_id", user.id).maybeSingle();
  if (athlete.error) throw new Error(`Could not look up the athlete login: ${athlete.error.message}`);
  if (athlete.data) {
    return { role: "athlete", ...base, athleteId: athlete.data.id, familyId: athlete.data.family_id };
  }
  if (user.app_metadata?.role === ATHLETE_ROLE) {
    return { role: "unlinked_athlete", ...base };
  }

  // A parent login. The first visit creates the family and the guardian row together.
  const family = await supabase.rpc("ensure_family");
  if (family.error || !family.data) throw new Error(`Could not set up the family: ${family.error?.message}`);

  const guardian = await supabase.from("guardians").select("id").eq("user_id", user.id).single();
  if (guardian.error) throw new Error(`Could not look up the guardian: ${guardian.error.message}`);

  return { role: "guardian", ...base, familyId: family.data, guardianId: guardian.data.id };
});

function signInPath(next?: string): string {
  return next ? `/login?next=${encodeURIComponent(next)}` : "/login";
}

/** For pages anyone signed in can see. Signed-out visitors go to the sign-in page. */
export async function requireViewer(next?: string): Promise<GuardianViewer | AthleteViewer> {
  const viewer = await getViewer();
  if (!viewer) redirect(signInPath(next));
  if (viewer.role === "unlinked_athlete") redirect("/auth/unlinked");
  return viewer;
}

/** For parent-only pages. An athlete login is sent to its own report. */
export async function requireGuardian(next?: string): Promise<GuardianViewer> {
  const viewer = await requireViewer(next);
  if (viewer.role === "athlete") redirect(`/athletes/${viewer.athleteId}`);
  return viewer;
}

/**
 * The athlete with this id, if the viewer may see it. Row-level security does the real
 * check: a row from another family simply is not returned.
 */
export async function findAthlete(athleteId: string): Promise<AthleteRow | null> {
  if (!/^[0-9a-f-]{36}$/i.test(athleteId)) return null;
  const supabase = await createServerSupabase();
  const { data, error } = await supabase.from("athletes").select("*").eq("id", athleteId).maybeSingle();
  if (error) throw new Error(`Could not load the athlete: ${error.message}`);
  return data;
}
