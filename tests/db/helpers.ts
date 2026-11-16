import { randomUUID } from "node:crypto";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/database.types";

/**
 * Helpers for tests that run against the real Supabase project in .env.local.
 * Every test user gets a random @example.com address and is deleted afterwards.
 */

process.loadEnvFile(".env.local");

export type Client = SupabaseClient<Database>;

function requireEnv(key: string): string {
  const value = process.env[key]?.trim();
  if (!value) throw new Error(`${key} is not set in .env.local`);
  return value;
}

const SUPABASE_URL = requireEnv("NEXT_PUBLIC_SUPABASE_URL");
const ANON_KEY = requireEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY");
const SERVICE_KEY = requireEnv("SUPABASE_SERVICE_ROLE_KEY");

const NO_SESSION_STORAGE = { auth: { persistSession: false, autoRefreshToken: false } } as const;

/** Bypasses row-level security. Used only to set up and clean up. */
export function adminClient(): Client {
  return createClient<Database>(SUPABASE_URL, SERVICE_KEY, NO_SESSION_STORAGE);
}

/** A signed-out visitor. */
export function anonClient(): Client {
  return createClient<Database>(SUPABASE_URL, ANON_KEY, NO_SESSION_STORAGE);
}

export type TestUser = { id: string; email: string; password: string; client: Client };

/** Every user made by this test run, so clean-up finds them even if set-up fails halfway. */
const createdUserIds: string[] = [];

/** Creates a confirmed user and returns a client signed in as that user. */
export async function createSignedInUser(admin: Client, label: string): Promise<TestUser> {
  const email = `rls-${label}-${randomUUID()}@example.com`;
  const password = `pw-${randomUUID()}`;
  const created = await admin.auth.admin.createUser({ email, password, email_confirm: true });
  if (created.error || !created.data.user) {
    throw new Error(`could not create test user ${label}: ${created.error?.message}`);
  }
  createdUserIds.push(created.data.user.id);

  const client = anonClient();
  const signedIn = await client.auth.signInWithPassword({ email, password });
  if (signedIn.error) throw new Error(`could not sign in test user ${label}: ${signedIn.error.message}`);

  return { id: created.data.user.id, email, password, client };
}

export type TestFamily = {
  user: TestUser;
  familyId: string;
  guardianId: string;
};

/** Signs a new parent in and creates their family the way the app does. */
export async function createFamily(admin: Client, label: string): Promise<TestFamily> {
  const user = await createSignedInUser(admin, label);
  const family = await user.client.rpc("ensure_family");
  if (family.error || !family.data) throw new Error(`ensure_family failed for ${label}: ${family.error?.message}`);

  const guardian = await user.client.from("guardians").select("id").eq("user_id", user.id).single();
  if (guardian.error) throw new Error(`could not read guardian for ${label}: ${guardian.error.message}`);

  return { user, familyId: family.data, guardianId: guardian.data.id };
}

export const TEST_CONSENT = { consent_version: "test-v1", method: "test" } as const;

export async function recordConsent(family: TestFamily): Promise<void> {
  const consent = await family.user.client
    .from("consents")
    .insert({ family_id: family.familyId, guardian_id: family.guardianId, ...TEST_CONSENT });
  if (consent.error) throw new Error(`could not record consent: ${consent.error.message}`);
}

/** Records consent, then adds an athlete with one sport and one stat entry. */
export async function addAthlete(
  family: TestFamily,
  firstName: string,
  birthYear: number,
): Promise<{ athleteId: string; statId: string }> {
  await recordConsent(family);
  const { client } = family.user;

  const athlete = await client
    .from("athletes")
    .insert({ family_id: family.familyId, first_name: firstName, grad_year: 2028, birth_year: birthYear, gender: "Male" })
    .select("id")
    .single();
  if (athlete.error) throw new Error(`could not add athlete ${firstName}: ${athlete.error.message}`);

  const sport = await client
    .from("athlete_sports")
    .insert({ athlete_id: athlete.data.id, sport: "Baseball", position_or_event: "Pitcher" });
  if (sport.error) throw new Error(`could not add sport for ${firstName}: ${sport.error.message}`);

  const stat = await client
    .from("stat_entries")
    .insert({
      athlete_id: athlete.data.id,
      sport: "Baseball",
      metric: "Fastball velocity",
      value: 80,
      unit: "mph",
      measured_on: "2026-10-01",
      how_measured: "self",
    })
    .select("id")
    .single();
  if (stat.error) throw new Error(`could not add stat for ${firstName}: ${stat.error.message}`);

  return { athleteId: athlete.data.id, statId: stat.data.id };
}

/** Deletes test families (which cascades to their rows) and every user this run created. */
export async function cleanUp(admin: Client, familyIds: string[]): Promise<void> {
  if (familyIds.length > 0) {
    await admin.from("families").delete().in("id", familyIds);
  }
  for (const userId of createdUserIds.splice(0)) {
    await admin.auth.admin.deleteUser(userId);
  }
}
